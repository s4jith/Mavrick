"""Firebase Admin SDK — initialized once from service-account.json.

Provides ID-token verification (auth) and a Firestore client (data). Both the
auth dependency and the Firestore stores import from here so the SDK is set up
in exactly one place.
"""
from __future__ import annotations

from pathlib import Path

import firebase_admin
from firebase_admin import auth as fb_auth
from firebase_admin import credentials, firestore

from ..config import settings
from ..logging_config import get_logger

log = get_logger("firebase")

# backend/  (two levels up from app/core/)
_BACKEND_DIR = Path(__file__).resolve().parent.parent.parent


def _service_account_path() -> Path:
    p = Path(settings.firebase_service_account)
    return p if p.is_absolute() else _BACKEND_DIR / p


def init_firebase() -> None:
    """Idempotent — safe to call at import and across hot reloads."""
    if firebase_admin._apps:  # already initialized
        return
    sa = _service_account_path()
    if not sa.exists():
        raise RuntimeError(
            f"Firebase service account not found at {sa}. "
            "Set FIREBASE_SERVICE_ACCOUNT in backend/.env."
        )
    cred = credentials.Certificate(str(sa))
    firebase_admin.initialize_app(cred, {"projectId": settings.firebase_project_id})
    log.info("Firebase Admin initialized — project=%s", settings.firebase_project_id)


def verify_id_token(id_token: str) -> dict:
    """Verify a Firebase ID token; raises on invalid/expired."""
    return fb_auth.verify_id_token(id_token)


def get_firestore():
    """Lazy Firestore client (Admin SDK)."""
    init_firebase()
    return firestore.client()


# Initialize on import so the app fails fast if the service account is missing.
init_firebase()
