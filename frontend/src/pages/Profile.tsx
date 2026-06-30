import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { updateProfile } from 'firebase/auth'
import { auth, firebaseAuthError } from '../firebase'
import { MavrickShell } from '../components/pixel/MavrickShell'
import { RobotMascot } from '../components/pixel/RobotMascot'
import { BrandMark } from '../components/pixel/BrandMark'
import { useAuth } from '../context/AuthContext'
import { getHistory, getSettings, putSettings, syncProfile } from '../api'
import type { CrisisHistory } from '../types'
import {
  UserIcon, MailIcon, PhoneIcon, FireIcon, HourglassIcon, TrophyIcon,
  CheckIcon, ChartIcon, GearIcon, CloseIcon, RefreshIcon, ZapIcon,
} from '../components/icons/PixelIcons'
import { PlayerAvatar, AvatarGrid, useAvatar } from '../components/pixel/Avatars'

const ACCOUNTS = [
  { provider: 'gmail' as const,  name: 'GMAIL' },
  { provider: 'google' as const, name: 'GOOGLE CALENDAR' },
]

/** Current consecutive-day streak from crisis history (days with ≥1 solve). */
function computeStreak(history: CrisisHistory[]): number {
  if (!history.length) return 0
  const days = new Set(
    history.map(h => new Date(h.completed_at).toDateString()),
  )
  let streak = 0
  const cursor = new Date()
  // Allow the streak to count from today or yesterday backwards.
  if (!days.has(cursor.toDateString())) cursor.setDate(cursor.getDate() - 1)
  while (days.has(cursor.toDateString())) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

export function Profile() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { avatar, setAvatar } = useAvatar()

  const [history, setHistory] = useState<CrisisHistory[]>([])
  const [picking, setPicking] = useState(false)

  // Editable fields
  const [editing, setEditing] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [phone, setPhone] = useState('')
  const [phoneInput, setPhoneInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { getHistory().then(setHistory).catch(() => setHistory([])) }, [])
  useEffect(() => {
    getSettings().then(s => {
      if (typeof s.phone === 'string') setPhone(s.phone)
    }).catch(() => { /* offline */ })
  }, [])

  const crisesSolved = history.length
  const hoursSaved = history.length ? Math.max(1, Math.round(history.length * 3.25)) : 0
  const streak = computeStreak(history)
  const email = user?.email || '—'
  const name = user?.name || '—'

  function startEdit() {
    setNameInput(user?.name ?? '')
    setPhoneInput(phone)
    setEditing(true)
    setError(null)
  }

  async function saveProfile() {
    setSaving(true); setError(null)
    try {
      const nextName = nameInput.trim()
      if (nextName && auth.currentUser && nextName !== user?.name) {
        await updateProfile(auth.currentUser, { displayName: nextName })
        await auth.currentUser.getIdToken(true)
        syncProfile().catch(() => { /* non-fatal */ })
      }
      const nextPhone = phoneInput.trim()
      setPhone(nextPhone)
      await putSettings({ phone: nextPhone })
      setEditing(false)
    } catch (err) {
      setError(firebaseAuthError(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <MavrickShell active="profile">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* ── Player profile ── */}
        <div className="mvk-card mvk-card-pad">
          <div className="mvk-sec-head">
            <span className="mvk-sec-title">PLAYER PROFILE</span>
            {!editing && (
              <button className="mvk-set-edit-btn" style={{ marginLeft: 'auto' }} onClick={startEdit}>
                <RefreshIcon size={11} /> EDIT
              </button>
            )}
          </div>

          {error && <div className="mvk-error" style={{ marginBottom: 10 }}>{error}</div>}

          <div className="mvk-prof-top">
            <button
              type="button"
              className="mvk-prof-avatar mvk-prof-avatar-btn"
              onClick={() => setPicking(p => !p)}
              title="Change avatar"
              aria-label="Change avatar"
            >
              <PlayerAvatar id={avatar} size={84} framed />
              <span className="mvk-prof-avatar-edit">EDIT</span>
            </button>

            {editing ? (
              <div className="mvk-prof-info" style={{ gap: 8 }}>
                <div>
                  <div className="mvk-prof-label">NAME</div>
                  <input className="mvk-textarea" style={{ minHeight: 'auto', marginTop: 4 }}
                    value={nameInput} onChange={e => setNameInput(e.target.value)} placeholder="Your name" autoFocus />
                </div>
                <div>
                  <div className="mvk-prof-label">PHONE</div>
                  <input className="mvk-textarea" style={{ minHeight: 'auto', marginTop: 4 }} type="tel"
                    value={phoneInput} onChange={e => setPhoneInput(e.target.value)} placeholder="Your phone number" />
                </div>
              </div>
            ) : (
              <div className="mvk-prof-info">
                <div className="mvk-prof-row"><span className="mvk-prof-ico"><UserIcon size={13} color="#E85D50" /></span><div><div className="mvk-prof-label">NAME</div><div className="mvk-prof-val">{name}</div></div></div>
                <div className="mvk-prof-row"><span className="mvk-prof-ico"><MailIcon size={13} color="#E85D50" /></span><div><div className="mvk-prof-label">EMAIL</div><div className="mvk-prof-val">{email}</div></div></div>
                <div className="mvk-prof-row"><span className="mvk-prof-ico"><PhoneIcon size={13} color="#E85D50" /></span><div><div className="mvk-prof-label">PHONE</div><div className="mvk-prof-val">{phone || '—'}</div></div></div>
              </div>
            )}
          </div>

          {editing && (
            <div className="mvk-rescue-actions" style={{ marginTop: 12 }}>
              <button className="mvk-btn mvk-btn-outline mvk-btn-sm" onClick={() => setEditing(false)}><CloseIcon size={12} /> CANCEL</button>
              <button className="mvk-btn mvk-btn-coral mvk-btn-sm" onClick={saveProfile} disabled={saving}>
                <CheckIcon size={12} color="#FFF6E6" /> {saving ? 'SAVING…' : 'SAVE'}
              </button>
            </div>
          )}

          {picking && (
            <div className="mvk-avatar-picker">
              <div className="mvk-avatar-picker-head">
                <span className="mvk-sec-title">CHOOSE YOUR AVATAR</span>
                <button className="mvk-modal-close" onClick={() => setPicking(false)} aria-label="Close">
                  <CloseIcon size={12} />
                </button>
              </div>
              <AvatarGrid selected={avatar} onSelect={id => { setAvatar(id); }} />
            </div>
          )}
        </div>

        {/* ── Connected accounts ── */}
        <div className="mvk-card mvk-card-pad">
          <div className="mvk-prof-accounts-head">
            <div className="mvk-sec-head" style={{ margin: 0 }}><span className="mvk-sec-title">CONNECTED ACCOUNTS</span></div>
            <RobotMascot size={36} mood="happy" />
          </div>
          <div className="mvk-conn-list">
            {ACCOUNTS.map(a => (
              <div key={a.provider} className="mvk-conn-row mvk-conn-static">
                <BrandMark provider={a.provider} size={28} />
                <div className="mvk-conn-body">
                  <div className="mvk-conn-name">{a.name}</div>
                  <div className="mvk-conn-desc">{email}</div>
                </div>
                <span className="mvk-conn-badge on"><CheckIcon size={9} color="#fff" /> CONNECTED</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Achievements ── */}
        <div className="mvk-sec-head"><span className="mvk-sec-title">ACHIEVEMENTS</span></div>
        <div className="mvk-ach-grid">
          <div className="mvk-ach-card">
            <FireIcon size={26} color="#E85D50" />
            <div className="mvk-ach-num" style={{ color: '#E85D50' }}>{crisesSolved}</div>
            <div className="mvk-ach-label">CRISES SOLVED</div>
          </div>
          <div className="mvk-ach-card">
            <HourglassIcon size={26} color="#B5179E" />
            <div className="mvk-ach-num" style={{ color: '#B5179E' }}>{hoursSaved}</div>
            <div className="mvk-ach-label">HOURS SAVED</div>
          </div>
          <div className="mvk-ach-card">
            <ZapIcon size={26} color="#F2C84B" />
            <div className="mvk-ach-num" style={{ color: '#F2C84B' }}>{streak}</div>
            <div className="mvk-ach-label">DAY STREAK</div>
          </div>
        </div>

        {/* ── Crisis master badge ── */}
        <div className="mvk-badge-banner">
          <TrophyIcon size={22} color="#F2C84B" />
          <div>
            <div className="mvk-badge-banner-title">
              {crisesSolved >= 5 ? 'CRISIS MASTER BADGE' : 'CRISIS ROOKIE'}
            </div>
            <div className="mvk-badge-banner-desc">
              {crisesSolved >= 5
                ? 'Awarded to elite commanders who stay calm and conquer chaos.'
                : `Solve ${5 - crisesSolved} more crises to earn the Crisis Master badge.`}
            </div>
          </div>
        </div>

        <div className="mvk-rescue-actions" style={{ marginTop: 14 }}>
          <button className="mvk-btn mvk-btn-outline mvk-btn-sm" onClick={() => navigate('/app/insights')}>
            <ChartIcon size={14} color="#2A8090" /> INSIGHTS
          </button>
          <button className="mvk-btn mvk-btn-outline mvk-btn-sm" onClick={() => navigate('/app/settings')}>
            <GearIcon size={14} color="#2A8090" /> SETTINGS
          </button>
        </div>
      </motion.div>
    </MavrickShell>
  )
}
