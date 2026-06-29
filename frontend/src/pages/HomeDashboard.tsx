import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { MavrickShell } from '../components/pixel/MavrickShell'
import { RobotMascot } from '../components/pixel/RobotMascot'
import {
  FireIcon, WarningIcon, ZapIcon, BookIcon, BriefcaseIcon,
  HourglassIcon, RocketIcon, MicIcon, PlusIcon, CalendarIcon,
} from '../components/icons/PixelIcons'
import { getReminders } from '../api'
import type { Reminder } from '../types'

/* ── Data helpers ───────────────────────────────────────────── */

type Deco = { Icon: typeof BookIcon; color: string }

function pickDeco(title: string): Deco {
  const t = title.toLowerCase()
  if (/bill|pay|rent|electric|invoice|emi|tax/.test(t)) return { Icon: ZapIcon, color: '#E8901A' }
  if (/interview|meeting|call|presentation|client/.test(t)) return { Icon: BriefcaseIcon, color: '#4890E8' }
  return { Icon: BookIcon, color: '#E85D50' }
}

function dueLabel(due: string): string {
  if (!due) return 'No date'
  const d = new Date(due)
  const now = new Date()
  const ms = d.getTime() - now.getTime()
  if (ms < 0) return 'Overdue'
  const hrs = ms / 3_600_000
  if (hrs < 8) return `${Math.max(1, Math.round(hrs))} Hours Left`
  if (d.toDateString() === now.toDateString()) return 'Today'
  const tomorrow = new Date(now); tomorrow.setDate(now.getDate() + 1)
  if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow'
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function crisisScore(active: Reminder[]): number {
  if (active.length === 0) return 0
  let s = 46
  for (const r of active) {
    s += r.priority === 'high' ? 12 : r.priority === 'medium' ? 7 : 4
    if (r.due_date && new Date(r.due_date) < new Date()) s += 8
  }
  return Math.min(99, s)
}


function toTimeline(reminders: Reminder[]) {
  const now = new Date()
  const todayStr = now.toDateString()
  return reminders
    .filter(r => !r.completed && r.due_date && new Date(r.due_date).toDateString() === todayStr)
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    .map(r => {
      const d = new Date(r.due_date)
      const t = r.title.toLowerCase()
      const Icon = /bill|pay|rent|electric|invoice|tax/.test(t) ? ZapIcon
        : /meeting|interview|call|presentation|client/.test(t) ? BriefcaseIcon
        : BookIcon
      const color = r.priority === 'high' ? '#E85D50' : r.priority === 'medium' ? '#4890E8' : '#2A8090'
      return {
        time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        title: r.title.toUpperCase(),
        desc: r.description || `Due ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        Icon,
        color,
      }
    })
}

/* ── Screen ─────────────────────────────────────────────────── */

export function HomeDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [reminders, setReminders] = useState<Reminder[]>([])

  useEffect(() => { getReminders().then(setReminders).catch(() => setReminders([])) }, [])

  const active = reminders.filter(r => !r.completed)
  const score = crisisScore(active)
  const firstName = (user?.name?.trim().split(/\s+/)[0] || 'Commander').toUpperCase()

  const deadlines = [...active]
    .filter(r => r.due_date)
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    .slice(0, 3)
    .map(r => {
      const { Icon, color } = pickDeco(r.title)
      return { title: r.title.toUpperCase(), sub: dueLabel(r.due_date), Icon, color }
    })

  const recTitle = deadlines.length ? `START ${deadlines[0].title} NOW` : 'ADD YOUR FIRST TASK'
  const TIMELINE = toTimeline(reminders)
  const totalEstMin = active.reduce((s, r) => {
    // rough estimate: high=90min, medium=45min, low=20min
    return s + (r.priority === 'high' ? 90 : r.priority === 'medium' ? 45 : 20)
  }, 0)
  const estLabel = totalEstMin
    ? totalEstMin >= 60
      ? `${Math.floor(totalEstMin / 60)}H ${totalEstMin % 60 > 0 ? `${totalEstMin % 60}M` : ''}`.trim()
      : `${totalEstMin}M`
    : '—'

  return (
    <MavrickShell active="home">
      {/* ── Compact brand header ── */}
      <header className="mvk-header">
        <div className="mvk-logo">
          <RobotMascot size={28} />
          <div>
            <div className="mvk-wordmark">MAVRICK</div>
            <div className="mvk-badge">AI CRISIS COMMANDER</div>
          </div>
        </div>
      </header>

      <motion.section
        className="mvk-card"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* ── Greeting + Crisis Score ── */}
        <div className="mvk-greet">
          <RobotMascot size={66} mood="wave" />
          <div className="mvk-greet-text">
            <div className="mvk-greet-hello">WELCOME BACK,</div>
            <div className="mvk-greet-name">{firstName} <span className="mvk-inline-heart">♥</span></div>
            <div className="mvk-score-label">CURRENT CRISIS SCORE</div>
            <div className="mvk-score-num">{score}<span> / 100</span></div>
          </div>
        </div>
        <div className="mvk-bar">
          <span className="mvk-bar-fill" style={{ width: `${score}%` }} />
        </div>

        {/* ── Urgent Deadlines ── */}
        <div className="mvk-sec-head">
          <FireIcon size={14} color="#E85D50" />
          <span className="mvk-sec-title">URGENT DEADLINES</span>
          <WarningIcon size={14} color="#E8901A" />
        </div>
        <div className="mvk-list">
          {deadlines.length === 0 ? (
            <div style={{ fontSize: 8, color: 'var(--mvk-label)', lineHeight: 1.8, padding: '6px 0' }}>
              No upcoming deadlines.<br />Add reminders to track them here.
            </div>
          ) : deadlines.map((d, i) => (
            <div className="mvk-list-item" key={i}>
              <span className="mvk-li-icon"><d.Icon size={18} color={d.color} /></span>
              <div className="mvk-li-body">
                <div className="mvk-li-title">{d.title}</div>
                <div className="mvk-li-sub" style={{ color: d.color }}>{d.sub}</div>
              </div>
              <span className="mvk-li-right"><HourglassIcon size={14} color="#8C9EA8" /></span>
            </div>
          ))}
        </div>

        {/* ── AI Recommendation ── */}
        <div className="mvk-sec-head">
          <ZapIcon size={13} color="#E85D50" />
          <span className="mvk-sec-title">AI RECOMMENDATION</span>
        </div>
        <div className="mvk-airec">
          <RobotMascot size={42} mood="coach" />
          <div className="mvk-airec-body">
            <div className="mvk-airec-title">{recTitle}</div>
            <div className="mvk-airec-desc">Focus now and finish ahead. I'll guide every step.</div>
            <div className="mvk-airec-eta">ESTIMATED TIME: <strong>{estLabel}</strong></div>
          </div>
        </div>

        {/* ── Today's Timeline ── */}
        <div className="mvk-sec-head">
          <HourglassIcon size={13} color="#5FD0E6" />
          <span className="mvk-sec-title">TODAY'S TIMELINE</span>
        </div>
        <div className="mvk-timeline">
          {TIMELINE.length === 0 ? (
            <div style={{ fontSize: 8, color: 'var(--mvk-label)', lineHeight: 1.8, padding: '6px 0' }}>
              Nothing scheduled for today.<br />Set due dates on reminders to see them here.
            </div>
          ) : TIMELINE.map((t, i) => (
            <div className="mvk-tl-row" key={i}>
              <div className="mvk-tl-time">{t.time}</div>
              <div className="mvk-tl-rail">
                <span className="mvk-tl-dot" style={{ background: t.color }} />
              </div>
              <div className="mvk-tl-card">
                <span className="mvk-tl-icon"><t.Icon size={15} color={t.color} /></span>
                <div className="mvk-tl-body">
                  <div className="mvk-tl-title">{t.title}</div>
                  <div className="mvk-tl-desc">{t.desc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Quick Actions ── */}
        <div className="mvk-sec-head">
          <RocketIcon size={13} color="#E85D50" />
          <span className="mvk-sec-title">QUICK ACTIONS</span>
        </div>
        <div className="mvk-qa-grid">
          <button className="mvk-qa-btn mvk-qa-danger" onClick={() => navigate('/app/plan')}>
            <WarningIcon size={24} color="#E85D50" />
            <span className="mvk-qa-label">PANIC MODE</span>
            <span className="mvk-qa-sub">Instant help</span>
          </button>
          <button className="mvk-qa-btn" onClick={() => navigate('/app/plan')}>
            <MicIcon size={22} color="#2A8090" />
            <span className="mvk-qa-label">VOICE INPUT</span>
            <span className="mvk-qa-sub">Speak your crisis</span>
          </button>
          <button className="mvk-qa-btn" onClick={() => navigate('/app/calendar')}>
            <PlusIcon size={22} color="#2A8090" />
            <span className="mvk-qa-label">ADD TASK</span>
            <span className="mvk-qa-sub">New task</span>
          </button>
        </div>

        {/* ── Closing line ── */}
        <div className="mvk-card-foot">
          <CalendarIcon size={12} color="#8C9EA8" />
          {active.length > 0
            ? `${active.length} task${active.length !== 1 ? 's' : ''} on your radar today`
            : "I've got your back. Let's crush this."}
        </div>
      </motion.section>
    </MavrickShell>
  )
}
