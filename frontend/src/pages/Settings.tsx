import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { UserIcon, TrashIcon, ShieldIcon, ActivityIcon } from '../components/icons/PixelIcons'

function SettingsSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="settings-section px-card">
      <div className="settings-section-head">
        {icon}
        <span className="settings-section-title">{title}</span>
      </div>
      {children}
    </div>
  )
}

export function Settings() {
  const { user } = useAuth()
  const [cleared, setCleared] = useState(false)
  const [gridEnabled, setGridEnabled] = useState(true)
  const [sound, setSound] = useState(true)

  function clearHistory() {
    localStorage.removeItem('mavrick_history')
    setCleared(true)
    setTimeout(() => setCleared(false), 2400)
  }

  function clearReminders() {
    if (confirm('Delete all reminders? This cannot be undone.')) {
      localStorage.removeItem('mavrick_reminders')
    }
  }

  return (
    <div className="settings-page">
      <div style={{ fontFamily: "'Press Start 2P', cursive", fontSize: 11, color: 'var(--text-primary)', marginBottom: 24 }}>
        SETTINGS
      </div>

      <div className="settings-grid">
        {/* Profile */}
        <SettingsSection title="PROFILE" icon={<UserIcon size={14} color="var(--px-purple)" />}>
          <div className="settings-row">
            <label className="settings-label">Name</label>
            <div className="settings-value">{user?.name || '—'}</div>
          </div>
          <div className="settings-row">
            <label className="settings-label">Email</label>
            <div className="settings-value">{user?.email}</div>
          </div>
          <div className="settings-row">
            <label className="settings-label">Account ID</label>
            <div className="settings-value" style={{ fontFamily: 'monospace', fontSize: 11 }}>{user?.id?.slice(0, 16)}…</div>
          </div>
          <div className="settings-note">Profile editing coming soon — contact support to update your name.</div>
        </SettingsSection>

        {/* Preferences */}
        <SettingsSection title="PREFERENCES" icon={<ActivityIcon size={14} color="var(--px-blue)" />}>
          <div className="settings-row settings-row--toggle">
            <div>
              <div className="settings-label">Pixel Grid Background</div>
              <div className="settings-hint">Subtle grid overlay on the page</div>
            </div>
            <button
              className={`settings-toggle ${gridEnabled ? 'on' : ''}`}
              onClick={() => setGridEnabled(g => !g)}
              aria-pressed={gridEnabled}
            >
              <span />
            </button>
          </div>
          <div className="settings-row settings-row--toggle">
            <div>
              <div className="settings-label">Voice Read-aloud</div>
              <div className="settings-hint">Use browser TTS to speak plan steps</div>
            </div>
            <button
              className={`settings-toggle ${sound ? 'on' : ''}`}
              onClick={() => setSound(s => !s)}
              aria-pressed={sound}
            >
              <span />
            </button>
          </div>
          <div className="settings-note">More preferences coming soon.</div>
        </SettingsSection>

        {/* Data */}
        <SettingsSection title="DATA" icon={<TrashIcon size={14} color="var(--px-pink)" />}>
          <div className="settings-row">
            <div>
              <div className="settings-label">Crisis History</div>
              <div className="settings-hint">Stored locally in your browser</div>
            </div>
            <button className="settings-danger-btn" onClick={clearHistory}>
              {cleared ? '✓ Cleared!' : 'Clear History'}
            </button>
          </div>
          <div className="settings-row">
            <div>
              <div className="settings-label">Reminders</div>
              <div className="settings-hint">All saved reminders</div>
            </div>
            <button className="settings-danger-btn" onClick={clearReminders}>
              Clear All
            </button>
          </div>
          <div className="settings-note">Data is stored in your browser only — we don't upload history or reminders to our servers.</div>
        </SettingsSection>

        {/* About */}
        <SettingsSection title="ABOUT" icon={<ShieldIcon size={14} color="var(--px-cyan)" />}>
          <div className="settings-row">
            <div className="settings-label">Version</div>
            <div className="settings-value">1.0.0</div>
          </div>
          <div className="settings-row">
            <div className="settings-label">AI Model</div>
            <div className="settings-value">Gemini 2.5 Flash</div>
          </div>
          <div className="settings-row">
            <div className="settings-label">Built for</div>
            <div className="settings-value">Vibe2Ship Hackathon</div>
          </div>
          <div className="settings-row">
            <div className="settings-label">By</div>
            <div className="settings-value">Team Mistake Technologies</div>
          </div>
          <div className="settings-note">
            Mavrick turns panic into a plan — 1 Gemini call, step-by-step, first action in seconds.
          </div>
        </SettingsSection>
      </div>
    </div>
  )
}
