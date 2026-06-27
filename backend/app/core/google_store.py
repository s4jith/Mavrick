"""Persist Google OAuth credentials on the user document and hand back
ready-to-use, auto-refreshed credentials for the API routers."""
from __future__ import annotations

from fastapi import HTTPException

from .db import users_collection
from . import google_oauth
from ..logging_config import get_logger

log = get_logger("google")


async def save_google_account(email: str, creds, profile: dict) -> None:
    """Upsert the Google token bundle + cached profile onto the user."""
    await users_collection.update_one(
        {"email": email},
        {"$set": {
            "google": google_oauth.creds_to_dict(creds),
            "google_profile": {
                "sub": profile.get("sub"),
                "name": profile.get("name"),
                "picture": profile.get("picture"),
                "email": profile.get("email"),
            },
            "google_connected": True,
        }},
    )


async def disconnect_google(email: str) -> None:
    await users_collection.update_one(
        {"email": email},
        {"$unset": {"google": "", "google_profile": ""}, "$set": {"google_connected": False}},
    )


async def connection_status(email: str) -> dict:
    user = await users_collection.find_one({"email": email})
    google = (user or {}).get("google") or {}
    scopes = google.get("scopes") or []
    connected = bool(user and user.get("google_connected") and google.get("refresh_token"))
    return {
        "connected": connected,
        "scopes": scopes,
        "gmail": connected and any("gmail" in s for s in scopes),
        "calendar": connected and any("calendar" in s for s in scopes),
        "profile": (user or {}).get("google_profile") or {},
    }


async def credentials_for_user(email: str):
    """Load stored creds, refresh if needed (persisting the new token), or 409."""
    user = await users_collection.find_one({"email": email})
    google = (user or {}).get("google")
    if not google or not google.get("refresh_token"):
        raise HTTPException(
            status_code=409,
            detail="Google account not connected. Connect it from the Connect screen first.",
        )

    creds = google_oauth.dict_to_creds(google)
    creds, refreshed = google_oauth.ensure_fresh(creds)
    if refreshed:
        await users_collection.update_one(
            {"email": email},
            {"$set": {"google": google_oauth.creds_to_dict(creds)}},
        )
        log.info("Refreshed Google access token for %s", email)
    return creds
