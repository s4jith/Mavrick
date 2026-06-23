"""Mavrick FastAPI entrypoint."""
from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import __version__
from .agents.coach import get_check_in
from .agents.fallback import make_fallback_plan
from .agents.planner import make_plan
from .core.schemas import CoachRequest, CoachResponse, PlanRequest, PlanResponse
from .gemini.key_manager import NoKeyAvailable
from .logging_config import get_logger
from .runtime import key_manager, settings

log = get_logger("api")


@asynccontextmanager
async def lifespan(app: FastAPI):
    log.info("Mavrick v%s starting — model=%s", __version__, settings.model)
    log.info(
        "Gemini budget: %d keys × %d/day = %d calls/day",
        len(settings.gemini_keys),
        settings.daily_limit_per_key,
        settings.daily_budget,
    )
    yield
    log.info("Mavrick shutting down.")


app = FastAPI(title="Mavrick", version=__version__, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict:
    return {
        "status": "ok",
        "version": __version__,
        "model": settings.model,
        "calls_remaining_today": key_manager.remaining_today(),
        "keys": key_manager.status(),
    }


@app.post("/api/plan", response_model=PlanResponse)
def plan(req: PlanRequest) -> PlanResponse:
    log.info("PANIC: %r (%d min left)", req.text[:60], req.minutes_left)
    try:
        return make_plan(req)
    except NoKeyAvailable as err:
        log.warning("No Gemini capacity — returning degraded fallback plan: %s", err)
        return make_fallback_plan(req.text, req.minutes_left)


@app.post("/api/coach", response_model=CoachResponse)
def coach(req: CoachRequest) -> CoachResponse:
    log.info(
        "Coach check-in: step %d, %d/%d completed, %d min elapsed",
        req.current_step_index,
        req.steps_completed,
        len(req.plan.steps),
        req.minutes_elapsed,
    )
    result = get_check_in(
        plan=req.plan,
        current_step_index=req.current_step_index,
        steps_completed=req.steps_completed,
        minutes_elapsed=req.minutes_elapsed,
        minutes_left=req.minutes_left,
    )
    return CoachResponse(**result)
