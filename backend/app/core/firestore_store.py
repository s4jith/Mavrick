"""Firestore data layer (Admin SDK).

All access goes through the backend with the Admin SDK, which bypasses
Firestore security rules — so this works without any rules configured.
Documents are keyed by Firebase UID. Queries filter by a single `uid` field
(auto-indexed) and sort in Python, so no composite indexes are required.

Collections:
  users/{uid}          profile
  history/{autoId}     solved crises   (field: uid)
  reminders/{autoId}   reminders       (field: uid)
  settings/{uid}       preferences
"""
from __future__ import annotations

from datetime import datetime, timezone

from google.cloud.firestore_v1 import FieldFilter

from .firebase_admin import get_firestore


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _db():
    return get_firestore()


# ── users / profile ─────────────────────────────────────────────────
def ensure_user(uid: str, email: str, name: str, picture: str | None = None) -> dict:
    """Create the profile on first sight, otherwise refresh basic fields."""
    ref = _db().collection("users").document(uid)
    snap = ref.get()
    now = _now()
    if snap.exists:
        ref.update({"email": email, "name": name, "picture": picture, "updated_at": now})
    else:
        ref.set({
            "uid": uid, "email": email, "name": name, "picture": picture,
            "phone": "", "role": "", "created_at": now, "updated_at": now,
        })
    return get_user(uid) or {}


def get_user(uid: str) -> dict | None:
    snap = _db().collection("users").document(uid).get()
    return snap.to_dict() if snap.exists else None


def update_user(uid: str, fields: dict) -> dict:
    allowed = {k: v for k, v in fields.items() if k in {"name", "phone", "role", "picture"}}
    allowed["updated_at"] = _now()
    _db().collection("users").document(uid).set(allowed, merge=True)
    return get_user(uid) or {}


def list_users() -> list[dict]:
    return [d.to_dict() for d in _db().collection("users").stream()]


def delete_user(uid: str) -> bool:
    ref = _db().collection("users").document(uid)
    if not ref.get().exists:
        return False
    ref.delete()
    return True


def count_users() -> int:
    return sum(1 for _ in _db().collection("users").stream())


# ── history ─────────────────────────────────────────────────────────
def list_history(uid: str) -> list[dict]:
    q = _db().collection("history").where(filter=FieldFilter("uid", "==", uid)).stream()
    items = []
    for d in q:
        row = d.to_dict()
        row["id"] = d.id
        items.append(row)
    items.sort(key=lambda r: r.get("completed_at", ""), reverse=True)
    return items


def add_history(uid: str, item: dict) -> dict:
    doc = {**item, "uid": uid, "completed_at": item.get("completed_at") or _now()}
    ref = _db().collection("history").add(doc)[1]
    saved = doc | {"id": ref.id}
    return saved


def clear_history(uid: str) -> int:
    q = _db().collection("history").where(filter=FieldFilter("uid", "==", uid)).stream()
    n = 0
    for d in q:
        d.reference.delete()
        n += 1
    return n


# ── reminders ───────────────────────────────────────────────────────
def list_reminders(uid: str) -> list[dict]:
    q = _db().collection("reminders").where(filter=FieldFilter("uid", "==", uid)).stream()
    items = []
    for d in q:
        row = d.to_dict()
        row["id"] = d.id
        items.append(row)
    items.sort(key=lambda r: r.get("created_at", ""))
    return items


_REMINDER_FIELDS = {"title", "description", "due_date", "priority", "completed"}


def add_reminder(uid: str, item: dict) -> dict:
    doc = {k: v for k, v in item.items() if k in _REMINDER_FIELDS}
    doc.update({"uid": uid, "completed": bool(item.get("completed", False)), "created_at": _now()})
    ref = _db().collection("reminders").add(doc)[1]
    return doc | {"id": ref.id}


def update_reminder(uid: str, rid: str, fields: dict) -> dict | None:
    ref = _db().collection("reminders").document(rid)
    snap = ref.get()
    if not snap.exists or snap.to_dict().get("uid") != uid:
        return None
    allowed = {k: v for k, v in fields.items() if k in _REMINDER_FIELDS}
    ref.set(allowed, merge=True)
    out = ref.get().to_dict()
    out["id"] = rid
    return out


def delete_reminder(uid: str, rid: str) -> bool:
    ref = _db().collection("reminders").document(rid)
    snap = ref.get()
    if not snap.exists or snap.to_dict().get("uid") != uid:
        return False
    ref.delete()
    return True


# ── settings ────────────────────────────────────────────────────────
def get_settings(uid: str) -> dict:
    snap = _db().collection("settings").document(uid).get()
    return snap.to_dict() if snap.exists else {}


def set_settings(uid: str, fields: dict) -> dict:
    payload = {**fields, "uid": uid, "updated_at": _now()}
    _db().collection("settings").document(uid).set(payload, merge=True)
    return get_settings(uid)
