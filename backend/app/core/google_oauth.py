"""Google OAuth + API credential helpers.

One place for: building the consent URL, exchanging the code for tokens,
persisting/refreshing user credentials, and reading the user's Google profile.
All API routers (Gmail, Calendar, People) build their service client from
``credentials_for_user`` so token refresh happens in exactly one spot.
"""
from __future__ import annotations

import os
from datetime import datetime, timezone

# Google sometimes returns scopes in a different order/superset than requested
# (it always adds `openid`). Relax the check so the token exchange doesn't fail.
os.environ.setdefault("OAUTHLIB_RELAX_TOKEN_SCOPE", "1")

from google.oauth2.credentials import Credentials
from google.auth.transport.requests import AuthorizedSession, Request
from google_auth_oauthlib.flow import Flow

from ..runtime import settings
from ..logging_config import get_logger

log = get_logger("google")

# Requested up-front so a single consent grants everything the app needs.
SCOPES = [
    "openid",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/calendar.events",
    "https://www.googleapis.com/auth/calendar.readonly",
    "https://www.googleapis.com/auth/user.phonenumbers.read",
]

USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"


def _client_config() -> dict:
    return {
        "web": {
            "client_id": settings.google_client_id,
            "client_secret": settings.google_client_secret,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "redirect_uris": [settings.google_redirect_uri],
        }
    }


def _flow(state: str | None = None) -> Flow:
    flow = Flow.from_client_config(_client_config(), scopes=SCOPES, state=state)
    flow.redirect_uri = settings.google_redirect_uri
    return flow


def authorization_url() -> tuple[str, str]:
    """Return (consent_url, state). `prompt=consent` + offline => refresh token."""
    flow = _flow()
    url, state = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        prompt="consent",
    )
    return url, state


def exchange_code(code: str, state: str | None = None) -> Credentials:
    flow = _flow(state=state)
    flow.fetch_token(code=code)
    return flow.credentials


def creds_to_dict(creds: Credentials) -> dict:
    """Serialise credentials for storage in Mongo."""
    return {
        "token": creds.token,
        "refresh_token": creds.refresh_token,
        "token_uri": creds.token_uri,
        "client_id": creds.client_id,
        "client_secret": creds.client_secret,
        "scopes": list(creds.scopes or SCOPES),
        "expiry": creds.expiry.replace(tzinfo=timezone.utc).isoformat() if creds.expiry else None,
    }


def dict_to_creds(data: dict) -> Credentials:
    expiry = None
    if data.get("expiry"):
        expiry = datetime.fromisoformat(data["expiry"]).replace(tzinfo=None)
    creds = Credentials(
        token=data.get("token"),
        refresh_token=data.get("refresh_token"),
        token_uri=data.get("token_uri", "https://oauth2.googleapis.com/token"),
        client_id=data.get("client_id", settings.google_client_id),
        client_secret=data.get("client_secret", settings.google_client_secret),
        scopes=data.get("scopes", SCOPES),
    )
    creds.expiry = expiry
    return creds


def ensure_fresh(creds: Credentials) -> tuple[Credentials, bool]:
    """Refresh the access token if expired. Returns (creds, was_refreshed)."""
    if creds.valid:
        return creds, False
    if creds.expired and creds.refresh_token:
        creds.refresh(Request())
        return creds, True
    return creds, False


def fetch_userinfo(creds: Credentials) -> dict:
    """Basic profile from the OIDC userinfo endpoint (sub/email/name/picture)."""
    session = AuthorizedSession(creds)
    resp = session.get(USERINFO_URL, timeout=10)
    resp.raise_for_status()
    return resp.json()
