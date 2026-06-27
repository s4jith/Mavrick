import type { AdminStats, AdminUser, CoachRequest, CoachResponse, Health, PlanRequest, PlanResponse, UserLogin, UserRegister, Token, UserResponse, IntegrationStatus, GmailScan, CalendarEvents, CreateEventRequest, CalendarEvent } from './types'

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

export async function getMe(token?: string): Promise<UserResponse> {
  const auth = token ?? localStorage.getItem('mavrick_token')
  const res = await fetch(`${BASE}/api/auth/me`, {
    headers: { Authorization: `Bearer ${auth}` },
  })
  if (!res.ok) return parseError(res)
  return res.json()
}

// Full-page redirect into the Google OAuth consent flow (via the Vite proxy).
export function googleLoginUrl(): string {
  return `${BASE}/api/auth/google/login`
}

// ── Google integrations ─────────────────────────────────────────

export async function getIntegrationStatus(): Promise<IntegrationStatus> {
  const res = await fetch(`${BASE}/api/integrations/status`, { headers: getHeaders() })
  if (!res.ok) return parseError(res)
  return res.json()
}

export async function disconnectGoogle(): Promise<void> {
  const res = await fetch(`${BASE}/api/integrations/disconnect`, {
    method: 'POST', headers: getHeaders(),
  })
  if (!res.ok) return parseError(res)
}

export async function scanGmail(maxResults = 15): Promise<GmailScan> {
  const res = await fetch(`${BASE}/api/integrations/gmail/scan?max_results=${maxResults}`, {
    headers: getHeaders(),
  })
  if (!res.ok) return parseError(res)
  return res.json()
}

export async function getCalendarEvents(days = 14): Promise<CalendarEvents> {
  const res = await fetch(`${BASE}/api/integrations/calendar/events?days=${days}`, {
    headers: getHeaders(),
  })
  if (!res.ok) return parseError(res)
  return res.json()
}

export async function createCalendarEvent(req: CreateEventRequest): Promise<CalendarEvent> {
  const res = await fetch(`${BASE}/api/integrations/calendar/events`, {
    method: 'POST', headers: getHeaders(), body: JSON.stringify(req),
  })
  if (!res.ok) return parseError(res)
  return res.json()
}

// ── Text-to-Speech ──────────────────────────────────────────────

export async function ttsAvailable(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}/api/tts/available`)
    if (!res.ok) return false
    return (await res.json()).available === true
  } catch { return false }
}

export async function synthesizeSpeech(text: string): Promise<string | null> {
  try {
    const res = await fetch(`${BASE}/api/tts/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
    if (!res.ok) return null
    return (await res.json()).audio as string
  } catch { return null }
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
