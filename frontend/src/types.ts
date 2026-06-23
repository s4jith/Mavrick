// Shapes mirror the FastAPI backend (app/core/schemas.py)

export interface Step {
  order: number
  title: string
  detail: string
  minutes: number
  is_right_now: boolean
}

export interface Plan {
  cluster: string
  sub_type: string
  severity: string
  summary: string
  steps: Step[]
  first_action: string
  warnings: string[]
}

export interface PlanResponse {
  plan: Plan
  urgency_score: number
  urgency_colour: 'red' | 'amber' | 'green'
  total_planned_minutes: number
  minutes_left: number
  fits: boolean
  cached: boolean
  key_index: number | null
  latency_ms: number
}

export interface PlanRequest {
  text: string
  minutes_left: number
  age?: number | null
}

export interface KeyStatus {
  key: string
  used_today: number
  limit: number
  cooling: number
}

export interface Health {
  status: string
  version: string
  model: string
  calls_remaining_today: number
  keys: KeyStatus[]
}
