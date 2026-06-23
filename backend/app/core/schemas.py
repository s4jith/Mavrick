"""Request/response models. `Plan` doubles as the Gemini structured-output schema."""
from __future__ import annotations

from pydantic import BaseModel, Field


class PlanRequest(BaseModel):
    text: str = Field(min_length=3, description="The crisis, in the user's words.")
    minutes_left: int = Field(gt=0, description="Minutes until the deadline.")
    age: int | None = Field(default=None, ge=5, le=120)


class Step(BaseModel):
    """One action in the plan. All fields required so Gemini always fills them."""

    order: int
    title: str
    detail: str
    minutes: int
    is_right_now: bool


class Plan(BaseModel):
    """The structured object Gemini returns (classification + plan in one call)."""

    cluster: str
    sub_type: str
    severity: str
    summary: str
    steps: list[Step]
    first_action: str
    warnings: list[str]


class PlanResponse(BaseModel):
    """What the API hands back to the frontend."""

    plan: Plan
    urgency_score: int
    urgency_colour: str
    total_planned_minutes: int
    minutes_left: int
    fits: bool
    cached: bool
    key_index: int | None
    latency_ms: int
