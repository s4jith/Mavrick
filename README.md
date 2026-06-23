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
| Frontend | React 19 + TypeScript + Vite 8 · installable PWA · Material 3 tokens |
| Backend | FastAPI (Python 3.10+) |
| AI | Gemini 2.5 Flash — 1 structured call per crisis (classify + plan) |
| Key management | Round-robin across N keys · daily cap · 429 cooldown · TTL plan cache |
| Database | Firestore (Firebase) — planned |
| Cache | Redis via Upstash — planned (in-memory TTL cache used today) |

---

## Repo layout

```
Mavrick/
├── backend/
│   ├── .env                   # your Gemini keys (gitignored)
│   ├── .env.example           # template to copy
│   ├── requirements.txt
│   └── app/
│       ├── main.py            # FastAPI entry — /health + /api/plan
│       ├── config.py          # settings loaded from .env
│       ├── runtime.py         # shared singletons (cache, key manager, gemini client)
│       ├── logging_config.py  # clean colour console logging
│       ├── gemini/
│       │   ├── key_manager.py # round-robin, daily cap, 429 cooldown, daily reset
│       │   └── client.py      # cache → acquire key → call → retry on 5xx/429
│       ├── agents/
│       │   └── planner.py     # 1 Gemini call: classify crisis + build time-blocked plan
│       ├── core/
│       │   ├── schemas.py     # Pydantic models (request, plan steps, response)
│       │   ├── clusters.py    # 8 crisis clusters + consequence weights
│       │   └── urgency.py     # pure-Python urgency score (0–100)
│       └── store/
│           └── cache.py       # thread-safe TTL cache (Redis-compatible interface)
├── frontend/
│   ├── index.html
│   ├── vite.config.ts         # dev proxy → backend :8000; PWA manifest
│   └── src/
│       ├── App.tsx            # state machine: idle → loading → done
│       ├── api.ts             # fetch wrapper for /api/plan and /health
│       ├── types.ts           # TypeScript types mirroring backend schemas
│       ├── components/
│       │   ├── Header.tsx     # brand + live key-budget pill
│       │   ├── PanicForm.tsx  # crisis input, minutes left, quick-time chips
│       │   ├── PlanView.tsx   # urgency badge, NOW card, budget bar, step list
│       │   └── StepCard.tsx   # checkable step with break detection
│       └── styles/
│           └── tokens.css     # design tokens (colours, radii, motion)
├── my-reference/
│   ├── WORKFLOW.md            # what the product does (user journey)
│   └── ARCHITECTURE.md       # how it's built (agents, stack, decisions)
├── CLAUDE.md                  # working guide for developers + Claude Code
└── README.md
```

---

## Prerequisites

- Python 3.10+
- Node.js 18+
- At least one [Gemini API key](https://aistudio.google.com/apikey) (free tier works)

---

## Setup

### 1. Configure API keys

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```env
GEMINI_API_KEY_1="your-key-here"
GEMINI_API_KEY_2="optional-second-key"
# Add up to N keys — each gets its own 20 calls/day budget
```

The key manager round-robins across all configured keys. More keys = more daily
capacity. Never commit `.env`.

### 2. Backend

```bash
cd backend
python -m pip install -r requirements.txt
uvicorn app.main:app --reload
```

Runs on **http://localhost:8000**

```
GET  /health      →  key budget, usage per key, model
POST /api/plan    →  { text, minutes_left, age? }  →  full plan response
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on **http://localhost:5173** — Vite proxies `/api` and `/health` to the
backend automatically. No CORS config needed in dev.

---

## API

### `POST /api/plan`

**Request**
```json
{
  "text": "I have a client presentation in 90 minutes and I haven't prepared",
  "minutes_left": 90,
  "age": 45
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
      { "order": 1, "title": "Open your slides", "detail": "...", "minutes": 3, "is_right_now": true },
      ...
    ],
    "first_action": "Open your presentation software and a blank template.",
    "warnings": ["This presentation will be basic. Focus on clarity..."]
  },
  "urgency_score": 80,
  "urgency_colour": "red",
  "total_planned_minutes": 77,
  "minutes_left": 90,
  "fits": true,
  "cached": false,
  "key_index": 1,
  "latency_ms": 9999
}
```

Repeated requests with the same crisis return `cached: true` and spend **zero**
API calls.

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

- [x] Backend — FastAPI, Gemini key manager, round-robin, plan cache
- [x] Spine — `POST /api/plan` classifies + plans in one Gemini call
- [x] Verified live — real plans returned; cache works; 5xx auto-retry
- [x] Frontend — React PWA, Panic Mode, urgency UI, checkable steps
- [ ] Persistence — Firestore (plans, user history)
- [ ] Cache — Redis via Upstash (replace in-memory TTL store)
- [ ] Voice input — Web Speech API in-browser
- [ ] Coach — check-in messages + TTS voice output
- [ ] Gmail scan — surface deadlines from inbox
- [ ] Calendar write — HITL approval before any write
