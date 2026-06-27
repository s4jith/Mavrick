"""History, reminders and settings — per-user, stored in Firestore.

All endpoints identify the user by their Firebase UID (from the verified token)
and never trust a client-supplied user id.
"""
from __future__ import annotations

import asyncio

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from .auth import get_current_user
from ..core import firestore_store as store

router = APIRouter()


# ── history ─────────────────────────────────────────────────────────
class HistoryItem(BaseModel):
    text: str
    cluster: str = ""
    sub_type: str = ""
    severity: str = ""
    urgency_score: int = 0
    evaluator_score: int = 0
    steps_count: int = 0
    completed_at: str | None = None


@router.get("/history")
async def get_history(current_user: dict = Depends(get_current_user)):
    return await asyncio.to_thread(store.list_history, current_user["uid"])


@router.post("/history")
async def post_history(item: HistoryItem, current_user: dict = Depends(get_current_user)):
    return await asyncio.to_thread(store.add_history, current_user["uid"], item.model_dump())


@router.delete("/history")
async def delete_history(current_user: dict = Depends(get_current_user)):
    n = await asyncio.to_thread(store.clear_history, current_user["uid"])
    return {"deleted": n}


# ── reminders ───────────────────────────────────────────────────────
class ReminderItem(BaseModel):
    title: str = Field(min_length=1)
    description: str = ""
    due_date: str = ""
    priority: str = "medium"
    completed: bool = False


class ReminderUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    due_date: str | None = None
    priority: str | None = None
    completed: bool | None = None


@router.get("/reminders")
async def get_reminders(current_user: dict = Depends(get_current_user)):
    return await asyncio.to_thread(store.list_reminders, current_user["uid"])


@router.post("/reminders")
async def post_reminder(item: ReminderItem, current_user: dict = Depends(get_current_user)):
    return await asyncio.to_thread(store.add_reminder, current_user["uid"], item.model_dump())


@router.patch("/reminders/{rid}")
async def patch_reminder(rid: str, req: ReminderUpdate, current_user: dict = Depends(get_current_user)):
    fields = {k: v for k, v in req.model_dump().items() if v is not None}
    updated = await asyncio.to_thread(store.update_reminder, current_user["uid"], rid, fields)
    if updated is None:
        raise HTTPException(status_code=404, detail="Reminder not found")
    return updated


@router.delete("/reminders/{rid}")
async def delete_reminder(rid: str, current_user: dict = Depends(get_current_user)):
    ok = await asyncio.to_thread(store.delete_reminder, current_user["uid"], rid)
    if not ok:
        raise HTTPException(status_code=404, detail="Reminder not found")
    return {"deleted": True, "id": rid}


# ── settings ────────────────────────────────────────────────────────
@router.get("/settings")
async def get_settings(current_user: dict = Depends(get_current_user)):
    return await asyncio.to_thread(store.get_settings, current_user["uid"])


@router.put("/settings")
async def put_settings(payload: dict, current_user: dict = Depends(get_current_user)):
    return await asyncio.to_thread(store.set_settings, current_user["uid"], payload)
