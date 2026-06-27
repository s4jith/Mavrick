import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { MavrickShell } from '../components/pixel/MavrickShell'
import { BrandHeader } from '../components/pixel/BrandHeader'
import { RobotMascot } from '../components/pixel/RobotMascot'
import { CalendarIcon, BookIcon, BriefcaseIcon, ZapIcon, PlayIcon } from '../components/icons/PixelIcons'
import { getCalendarEvents } from '../api'
import type { CalendarEvent } from '../types'

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const FIRST_WEEKDAY = 4   // May 1 2025 falls on Thursday
const DAYS_IN_MONTH = 31
const PREV_MONTH_DAYS = 30
const TODAY = 14

const TYPE_COLOR: Record<string, string> = {
  critical: '#E82830', normal: '#4890E8', completed: '#28B068', bill: '#E8901A', meeting: '#E8901A',
}

const EVENTS = [
  { date: 14, type: 'critical', title: 'Assignment Due',  time: 'Today, 11:59 PM', Icon: BookIcon },
  { date: 22, type: 'meeting',  title: 'Team Meeting',     time: 'May 22, 3:00 PM', Icon: BriefcaseIcon },
  { date: 22, type: 'bill',     title: 'Electricity Bill', time: 'May 22, 12:00 AM', Icon: ZapIcon },
  { date: 23, type: 'critical', title: 'Project Deadline', time: 'May 23, 11:59 PM', Icon: BookIcon },
  { date: 25, type: 'normal',   title: 'Presentation',     time: 'May 25, All Day', Icon: BriefcaseIcon },
]

const SUGGESTIONS = [
  'Avoid distractions between 7–11 PM',
  'Draw your study into 50-min sessions',
  'Review pending tasks tomorrow morning',
]

const eventByDate: Record<number, string> = {}
EVENTS.forEach(e => { if (!eventByDate[e.date]) eventByDate[e.date] = e.type })

function buildCells() {
  const cells: { n: number; out: boolean }[] = []
  for (let i = 0; i < 42; i++) {
    const day = i - FIRST_WEEKDAY + 1
    if (day < 1) cells.push({ n: PREV_MONTH_DAYS + day, out: true })
    else if (day > DAYS_IN_MONTH) cells.push({ n: day - DAYS_IN_MONTH, out: true })
    else cells.push({ n: day, out: false })
  }
  return cells
}

function fmtEventTime(ev: CalendarEvent): string {
  try {
    const d = new Date(ev.start)
    if (ev.all_day) return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ', All Day'
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ', ' +
      d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
  } catch { return ev.start }
}

function iconFor(title: string) {
  const t = title.toLowerCase()
  if (/(bill|pay|invoice|rent)/.test(t)) return { Icon: ZapIcon, color: TYPE_COLOR.bill }
  if (/(meet|call|sync|standup|interview)/.test(t)) return { Icon: BriefcaseIcon, color: TYPE_COLOR.meeting }
  if (/(due|deadline|exam|assignment|submit|project)/.test(t)) return { Icon: BookIcon, color: TYPE_COLOR.critical }
  return { Icon: BriefcaseIcon, color: TYPE_COLOR.normal }
}

export function Calendar() {
  const cells = buildCells()
  const [liveEvents, setLiveEvents] = useState<CalendarEvent[] | null>(null)

  useEffect(() => {
    getCalendarEvents(30)
      .then(r => setLiveEvents(r.events))
      .catch(() => setLiveEvents(null))   // not connected → keep demo
  }, [])

  const hasLive = !!liveEvents && liveEvents.length > 0

  return (
    <MavrickShell active="calendar">
      <BrandHeader />

      <div className="mvk-page-title">
        <CalendarIcon size={20} color="#E85D50" />
        <span className="mvk-page-title-text">CALENDAR</span>
      </div>
      <div className="mvk-page-sub">
        Plan <span className="mvk-coral">smart</span>. Stay <span className="mvk-coral">ahead</span>. Beat every <span className="mvk-coral">crisis</span>.
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Month grid */}
        <div className="mvk-card mvk-card-pad">
          <div className="mvk-cal-head">
            <button className="mvk-cal-arrow">‹</button>
            <span className="mvk-cal-month">MAY 2025</span>
            <button className="mvk-cal-arrow">›</button>
          </div>

          <div className="mvk-cal-grid mvk-cal-weekdays">
            {WEEKDAYS.map(w => <span key={w} className="mvk-cal-wd">{w}</span>)}
          </div>
          <div className="mvk-cal-grid">
            {cells.map((c, i) => {
              const isToday = !c.out && c.n === TODAY
              const ev = !c.out ? eventByDate[c.n] : undefined
              return (
                <span key={i} className={`mvk-cal-cell ${c.out ? 'out' : ''} ${isToday ? 'today' : ''}`}>
                  {c.n}
                  {ev && <span className="mvk-cal-dot" style={{ background: TYPE_COLOR[ev] }} />}
                </span>
              )
            })}
          </div>

          <div className="mvk-cal-legend">
            <span><i style={{ background: TYPE_COLOR.critical }} /> CRITICAL</span>
            <span><i style={{ background: TYPE_COLOR.normal }} /> NORMAL</span>
            <span><i style={{ background: TYPE_COLOR.completed }} /> COMPLETED</span>
            <span><i style={{ background: TYPE_COLOR.bill }} /> MEETING / BILL</span>
          </div>
        </div>

        {/* Events + AI suggestions */}
        <div className="mvk-cal-cols">
          <div className="mvk-card mvk-card-pad">
            <div className="mvk-sec-head">
              <span className="mvk-sec-title">{hasLive ? 'UPCOMING EVENTS' : 'EVENTS'}</span>
              {hasLive && <span className="mvk-conn-badge on" style={{ fontSize: 6, padding: '3px 6px' }}>● LIVE</span>}
            </div>
            <div className="mvk-cal-events">
              {hasLive ? (
                liveEvents!.slice(0, 8).map((e, i) => {
                  const { Icon, color } = iconFor(e.title)
                  return (
                    <div key={e.id || i} className="mvk-cal-event">
                      <span className="mvk-cal-event-ico"><Icon size={14} color={color} /></span>
                      <div>
                        <div className="mvk-cal-event-title">{e.title}</div>
                        <div className="mvk-cal-event-time">{fmtEventTime(e)}</div>
                      </div>
                    </div>
                  )
                })
              ) : (
                EVENTS.map((e, i) => (
                  <div key={i} className="mvk-cal-event">
                    <span className="mvk-cal-event-ico"><e.Icon size={14} color={TYPE_COLOR[e.type]} /></span>
                    <div>
                      <div className="mvk-cal-event-title">{e.title}</div>
                      <div className="mvk-cal-event-time">{e.time}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mvk-card mvk-card-pad">
            <div className="mvk-sec-head"><span className="mvk-sec-title">AI SUGGESTIONS</span></div>
            <div className="mvk-cal-ai-intro">
              <RobotMascot size={34} mood="coach" />
              <span>Based on your schedule, here are my suggestions!</span>
            </div>
            <div className="mvk-cal-besttime">
              <div className="mvk-cal-besttime-label">BEST TIME TO STUDY</div>
              <div className="mvk-cal-besttime-val">8 PM – 10 PM</div>
            </div>
            <div className="mvk-cal-suggestions">
              {SUGGESTIONS.map((s, i) => (
                <div key={i} className="mvk-cal-suggestion"><PlayIcon size={8} color="#2A8090" /> {s}</div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </MavrickShell>
  )
}
