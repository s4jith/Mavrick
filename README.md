# Mavrick

> **The AI execution engine that turns panic into a plan.**

You describe a crisis and how much time you have. Mavrick returns an exact,
time-blocked, step-by-step plan in seconds — starting with one action you can
take *right now*. Not a reminder app. An execution engine that activates under
pressure.

Built for the **Vibe2Ship hackathon** · Google-first · retro pixel-RPG UI · Age 10–100.

---

## The journey

```
Landing → Login / Register → Onboarding → Connect Digital Life
   → Home → PANIC MODE → AI Rescue Plan → Execution Mode → Mission Complete
        (+ Calendar · Profile · Productivity Insights)
```

One Gemini call classifies the crisis **and** builds the plan in a single
structured-output request. Urgency scoring and time-block math are pure Python —
no extra calls. A persistent cache returns identical crises instantly at zero cost.

---

## Design system (locked)

The entire app follows a single **pixel-art retro-RPG** design language, reverse-engineered
from 11 reference screens and documented in
[my-reference/DESIGN_SYSTEM.md](./my-reference/DESIGN_SYSTEM.md). It is treated as immutable —
every screen must look like the same designer made it.

- **Palette** — coral `#E85D50` · cream `#F0DDB5` · dark teal card `#0F3046` · city navy `#0D2535`
- **Font** — Press Start 2P everywhere
- **Mascot** — the white robot "AI Crisis Commander" with a heart on its chest
- **Shell** — fixed pixel city background (sky, moon, stars, PLAN/FOCUS buildings, cat),
  cream cards on a dark card, 3D bevel buttons, 5-tab bottom nav, and the
  `♥ YOUR AI PARTNER IN EVERY CRISIS ♥` strip on every screen.

Reusable building blocks live in `frontend/src/components/pixel/`
(`MavrickShell`, `PixelScene`, `RobotMascot`, `BottomNav`, `BrandHeader`, `BrandMark`, `AuthField`)
and `frontend/src/styles/mavrick.css`.

---

## Screens & routes

| Route | Screen | Notes |
|---|---|---|
| `/` | Landing | Marketing hero + CTAs *(still on the legacy light theme — see roadmap)* |
| `/login` | Login | **Firebase Auth** — Email/Password + Google sign-in |
| `/register` | Register | **Firebase** sign-up → onboarding |
| `/onboarding` | Onboarding | Role selection (Student / Employee / Founder / Freelancer) → saved to Firestore |
| `/connect` | Connect Digital Life | Onboarding info screen (Gmail/Calendar sync — coming soon) |
| `/app` | Home Dashboard | Crisis score, urgent deadlines, AI recommendation, timeline, quick actions |
| `/app/plan` | **Panic Mode** | Crisis textarea, voice input, time chips → SAVE ME |
| `/app/rescue` | AI Rescue Plan | Urgency score, AI analysis, time-blocked rescue timeline |
| `/app/execute` | Execution Mode | Live countdown, current/next task, AI coach, COMPLETE TASK |
| `/app/calendar` | Calendar | Month grid, events, AI scheduling suggestions |
| `/app/profile` | Profile | Player profile, connected accounts, achievements |
| `/app/insights` | Productivity Insights | Completion rate, crises solved, hours saved, AI tips |
| `/admin` | Admin Panel | Users, API budget, health, cache *(admin-only, legacy theme)* |

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript + Vite · installable PWA · Framer Motion · React Router v7 |
| UI | Custom pixel-art design system (Press Start 2P, SVG pixel icons, 3D bevels) |
| Backend | FastAPI (Python 3.10+) |
| AI | Gemini 2.5 Flash — 1 structured call per crisis (classify + plan) |
| Key management | Round-robin across N keys · daily cap · 429 cooldown · degraded fallback |
| Cache | SQLite TTL cache at `backend/data/cache.db` · survives restarts (24h TTL) |
| Auth | **Firebase Authentication** (Email/Password + Google) · backend verifies ID tokens with `firebase-admin` |
| Database | **Cloud Firestore** — users, history, reminders, settings (keyed by Firebase UID) |
| Voice | Google Cloud TTS for the coach, with browser `speechSynthesis` fallback |

---

## ⚠️ The #1 constraint — Gemini call budget

3 API keys × ~20 requests/day ≈ **60 LLM calls/day**. The architecture is built around this:

- **Most "agents" are plain Python** — urgency scoring, time-block math, the evaluator,
  and the Execution Mode coach are rule-based, *not* LLM calls.
- **1 Gemini call per crisis** — classify + plan combined via structured output.
- **Cache before you call** — identical crises return cached plans for **0 calls**.
- **Round-robin keys** with daily caps and 429 cooldowns (`backend/app/gemini/key_manager.py`).
- **Degraded mode** — when all keys are exhausted, `agents/fallback.py` returns a
  generic triage plan so the UI never hard-fails.

---

## Setup

Auth and data run on **Firebase** (project `mavrick-81bf2`). In the
[Firebase console](https://console.firebase.google.com): enable **Authentication
→ Email/Password and Google**, and create a **Firestore database**. Download a
service-account key (Project settings → Service accounts) to `backend/service-account.json`.

### 1. Frontend env — `frontend/.env`

```env
VITE_FIREBASE_API_KEY="…"
VITE_FIREBASE_AUTH_DOMAIN="<project>.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="<project>"
VITE_FIREBASE_STORAGE_BUCKET="<project>.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="…"
VITE_FIREBASE_APP_ID="…"
VITE_FIREBASE_MEASUREMENT_ID="…"
```

### 2. Backend env — `backend/.env`

```env
# Gemini keys (1..N). At least one required.
GEMINI_API_KEY_1="your-key-here"
GEMINI_API_KEY_2="optional-second-key"
GEMINI_MODEL="gemini-2.5-flash"
GEMINI_DAILY_LIMIT="20"

# Firebase Admin — token verification + Firestore
FIREBASE_PROJECT_ID="mavrick-81bf2"
FIREBASE_SERVICE_ACCOUNT="service-account.json"

# Admin access — comma-separated emails (checked against the Firebase token)
ADMIN_EMAILS="you@example.com"

# Optional — premium coach voice (else browser speech is used)
GOOGLE_TTS_API_KEY=""
```

See [`backend/.env.example`](./backend/.env.example) for the annotated template.
`backend/service-account.json` and both `.env` files are gitignored.

### 3. Run the backend

```bash
cd backend
python -m pip install -r requirements.txt
uvicorn app.main:app --reload          # http://localhost:8000
```

### 4. Run the frontend

```bash
cd frontend
npm install
npm run dev                            # http://localhost:5173
```

Vite proxies `/api` and `/health` to the backend on `:8000`.

---

## API

All authenticated requests send `Authorization: Bearer <Firebase ID token>`;
the backend verifies it with `firebase-admin` and keys off the Firebase **UID**.

```
GET    /health                  →  key budget, usage per key, model
GET    /api/auth/me             →  current user (from the verified token)
POST   /api/plan                →  { text, minutes_left, age? } → plan   (auth)
POST   /api/coach               →  coach check-in message
POST   /api/profile/sync        →  upsert the Firestore profile          (auth)
GET    /api/profile             →  read profile                          (auth)
PUT    /api/profile             →  update name / phone / role            (auth)
GET    /api/history             →  list solved crises                    (auth)
POST   /api/history             →  save a solved crisis                  (auth)
DELETE /api/history             →  clear history                         (auth)
GET    /api/reminders           →  list reminders                        (auth)
POST   /api/reminders           →  add reminder                          (auth)
PATCH  /api/reminders/{id}      →  update reminder                       (auth)
DELETE /api/reminders/{id}      →  delete reminder                       (auth)
GET    /api/settings            →  read preferences                      (auth)
PUT    /api/settings            →  save preferences                      (auth)
GET    /api/tts/available       →  is premium Google TTS configured?
POST   /api/tts                 →  { text } → base64 MP3 (coach voice)
GET    /api/admin/users         →  list users          (admin only)
DELETE /api/admin/users/{id}    →  delete user          (admin only)
GET    /api/admin/stats         →  usage + cache stats  (admin only)
```

### `POST /api/plan`

**Request**
```json
{ "text": "Client presentation in 90 minutes, no slides", "minutes_left": 90, "age": 30 }
```

**Response** (abridged)
```json
{
  "plan": {
    "cluster": "Work", "sub_type": "presentation", "severity": "critical",
    "steps": [{ "order": 1, "title": "Open your slides", "minutes": 3, "is_right_now": true }],
    "first_action": "Open your presentation software right now.",
    "warnings": ["Focus on clarity over polish."]
  },
  "urgency_score": 80, "urgency_colour": "red",
  "total_planned_minutes": 77, "minutes_left": 90, "fits": true,
  "cached": false, "key_index": 1, "latency_ms": 1240
}
```

Repeated identical crises return `cached: true` and cost **zero** Gemini calls.

---

## Repo structure

```
Mavrick/
├── backend/
│   ├── service-account.json    # Firebase Admin key (gitignored)
│   └── app/
│       ├── main.py             # FastAPI entry — /health, /api/plan, /api/coach
│       ├── config.py           # settings from .env
│       ├── gemini/             # key manager (round-robin) + client wrapper
│       ├── agents/             # planner, fallback, evaluator, coach
│       ├── core/               # urgency, clusters, schemas, firebase_admin, firestore_store
│       ├── api/                # auth (Firebase), profile, userdata, tts, admin routers
│       └── store/cache.py      # SQLite TTL cache
├── frontend/
│   └── src/
│       ├── firebase.ts         # Firebase app + Auth + Firestore init
│       ├── pages/              # pixel screens (Home/Panic/Rescue/Execute/…) + Admin
│       ├── context/            # AuthContext (Firebase-driven)
│       ├── components/pixel/   # MavrickShell, PixelScene, RobotMascot, BottomNav, …
│       ├── components/icons/   # PixelIcons (40+ SVG pixel-art icons)
│       └── styles/mavrick.css  # the pixel design system
├── App-images/                 # the 11 reference screens (source of truth)
├── my-reference/
│   ├── DESIGN_SYSTEM.md        # the locked design system spec
│   ├── WORKFLOW.md
│   └── ARCHITECTURE.md
├── CLAUDE.md
└── README.md
```

---

## Status

**Done**
- [x] Backend spine — `POST /api/plan` classifies + plans in one Gemini call
- [x] Round-robin key manager, daily caps, 429 cooldown, degraded fallback
- [x] Persistent SQLite plan cache (survives restarts)
- [x] **Firebase Authentication** — Email/Password + Google sign-in
- [x] **Backend verifies Firebase ID tokens** with `firebase-admin` (no JWT)
- [x] **Cloud Firestore** — users, history, reminders, settings (keyed by UID)
- [x] Admin panel — users (Firestore), API budget, health, cache
- [x] **All reference screens** in the locked pixel design system
- [x] End-to-end flow: Panic → Rescue → Execute → Mission Complete
- [x] Live Execution Mode (countdown, task progression, rule-based coach, TTS voice)
- [x] PWA, installable, mobile-responsive

**Known gaps / roadmap**
- [ ] Gmail/Calendar live sync (removed in the Firebase migration — re-do Firebase-native with Google provider scopes)
- [ ] Microsoft / Outlook sign-in
- [ ] PWA push notifications when a time block ends
- [ ] Firestore security rules (today all access is via the trusted backend / Admin SDK)

---

## Run the full product

```bash
# Terminal 1 — backend
cd backend && uvicorn app.main:app --reload      # http://localhost:8000

# Terminal 2 — frontend
cd frontend && npm run dev                        # http://localhost:5173
```

Open http://localhost:5173.
