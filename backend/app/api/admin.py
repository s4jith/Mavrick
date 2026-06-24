"""Admin-only API routes.

Protected by require_admin dependency — only emails listed in the
ADMIN_EMAILS env var (default: teammistaketechnologies@gmail.com) can call
these endpoints. Uses the same JWT as regular users; the server checks the
email after decoding.
"""
from __future__ import annotations

import os
from datetime import datetime

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException

from ..api.auth import get_current_user
from ..core.db import users_collection
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
    created = u.get("created_at")
    if isinstance(created, datetime):
        created = created.isoformat()
    return {
        "id": str(u["_id"]),
        "email": u.get("email", ""),
        "name": u.get("name", ""),
        "created_at": created,
    }


# ── User management ─────────────────────────────────────────────────────────

@router.get("/users")
async def list_users(_admin: dict = Depends(require_admin)) -> list:
    users = await users_collection.find(
        {}, {"hashed_password": 0}
    ).to_list(None)
    return [_serialize_user(u) for u in users]


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    _admin: dict = Depends(require_admin),
) -> dict:
    try:
        oid = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID")
    result = await users_collection.delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"deleted": True, "id": user_id}


# ── Stats ────────────────────────────────────────────────────────────────────

@router.get("/stats")
async def get_stats(_admin: dict = Depends(require_admin)) -> dict:
    total_users = await users_collection.count_documents({})
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
