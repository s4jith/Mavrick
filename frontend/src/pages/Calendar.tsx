import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { MavrickShell } from '../components/pixel/MavrickShell'
import { BrandHeader } from '../components/pixel/BrandHeader'
import { RobotMascot } from '../components/pixel/RobotMascot'
import { CalendarIcon, BookIcon, BriefcaseIcon, ZapIcon, PlayIcon } from '../components/icons/PixelIcons'
import { getReminders } from '../api'
import type { Reminder } from '../types'

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const MONTH_NAMES = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
]

type EventType = 'critical' | 'normal' | 'completed' | 'bill' | 'meeting'

interface CalEvent {
  date: number
  type: EventType
  title: string
  time: string
  Icon: typeof BookIcon
}

const TYPE_COLOR: Record<EventType, string> = {
  critical: '#E82830', normal: '#4890E8', completed: '#28B068', bill: '#E8901A', meeting: '#E8901A',
}

function eventType(r: Reminder): EventType {
  if (r.completed) return 'completed'
  if (r.priority === 'high') return 'critical'
  const t = r.title.toLowerCase()
  if (/bill|pay|rent|electric|invoice|emi|tax/.test(t)) return 'bill'
  if (/meeting|interview|call|presentation|client/.test(t)) return 'meeting'
  return 'normal'
}

function eventIcon(r: Reminder): typeof BookIcon {
  const t = r.title.toLowerCase()
  if (/bill|pay|rent|electric|invoice|emi|tax/.test(t)) return ZapIcon
  if (/meeting|interview|call|presentation|client/.test(t)) return BriefcaseIcon
  return BookIcon
}

function formatEventTime(due: string, isToday: boolean): string {
  const d = new Date(due)
  const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  if (isToday) return `Today, ${time}`
  return `${MONTH_NAMES[d.getMonth()].slice(0, 3)} ${d.getDate()}, ${time}`
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstWeekday(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

const SUGGESTIONS_BY_LOAD: Record<string, string[]> = {
  heavy: [
    'Block 2-hour deep-work sessions to tackle critical tasks',
    'Avoid scheduling new commitments this week',
    'Batch your low-priority tasks into one daily slot',
  ],
  moderate: [
    'Tackle your highest-priority task first thing each morning',
    'Review pending items tomorrow morning',
    'Draw your work into 50-minute focused sessions',
  ],
  light: [
    'Use quiet periods to get ahead on upcoming deadlines',
    "Great time to plan next week's priorities",
    'Consider batching digital tasks into one daily block',
  ],
}

export function Calendar() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [reminders, setReminders] = useState<Reminder[]>([])

  useEffect(() => {
    getReminders().then(setReminders).catch(() => setReminders([]))
  }, [])

  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth()
  const todayDate = isCurrentMonth ? today.getDate() : -1

  const daysInMonth = getDaysInMonth(year, month)
  const firstWeekday = getFirstWeekday(year, month)
  const prevMonthDays = getDaysInMonth(year, month - 1 < 0 ? 11 : month - 1)

  // Build calendar cells
  const cells: { n: number; out: boolean }[] = []
  for (let i = 0; i < 42; i++) {
    const day = i - firstWeekday + 1
    if (day < 1) cells.push({ n: prevMonthDays + day, out: true })
    else if (day > daysInMonth) cells.push({ n: day - daysInMonth, out: true })
    else cells.push({ n: day, out: false })
  }

  // Map reminders with due_date in current month → events
  const events: CalEvent[] = reminders
    .filter(r => {
      if (!r.due_date) return false
      const d = new Date(r.due_date)
      return d.getFullYear() === year && d.getMonth() === month
    })
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    .map(r => {
      const d = new Date(r.due_date)
      const date = d.getDate()
      const isToday = isCurrentMonth && date === todayDate
      return {
        date,
        type: eventType(r),
        title: r.title.toUpperCase(),
        time: formatEventTime(r.due_date, isToday),
        Icon: eventIcon(r),
      }
    })

  // Dot map for grid: first event type per day wins
  const dotByDate: Record<number, EventType> = {}
  events.forEach(e => { if (!dotByDate[e.date]) dotByDate[e.date] = e.type })

  // AI suggestions based on event load
  const activeCount = events.filter(e => e.type !== 'completed').length
  const suggestionKey = activeCount >= 5 ? 'heavy' : activeCount >= 2 ? 'moderate' : 'light'
  const suggestions = SUGGESTIONS_BY_LOAD[suggestionKey]

  // Best study time: lean toward evening if heavy load, morning if light
  const bestTime = activeCount >= 5 ? '8 PM – 10 PM' : activeCount >= 2 ? '9 PM – 11 PM' : '9 AM – 11 AM'

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

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
            <button className="mvk-cal-arrow" onClick={prevMonth}>‹</button>
            <span className="mvk-cal-month">{MONTH_NAMES[month]} {year}</span>
            <button className="mvk-cal-arrow" onClick={nextMonth}>›</button>
          </div>

          <div className="mvk-cal-grid mvk-cal-weekdays">
            {WEEKDAYS.map(w => <span key={w} className="mvk-cal-wd">{w}</span>)}
          </div>
          <div className="mvk-cal-grid">
            {cells.map((c, i) => {
              const isToday = !c.out && c.n === todayDate
              const ev = !c.out ? dotByDate[c.n] : undefined
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
            <div className="mvk-sec-head"><span className="mvk-sec-title">EVENTS</span></div>
            <div className="mvk-cal-events">
              {events.length === 0 ? (
                <div style={{ fontSize: 8, color: 'var(--mvk-label)', lineHeight: 1.8 }}>
                  No reminders this month.<br />Add some in Reminders!
                </div>
              ) : (
                events.map((e, i) => (
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
              <div className="mvk-cal-besttime-val">{bestTime}</div>
            </div>
            <div className="mvk-cal-suggestions">
              {suggestions.map((s, i) => (
                <div key={i} className="mvk-cal-suggestion"><PlayIcon size={8} color="#2A8090" /> {s}</div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </MavrickShell>
  )
}
