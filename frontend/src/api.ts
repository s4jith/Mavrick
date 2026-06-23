import type { CoachRequest, CoachResponse, Health, PlanRequest, PlanResponse } from './types'

// In dev, Vite proxies /api and /health to the FastAPI backend.
// In prod, set VITE_API_BASE to the deployed backend origin.
const BASE = import.meta.env.VITE_API_BASE ?? ''

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function parseError(res: Response): Promise<never> {
  let detail = `Request failed (${res.status})`
  try {
    const body = await res.json()
    if (body?.detail) detail = body.detail
  } catch {
    /* ignore */
  }
  throw new ApiError(res.status, detail)
}

export async function getPlan(req: PlanRequest): Promise<PlanResponse> {
  const res = await fetch(`${BASE}/api/plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  })
  if (!res.ok) return parseError(res)
  return res.json()
}

export async function getCoachMessage(req: CoachRequest): Promise<CoachResponse> {
  const res = await fetch(`${BASE}/api/coach`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  })
  if (!res.ok) return parseError(res)
  return res.json()
}

export async function getHealth(): Promise<Health> {
  const res = await fetch(`${BASE}/health`)
  if (!res.ok) return parseError(res)
  return res.json()
}
