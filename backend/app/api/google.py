"""Google OAuth login/connect endpoints.

One flow serves both "Login with Google" and "Connect your Google account":
the callback always keys off the Google email — it creates the Mavrick user if
needed, stores the OAuth tokens, and issues our own JWT, then bounces the
browser back to the frontend's /auth/callback with that token.
"""
from __future__ import annotations

from datetime import timedelta
from urllib.parse import urlencode

from fastapi import APIRouter, Request
from fastapi.responses import RedirectResponse

from ..core import google_oauth
from ..core.google_store import save_google_account
from ..core.auth import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from ..core.db import users_collection
from ..runtime import settings
from ..logging_config import get_logger

router = APIRouter()
log = get_logger("google")


def _frontend_redirect(**params) -> RedirectResponse:
    return RedirectResponse(f"{settings.frontend_url}/auth/callback?{urlencode(params)}")


@router.get("/login")
async def google_login():
    """Kick off the consent flow — redirect the browser to Google."""
    if not settings.google_oauth_enabled:
        return _frontend_redirect(error="google_oauth_not_configured")
    url, _state = google_oauth.authorization_url()
    return RedirectResponse(url)


@router.get("/callback")
async def google_callback(request: Request):
    """Google sends the user back here with ?code=…"""
    err = request.query_params.get("error")
    if err:
        log.warning("Google OAuth denied: %s", err)
        return _frontend_redirect(error=err)

    code = request.query_params.get("code")
    state = request.query_params.get("state")
    if not code:
        return _frontend_redirect(error="missing_code")

    try:
        creds = google_oauth.exchange_code(code, state=state)
        profile = google_oauth.fetch_userinfo(creds)
    except Exception as exc:  # noqa: BLE001 — surface any OAuth failure to the UI
        log.exception("Google token exchange failed")
        return _frontend_redirect(error="token_exchange_failed")

    email = (profile.get("email") or "").lower()
    if not email:
        return _frontend_redirect(error="no_email")

    name = profile.get("name") or email.split("@")[0]

    # Create the Mavrick user on first sight; otherwise just refresh their name.
    existing = await users_collection.find_one({"email": email})
    if not existing:
        await users_collection.insert_one({
            "email": email,
            "name": name,
            "hashed_password": None,   # Google-only account
            "auth_provider": "google",
        })
        log.info("Created Google user %s", email)

    await save_google_account(email, creds, profile)

    token = create_access_token(
        data={"sub": email},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return _frontend_redirect(token=token)
