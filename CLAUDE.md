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
| LLM | **Gemini 2.5 Flash** (thinking off for fast steps, on for the Planner) |
| DB | **Firestore** (Firebase) — see DB & Cache section |
| Cache / counters | **Redis** (Upstash free tier) — see DB & Cache section |

## Repo structure (target)
```
mavrick/
├─ frontend/          # React + TS + Vite PWA
│  └─ src/
├─ backend/           # FastAPI
│  ├─ app/
│  │  ├─ main.py            # FastAPI entry
│  │  ├─ gemini/            # key manager + client wrapper
│  │  ├─ agents/            # intake/planner/coach logic (few are LLM)
│  │  ├─ core/              # urgency scoring, time-block math (pure Python)
│  │  └─ store/             # Firestore + cache adapters
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
- Cache stored in Redis (key: `plan:{hash}`), TTL ~24h.
- Pre-seed the **demo inputs** so the live demo costs **zero** Gemini calls and never rate-limits on stage.

### Rule 3 — Round-robin key rotation (`backend/app/gemini/key_manager.py`)
- Hold N keys, each with: `daily_count`, `reset_date`, `cooling_until` (for 429s).
- `get_key()` → round-robin pointer picks the **next key that is** (a) under its daily cap and (b) not cooling down.
- On a `429`/rate-limit response: mark that key `cooling_until = now + backoff`, rotate to next key, retry.
- If **all** keys are exhausted/cooling: serve cached/degraded response, never hard-fail the UI.
- Counters are in-memory today (single instance); swap to Redis (`key:{i}:count`, `key:{i}:reset`) when we scale. Reset daily.
- Keys come from `backend/.env` as `GEMINI_API_KEY_1..N` (never hardcode, never commit). Implemented in [backend/app/gemini/key_manager.py](./backend/app/gemini/key_manager.py).

### Rule 4 — Squeeze each call
- Use **structured output** (JSON schema) so one call returns cluster + plan together.
- Use **context caching** for the system prompt (don't resend it every call).
- Keep prompts tight; put user context as compact JSON, not prose.

---

## DB & Cache decision
- **Google Cloud Storage is NOT a database or a cache** — it's file/object storage (images, audio, exports). Don't use it for app data or counters.
- **Database → Firestore** (Firebase). Real-time, generous free tier, fits the Google-first story, accessed from FastAPI via the `firebase-admin` Python SDK. Stores users, crises, plans, and the 3-layer memory.
- **Cache + key counters → Redis (Upstash free tier)**. Serverless, HTTP-based, no infra to run. Holds plan cache, rate-limit counters, and round-robin state.
- **Hackathon fallback (single backend instance):** if you'd rather not add Upstash on day one, an in-process dict + SQLite works for the spine — but Redis is the right answer once persistence/restarts matter. Code talks to a `store/` adapter so we can swap without touching agents.

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
- [x] Backend scaffold (FastAPI + Gemini key manager, round-robin + cache)
- [x] Spine: `POST /api/plan` -> classify + plan in ONE Gemini call
- [x] Verified live: real plans returned; HTTP cache returns repeats for 0 calls
- [x] Frontend: React PWA + Panic Mode screen wired to the live API
- [ ] Persistence (Firestore) + cache (Redis)
- [ ] Features: voice, Gmail scan, Calendar, Coach/TTS, memory

## Run the full product (two terminals)
```
# Terminal 1 — backend
cd backend && uvicorn app.main:app --reload      # http://localhost:8000

# Terminal 2 — frontend
cd frontend && npm run dev                        # http://localhost:5173
```
Open http://localhost:5173. The Vite dev server proxies `/api` and `/health`
to the backend on :8000.
