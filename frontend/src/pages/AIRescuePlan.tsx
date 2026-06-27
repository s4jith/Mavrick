import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MavrickShell } from '../components/pixel/MavrickShell'
import { RobotMascot } from '../components/pixel/RobotMascot'
import {
  SirenIcon, TimerIcon, BookIcon, HourglassIcon,
  SearchIcon, ImageIcon, MicIcon, CalendarIcon, RocketIcon,
} from '../components/icons/PixelIcons'
import { createCalendarEvent, ApiError } from '../api'
import type { PlanResponse } from '../types'

/* ── Fallback demo plan (matches the reference screen) ── */
const DEMO: PlanResponse = {
  plan: {
    cluster: 'Work',
    sub_type: 'Presentation',
    severity: 'critical',
    summary: 'Build and rehearse a client presentation in the time you have left.',
    first_action: 'Open your slide deck and write the title slide right now.',
    steps: [
      { order: 1, title: 'RESEARCH', detail: 'Gather info and key points',     minutes: 20, is_right_now: true },
      { order: 2, title: 'SLIDES',   detail: 'Create and organize content',    minutes: 40, is_right_now: false },
      { order: 3, title: 'VISUALS',  detail: 'Add visuals and examples',       minutes: 30, is_right_now: false },
      { order: 4, title: 'PRACTICE', detail: 'Rehearse and improve flow',      minutes: 30, is_right_now: false },
    ],
    warnings: [],
  },
  urgency_score: 92,
  urgency_colour: 'red',
  total_planned_minutes: 135,
  minutes_left: 180,
  fits: true,
  cached: false,
  key_index: null,
  latency_ms: 0,
  evaluator_score: 90,
  evaluator_notes: [],
}

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

type CalState = 'idle' | 'adding' | 'added' | 'error'

export function AIRescuePlan() {
  const navigate = useNavigate()
  const [calState, setCalState] = useState<CalState>('idle')
  const [calMsg, setCalMsg] = useState<string | null>(null)

  const plan = useMemo<PlanResponse>(() => {
    try {
      const raw = sessionStorage.getItem('mavrick_plan')
      if (raw) return JSON.parse(raw) as PlanResponse
    } catch { /* ignore */ }
    return DEMO
  }, [])

  const steps = useMemo(() => {
    let t = 0
    return plan.plan.steps.map((s, i) => {
      const start = t; t += s.minutes
      return { ...s, start, end: t, i }
    })
  }, [plan])

  const segCount = 14
  const filled = Math.round((plan.urgency_score / 100) * segCount)

  // HITL: only writes to Google Calendar on this explicit, confirmed click.
  async function addToCalendar() {
    if (calState === 'adding' || calState === 'added') return
    setCalState('adding'); setCalMsg(null)
    const title = `MAVRICK: ${cap(plan.plan.sub_type)} rescue plan`
    const description = plan.plan.steps
      .map(s => `${s.order}. ${s.title} (${s.minutes}m) — ${s.detail}`)
      .join('\n')
    try {
      const ev = await createCalendarEvent({
        title,
        start: new Date().toISOString(),
        minutes: plan.total_planned_minutes,
        description,
        confirm: true,
      })
      setCalState('added')
      setCalMsg(ev.html_link ? 'Added to your Google Calendar.' : 'Added to your calendar.')
    } catch (err) {
      setCalState('error')
      if (err instanceof ApiError && err.status === 409) {
        setCalMsg('Connect your Google account first (Connect screen).')
      } else {
        setCalMsg(err instanceof Error ? err.message : 'Could not add to calendar.')
      }
    }
  }

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
          <button className="mvk-btn mvk-btn-outline mvk-btn-sm" onClick={addToCalendar} disabled={calState === 'adding' || calState === 'added'}>
            <CalendarIcon size={15} color="#2A8090" />{' '}
            {calState === 'adding' ? 'ADDING…' : calState === 'added' ? 'ADDED ✓' : 'ADD TO CALENDAR'}
          </button>
          <button className="mvk-btn mvk-btn-coral mvk-btn-sm" onClick={() => navigate('/app/execute')}>
            <RocketIcon size={15} color="#FFF6E6" /> START MISSION
          </button>
        </div>
        {calMsg && (
          <div className={calState === 'error' ? 'mvk-error' : 'mvk-cal-ok'} style={{ marginTop: 10 }}>
            {calMsg}
          </div>
        )}

        <div className="mvk-crush">
          <span className="mvk-coral">✦</span> I've got your back. Let's crush this! <span className="mvk-coral">✦</span>
        </div>
      </motion.section>
    </MavrickShell>
  )
}
