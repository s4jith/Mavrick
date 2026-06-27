import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { updateProfile } from '../api'
import { MavrickShell } from '../components/pixel/MavrickShell'
import { RobotMascot } from '../components/pixel/RobotMascot'
import { GraduationCapIcon, BriefcaseIcon, RocketIcon, PaletteIcon, PlayIcon } from '../components/icons/PixelIcons'

const ROLES = [
  { id: 'student',    title: 'STUDENT',    desc: 'Manage studies, deadlines, exams, and learning goals.',         Icon: GraduationCapIcon },
  { id: 'employee',   title: 'EMPLOYEE',   desc: 'Handle work tasks, meetings, productivity, and career growth.', Icon: BriefcaseIcon },
  { id: 'founder',    title: 'FOUNDER',    desc: 'Organize startups, teams, strategy, and business decisions.',   Icon: RocketIcon },
  { id: 'freelancer', title: 'FREELANCER', desc: 'Track clients, projects, income, and creative workflows.',      Icon: PaletteIcon },
]

export function Onboarding() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState<string | null>(null)

  function cont() {
    if (selected) updateProfile({ role: selected }).catch(() => { /* non-fatal */ })
    navigate('/connect')
  }

  return (
    <MavrickShell>
      <div className="mvk-hero">
        <RobotMascot size={54} mood="wave" />
        <div className="mvk-hero-word">MAVRICK</div>
        <div className="mvk-badge">AI CRISIS COMMANDER</div>
      </div>

      <div className="mvk-onb-head">
        <div className="mvk-onb-title">WELCOME TO MAVRICK</div>
        <div className="mvk-onb-sub">Let's personalize your <span className="mvk-coral">AI crisis commander</span>.</div>
      </div>

      <motion.section
        className="mvk-card"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="mvk-role-grid">
          {ROLES.map(r => (
            <button
              key={r.id}
              className={`mvk-role-card ${selected === r.id ? 'selected' : ''}`}
              onClick={() => setSelected(r.id)}
            >
              <span className="mvk-role-icon"><r.Icon size={28} color="#E85D50" /></span>
              <span className="mvk-role-title">{r.title}</span>
              <span className="mvk-role-desc">{r.desc}</span>
            </button>
          ))}
        </div>

        <div className="mvk-steps">
          <span className="mvk-step-dot on" />
          <span className="mvk-step-dot" />
          <span className="mvk-step-dot" />
          <span className="mvk-step-dot" />
        </div>
        <div className="mvk-step-label">STEP 1 OF 4</div>

        <button className="mvk-save-btn" onClick={cont} disabled={!selected}>
          <PlayIcon size={16} color="#FFF6E6" /> CONTINUE
        </button>
      </motion.section>
    </MavrickShell>
  )
}
