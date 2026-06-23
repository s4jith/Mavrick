"""Coach agent — generates motivational check-in messages.

Rule-based (no LLM call). Produces context-aware nudges based on the
current step, time elapsed, and user progress. The frontend triggers
these during Time Warp mode or at real-time intervals.
"""
from __future__ import annotations

import random

from ..core.schemas import Plan, Step


# --- Message templates by context ---
_STARTING = [
    "You've got this. Step 1 is the hardest — just start.",
    "The hardest part is opening the laptop. You're past that.",
    "No thinking, just doing. Start with: {action}",
    "Every expert was once a beginner under pressure. Let's go.",
]

_ON_TRACK = [
    "Nice — you're on step {order}. Keep the momentum.",
    "You're ahead of the curve. {minutes_left} min left, and you're crushing it.",
    "Step {order} done. That's real progress. Next: {next_title}.",
    "You're doing better than 90% of people who'd still be panicking.",
]

_HALFWAY = [
    "Halfway through. Breathe for 10 seconds, then keep going.",
    "You've already done the hard part. The second half is easier.",
    "50% done. You're not failing — you're executing under pressure.",
]

_ALMOST_DONE = [
    "Almost there — one or two steps left. Finish strong.",
    "The finish line is in sight. Don't slow down now.",
    "Last push. You'll look back and be proud you didn't quit.",
]

_FALLING_BEHIND = [
    "You're a bit behind. Skip polish — focus on the core.",
    "Time is tight. Drop anything non-essential and focus.",
    "Imperfect and done beats perfect and late. Keep moving.",
]

_STUCK = [
    "Stuck? Skip this step for now and come back to it.",
    "If you're stuck for more than 2 minutes, move on. Momentum matters.",
    "Ask yourself: 'What's the simplest version of this?' Do that.",
]

_COMPLETED = [
    "You did it! Crisis handled. Take a breath — you earned it.",
    "Done. That's what executing under pressure looks like. 💪",
    "Crisis survived. Mavrick remembers — next time you'll be even faster.",
]


def get_check_in(
    plan: Plan,
    current_step_index: int,
    steps_completed: int,
    minutes_elapsed: int,
    minutes_left: int,
) -> dict:
    """Generate a context-aware coach message.

    Args:
        plan: The active plan.
        current_step_index: 0-based index of the step the user should be on.
        steps_completed: How many steps the user has actually checked off.
        minutes_elapsed: Minutes since the plan started.
        minutes_left: Original minutes_left from the crisis.

    Returns:
        A dict with 'message', 'tone', and 'step_hint'.
    """
    total_steps = len(plan.steps)
    progress = steps_completed / max(total_steps, 1)
    time_progress = minutes_elapsed / max(minutes_left, 1)

    # Determine context
    if steps_completed >= total_steps:
        pool = _COMPLETED
        tone = "celebration"
    elif steps_completed == 0 and minutes_elapsed < 2:
        pool = _STARTING
        tone = "encouraging"
    elif time_progress > progress + 0.2:
        pool = _FALLING_BEHIND
        tone = "urgent"
    elif progress >= 0.8:
        pool = _ALMOST_DONE
        tone = "motivating"
    elif progress >= 0.45:
        pool = _HALFWAY
        tone = "calm"
    else:
        pool = _ON_TRACK
        tone = "positive"

    template = random.choice(pool)

    # Fill in template vars
    current_step: Step | None = (
        plan.steps[current_step_index]
        if current_step_index < total_steps
        else None
    )
    next_step: Step | None = (
        plan.steps[current_step_index + 1]
        if current_step_index + 1 < total_steps
        else None
    )

    message = template.format(
        action=plan.first_action,
        order=current_step.order if current_step else "?",
        next_title=next_step.title if next_step else "wrap up",
        minutes_left=max(0, minutes_left - minutes_elapsed),
    )

    return {
        "message": message,
        "tone": tone,
        "step_hint": current_step.title if current_step else None,
        "progress_pct": round(progress * 100),
    }
