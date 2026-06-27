# CLAUDE.md — Mavrick

Guidance for Claude Code (and humans) working in this repo. Read this first.

## What Mavrick is
Mavrick turns **panic into a plan**. A user describes a crisis + how much time is left; Mavrick returns an exact, time-blocked, step-by-step plan in seconds — first step always doable *right now*. It is an **AI execution engine**, not a reminder app.

- Concept & behaviour: [my-reference/WORKFLOW.md](./my-reference/WORKFLOW.md)
- Technical design: [my-reference/ARCHITECTURE.md](./my-reference/ARCHITECTURE.md)
- Original blueprint: `LastMinuteLifeSaver_Blueprint.pdf`

> **Build philosophy: spine first, then features.** The spine is `input → classify → plan → display a great plan`. Get that magical, then snap features on. Demo-driven: if it isn't on screen in the 2-minute demo, it waits.

## Tech stack
| Layer | Choice |
|---|---|
| Frontend | **React + TypeScript + Vite**, PWA, Material Design 3 tokens |
| Backend | **FastAPI** (Python 3.10+) |
| LLM | **Gemini 2.5 Flash** — single model everywhere; thinking off for speed-critical agents, on for the Planner |
| DB | **Firestore** (Firebase) — see DB & Cache section |
| Cache | **SQLite** (`backend/data/cache.db`, auto-created) for hackathon; Upstash Redis is the production swap |

## Repo structure (target)
```
mavrick/
├─ frontend/          # React + TS + Vite PWA
│  └─ src/
├─ backend/           # FastAPI
│  ├─ app/
│  │  ├─ main.py            # FastAPI entry
│  │  ├─ gemini/            # key manager + client wrapper
│  │  ├─ agents/            # planner + fallback (degraded mode)
│  │  ├─ core/              # urgency scoring, clusters, schemas (pure Python)
│  │  └─ store/             # SQLite cache adapter (swap to Redis later)
│  ├─ data/                 # cache.db lives here (gitignored)
│  └─ requirements.txt
├─ my-reference/      # concept + architecture docs
└─ CLAUDE.md
```

---

## ⚠️ THE #1 CONSTRAINT — Gemini call budget
We have **3 API keys** (3 accounts). Each key allows **~20 requests/day** with a per-minute rate limit. **Total ≈ 60 LLM calls/day.** Treat every Gemini call as expensive. Rules:

### Rule 1 — Most "agents" are NOT LLM calls
Only call Gemini where genuine reasoning is required. Do everything else in plain Python:
| Step | LLM? | How |
|---|---|---|
| Classify cluster + extract deadline/effort | ✅ (folded into the plan call) | 1 combined call |
| Build time-blocked plan | ✅ (same call) | Same structured call as classify |
| Urgency score | ❌ | Pure Python: `proximity × consequence × effort` |
| Time-block math | ❌ | Pure Python (no LLM arithmetic) |
| Memory retrieval / routing / HITL | ❌ | Pure Python / Firestore reads |
| Evaluator (sanity check) | ❌ by default | Rule-based checks; only escalate to an LLM call if rules flag it |
| Coach check-in message | ✅ only when triggered | 1 call, cached per plan |

**Target: 1 Gemini call per crisis** (classify+plan combined via structured output). 2 max if Coach speaks.

### Rule 2 — Cache before you call
- Hash the normalized input. If we've planned a near-identical crisis, **return the cached plan — 0 calls**.
- Cache stored in SQLite (`backend/data/cache.db`), TTL 24h. Survives backend restarts.
- Pre-seed the **demo inputs** so the live demo costs **zero** Gemini calls and never rate-limits on stage.

### Rule 3 — Round-robin key rotation (`backend/app/gemini/key_manager.py`)
- Hold N keys, each with: `daily_count`, `reset_date`, `cooling_until` (for 429s).
- `get_key()` → round-robin pointer picks the **next key that is** (a) under its daily cap and (b) not cooling down.
- On a `429`/rate-limit response: mark that key `cooling_until = now + backoff`, rotate to next key, retry.
- If **all** keys are exhausted/cooling: `make_fallback_plan()` in `agents/fallback.py` returns a generic triage plan — never hard-fail the UI.
- Counters are in-memory (single instance); swap to Redis when scaling. Reset daily.
- Keys come from `backend/.env` as `GEMINI_API_KEY_1..N` (never hardcode, never commit). Implemented in [backend/app/gemini/key_manager.py](./backend/app/gemini/key_manager.py).

### Rule 4 — Squeeze each call
- Use **structured output** (JSON schema) so one call returns cluster + plan together.
- Use **context caching** for the system prompt (don't resend it every call).
- Keep prompts tight; put user context as compact JSON, not prose.

---

## DB & Cache decision
- **Google Cloud Storage is NOT a database or a cache** — it's file/object storage. Don't use it for app data.
- **Database → Firestore** (Firebase). Real-time, generous free tier, fits the Google-first story. Stores users, crises, plans, and the 3-layer memory. (Not yet wired — next milestone.)
- **Cache → SQLite** (`backend/data/cache.db`, auto-created). Zero-dependency, survives restarts, correct for a single-instance hackathon backend. The `store/cache.py` adapter exposes `get`/`set` so swapping to Upstash Redis later requires touching only that file.
- **Degraded mode** — when all keys are exhausted, `agents/fallback.py` returns a generic triage plan. The UI always gets a usable response.

---

## Conventions
- Secrets only in env / `.env` (gitignored). Never commit keys.
- Backend returns plans as typed JSON; frontend renders. Agent-to-agent = JSON, user-facing = markdown.
- Planner output guardrails: no step >25 min without a break; never use >90% of available time; always end with one "do this right now" action.
- HITL: never write to Calendar or send a notification without explicit user approval.

## Dev commands
```
# backend (from backend/)
python -m pip install -r requirements.txt
uvicorn app.main:app --reload
#   GET  http://localhost:8000/health      -> key budget + status
#   POST http://localhost:8000/api/plan    -> { text, minutes_left, age? }

# frontend (from frontend/, once scaffolded)
npm install
npm run dev
```

## Current status
- [x] Concept + architecture docs (`my-reference/`)
- [x] Backend scaffold (FastAPI + Gemini key manager, round-robin)
- [x] Spine: `POST /api/plan` → classify + plan in ONE Gemini 2.5 Flash call
- [x] Verified live: real plans returned; cache returns repeats for 0 calls
- [x] Frontend: React PWA + Panic Mode screen wired to the live API
- [x] Persistent SQLite cache — plans survive backend restarts (`backend/data/cache.db`)
- [x] Degraded fallback — generic triage plan returned when all API keys exhausted (no 503)
- [x] **Firebase Authentication** (Email/Password + Google) — frontend `firebase.ts` + `AuthContext`
- [x] **Backend verifies Firebase ID tokens** with `firebase-admin` (`core/firebase_admin.py`, `api/auth.py`) — no JWT, no Mongo
- [x] **Cloud Firestore** is the database — users, history, reminders, settings keyed by Firebase UID (`core/firestore_store.py`, `api/profile.py`, `api/userdata.py`). Admin SDK bypasses security rules.
- [x] Cloud TTS coach voice (`api/tts.py`) with browser-speech fallback
  - Migration removed Mongo/JWT/custom-OAuth and the Mongo-backed Gmail/Calendar integration. Backend needs `backend/service-account.json` + `FIREBASE_PROJECT_ID`; frontend needs `VITE_FIREBASE_*` in `frontend/.env`. See README → Setup.
- [ ] Gmail/Calendar live sync (re-do Firebase-native); Outlook sign-in; PWA push; Firestore security rules

## Run the full product (two terminals)
```
# Terminal 1 — backend
cd backend && uvicorn app.main:app --reload      # http://localhost:8000

# Terminal 2 — frontend
cd frontend && npm run dev                        # http://localhost:5173
```
Open http://localhost:5173. The Vite dev server proxies `/api` and `/health`
to the backend on :8000.
