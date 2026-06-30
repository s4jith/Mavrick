import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { updateProfile, sendPasswordResetEmail, deleteUser } from 'firebase/auth'
import { auth, firebaseAuthError } from '../firebase'
import { useAuth } from '../context/AuthContext'
import {
  clearHistory as clearHistoryApi, getReminders, deleteReminder, syncProfile,
} from '../api'
import { MavrickShell } from '../components/pixel/MavrickShell'
import { PlayerAvatar, AvatarGrid, avatarLabel, useAvatar } from '../components/pixel/Avatars'
import {
  GearIcon, UserIcon, LockIcon, TrashIcon, LogoutIcon,
  CheckIcon, CloseIcon, RefreshIcon, MailIcon,
} from '../components/icons/PixelIcons'

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mvk-card mvk-card-pad">
      <div className="mvk-sec-head"><span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{icon}<span className="mvk-sec-title">{title}</span></span></div>
      {children}
    </div>
  )
}

export function Settings() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // Which providers the account uses (password vs. Google).
  const hasPassword = useMemo(
    () => auth.currentUser?.providerData.some(p => p.providerId === 'password') ?? false,
    [],
  )

  // ── Avatar (shared hook — same selection as Profile) ──
  const { avatar, setAvatar } = useAvatar()
  const [picking, setPicking] = useState(false)

  // ── Name edit ──
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [savingName, setSavingName] = useState(false)

  // ── Password reset ──
  const [resetSent, setResetSent] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)

  // ── Data ──
  const [cleared, setCleared] = useState(false)
  const [remCleared, setRemCleared] = useState(false)

  const [error, setError] = useState<string | null>(null)

  /* ── Name ── */
  function startNameEdit() {
    setNameInput(user?.name ?? '')
    setEditingName(true)
    setError(null)
  }
  async function saveName() {
    const next = nameInput.trim()
    if (!next || !auth.currentUser) { setEditingName(false); return }
    setSavingName(true); setError(null)
    try {
      await updateProfile(auth.currentUser, { displayName: next })
      // Refresh the ID token so AuthContext's onIdTokenChanged picks up the new name.
      await auth.currentUser.getIdToken(true)
      syncProfile().catch(() => { /* non-fatal */ })
      setEditingName(false)
    } catch (err) {
      setError(firebaseAuthError(err))
    } finally {
      setSavingName(false)
    }
  }

  /* ── Password ── */
  async function resetPassword() {
    if (!user?.email) return
    setResetLoading(true); setError(null)
    try {
      await sendPasswordResetEmail(auth, user.email)
      setResetSent(true)
    } catch (err) {
      setError(firebaseAuthError(err))
    } finally {
      setResetLoading(false)
    }
  }

  /* ── Data ── */
  async function clearHistory() {
    try { await clearHistoryApi() } catch { /* ignore */ }
    setCleared(true); setTimeout(() => setCleared(false), 2200)
  }
  async function clearReminders() {
    if (!confirm('Delete all reminders? This cannot be undone.')) return
    try {
      const rs = await getReminders()
      await Promise.all(rs.map(r => deleteReminder(r.id)))
    } catch { /* ignore */ }
    setRemCleared(true); setTimeout(() => setRemCleared(false), 2200)
  }

  /* ── Account ── */
  function doLogout() { logout(); navigate('/login') }
  async function deleteAccount() {
    if (!auth.currentUser) return
    if (!confirm('Permanently delete your Mavrick account? This erases your profile and cannot be undone.')) return
    setError(null)
    try {
      await deleteUser(auth.currentUser)
      navigate('/register')
    } catch (err) {
      const code = (err as { code?: string })?.code
      if (code === 'auth/requires-recent-login') {
        setError('For your security, please log out and sign in again, then retry deleting your account.')
      } else {
        setError(firebaseAuthError(err))
      }
    }
  }

  return (
    <MavrickShell active="profile">
      <div className="mvk-page-title">
        <GearIcon size={18} color="#E85D50" />
        <span className="mvk-page-title-text">SETTINGS</span>
      </div>
      <div className="mvk-page-sub">Manage your <span className="mvk-coral">account</span>.</div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>

        {error && <div className="mvk-error" style={{ marginBottom: 12 }}>{error}</div>}

        {/* ── PROFILE ── */}
        <Section title="PROFILE" icon={<UserIcon size={13} color="#E85D50" />}>
          {/* Avatar */}
          <div className="mvk-set-avatar-row">
            <button
              type="button"
              className="mvk-prof-avatar mvk-prof-avatar-btn"
              onClick={() => setPicking(p => !p)}
              title="Change avatar"
              aria-label="Change avatar"
            >
              <PlayerAvatar id={avatar} size={56} />
              <span className="mvk-prof-avatar-edit">EDIT</span>
            </button>
            <div>
              <div className="mvk-set-label">AVATAR</div>
              <div className="mvk-set-hint">{avatarLabel(avatar)} — tap to change</div>
            </div>
          </div>

          {picking && (
            <div className="mvk-avatar-picker">
              <div className="mvk-avatar-picker-head">
                <span className="mvk-sec-title">CHOOSE YOUR AVATAR</span>
                <button className="mvk-modal-close" onClick={() => setPicking(false)} aria-label="Close">
                  <CloseIcon size={12} />
                </button>
              </div>
              <AvatarGrid selected={avatar} onSelect={setAvatar} />
            </div>
          )}

          {/* Name */}
          {editingName ? (
            <div style={{ marginTop: 12 }}>
              <div className="mvk-set-label" style={{ marginBottom: 6 }}>NAME</div>
              <input
                className="mvk-textarea"
                style={{ minHeight: 'auto' }}
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                placeholder="Your name"
                autoFocus
                onKeyDown={e => e.key === 'Enter' && saveName()}
              />
              <div className="mvk-rescue-actions" style={{ marginTop: 10 }}>
                <button className="mvk-btn mvk-btn-outline mvk-btn-sm" onClick={() => setEditingName(false)}>
                  <CloseIcon size={12} /> CANCEL
                </button>
                <button className="mvk-btn mvk-btn-coral mvk-btn-sm" onClick={saveName} disabled={savingName}>
                  <CheckIcon size={12} color="#FFF6E6" /> {savingName ? 'SAVING…' : 'SAVE'}
                </button>
              </div>
            </div>
          ) : (
            <div className="mvk-set-row">
              <div><div className="mvk-set-label">NAME</div><div className="mvk-set-val" style={{ marginTop: 2 }}>{user?.name || '—'}</div></div>
              <button className="mvk-set-edit-btn" onClick={startNameEdit} aria-label="Edit name">
                <RefreshIcon size={11} /> EDIT
              </button>
            </div>
          )}

          {/* Email (read-only) */}
          <div className="mvk-set-row">
            <div><div className="mvk-set-label">EMAIL</div><div className="mvk-set-val" style={{ marginTop: 2 }}>{user?.email}</div></div>
          </div>
        </Section>

        {/* ── SECURITY ── */}
        <Section title="SECURITY" icon={<LockIcon size={13} color="#4361EE" />}>
          {hasPassword ? (
            <>
              <div className="mvk-set-row">
                <div><div className="mvk-set-label">PASSWORD</div><div className="mvk-set-hint">Send a reset link to your email</div></div>
                <button className="mvk-set-edit-btn" onClick={resetPassword} disabled={resetLoading}>
                  <MailIcon size={11} color="#2A8090" /> {resetLoading ? 'SENDING…' : 'RESET'}
                </button>
              </div>
              {resetSent && (
                <div className="mvk-reassure" style={{ marginTop: 4 }}>
                  ✓ Reset link sent to <strong>{user?.email}</strong>. Check your inbox.
                </div>
              )}
            </>
          ) : (
            <div className="mvk-set-row">
              <div><div className="mvk-set-label">SIGN-IN METHOD</div><div className="mvk-set-hint">Your account is managed by Google</div></div>
              <span className="mvk-conn-badge on"><CheckIcon size={9} color="#fff" /> GOOGLE</span>
            </div>
          )}
        </Section>

        {/* ── DATA ── */}
        <Section title="DATA" icon={<TrashIcon size={13} color="#E85D50" />}>
          <div className="mvk-set-row">
            <div><div className="mvk-set-label">CRISIS HISTORY</div><div className="mvk-set-hint">Synced to your account</div></div>
            <button className="mvk-set-danger" onClick={clearHistory}>{cleared ? 'CLEARED ✓' : 'CLEAR'}</button>
          </div>
          <div className="mvk-set-row">
            <div><div className="mvk-set-label">REMINDERS</div><div className="mvk-set-hint">All saved tasks &amp; reminders</div></div>
            <button className="mvk-set-danger" onClick={clearReminders}>{remCleared ? 'CLEARED ✓' : 'CLEAR'}</button>
          </div>
          <div className="mvk-set-note">Your data syncs to your Mavrick account in the cloud.</div>
        </Section>

        {/* ── ACCOUNT ── */}
        <button className="mvk-btn mvk-btn-outline" onClick={doLogout}>
          <LogoutIcon size={14} color="#E85D50" /> LOG OUT
        </button>
        <button className="mvk-set-delete-btn" onClick={deleteAccount}>
          <TrashIcon size={12} color="#E82830" /> DELETE ACCOUNT
        </button>
      </motion.div>
    </MavrickShell>
  )
}
