import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MavrickShell } from '../components/pixel/MavrickShell'
import { RobotMascot } from '../components/pixel/RobotMascot'
import { PlayIcon } from '../components/icons/PixelIcons'

const FEATURES = [
  { label: 'INSTANT PLAN',   color: '#E85D50', border: 'rgba(232,93,80,0.4)' },
  { label: 'STEP BY STEP',   color: '#2A8090', border: 'rgba(42,128,144,0.4)' },
  { label: 'AI POWERED',     color: '#4361EE', border: 'rgba(67,97,238,0.4)' },
  { label: 'FIRST STEP NOW', color: '#B5179E', border: 'rgba(181,23,158,0.4)' },
]

export function Landing() {
  const navigate = useNavigate()
  return (
    <MavrickShell>
      <div className="mvk-hero" style={{ paddingTop: 26 }}>
        <RobotMascot size={74} mood="wave" />
        <div className="mvk-hero-word" style={{ fontSize: 32 }}>MAVRICK</div>
        <div className="mvk-badge">AI CRISIS COMMANDER</div>
        <div className="mvk-hero-sub">Turn <span className="mvk-coral">Panic</span> into a <span className="mvk-coral">Plan</span>. Instantly.</div>
      </div>

      <motion.section
        className="mvk-card"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="mvk-landing-desc">
          The AI execution engine that turns your crisis into a clear, time-blocked
          action plan — with a first step you can do <span className="mvk-coral">right now</span>.
        </div>

        <button className="mvk-save-btn" onClick={() => navigate('/register')}>
          <PlayIcon size={16} color="#FFF6E6" /> START FREE
        </button>
        <button className="mvk-btn mvk-btn-outline" style={{ marginTop: 11 }} onClick={() => navigate('/login')}>
          SIGN IN
        </button>

        <div className="mvk-landing-pills">
          {FEATURES.map(f => (
            <span key={f.label} className="mvk-landing-pill" style={{ color: f.color, borderColor: f.border }}>
              {f.label}
            </span>
          ))}
        </div>
      </motion.section>
    </MavrickShell>
  )
}
