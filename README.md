# Mavrick

> **The AI execution engine that turns panic into a plan.**

You describe a crisis and how much time you have. Mavrick returns an exact,
time-blocked, step-by-step plan in seconds — starting with one action you can
take *right now*. Not a reminder app. An execution engine that activates under
pressure.

Built for the **Vibe2Ship hackathon** · Google-first · 8 crisis clusters · Age 10–100.

---

## How it works

```
You type (or speak) your crisis  →  Mavrick classifies it  →  builds a plan  →  you act
```

One Gemini call classifies the crisis **and** builds the plan in a single
structured-output request. Urgency scoring and time-block math are pure Python
— no extra calls. A cache returns identical crises instantly at zero cost.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript + Vite 8 · installable PWA · pixel art UI |
| Auth | JWT (jose) + bcrypt · MongoDB user store (Motor async driver) |
| Backend | FastAPI (Python 3.10+) |
| AI | Gemini 2.5 Flash — 1 structured call per crisis (classify + plan) |
| Key management | Round-robin across N keys · daily cap · 429 cooldown |
| Cache | SQLite TTL cache at `backend/data/cache.db` · survives restarts |
| Database | MongoDB (Motor) — users, auth tokens |

---

## Repo layout

```
Mavrick/
├── backend/
│   ├── .env                    # Gemini keys + JWT secret (gitignored)
│   ├── .env.example
│   ├── requirements.txt
│   └── app/
│       ├── main.py             # FastAPI entry — mounts all routers
│       ├── config.py           # settings from .env
│       ├── runtime.py          # shared singletons (cache, key manager)
│       ├── gemini/
│       │   ├── key_manager.py  # round-robin, daily cap, 429 cooldown
│       │   └── client.py       # cache → key → call → retry
│       ├── agents/
│       │   ├── planner.py      # 1 Gemini call: classify + plan
│       │   └── fallback.py     # generic triage plan when keys exhausted
│       ├── api/
│       │   ├── auth.py         # POST /api/auth/register + /login
│       │   └── admin.py        # GET/DELETE /api/admin/* (admin-only)
│       ├── core/
│       │   ├── schemas.py      # Pydantic models
│       │   ├── clusters.py     # 8 crisis clusters + weights
│       │   └── urgency.py      # pure-Python urgency score (0–100)
│       └── store/
│           └── cache.py        # SQLite TTL cache (swap to Redis later)
├── frontend/
│   ├── index.html
│   ├── vite.config.ts          # dev proxy → :8000; PWA manifest
│   └── src/
│       ├── App.tsx             # routes + AdminGuard
│       ├── api.ts              # fetch wrappers for all endpoints
│       ├── types.ts            # TypeScript types mirroring backend
│       ├── context/
│       │   └── AuthContext.tsx # JWT auth state + isAdmin flag
│       ├── pages/
│       │   ├── Landing.tsx     # pixel art hero + CTAs
│       │   ├── Login.tsx       # email/password login
│       │   ├── Register.tsx    # sign up
│       │   ├── Dashboard.tsx   # main app (crisis input → plan)
│       │   └── Admin.tsx       # admin panel (users, API budget, health)
│       ├── components/
│       │   ├── Navbar.tsx      # fixed full-width nav with budget pill
│       │   ├── PanicForm.tsx   # crisis input, minutes, quick chips
│       │   ├── PlanView.tsx    # urgency badge, NOW card, step list
│       │   ├── StepCard.tsx    # checkable step card
│       │   ├── StressMeter.tsx # progress gauge
│       │   ├── TimeWarp.tsx    # coach / time simulation
│       │   ├── HistoryPanel.tsx# past crises drawer
│       │   ├── VoiceButton.tsx # Web Speech API input
│       │   ├── PixelAvatar.tsx # pixel art characters (panicked / calm)
│       │   └── icons/
│       │       └── PixelIcons.tsx # 25+ SVG pixel-art icons
│       └── styles/
│           └── tokens.css      # design tokens (pixel palette, motion)
├── my-reference/
│   ├── WORKFLOW.md
│   └── ARCHITECTURE.md
├── CLAUDE.md
└── README.md
```

---

## Prerequisites

- Python 3.10+
- Node.js 18+
- MongoDB (local or Atlas free tier)
- At least one [Gemini API key](https://aistudio.google.com/apikey) (free tier)

---

## Setup

### 1. Configure environment

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```env
GEMINI_API_KEY_1="your-key-here"
GEMINI_API_KEY_2="optional-second-key"

# MongoDB
MONGODB_URL="mongodb://localhost:27017"
MONGODB_DB="mavrick"

# JWT — change this to a long random string in production
JWT_SECRET="change-me-in-production-use-openssl-rand-hex-32"

# Admin — comma-separated emails that get admin access
ADMIN_EMAILS="yourname@example.com"
```

### 2. Backend

```bash
cd backend
python -m pip install -r requirements.txt
uvicorn app.main:app --reload
```

Runs on **http://localhost:8000**

```
GET  /health                  →  key budget, usage per key, model
POST /api/auth/register       →  { email, password, name }
POST /api/auth/login          →  { email, password } → JWT token
POST /api/plan                →  { text, minutes_left, age? } → plan (auth required)
GET  /api/admin/users         →  list all users (admin only)
DELETE /api/admin/users/{id}  →  delete user (admin only)
GET  /api/admin/stats         →  usage stats + cache size (admin only)
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on **http://localhost:5173** — Vite proxies `/api` and `/health` to the
backend automatically.

---

## Admin panel

Navigate to `/admin` while logged in with an email listed in `ADMIN_EMAILS`.
The admin panel is guarded server-side (403 if not admin) and client-side
(redirects to `/app` if `isAdmin` is false).

Admin features:
- **Users** — list all users, search, delete accounts
- **API Budget** — per-key usage bars, cooling status, total remaining calls
- **System Health** — live status of backend, model, keys, cache
- **Cache** — SQLite cache size and TTL info

---

## API

### `POST /api/plan`

**Request**
```json
{
  "text": "Client presentation in 90 minutes, haven't prepared a single slide",
  "minutes_left": 90,
  "age": 30
}
```

**Response**
```json
{
  "plan": {
    "cluster": "Work",
    "sub_type": "client presentation",
    "severity": "critical",
    "summary": "...",
    "steps": [
      { "order": 1, "title": "Open your slides", "detail": "...", "minutes": 3, "is_right_now": true }
    ],
    "first_action": "Open your presentation software right now.",
    "warnings": ["This will be basic — focus on clarity over polish."]
  },
  "urgency_score": 80,
  "urgency_colour": "red",
  "total_planned_minutes": 77,
  "minutes_left": 90,
  "fits": true,
  "cached": false,
  "key_index": 1,
  "latency_ms": 1240
}
```

Repeated requests with the same crisis return `cached: true` and cost **zero** Gemini calls.

---

## Crisis clusters

| Cluster | Consequence weight | Example crises |
|---|---|---|
| Health & Medical | 1.00 | Prescription refill, missed vaccination |
| Legal & Government | 0.95 | Visa expiring, court date, tax deadline |
| Financial & Money | 0.85 | Bill triage, rent overdue, EMI missed |
| Family & Parenting | 0.80 | School pickup, child medication |
| Work & Career | 0.70 | Presentation in 1 hr, report not started |
| Academic & Learning | 0.60 | Assignment due tonight, exam tomorrow |
| Digital & Admin | 0.60 | Account hacked, domain expiring |
| Social & Relationships | 0.40 | Forgotten birthday, RSVP closing |

---

## Current status

- [x] Backend — FastAPI, Gemini key manager, round-robin, fallback mode
- [x] Auth — JWT register/login, bcrypt passwords, MongoDB user store
- [x] Spine — `POST /api/plan` classifies + plans in one Gemini call
- [x] Verified live — real plans returned; cache returns 0-call repeats
- [x] Frontend — React PWA, pixel art UI, full-width navbar, mobile-responsive
- [x] Admin panel — user management, API budget viz, health checks
- [x] Plan cache — SQLite persists across backend restarts (24h TTL)
- [x] Degraded mode — generic triage plan when all API keys exhausted
- [ ] Firestore persistence (plan history, user memory)
- [ ] Voice output — TTS coach check-ins
- [ ] Gmail scan — surface deadlines from inbox
- [ ] Calendar write — HITL approval before any write
