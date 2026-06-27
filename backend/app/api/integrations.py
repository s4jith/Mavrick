"""Gmail + Google Calendar integration endpoints.

All endpoints require a Mavrick JWT (Depends get_current_user) and a connected
Google account. The blocking googleapiclient calls run in a worker thread so we
never block the event loop. Calendar writes follow the CLAUDE.md HITL rule:
they only happen on an explicit, confirmed user action.
"""
from __future__ import annotations

import asyncio
import base64
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from googleapiclient.discovery import build
from pydantic import BaseModel, Field

from .auth import get_current_user
from ..core.google_store import credentials_for_user, connection_status, disconnect_google
from ..logging_config import get_logger

router = APIRouter()
log = get_logger("google")

# Words that make an email look like it carries a deadline / action.
DEADLINE_HINTS = (
    "deadline", "due", "due date", "submit", "expire", "expires", "expiring",
    "reminder", "overdue", "last day", "final notice", "payment", "invoice",
    "renew", "tomorrow", "today", "eod", "asap", "action required", "rsvp",
)


# ── helpers ──────────────────────────────────────────────────────────

def _header(headers: list[dict], name: str) -> str:
    for h in headers:
        if h.get("name", "").lower() == name.lower():
            return h.get("value", "")
    return ""


def _scan_gmail(creds, max_results: int) -> list[dict]:
    service = build("gmail", "v1", credentials=creds, cache_discovery=False)
    listing = (
        service.users().messages()
        .list(userId="me", q="newer_than:14d -category:promotions", maxResults=max_results)
        .execute()
    )
    out: list[dict] = []
    for ref in listing.get("messages", []):
        msg = (
            service.users().messages()
            .get(userId="me", id=ref["id"], format="metadata",
                 metadataHeaders=["Subject", "From", "Date"])
            .execute()
        )
        headers = msg.get("payload", {}).get("headers", [])
        subject = _header(headers, "Subject") or "(no subject)"
        snippet = msg.get("snippet", "")
        blob = f"{subject} {snippet}".lower()
        looks_urgent = any(h in blob for h in DEADLINE_HINTS)
        out.append({
            "id": ref["id"],
            "subject": subject,
            "from": _header(headers, "From"),
            "date": _header(headers, "Date"),
            "snippet": snippet,
            "looks_urgent": looks_urgent,
        })
    # Surface the deadline-looking ones first.
    out.sort(key=lambda m: not m["looks_urgent"])
    return out


def _list_events(creds, days: int, max_results: int) -> list[dict]:
    service = build("calendar", "v3", credentials=creds, cache_discovery=False)
    now = datetime.now(timezone.utc)
    resp = (
        service.events()
        .list(
            calendarId="primary",
            timeMin=now.isoformat(),
            timeMax=(now + timedelta(days=days)).isoformat(),
            singleEvents=True,
            orderBy="startTime",
            maxResults=max_results,
        )
        .execute()
    )
    events: list[dict] = []
    for ev in resp.get("items", []):
        start = ev.get("start", {})
        end = ev.get("end", {})
        events.append({
            "id": ev.get("id"),
            "title": ev.get("summary", "(no title)"),
            "start": start.get("dateTime") or start.get("date"),
            "end": end.get("dateTime") or end.get("date"),
            "all_day": "date" in start,
            "location": ev.get("location"),
            "html_link": ev.get("htmlLink"),
        })
    return events


def _create_event(creds, title: str, start_iso: str, minutes: int, description: str) -> dict:
    service = build("calendar", "v3", credentials=creds, cache_discovery=False)
    start = datetime.fromisoformat(start_iso.replace("Z", "+00:00"))
    end = start + timedelta(minutes=minutes)
    body = {
        "summary": title,
        "description": description or "Created by Mavrick — your AI crisis commander.",
        "start": {"dateTime": start.isoformat()},
        "end": {"dateTime": end.isoformat()},
        "reminders": {"useDefault": True},
    }
    ev = service.events().insert(calendarId="primary", body=body).execute()
    return {"id": ev.get("id"), "html_link": ev.get("htmlLink"), "title": ev.get("summary")}


# ── routes ───────────────────────────────────────────────────────────

@router.get("/status")
async def integrations_status(current_user: dict = Depends(get_current_user)):
    return await connection_status(current_user["email"])


@router.post("/disconnect")
async def integrations_disconnect(current_user: dict = Depends(get_current_user)):
    await disconnect_google(current_user["email"])
    return {"connected": False}


@router.get("/gmail/scan")
async def gmail_scan(max_results: int = 15, current_user: dict = Depends(get_current_user)):
    creds = await credentials_for_user(current_user["email"])
    try:
        messages = await asyncio.to_thread(_scan_gmail, creds, min(max_results, 30))
    except Exception as exc:  # noqa: BLE001
        log.exception("Gmail scan failed")
        raise HTTPException(status_code=502, detail=f"Gmail scan failed: {exc}")
    return {"count": len(messages), "messages": messages,
            "urgent": [m for m in messages if m["looks_urgent"]]}


@router.get("/calendar/events")
async def calendar_events(days: int = 14, max_results: int = 25,
                          current_user: dict = Depends(get_current_user)):
    creds = await credentials_for_user(current_user["email"])
    try:
        events = await asyncio.to_thread(_list_events, creds, days, min(max_results, 50))
    except Exception as exc:  # noqa: BLE001
        log.exception("Calendar list failed")
        raise HTTPException(status_code=502, detail=f"Calendar read failed: {exc}")
    return {"count": len(events), "events": events}


class CreateEventRequest(BaseModel):
    title: str = Field(min_length=1)
    start: str = Field(description="ISO 8601 start datetime.")
    minutes: int = Field(default=30, gt=0, le=24 * 60)
    description: str = ""
    confirm: bool = Field(default=False, description="HITL: must be true to write.")


@router.post("/calendar/events")
async def calendar_create(req: CreateEventRequest,
                          current_user: dict = Depends(get_current_user)):
    # HITL guardrail (CLAUDE.md): never write to Calendar without explicit approval.
    if not req.confirm:
        raise HTTPException(status_code=400, detail="Calendar write requires confirm=true.")
    creds = await credentials_for_user(current_user["email"])
    try:
        event = await asyncio.to_thread(
            _create_event, creds, req.title, req.start, req.minutes, req.description
        )
    except Exception as exc:  # noqa: BLE001
        log.exception("Calendar create failed")
        raise HTTPException(status_code=502, detail=f"Calendar write failed: {exc}")
    log.info("Calendar event created for %s: %s", current_user["email"], event.get("id"))
    return event
