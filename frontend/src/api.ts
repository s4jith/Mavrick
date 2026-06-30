import { auth } from './firebase'
import type { AdminStats, AdminUser, CoachRequest, CoachResponse, Health, PlanRequest, PlanResponse, UserResponse, UserProfile, CrisisHistory, Reminder } from './types'

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

// Always attach a fresh Firebase ID token. auth.currentUser.getIdToken()
// returns the cached token or transparently refreshes it near expiry, so every
// authenticated request carries a valid token and the backend keys off the UID.
async function authHeaders(): Promise<Record<string, string>> {
  let token = localStorage.getItem('mavrick_token');
  try {
    const u = auth.currentUser;
    if (u) {
      token = await u.getIdToken();
      localStorage.setItem('mavrick_token', token);
    }
  } catch {
    /* fall back to the stored token */
  }
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

export async function getMe(token?: string): Promise<UserResponse> {
  const auth = token ?? localStorage.getItem('mavrick_token')
  const res = await fetch(`${BASE}/api/auth/me`, {
    headers: { Authorization: `Bearer ${auth}` },
  })
  if (!res.ok) return parseError(res)
  return res.json()
}

// ── Profile (Firestore) ─────────────────────────────────────────

export async function syncProfile(): Promise<UserProfile> {
  const res = await fetch(`${BASE}/api/profile/sync`, { method: 'POST', headers: await authHeaders() })
  if (!res.ok) return parseError(res)
  return res.json()
}

export async function getProfile(): Promise<UserProfile> {
  const res = await fetch(`${BASE}/api/profile`, { headers: await authHeaders() })
  if (!res.ok) return parseError(res)
  return res.json()
}

export async function updateProfile(fields: Partial<UserProfile>): Promise<UserProfile> {
  const res = await fetch(`${BASE}/api/profile`, {
    method: 'PUT', headers: await authHeaders(), body: JSON.stringify(fields),
  })
  if (!res.ok) return parseError(res)
  return res.json()
}

// ── History (Firestore) ─────────────────────────────────────────

export async function getHistory(): Promise<CrisisHistory[]> {
  const res = await fetch(`${BASE}/api/history`, { headers: await authHeaders() })
  if (!res.ok) return parseError(res)
  return res.json()
}

export async function addHistory(item: Omit<CrisisHistory, 'id'>): Promise<CrisisHistory> {
  const res = await fetch(`${BASE}/api/history`, {
    method: 'POST', headers: await authHeaders(), body: JSON.stringify(item),
  })
  if (!res.ok) return parseError(res)
  return res.json()
}

export async function clearHistory(): Promise<void> {
  const res = await fetch(`${BASE}/api/history`, { method: 'DELETE', headers: await authHeaders() })
  if (!res.ok) return parseError(res)
}

// ── Reminders (Firestore) ───────────────────────────────────────

export async function getReminders(): Promise<Reminder[]> {
  const res = await fetch(`${BASE}/api/reminders`, { headers: await authHeaders() })
  if (!res.ok) return parseError(res)
  return res.json()
}

export async function addReminder(item: Omit<Reminder, 'id' | 'created_at'>): Promise<Reminder> {
  const res = await fetch(`${BASE}/api/reminders`, {
    method: 'POST', headers: await authHeaders(), body: JSON.stringify(item),
  })
  if (!res.ok) return parseError(res)
  return res.json()
}

export async function updateReminder(id: string, fields: Partial<Reminder>): Promise<Reminder> {
  const res = await fetch(`${BASE}/api/reminders/${id}`, {
    method: 'PATCH', headers: await authHeaders(), body: JSON.stringify(fields),
  })
  if (!res.ok) return parseError(res)
  return res.json()
}

export async function deleteReminder(id: string): Promise<void> {
  const res = await fetch(`${BASE}/api/reminders/${id}`, { method: 'DELETE', headers: await authHeaders() })
  if (!res.ok) return parseError(res)
}

// ── Settings (Firestore) ────────────────────────────────────────

export async function getSettings(): Promise<Record<string, unknown>> {
  const res = await fetch(`${BASE}/api/settings`, { headers: await authHeaders() })
  if (!res.ok) return parseError(res)
  return res.json()
}

export async function putSettings(fields: Record<string, unknown>): Promise<Record<string, unknown>> {
  const res = await fetch(`${BASE}/api/settings`, {
    method: 'PUT', headers: await authHeaders(), body: JSON.stringify(fields),
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
      headers: await authHeaders(),
      body: JSON.stringify({ text }),
    })
    if (!res.ok) return null
    return (await res.json()).audio as string
  } catch { return null }
}

export async function getPlan(req: PlanRequest): Promise<PlanResponse> {
  const res = await fetch(`${BASE}/api/plan`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(req),
  })
  if (!res.ok) return parseError(res)
  return res.json()
}

export async function getCoachMessage(req: CoachRequest): Promise<CoachResponse> {
  const res = await fetch(`${BASE}/api/coach`, {
    method: 'POST',
    headers: await authHeaders(),
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
  const res = await fetch(`${BASE}/api/admin/users`, { headers: await authHeaders() })
  if (!res.ok) return parseError(res)
  return res.json()
}

export async function adminDeleteUser(id: string): Promise<void> {
  const res = await fetch(`${BASE}/api/admin/users/${id}`, {
    method: 'DELETE',
    headers: await authHeaders(),
  })
  if (!res.ok) return parseError(res)
}

export async function adminGetStats(): Promise<AdminStats> {
  const res = await fetch(`${BASE}/api/admin/stats`, { headers: await authHeaders() })
  if (!res.ok) return parseError(res)
  return res.json()
}
