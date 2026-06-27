"""Google Cloud Text-to-Speech for the Execution Mode coach.

Called over REST with a Google API key (no service account needed). If no
TTS-capable key is configured the endpoint reports unavailable and the frontend
falls back to the browser's built-in speechSynthesis — so the coach can always
speak.
"""
from __future__ import annotations

import requests
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from ..runtime import settings
from ..logging_config import get_logger

router = APIRouter()
log = get_logger("tts")

TTS_URL = "https://texttospeech.googleapis.com/v1/text:synthesize"


def _tts_api_key() -> str | None:
    if settings.google_tts_api_key:
        return settings.google_tts_api_key
    # Fall back to any standard AIza… key among the Gemini keys.
    for key in settings.gemini_keys:
        if key.startswith("AIza"):
            return key
    return None


class TTSRequest(BaseModel):
    text: str = Field(min_length=1, max_length=2000)
    voice: str = Field(default="en-US-Neural2-F")
    language_code: str = Field(default="en-US")
    speaking_rate: float = Field(default=1.0, ge=0.25, le=4.0)


@router.get("/available")
def tts_available() -> dict:
    return {"available": _tts_api_key() is not None}


@router.post("/")
def synthesize(req: TTSRequest) -> dict:
    api_key = _tts_api_key()
    if not api_key:
        # 503 → frontend knows to use browser speechSynthesis instead.
        raise HTTPException(status_code=503, detail="TTS not configured")

    body = {
        "input": {"text": req.text},
        "voice": {"languageCode": req.language_code, "name": req.voice},
        "audioConfig": {"audioEncoding": "MP3", "speakingRate": req.speaking_rate},
    }
    try:
        resp = requests.post(f"{TTS_URL}?key={api_key}", json=body, timeout=15)
    except requests.RequestException as exc:
        log.exception("TTS request error")
        raise HTTPException(status_code=502, detail=f"TTS request failed: {exc}")

    if resp.status_code != 200:
        log.warning("TTS API %s: %s", resp.status_code, resp.text[:300])
        raise HTTPException(status_code=502, detail="TTS synthesis failed")

    audio_b64 = resp.json().get("audioContent")
    if not audio_b64:
        raise HTTPException(status_code=502, detail="TTS returned no audio")
    # data: URI the frontend can drop straight into an <audio> element.
    return {"audio": f"data:audio/mp3;base64,{audio_b64}"}
