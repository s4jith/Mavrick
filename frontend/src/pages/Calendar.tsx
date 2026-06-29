import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { MavrickShell } from '../components/pixel/MavrickShell'
import { BrandHeader } from '../components/pixel/BrandHeader'
import { RobotMascot } from '../components/pixel/RobotMascot'
import { CalendarIcon, BookIcon, BriefcaseIcon, ZapIcon, PlayIcon,
  BellIcon, PlusIcon, TrashIcon, CheckIcon, CloseIcon, RefreshIcon } from '../components/icons/PixelIcons'
import { getReminders, addReminder, updateReminder, deleteReminder } from '../api'
import type { Reminder } from '../types'

/* ─────────────────────────── SHARED TYPES ─────────────────────────── */

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const MONTH_NAMES = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
]

type EventType = 'critical' | 'normal' | 'completed' | 'bill' | 'meeting'
type Filter = 'all' | 'active' | 'done'

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

const PRIORITY_COLOR = { high: '#E85D50', medium: '#B5179E', low: '#4361EE' }
const PRIORITY_LABEL = { high: 'HIGH', medium: 'MED', low: 'LOW' }
const BLANK: Omit<Reminder, 'id' | 'created_at' | 'completed'> = {
  title: '', description: '', due_date: '', priority: 'medium',
}

/* ─────────────────────────── HELPERS ─────────────────────────── */

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

function getDaysInMonth(year: number, month: number) { return new Date(year, month + 1, 0).getDate() }
function getFirstWeekday(year: number, month: number) { return new Date(year, month, 1).getDay() }

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

/* ─────────────────────────── COMPONENT ─────────────────────────── */

export function Calendar() {
  const today = new Date()
  const [tab, setTab] = useState<'calendar' | 'tasks'>('calendar')
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  // Shared reminder state — both tabs read from this
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [form, setForm] = useState({ ...BLANK })
  const [editId, setEditId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ ...BLANK })
  const [filter, setFilter] = useState<Filter>('all')
  const [showAdd, setShowAdd] = useState(false)

  useEffect(() => {
    getReminders().then(setReminders).catch(() => setReminders([]))
  }, [])

  /* ── Reminders CRUD ── */
  async function add() {
    if (!form.title.trim()) return
    try {
      const saved = await addReminder({ ...form, completed: false })
      setReminders(prev => [saved, ...prev])
    } catch { /* ignore */ }
    setForm({ ...BLANK }); setShowAdd(false)
  }
  async function toggle(id: string) {
    const cur = reminders.find(r => r.id === id); if (!cur) return
    setReminders(prev => prev.map(r => r.id === id ? { ...r, completed: !r.completed } : r))
    try { await updateReminder(id, { completed: !cur.completed }) }
    catch { setReminders(prev => prev.map(r => r.id === id ? { ...r, completed: cur.completed } : r)) }
  }
  async function remove(id: string) {
    const snapshot = reminders
    setReminders(p => p.filter(r => r.id !== id))
    try { await deleteReminder(id) } catch { setReminders(snapshot) }
  }
  function startEdit(r: Reminder) {
    setEditId(r.id)
    setEditForm({ title: r.title, description: r.description, due_date: r.due_date, priority: r.priority })
  }
  async function saveEdit() {
    if (!editForm.title.trim() || !editId) return
    try {
      const saved = await updateReminder(editId, { ...editForm })
      setReminders(prev => prev.map(r => r.id === editId ? saved : r))
    } catch { /* ignore */ }
    setEditId(null)
  }

  /* ── Calendar derivations ── */
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth()
  const todayDate = isCurrentMonth ? today.getDate() : -1
  const daysInMonth = getDaysInMonth(year, month)
  const firstWeekday = getFirstWeekday(year, month)
  const prevMonthDays = getDaysInMonth(year, month - 1 < 0 ? 11 : month - 1)

  const cells: { n: number; out: boolean }[] = []
  for (let i = 0; i < 42; i++) {
    const day = i - firstWeekday + 1
    if (day < 1) cells.push({ n: prevMonthDays + day, out: true })
    else if (day > daysInMonth) cells.push({ n: day - daysInMonth, out: true })
    else cells.push({ n: day, out: false })
  }

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
      return { date, type: eventType(r), title: r.title.toUpperCase(), time: formatEventTime(r.due_date, isToday), Icon: eventIcon(r) }
    })

  const dotByDate: Record<number, EventType> = {}
  events.forEach(e => { if (!dotByDate[e.date]) dotByDate[e.date] = e.type })

  const calActiveCount = events.filter(e => e.type !== 'completed').length
  const suggestionKey = calActiveCount >= 5 ? 'heavy' : calActiveCount >= 2 ? 'moderate' : 'light'
  const suggestions = SUGGESTIONS_BY_LOAD[suggestionKey]
  const bestTime = calActiveCount >= 5 ? '8 PM – 10 PM' : calActiveCount >= 2 ? '9 PM – 11 PM' : '9 AM – 11 AM'

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  /* ── Tasks tab ── */
  const isOverdue = (r: Reminder) => !r.completed && !!r.due_date && new Date(r.due_date) < new Date()
  const filtered = reminders.filter(r =>
    filter === 'all' ? true : filter === 'active' ? !r.completed : r.completed
  )
  const totalActive = reminders.filter(r => !r.completed).length
  const totalDone = reminders.filter(r => r.completed).length

  return (
    <MavrickShell active="calendar">
      <BrandHeader />

      {/* ── Tab switcher ── */}
      <div className="mvk-pills" style={{ gridTemplateColumns: 'repeat(2,1fr)', marginBottom: 4 }}>
        <button className={`mvk-pill ${tab === 'calendar' ? 'active' : ''}`} onClick={() => setTab('calendar')}>
          CALENDAR
        </button>
        <button className={`mvk-pill ${tab === 'tasks' ? 'active' : ''}`} onClick={() => setTab('tasks')}>
          TASKS{totalActive > 0 ? ` · ${totalActive}` : ''}
        </button>
      </div>

      <motion.div
        key={tab}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        {tab === 'calendar' ? (
          /* ════════════ CALENDAR TAB ════════════ */
          <>
            <div className="mvk-page-title">
              <CalendarIcon size={20} color="#E85D50" />
              <span className="mvk-page-title-text">CALENDAR</span>
            </div>
            <div className="mvk-page-sub">
              Plan <span className="mvk-coral">smart</span>. Stay <span className="mvk-coral">ahead</span>. Beat every <span className="mvk-coral">crisis</span>.
            </div>

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

            <div className="mvk-cal-cols">
              <div className="mvk-card mvk-card-pad">
                <div className="mvk-sec-head"><span className="mvk-sec-title">EVENTS</span></div>
                <div className="mvk-cal-events">
                  {events.length === 0 ? (
                    <div style={{ fontSize: 8, color: 'var(--mvk-label)', lineHeight: 1.8 }}>
                      No tasks this month.<br />Add some in the Tasks tab!
                    </div>
                  ) : events.map((e, i) => (
                    <div key={i} className="mvk-cal-event">
                      <span className="mvk-cal-event-ico"><e.Icon size={14} color={TYPE_COLOR[e.type]} /></span>
                      <div>
                        <div className="mvk-cal-event-title">{e.title}</div>
                        <div className="mvk-cal-event-time">{e.time}</div>
                      </div>
                    </div>
                  ))}
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
          </>
        ) : (
          /* ════════════ TASKS TAB ════════════ */
          <>
            <div className="mvk-page-title">
              <BellIcon size={18} color="#E85D50" />
              <span className="mvk-page-title-text">TASKS</span>
            </div>
            <div className="mvk-page-sub">{totalActive} active · {totalDone} done</div>

            <button className="mvk-save-btn" style={{ marginTop: 0 }} onClick={() => setShowAdd(s => !s)}>
              <PlusIcon size={15} color="#FFF6E6" /> ADD TASK
            </button>

            {showAdd && (
              <div className="mvk-card mvk-card-pad" style={{ marginTop: 12 }}>
                <input
                  className="mvk-textarea"
                  style={{ minHeight: 'auto' }}
                  placeholder="What to remember?"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && add()}
                />
                <textarea
                  className="mvk-textarea"
                  style={{ marginTop: 10, minHeight: 64 }}
                  placeholder="Notes (optional)…"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                />
                <input
                  type="datetime-local"
                  className="mvk-textarea"
                  style={{ marginTop: 10, minHeight: 'auto' }}
                  value={form.due_date}
                  onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
                />
                <div className="mvk-pills" style={{ marginTop: 10, gridTemplateColumns: 'repeat(3,1fr)' }}>
                  {(['high', 'medium', 'low'] as const).map(p => (
                    <button key={p} className={`mvk-pill ${form.priority === p ? 'active' : ''}`} onClick={() => setForm(f => ({ ...f, priority: p }))}>
                      {PRIORITY_LABEL[p]}
                    </button>
                  ))}
                </div>
                <div className="mvk-rescue-actions" style={{ marginTop: 12 }}>
                  <button className="mvk-btn mvk-btn-outline mvk-btn-sm" onClick={() => setShowAdd(false)}><CloseIcon size={12} /> CANCEL</button>
                  <button className="mvk-btn mvk-btn-coral mvk-btn-sm" onClick={add}><CheckIcon size={12} color="#FFF6E6" /> SAVE</button>
                </div>
              </div>
            )}

            <div className="mvk-pills" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginTop: 14, marginBottom: 12 }}>
              {(['all', 'active', 'done'] as Filter[]).map(f => (
                <button key={f} className={`mvk-pill ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f.toUpperCase()}</button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div className="mvk-card mvk-card-pad" style={{ textAlign: 'center', padding: 28 }}>
                <BellIcon size={28} color="#5FD0E6" />
                <div style={{ fontSize: 8, color: 'var(--mvk-label)', marginTop: 12, lineHeight: 1.7 }}>No tasks here yet.<br />Tap ADD TASK to get started.</div>
              </div>
            ) : (
              <div className="mvk-list">
                {filtered.map(r => editId === r.id ? (
                  <div key={r.id} className="mvk-card mvk-card-pad">
                    <input
                      className="mvk-textarea"
                      style={{ minHeight: 'auto' }}
                      value={editForm.title}
                      onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                      autoFocus
                    />
                    <textarea
                      className="mvk-textarea"
                      style={{ marginTop: 10, minHeight: 56 }}
                      placeholder="Notes (optional)…"
                      value={editForm.description}
                      onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                    />
                    <input
                      type="datetime-local"
                      className="mvk-textarea"
                      style={{ marginTop: 10, minHeight: 'auto' }}
                      value={editForm.due_date}
                      onChange={e => setEditForm(f => ({ ...f, due_date: e.target.value }))}
                    />
                    <div className="mvk-pills" style={{ marginTop: 10, gridTemplateColumns: 'repeat(3,1fr)' }}>
                      {(['high', 'medium', 'low'] as const).map(p => (
                        <button key={p} className={`mvk-pill ${editForm.priority === p ? 'active' : ''}`} onClick={() => setEditForm(f => ({ ...f, priority: p }))}>
                          {PRIORITY_LABEL[p]}
                        </button>
                      ))}
                    </div>
                    <div className="mvk-rescue-actions" style={{ marginTop: 12 }}>
                      <button className="mvk-btn mvk-btn-outline mvk-btn-sm" onClick={() => setEditId(null)}><CloseIcon size={12} /> CANCEL</button>
                      <button className="mvk-btn mvk-btn-coral mvk-btn-sm" onClick={saveEdit}><CheckIcon size={12} color="#FFF6E6" /> SAVE</button>
                    </div>
                  </div>
                ) : (
                  <div
                    key={r.id}
                    className={`mvk-list-item ${r.completed ? 'mvk-rmd-done' : ''}`}
                    style={isOverdue(r) ? { borderColor: 'rgba(232,93,80,0.45)' } : undefined}
                  >
                    <button className={`mvk-rmd-check ${r.completed ? 'on' : ''}`} onClick={() => toggle(r.id)} aria-label="Toggle complete">
                      {r.completed && <CheckIcon size={11} color="#fff" />}
                    </button>
                    <div className="mvk-li-body" onClick={() => startEdit(r)} role="button" tabIndex={0}>
                      <div className="mvk-li-title" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <span style={{ width: 7, height: 7, borderRadius: 2, background: PRIORITY_COLOR[r.priority] }} />
                        {r.title}
                      </div>
                      {r.description && <div className="mvk-li-sub" style={{ color: 'var(--mvk-muted)' }}>{r.description}</div>}
                      {r.due_date && (
                        <div className="mvk-li-sub" style={{ color: isOverdue(r) ? '#E85D50' : '#7A8A78' }}>
                          {isOverdue(r) ? 'OVERDUE · ' : 'Due · '}
                          {new Date(r.due_date).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="mvk-rmd-icon" onClick={() => startEdit(r)} aria-label="Edit"><RefreshIcon size={11} /></button>
                      <button className="mvk-rmd-icon mvk-rmd-del" onClick={() => remove(r.id)} aria-label="Delete"><TrashIcon size={11} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </motion.div>
    </MavrickShell>
  )
}
