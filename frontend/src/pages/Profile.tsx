import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MavrickShell } from '../components/pixel/MavrickShell'
import { BrandHeader } from '../components/pixel/BrandHeader'
import { RobotMascot } from '../components/pixel/RobotMascot'
import { BrandMark } from '../components/pixel/BrandMark'
import { useAuth } from '../context/AuthContext'
import { getHistory } from '../api'
import type { CrisisHistory } from '../types'
import { UserIcon, MailIcon, PhoneIcon, FireIcon, HourglassIcon, TrophyIcon, CheckIcon, ChartIcon, GearIcon } from '../components/icons/PixelIcons'

function PlayerAvatar({ size = 64 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ imageRendering: 'pixelated', display: 'block' }} aria-hidden="true">
      <rect x="0" y="0" width="16" height="16" fill="#1B2A3A" />
      <rect x="3" y="2" width="10" height="3" fill="#2A2438" />
      <rect x="2" y="3" width="2" height="6" fill="#2A2438" />
      <rect x="12" y="3" width="2" height="6" fill="#2A2438" />
      <rect x="4" y="4" width="8" height="6" fill="#E8B888" />
      <rect x="5" y="6" width="2" height="2" fill="#2A2438" />
      <rect x="9" y="6" width="2" height="2" fill="#2A2438" />
      <rect x="6" y="10" width="4" height="2" fill="#E8B888" />
      <rect x="2" y="11" width="12" height="5" fill="#3A4A6B" />
      <rect x="4" y="11" width="2" height="3" fill="#2E3A55" />
      <rect x="10" y="11" width="2" height="3" fill="#2E3A55" />
    </svg>
  )
}

const ACCOUNTS = [
  { provider: 'gmail' as const,  name: 'GMAIL' },
  { provider: 'google' as const, name: 'GOOGLE CALENDAR' },
]

export function Profile() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [history, setHistory] = useState<CrisisHistory[]>([])
  useEffect(() => { getHistory().then(setHistory).catch(() => setHistory([])) }, [])
  const crisesSolved = history.length
  const hoursSaved = history.length ? Math.max(1, Math.round(history.length * 3.25)) : 0
  const email = user?.email || '—'
  const name = user?.name || '—'

  return (
    <MavrickShell active="profile">
      <BrandHeader />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Player profile */}
        <div className="mvk-card mvk-card-pad">
          <div className="mvk-sec-head"><span className="mvk-sec-title">PLAYER PROFILE</span></div>
          <div className="mvk-prof-top">
            <div className="mvk-prof-avatar"><PlayerAvatar size={72} /></div>
            <div className="mvk-prof-info">
              <div className="mvk-prof-row"><span className="mvk-prof-ico"><UserIcon size={13} color="#E85D50" /></span><div><div className="mvk-prof-label">NAME</div><div className="mvk-prof-val">{name}</div></div></div>
              <div className="mvk-prof-row"><span className="mvk-prof-ico"><MailIcon size={13} color="#E85D50" /></span><div><div className="mvk-prof-label">EMAIL</div><div className="mvk-prof-val">{email}</div></div></div>
              <div className="mvk-prof-row"><span className="mvk-prof-ico"><PhoneIcon size={13} color="#E85D50" /></span><div><div className="mvk-prof-label">PHONE</div><div className="mvk-prof-val">—</div></div></div>
            </div>
          </div>
        </div>

        {/* Connected accounts */}
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

        {/* Achievements */}
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
            <TrophyIcon size={26} color="#F2C84B" />
            <div className="mvk-ach-num" style={{ color: '#F2C84B', fontSize: 9 }}>CRISIS<br />MASTER</div>
            <div className="mvk-ach-label">UNLOCKED</div>
          </div>
        </div>

        {/* Crisis master badge */}
        <div className="mvk-badge-banner">
          <TrophyIcon size={22} color="#F2C84B" />
          <div>
            <div className="mvk-badge-banner-title">CRISIS MASTER BADGE</div>
            <div className="mvk-badge-banner-desc">Awarded to elite commanders who stay calm and conquer chaos.</div>
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
