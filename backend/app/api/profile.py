"""User profile — stored in Firestore, keyed by Firebase UID."""
from __future__ import annotations

import asyncio

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from .auth import get_current_user
from ..core import firestore_store as store

router = APIRouter()


def _profile_payload(current_user: dict) -> dict:
    """Args for ensure_user pulled from the verified token."""
    return dict(
        uid=current_user["uid"],
        email=current_user.get("email", ""),
        name=current_user.get("name", ""),
        picture=current_user.get("picture"),
    )


@router.post("/sync")
async def sync_profile(current_user: dict = Depends(get_current_user)):
    """Upsert the profile from the token. Called right after login."""
    profile = await asyncio.to_thread(store.ensure_user, **_profile_payload(current_user))
    return profile


@router.get("")
async def get_profile(current_user: dict = Depends(get_current_user)):
    profile = await asyncio.to_thread(store.get_user, current_user["uid"])
    if not profile:
        profile = await asyncio.to_thread(store.ensure_user, **_profile_payload(current_user))
    return profile


class ProfileUpdate(BaseModel):
    name: str | None = None
    phone: str | None = None
    role: str | None = None


@router.put("")
async def update_profile(req: ProfileUpdate, current_user: dict = Depends(get_current_user)):
    fields = {k: v for k, v in req.model_dump().items() if v is not None}
    profile = await asyncio.to_thread(store.update_user, current_user["uid"], fields)
    return profile
