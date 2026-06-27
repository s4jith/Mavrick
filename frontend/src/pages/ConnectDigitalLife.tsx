import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MavrickShell } from '../components/pixel/MavrickShell'
import { RobotMascot } from '../components/pixel/RobotMascot'
import { BrandMark } from '../components/pixel/BrandMark'
import { CheckIcon, WarningIcon, PlayIcon } from '../components/icons/PixelIcons'
import { getIntegrationStatus, googleLoginUrl } from '../api'
import type { IntegrationStatus } from '../types'

type Provider = 'gmail' | 'google' | 'outlook' | 'drive'

const INTEGRATIONS: { id: string; name: string; desc: string; provider: Provider; google: boolean }[] = [
  { id: 'gmail',   name: 'GMAIL',            desc: 'Scan for deadlines & urgent mail',      provider: 'gmail',   google: true },
  { id: 'gcal',    name: 'GOOGLE CALENDAR',  desc: 'Read events & block your rescue plan',  provider: 'google',  google: true },
  { id: 'outlook', name: 'MICROSOFT OUTLOOK', desc: 'Coming soon',                          provider: 'outlook', google: false },
  { id: 'drive',   name: 'GOOGLE DRIVE',     desc: 'Coming soon',                           provider: 'drive',   google: false },
]

export function ConnectDigitalLife() {
  const navigate = useNavigate()
  const [status, setStatus] = useState<IntegrationStatus | null>(null)

  useEffect(() => {
    getIntegrationStatus().then(setStatus).catch(() => setStatus(null))
  }, [])

  function connectGoogle() {
    window.location.href = googleLoginUrl()
  }

  function isOn(item: typeof INTEGRATIONS[number]): boolean {
    if (!status) return false
    if (item.id === 'gmail') return status.gmail
    if (item.id === 'gcal') return status.calendar
    return false
  }

  const googleConnected = !!status?.connected

  return (
    <MavrickShell>
      <div className="mvk-hero">
        <RobotMascot size={54} mood="wave" />
        <div className="mvk-hero-word">MAVRICK</div>
        <div className="mvk-badge">AI CRISIS COMMANDER</div>
      </div>

      <div className="mvk-onb-head">
        <div className="mvk-onb-title">CONNECT YOUR DIGITAL LIFE</div>
        <div className="mvk-onb-sub">Help <span className="mvk-coral">MAVRICK</span> understand your <span className="mvk-coral">deadlines</span>.</div>
      </div>

      <motion.section
        className="mvk-card"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="mvk-conn-list">
          {INTEGRATIONS.map(item => {
            const on = isOn(item)
            const disabled = !item.google
            return (
              <button
                key={item.id}
                className={`mvk-conn-row ${disabled ? 'mvk-conn-disabled' : ''}`}
                onClick={() => { if (!disabled && !on) connectGoogle() }}
                disabled={disabled}
              >
                <BrandMark provider={item.provider} size={30} />
                <div className="mvk-conn-body">
                  <div className="mvk-conn-name">{item.name}</div>
                  <div className="mvk-conn-desc">{item.desc}</div>
                </div>
                <span className={`mvk-conn-badge ${on ? 'on' : 'off'}`}>
                  {on ? <CheckIcon size={9} color="#fff" /> : <WarningIcon size={9} color="#fff" />}
                  {on ? 'CONNECTED' : (disabled ? 'SOON' : 'CONNECT')}
                </span>
              </button>
            )
          })}
        </div>

        {googleConnected && status?.profile?.email && (
          <div className="mvk-conn-note" style={{ marginTop: 12 }}>
            <RobotMascot size={36} mood="happy" />
            <div className="mvk-conn-note-text">
              Connected as <span className="mvk-coral">{status.profile.email}</span>. I can now scan Gmail and read your Calendar.
            </div>
          </div>
        )}

        {!googleConnected && (
          <div className="mvk-conn-note">
            <RobotMascot size={40} mood="happy" />
            <div className="mvk-conn-note-text">Connect your Google account to let me scan deadlines and plan around your calendar!</div>
          </div>
        )}

        <div className="mvk-rescue-actions">
          <button className="mvk-btn mvk-btn-outline mvk-btn-sm" onClick={() => navigate('/app')}>
            {googleConnected ? 'DONE' : 'SKIP FOR NOW'}
          </button>
          {!googleConnected ? (
            <button className="mvk-btn mvk-btn-coral mvk-btn-sm" onClick={connectGoogle}>
              <BrandMark provider="google" size={15} /> CONNECT GOOGLE
            </button>
          ) : (
            <button className="mvk-btn mvk-btn-coral mvk-btn-sm" onClick={() => navigate('/app')}>
              <PlayIcon size={13} color="#FFF6E6" /> ENTER MAVRICK
            </button>
          )}
        </div>
      </motion.section>
    </MavrickShell>
  )
}
