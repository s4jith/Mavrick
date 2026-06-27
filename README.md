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
| `/login` | Login | Email + password, real JWT auth |
| `/register` | Register | Full sign-up, auto-login → onboarding |
| `/onboarding` | Onboarding | Role selection (Student / Employee / Founder / Freelancer) |
| `/auth/callback` | OAuth Callback | Receives the Google token, then routes into the app |
| `/connect` | Connect Digital Life | Real Google (Gmail + Calendar) connect; Outlook/Drive soon |
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
| Database | MongoDB (Motor async) — user accounts + Google tokens |
| Auth | JWT (python-jose) + bcrypt · **Google OAuth 2.0** (sign-in) |
| Google APIs | Gmail (scan) · Calendar (read + HITL write) · People (profile) · Cloud TTS (coach voice) |

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

### 1. Backend env — `backend/.env`

```env
# Gemini keys (1..N). At least one required.
GEMINI_API_KEY_1="your-key-here"
GEMINI_API_KEY_2="optional-second-key"
GEMINI_API_KEY_3="optional-third-key"

# Model + budget (optional overrides)
GEMINI_MODEL="gemini-2.5-flash"
GEMINI_DAILY_LIMIT="20"

# MongoDB (user accounts)
MONGO_URI="mongodb://localhost:27017"

# JWT signing secret — change in production
SECRET_KEY="change-me-to-a-long-random-string"

# Admin access — comma-separated emails
ADMIN_EMAILS="you@example.com"

# Google OAuth + APIs (for Continue-with-Google, Gmail, Calendar)
GOOGLE_OAUTH_CLIENT_ID="xxxx.apps.googleusercontent.com"
GOOGLE_OAUTH_CLIENT_SECRET="GOCSPX-xxxx"
GOOGLE_REDIRECT_URI="http://localhost:8000/api/auth/google/callback"
FRONTEND_URL="http://localhost:5173"

# Optional — premium coach voice (else browser speech is used)
GOOGLE_TTS_API_KEY=""
```

See [`backend/.env.example`](./backend/.env.example) for the annotated template.

### 1b. Google Cloud Console (one-time, required for Google sign-in)

In [console.cloud.google.com](https://console.cloud.google.com) for your project:

1. **APIs & Services → Enable APIs**: Gmail API, Google Calendar API, People API,
   and (optional) Cloud Text-to-Speech API.
2. **Credentials → your OAuth 2.0 Web client → Authorized redirect URIs** — add
   **exactly**: `http://localhost:8000/api/auth/google/callback`
3. **OAuth consent screen → Data access** — add the scopes:
   `openid`, `userinfo.email`, `userinfo.profile`, `gmail.readonly`,
   `calendar.events`, `calendar.readonly`, `user.phonenumbers.read`.
4. **OAuth consent screen → Audience** — while the app is *Testing*, add your
   Google account under **Test users** (required for the Gmail/Calendar scopes).
5. *(TTS only)* Create an **API key** in the same project that has Cloud
   Text-to-Speech enabled, and set it as `GOOGLE_TTS_API_KEY`.

### 2. Backend

```bash
cd backend
python -m pip install -r requirements.txt
uvicorn app.main:app --reload          # http://localhost:8000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev                            # http://localhost:5173
```

Vite proxies `/api` and `/health` to the backend on `:8000`.

---

## API

```
GET  /health                           →  key budget, usage per key, model
POST /api/auth/register                →  { email, password, name }
POST /api/auth/login                   →  { email, password } → JWT token
GET  /api/auth/me                      →  current user profile          (auth)
GET  /api/auth/google/login            →  302 → Google consent screen
GET  /api/auth/google/callback         →  Google → JWT → /auth/callback
POST /api/plan                         →  { text, minutes_left, age? } → plan (auth)
POST /api/coach                        →  coach check-in message
GET  /api/integrations/status          →  which Google scopes connected (auth)
POST /api/integrations/disconnect      →  forget Google tokens          (auth)
GET  /api/integrations/gmail/scan      →  recent mail + deadline flags  (auth)
GET  /api/integrations/calendar/events →  upcoming Calendar events      (auth)
POST /api/integrations/calendar/events →  create event (HITL confirm=true) (auth)
GET  /api/tts/available                →  is premium Google TTS configured?
POST /api/tts                          →  { text } → base64 MP3 (coach voice)
GET  /api/admin/users                  →  list users          (admin only)
DELETE /api/admin/users/{id}           →  delete user          (admin only)
GET  /api/admin/stats                  →  usage + cache stats  (admin only)
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
│   └── app/
│       ├── main.py             # FastAPI entry — /health, /api/plan, /api/coach
│       ├── config.py           # settings from .env
│       ├── gemini/             # key manager (round-robin) + client wrapper
│       ├── agents/             # planner, fallback, evaluator, coach
│       ├── core/               # urgency, clusters, schemas, auth, db, google_oauth/store
│       ├── api/                # auth, google (oauth), integrations, tts, admin routers
│       └── store/cache.py      # SQLite TTL cache
├── frontend/
│   └── src/
│       ├── pages/              # 11 pixel screens + Admin/Reminders/Settings (legacy)
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
- [x] JWT auth (register/login) + MongoDB user store + bcrypt
- [x] Admin panel — users, API budget, health, cache
- [x] **All 11 reference screens** rebuilt in the locked pixel design system
- [x] End-to-end flow: Panic → Rescue → Execute → Mission Complete
- [x] Live Execution Mode (countdown, task progression, rule-based coach)
- [x] PWA, installable, mobile-responsive

- [x] Landing, Reminders, Settings converted to the pixel design (whole app now consistent)
- [x] **Google OAuth login** — "Continue with Google" → real account, JWT issued
- [x] `GET /api/auth/me` — real profile (Login/Register fetch it, no more email-derived names)
- [x] **Gmail scan** — pulls recent mail and flags deadline-looking messages
- [x] **Google Calendar** — Calendar screen shows live events; Rescue Plan "Add to Calendar" writes (HITL `confirm=true`)
- [x] **Coach voice** — Execution Mode speaks via Google Cloud TTS, with browser-speech fallback

**Known gaps (see roadmap)**
- [ ] Server-side crisis-history persistence (history is browser-local only)
- [ ] Microsoft / Outlook OAuth (button present but disabled)
- [ ] Gmail-derived deadlines surfaced on the Home dashboard
- [ ] PWA push notifications when a time block ends
- [ ] Google account verification (sensitive scopes need test users until then)

---

## Run the full product

```bash
# Terminal 1 — backend
cd backend && uvicorn app.main:app --reload      # http://localhost:8000

# Terminal 2 — frontend
cd frontend && npm run dev                        # http://localhost:5173
```

Open http://localhost:5173.
