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
  urgency_colour: 'red' | 'amber' | 'green' | 'orange'
  total_planned_minutes: number
  minutes_left: number
  fits: boolean
  cached: boolean
  key_index: number | null
  latency_ms: number
  evaluator_score: number
  evaluator_notes: string[]
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

export interface CoachRequest {
  plan: Plan
  current_step_index: number
  steps_completed: number
  minutes_elapsed: number
  minutes_left: number
}

export interface CoachResponse {
  message: string
  tone: string
  step_hint: string | null
  progress_pct: number
}

export interface CrisisHistory {
  id: string
  text: string
  cluster: string
  sub_type: string
  severity: string
  urgency_score: number
  evaluator_score: number
  steps_count: number
  completed_at: string
}

export interface UserRegister {
  email: string
  password: string
  name: string
}

export interface UserLogin {
  email: string
  password: string
}

export interface Token {
  access_token: string
  token_type: string
}

export interface UserResponse {
  id: string
  email: string
  name: string
}

// ── Admin types ─────────────────────────────────────────────────

export interface AdminUser {
  id: string
  email: string
  name: string
  created_at: string | null
}

export interface AdminStats {
  total_users: number
  cache_entries: number
  api_keys_total: number
  calls_used_today: number
  calls_remaining_today: number
  keys: KeyStatus[]
}
