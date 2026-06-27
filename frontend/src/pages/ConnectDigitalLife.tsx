import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MavrickShell } from '../components/pixel/MavrickShell'
import { RobotMascot } from '../components/pixel/RobotMascot'
import { BrandMark } from '../components/pixel/BrandMark'
import { useAuth } from '../context/AuthContext'
import { CheckIcon, WarningIcon, PlayIcon } from '../components/icons/PixelIcons'

type Provider = 'gmail' | 'google' | 'outlook' | 'drive'

const INTEGRATIONS: { id: string; name: string; desc: string; provider: Provider }[] = [
  { id: 'gmail',   name: 'GMAIL',            desc: 'Scan for deadlines & urgent mail',     provider: 'gmail' },
  { id: 'gcal',    name: 'GOOGLE CALENDAR',  desc: 'Read events & block your rescue plan', provider: 'google' },
  { id: 'outlook', name: 'MICROSOFT OUTLOOK', desc: 'Coming soon',                          provider: 'outlook' },
  { id: 'drive',   name: 'GOOGLE DRIVE',     desc: 'Coming soon',                           provider: 'drive' },
]

export function ConnectDigitalLife() {
  const navigate = useNavigate()
  const { user } = useAuth()

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
          {INTEGRATIONS.map(item => (
            <div key={item.id} className="mvk-conn-row mvk-conn-disabled">
              <BrandMark provider={item.provider} size={30} />
              <div className="mvk-conn-body">
                <div className="mvk-conn-name">{item.name}</div>
                <div className="mvk-conn-desc">{item.desc}</div>
              </div>
              <span className="mvk-conn-badge off"><WarningIcon size={9} color="#fff" /> SOON</span>
            </div>
          ))}
        </div>

        <div className="mvk-conn-note">
          <RobotMascot size={38} mood="happy" />
          <div className="mvk-conn-note-text">
            You're signed in{user?.email ? <> as <span className="mvk-coral">{user.email}</span></> : ''}
            <CheckIcon size={9} color="#5FD0E6" />. Smart inbox &amp; calendar sync are coming soon —
            you can start planning crises right now.
          </div>
        </div>

        <div className="mvk-rescue-actions">
          <button className="mvk-btn mvk-btn-outline mvk-btn-sm" onClick={() => navigate('/app')}>SKIP FOR NOW</button>
          <button className="mvk-btn mvk-btn-coral mvk-btn-sm" onClick={() => navigate('/app')}>
            <PlayIcon size={13} color="#FFF6E6" /> ENTER MAVRICK
          </button>
        </div>
      </motion.section>
    </MavrickShell>
  )
}
