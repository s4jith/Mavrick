import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MavrickShell } from '../components/pixel/MavrickShell'
import { RobotMascot } from '../components/pixel/RobotMascot'
import {
  SirenIcon, TimerIcon, BookIcon, HourglassIcon,
  SearchIcon, ImageIcon, MicIcon, CalendarIcon, RocketIcon, CheckIcon,
} from '../components/icons/PixelIcons'
import type { PlanResponse } from '../types'


const STEP_COLORS = ['#E85D50', '#2A8090', '#B5179E', '#4361EE']

function cap(s: string) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s }

function fmtVerbose(min: number): string {
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60), m = min % 60
  const hr = `${h} hour${h > 1 ? 's' : ''}`
  return m ? `${hr} ${m}m` : hr
}

function fmtCompact(min: number): string {
  if (min < 60) return `${min}m`
  const h = Math.floor(min / 60), m = min % 60
  return m ? `${h}h ${m}m` : `${h}h`
}

function stepIcon(title: string, detail: string) {
  const t = `${title} ${detail}`.toLowerCase()
  if (/research|gather|read|find|review|info|study|search/.test(t)) return SearchIcon
  if (/visual|image|design|chart|graphic|photo|diagram/.test(t)) return ImageIcon
  if (/practice|rehearse|present|speak|call|interview|deliver|run/.test(t)) return MicIcon
  return BookIcon
}

export function AIRescuePlan() {
  const navigate = useNavigate()
  const [calAdded, setCalAdded] = useState(false)

  const plan = useMemo<PlanResponse | null>(() => {
    try {
      const raw = sessionStorage.getItem('mavrick_plan')
      if (raw) return JSON.parse(raw) as PlanResponse
    } catch { /* ignore */ }
    return null
  }, [])

  useEffect(() => {
    if (!plan) navigate('/app/plan', { replace: true })
  }, [plan, navigate])

  if (!plan) return null

  const steps = useMemo(() => {
    let t = 0
    return plan.plan.steps.map((s, i) => {
      const start = t; t += s.minutes
      return { ...s, start, end: t, i }
    })
  }, [plan])

  const segCount = 14
  const filled = Math.round((plan.urgency_score / 100) * segCount)

  return (
    <MavrickShell active="execute">
      {/* ── Hero ── */}
      <div className="mvk-hero">
        <RobotMascot size={56} mood="coach" />
        <div className="mvk-hero-word">MAVRICK</div>
        <div className="mvk-badge">AI CRISIS COMMANDER</div>
        <div className="mvk-rescue-title">AI RESCUE PLAN</div>
        <div className="mvk-rescue-sub">
          I've <span className="mvk-coral">analyzed</span> your crisis. Here's the <span className="mvk-coral">plan</span>.
        </div>
      </div>

      <motion.section
        className="mvk-card"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* ── Urgency Score ── */}
        <div className="mvk-sec-head"><span className="mvk-sec-title">URGENCY SCORE</span></div>
        <div className="mvk-urgency-row">
          <SirenIcon size={34} color="#E85D50" />
          <div className="mvk-urgency-score">{plan.urgency_score}<span> / 100</span></div>
        </div>
        <div className="mvk-seg-bar">
          {Array.from({ length: segCount }).map((_, i) => (
            <span key={i} className={`mvk-seg ${i < filled ? 'on' : ''}`} />
          ))}
        </div>

        {/* ── AI Analysis ── */}
        <div className="mvk-sec-head"><span className="mvk-sec-title">AI ANALYSIS</span></div>
        <div className="mvk-analysis-grid">
          <div className="mvk-analysis-card">
            <TimerIcon size={18} color="#2A8090" />
            <div className="mvk-an-label">YOU HAVE</div>
            <div className="mvk-an-value">{fmtVerbose(plan.minutes_left)}</div>
          </div>
          <div className="mvk-analysis-card">
            <BookIcon size={18} color="#E85D50" />
            <div className="mvk-an-label">NEED</div>
            <div className="mvk-an-value">{cap(plan.plan.sub_type)}</div>
          </div>
          <div className="mvk-analysis-card">
            <HourglassIcon size={18} color="#B5179E" />
            <div className="mvk-an-label">EST. WORK</div>
            <div className="mvk-an-value">{fmtCompact(plan.total_planned_minutes)}</div>
          </div>
        </div>

        {/* ── Rescue Timeline ── */}
        <div className="mvk-sec-head"><span className="mvk-sec-title">RESCUE TIMELINE</span></div>
        <div className="mvk-rtl">
          {steps.map(s => {
            const Icon = stepIcon(s.title, s.detail)
            const color = STEP_COLORS[s.i % STEP_COLORS.length]
            return (
              <div className="mvk-rtl-row" key={s.order}>
                <div className="mvk-rtl-time">{s.start}-{s.end} MIN</div>
                <div className="mvk-rtl-rail"><span className="mvk-rtl-dot" style={{ background: color }} /></div>
                <div className="mvk-rtl-card">
                  <span className="mvk-rtl-icon"><Icon size={16} color={color} /></span>
                  <div className="mvk-rtl-body">
                    <div className="mvk-rtl-title">
                      {s.title}
                      {s.is_right_now && <span className="mvk-now-tag">NOW</span>}
                    </div>
                    <div className="mvk-rtl-desc">{s.detail}</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Actions ── */}
        <div className="mvk-rescue-actions">
          <button className="mvk-btn mvk-btn-outline mvk-btn-sm" onClick={() => setCalAdded(true)}>
            <CalendarIcon size={15} color="#2A8090" /> {calAdded ? 'ADDED ✓' : 'ADD TO CALENDAR'}
          </button>
          <button className="mvk-btn mvk-btn-coral mvk-btn-sm" onClick={() => navigate('/app/execute')}>
            <RocketIcon size={15} color="#FFF6E6" /> START MISSION
          </button>
        </div>

        <button
          className="mvk-btn mvk-btn-outline"
          style={{ marginTop: 10, color: '#28B068', borderColor: '#28B068' }}
          onClick={() => { sessionStorage.removeItem('mavrick_plan'); navigate('/app') }}
        >
          <CheckIcon size={14} color="#28B068" /> SOLVED IT MYSELF
        </button>

        <div className="mvk-crush">
          <span className="mvk-coral">✦</span> I've got your back. Let's crush this! <span className="mvk-coral">✦</span>
        </div>
      </motion.section>
    </MavrickShell>
  )
}
