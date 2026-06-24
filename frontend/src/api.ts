import type { AdminStats, AdminUser, CoachRequest, CoachResponse, Health, PlanRequest, PlanResponse, UserLogin, UserRegister, Token, UserResponse } from './types'

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

function getHeaders() {
  const token = localStorage.getItem('mavrick_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function loginUser(req: UserLogin): Promise<Token> {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  })
  if (!res.ok) return parseError(res)
  return res.json()
}

export async function registerUser(req: UserRegister): Promise<UserResponse> {
  const res = await fetch(`${BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  })
  if (!res.ok) return parseError(res)
  return res.json()
}

export async function getPlan(req: PlanRequest): Promise<PlanResponse> {
  const res = await fetch(`${BASE}/api/plan`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(req),
  })
  if (!res.ok) return parseError(res)
  return res.json()
}

export async function getCoachMessage(req: CoachRequest): Promise<CoachResponse> {
  const res = await fetch(`${BASE}/api/coach`, {
    method: 'POST',
    headers: getHeaders(),
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

// ── Admin API ────────────────────────────────────────────────────

export async function adminGetUsers(): Promise<AdminUser[]> {
  const res = await fetch(`${BASE}/api/admin/users`, { headers: getHeaders() })
  if (!res.ok) return parseError(res)
  return res.json()
}

export async function adminDeleteUser(id: string): Promise<void> {
  const res = await fetch(`${BASE}/api/admin/users/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  })
  if (!res.ok) return parseError(res)
}

export async function adminGetStats(): Promise<AdminStats> {
  const res = await fetch(`${BASE}/api/admin/stats`, { headers: getHeaders() })
  if (!res.ok) return parseError(res)
  return res.json()
}
