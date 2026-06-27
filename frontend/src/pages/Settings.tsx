import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { MavrickShell } from '../components/pixel/MavrickShell'
import { BrandHeader } from '../components/pixel/BrandHeader'
import { GearIcon, UserIcon, ActivityIcon, TrashIcon, ShieldIcon, LogoutIcon } from '../components/icons/PixelIcons'

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mvk-card mvk-card-pad">
      <div className="mvk-sec-head"><span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{icon}<span className="mvk-sec-title">{title}</span></span></div>
      {children}
    </div>
  )
}

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button className={`mvk-toggle ${on ? 'on' : ''}`} onClick={onClick} aria-pressed={on}><span /></button>
  )
}

export function Settings() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [grid, setGrid] = useState(true)
  const [sound, setSound] = useState(true)
  const [cleared, setCleared] = useState(false)

  function clearHistory() {
    localStorage.removeItem('mavrick_history')
    setCleared(true); setTimeout(() => setCleared(false), 2200)
  }
  function clearReminders() {
    if (confirm('Delete all reminders? This cannot be undone.')) localStorage.removeItem('mavrick_reminders')
  }
  function doLogout() { logout(); navigate('/login') }

  return (
    <MavrickShell active="profile">
      <BrandHeader />

      <div className="mvk-page-title">
        <GearIcon size={18} color="#E85D50" />
        <span className="mvk-page-title-text">SETTINGS</span>
      </div>
      <div className="mvk-page-sub">Tune your AI crisis commander.</div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <Section title="PROFILE" icon={<UserIcon size={13} color="#E85D50" />}>
          <div className="mvk-set-row"><span className="mvk-set-label">NAME</span><span className="mvk-set-val">{user?.name || '—'}</span></div>
          <div className="mvk-set-row"><span className="mvk-set-label">EMAIL</span><span className="mvk-set-val">{user?.email}</span></div>
          <div className="mvk-set-note">Profile editing coming soon.</div>
        </Section>

        <Section title="PREFERENCES" icon={<ActivityIcon size={13} color="#4361EE" />}>
          <div className="mvk-set-row">
            <div><div className="mvk-set-label">PIXEL GRID</div><div className="mvk-set-hint">Background grid overlay</div></div>
            <Toggle on={grid} onClick={() => setGrid(g => !g)} />
          </div>
          <div className="mvk-set-row">
            <div><div className="mvk-set-label">VOICE READ-ALOUD</div><div className="mvk-set-hint">Speak plan steps via TTS</div></div>
            <Toggle on={sound} onClick={() => setSound(s => !s)} />
          </div>
        </Section>

        <Section title="DATA" icon={<TrashIcon size={13} color="#E85D50" />}>
          <div className="mvk-set-row">
            <div><div className="mvk-set-label">CRISIS HISTORY</div><div className="mvk-set-hint">Stored in your browser</div></div>
            <button className="mvk-set-danger" onClick={clearHistory}>{cleared ? 'CLEARED ✓' : 'CLEAR'}</button>
          </div>
          <div className="mvk-set-row">
            <div><div className="mvk-set-label">REMINDERS</div><div className="mvk-set-hint">All saved reminders</div></div>
            <button className="mvk-set-danger" onClick={clearReminders}>CLEAR</button>
          </div>
          <div className="mvk-set-note">Data lives only in your browser — nothing is uploaded.</div>
        </Section>

        <Section title="ABOUT" icon={<ShieldIcon size={13} color="#5FD0E6" />}>
          <div className="mvk-set-row"><span className="mvk-set-label">VERSION</span><span className="mvk-set-val">1.0.0</span></div>
          <div className="mvk-set-row"><span className="mvk-set-label">AI MODEL</span><span className="mvk-set-val">Gemini 2.5 Flash</span></div>
          <div className="mvk-set-row"><span className="mvk-set-label">BUILT FOR</span><span className="mvk-set-val">Vibe2Ship</span></div>
        </Section>

        <button className="mvk-btn mvk-btn-outline" onClick={doLogout}>
          <LogoutIcon size={14} color="#E85D50" /> LOG OUT
        </button>
      </motion.div>
    </MavrickShell>
  )
}
