"""Authentication — Firebase ID-token verification.

The frontend authenticates with Firebase (Email/Password or Google) and sends
the resulting ID token as `Authorization: Bearer <token>`. We verify it with the
Firebase Admin SDK and identify the user by their Firebase UID. No JWT, no
password handling on the backend.
"""
from __future__ import annotations

import asyncio

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from ..core.firebase_admin import verify_id_token
from ..core.schemas import UserResponse

router = APIRouter()

# Only used to pull the Bearer token out of the Authorization header.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=True)


async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    """Verify the Firebase ID token and return the identified user."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        decoded = await asyncio.to_thread(verify_id_token, token)
    except Exception:
        raise credentials_exception

    uid = decoded.get("uid") or decoded.get("user_id")
    if not uid:
        raise credentials_exception
    email = (decoded.get("email") or "").lower()
    name = decoded.get("name") or (email.split("@")[0] if email else "Commander")
    return {
        "uid": uid,
        "id": uid,
        "email": email,
        "name": name,
        "picture": decoded.get("picture"),
    }


@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return {
        "id": current_user["id"],
        "email": current_user["email"],
        "name": current_user["name"],
    }
