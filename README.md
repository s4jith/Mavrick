# Mavrick

**The AI execution engine that turns panic into a plan.**

Tell Mavrick your crisis and how much time is left — it returns an exact,
time-blocked, step-by-step plan in seconds, starting with one thing you can do
*right now*. Not a reminder app: an execution engine that activates under pressure.

Built for the Vibe2Ship hackathon · Google-first · Gemini 2.5 Flash.

## Stack
- **Frontend:** React + TypeScript + Vite (installable PWA)
- **Backend:** FastAPI (Python)
- **AI:** Gemini 2.5 Flash — one structured call does classify + plan
- **Call budget:** round-robin across N API keys with a daily cap, 429 cooldown,
  and a plan cache so repeats cost zero calls

## Quick start
```bash
# 1. Backend  (needs backend/.env with GEMINI_API_KEY_1..N)
cd backend
python -m pip install -r requirements.txt
uvicorn app.main:app --reload          # http://localhost:8000

# 2. Frontend
cd frontend
npm install
npm run dev                            # http://localhost:5173
```
Open http://localhost:5173.

## Docs
- `my-reference/WORKFLOW.md` — how the product behaves (the user journey)
- `my-reference/ARCHITECTURE.md` — how it's built (agents, stack, data)
- `CLAUDE.md` — working guide, call-budget rules, project status
