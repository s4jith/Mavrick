"""Admin-only API routes.

Protected by require_admin dependency — only emails listed in the
ADMIN_EMAILS env var (default: teammistaketechnologies@gmail.com) can call
these endpoints. Auth is the same Firebase ID token as regular users; the
server checks the email after verifying the token. User data lives in Firestore.
"""
from __future__ import annotations

import asyncio
import os

from fastapi import APIRouter, Depends, HTTPException

from ..api.auth import get_current_user
from ..core import firestore_store as store
from ..runtime import cache, key_manager

router = APIRouter()

ADMIN_EMAILS: set[str] = {
    e.strip().lower()
    for e in os.getenv("ADMIN_EMAILS", "teammistaketechnologies@gmail.com").split(",")
    if e.strip()
}


async def require_admin(current_user: dict = Depends(get_current_user)) -> dict:
    if current_user["email"].lower() not in ADMIN_EMAILS:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


def _serialize_user(u: dict) -> dict:
    return {
        "id": u.get("uid", ""),
        "email": u.get("email", ""),
        "name": u.get("name", ""),
        "created_at": u.get("created_at"),
    }


# ── User management ─────────────────────────────────────────────────────────

@router.get("/users")
async def list_users(_admin: dict = Depends(require_admin)) -> list:
    users = await asyncio.to_thread(store.list_users)
    return [_serialize_user(u) for u in users]


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    _admin: dict = Depends(require_admin),
) -> dict:
    deleted = await asyncio.to_thread(store.delete_user, user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="User not found")
    return {"deleted": True, "id": user_id}


# ── Stats ────────────────────────────────────────────────────────────────────

@router.get("/stats")
async def get_stats(_admin: dict = Depends(require_admin)) -> dict:
    total_users = await asyncio.to_thread(store.count_users)
    cache_size = len(cache)
    keys = key_manager.status()
    used_today = sum(k.get("used_today", 0) for k in keys)
    remaining = key_manager.remaining_today()

    return {
        "total_users": total_users,
        "cache_entries": cache_size,
        "api_keys_total": len(keys),
        "calls_used_today": used_today,
        "calls_remaining_today": remaining,
        "keys": keys,
    }
