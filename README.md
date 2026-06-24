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
| Frontend | React 19 + TypeScript + Vite · installable PWA · pixel art UI |
| Routing | React Router DOM v6 — multi-page app |
| Auth | JWT (jose) + bcrypt · MongoDB user store (Motor async driver) |
| Backend | FastAPI (Python 3.10+) |
| AI | Gemini 2.5 Flash — 1 structured call per crisis (classify + plan) |
| Key management | Round-robin across N keys · daily cap · 429 cooldown |
| Cache | SQLite TTL cache at `backend/data/cache.db` · survives restarts |
| Database | MongoDB (Motor) — users, auth tokens |

---

## Pages & Routes

| Route | Page | Description |
|---|---|---|
| `/` | Landing | Hero + CTAs (pixel art, hot-pink→cyan gradient palette) |
| `/login` | Login | Email + password authentication |
| `/register` | Register | Account creation |
| `/app` | Dashboard | Stats: total crises, this-week count, avg urgency, avg score, recent list, cluster distribution, AI budget |
| `/app/plan` | Crisis Plan | Panic form → Gemini plan → step-by-step execution view |
| `/app/reminders` | Reminders | Full CRUD reminder manager with priorities, due dates, overdue detection |
| `/app/settings` | Settings | Profile info, preferences (pixel grid, voice), data management |
| `/admin` | Admin Panel | User table, API budget, health check, cache info (admin only) |

All `/app/*` routes are wrapped in **AppLayout** — vertical sidebar nav + auth guard.
The admin page uses its own separate layout, completely isolated from the user pages.

---

## UI Design

- **Pixel art theme** — Press Start 2P font, SVG rect-based icons (16×16 grid), 3D bevel buttons with box-shadow "floor", dashed `::after` inner frames
- **Color palette** — 10-step gradient: `#f72585` → `#b5179e` → `#7209b7` → `#560bad` → `#480ca8` → `#3a0ca3` → `#3f37c9` → `#4361ee` → `#4895ef` → `#4cc9f0`
- **Light theme** — white/near-white main background (#f8f9ff), dark purple sidebar (#10002b)
- **Vertical sidebar** — fixed left nav with logo, user card, nav links, spacer, settings + logout at bottom; collapses to icon-only on mobile (≤768px)
- **Responsive** — sidebar collapses, stat grid adjusts, mobile-safe padding, PWA installable

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
│       ├── App.tsx             # routes + AdminGuard + AppLayout wrapper
│       ├── App.css             # all pixel UI styles — light theme
│       ├── api.ts              # fetch wrappers for all endpoints
│       ├── types.ts            # TypeScript types mirroring backend
│       ├── context/
│       │   └── AuthContext.tsx # JWT auth state + isAdmin flag
│       ├── pages/
│       │   ├── Landing.tsx     # pixel art hero + CTAs (hot-pink palette)
│       │   ├── Login.tsx       # email/password login
│       │   ├── Register.tsx    # sign up
│       │   ├── Dashboard.tsx   # stats page: history, clusters, budget
│       │   ├── PlanPage.tsx    # crisis form → Gemini plan → steps
│       │   ├── Reminders.tsx   # CRUD reminders (localStorage)
│       │   ├── Settings.tsx    # profile, preferences, data management
│       │   └── Admin.tsx       # admin panel (separate layout)
│       ├── components/
│       │   ├── Sidebar.tsx     # vertical left sidebar nav
│       │   ├── AppLayout.tsx   # auth-guard wrapper + sidebar layout
│       │   ├── Navbar.tsx      # top navbar (landing/legacy)
│       │   ├── PanicForm.tsx   # crisis input, minutes, quick chips
│       │   ├── PlanView.tsx    # urgency badge, NOW card, step list
│       │   ├── StepCard.tsx    # checkable step card
│       │   ├── StressMeter.tsx # progress gauge SVG
│       │   ├── TimeWarp.tsx    # coach / time simulation
│       │   ├── HistoryPanel.tsx# past crises drawer
│       │   ├── VoiceButton.tsx # Web Speech API input
│       │   ├── PixelAvatar.tsx # pixel art characters (panicked / calm)
│       │   └── icons/
│       │       └── PixelIcons.tsx  # 25+ SVG pixel-art icons (16×16 grid)
│       └── styles/
│           └── tokens.css      # design tokens (10-color palette, motion)
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
(redirects to `/app` if `isAdmin` is false). It is completely isolated from
the user-facing AppLayout — separate sidebar, separate routing.

Admin features:
- **Users** — list all users, search, delete accounts
- **API Budget** — per-key usage bars, cooling status, total remaining calls
- **System Health** — live status of backend, model, keys, cache
- **Cache** — SQLite cache size and TTL info

---

## Reminders

Reminders are stored in `localStorage` under the key `mavrick_reminders`.
Full CRUD: add, edit (click any row), toggle complete, delete.
Fields: title, description, due date/time, priority (high/medium/low).
Overdue items are highlighted in the crisis-red color automatically.

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
- [x] Frontend — React PWA, pixel art UI, light theme, mobile-responsive
- [x] Multi-page app — Dashboard, Crisis Plan, Reminders, Settings, Admin
- [x] Vertical sidebar nav — fixed left sidebar, collapses to icons on mobile
- [x] Dashboard stats — total plans, this-week, avg urgency, cluster chart
- [x] Reminders — full CRUD with priorities, due dates, overdue detection
- [x] Settings — profile, preferences, data management
- [x] Admin panel — user management, API budget viz, health checks (isolated page)
- [x] Plan cache — SQLite persists across backend restarts (24h TTL)
- [x] Degraded mode — generic triage plan when all API keys exhausted
- [ ] Firestore persistence (plan history, user memory)
- [ ] Voice output — TTS coach check-ins
- [ ] Gmail scan — surface deadlines from inbox
- [ ] Calendar write — HITL approval before any write
