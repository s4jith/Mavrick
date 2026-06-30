import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MavrickShell } from '../components/pixel/MavrickShell'
import { RobotMascot } from '../components/pixel/RobotMascot'
import {
  CalendarIcon, BookIcon, BriefcaseIcon, ZapIcon, PlayIcon,
  BellIcon, PlusIcon, TrashIcon, CheckIcon, CloseIcon, RefreshIcon,
} from '../components/icons/PixelIcons'
import { getReminders, addReminder, updateReminder, deleteReminder } from '../api'
import type { Reminder } from '../types'

/* ─────────────────────────── CONSTANTS ─────────────────────────── */

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const MONTH_NAMES = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
]

type EventType = 'critical' | 'normal' | 'completed' | 'bill' | 'meeting'
type Filter = 'all' | 'active' | 'done'

const TYPE_COLOR: Record<EventType, string> = {
  critical: '#E82830', normal: '#4890E8', completed: '#28B068', bill: '#E8901A', meeting: '#E8901A',
}
const PRIORITY_COLOR = { high: '#E85D50', medium: '#B5179E', low: '#4361EE' }
const PRIORITY_LABEL = { high: 'HIGH', medium: 'MED', low: 'LOW' }
const BLANK: Omit<Reminder, 'id' | 'created_at' | 'completed'> = {
  title: '', description: '', due_date: '', priority: 'medium',
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

function getDaysInMonth(year: number, month: number) { return new Date(year, month + 1, 0).getDate() }
function getFirstWeekday(year: number, month: number) { return new Date(year, month, 1).getDay() }

function isOverdue(r: Reminder) { return !r.completed && !!r.due_date && new Date(r.due_date) < new Date() }

/* ─────────────────────────── COMPONENT ─────────────────────────── */

export function Calendar() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  const [reminders, setReminders] = useState<Reminder[]>([])
  const [filter, setFilter] = useState<Filter>('all')

  // Modal state
  const [modalDay, setModalDay] = useState<number | null>(null)
  const [modalYear, setModalYear] = useState(year)
  const [modalMonth, setModalMonth] = useState(month)
  const [showModalAdd, setShowModalAdd] = useState(false)
  const [modalForm, setModalForm] = useState({ ...BLANK })

  // Task list edit
  const [editId, setEditId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ ...BLANK })

  useEffect(() => {
    getReminders().then(setReminders).catch(() => setReminders([]))
  }, [])

  /* ── CRUD ── */
  async function addTask() {
    if (!modalForm.title.trim()) return
    const due = modalForm.due_date || `${modalYear}-${String(modalMonth + 1).padStart(2, '0')}-${String(modalDay).padStart(2, '0')}T09:00`
    try {
      const saved = await addReminder({ ...modalForm, due_date: due, completed: false })
      setReminders(prev => [saved, ...prev])
    } catch { /* ignore */ }
    setModalForm({ ...BLANK }); setShowModalAdd(false)
  }

  async function toggle(id: string) {
    const cur = reminders.find(r => r.id === id); if (!cur) return
    setReminders(prev => prev.map(r => r.id === id ? { ...r, completed: !r.completed } : r))
    try { await updateReminder(id, { completed: !cur.completed }) }
    catch { setReminders(prev => prev.map(r => r.id === id ? { ...r, completed: cur.completed } : r)) }
  }

  async function remove(id: string) {
    const snap = reminders
    setReminders(p => p.filter(r => r.id !== id))
    try { await deleteReminder(id) } catch { setReminders(snap) }
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

  /* ── Calendar math ── */
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

  const dotByDate: Record<number, EventType> = {}
  reminders
    .filter(r => {
      if (!r.due_date) return false
      const d = new Date(r.due_date)
      return d.getFullYear() === year && d.getMonth() === month
    })
    .forEach(r => {
      const date = new Date(r.due_date).getDate()
      if (!dotByDate[date]) dotByDate[date] = eventType(r)
    })

  /* ── AI suggestions ── */
  const activeCount = reminders.filter(r => !r.completed).length
  const suggKey = activeCount >= 5 ? 'heavy' : activeCount >= 2 ? 'moderate' : 'light'
  const suggestions = SUGGESTIONS_BY_LOAD[suggKey]

  /* ── Nav ── */
  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  /* ── Modal ── */
  function openModal(day: number) {
    setModalDay(day); setModalYear(year); setModalMonth(month)
    setShowModalAdd(false); setModalForm({ ...BLANK })
  }
  function closeModal() { setModalDay(null); setShowModalAdd(false) }

  const modalDayTasks = modalDay !== null ? reminders.filter(r => {
    if (!r.due_date) return false
    const d = new Date(r.due_date)
    return d.getFullYear() === modalYear && d.getMonth() === modalMonth && d.getDate() === modalDay
  }) : []

  /* ── Task list ── */
  const filtered = reminders.filter(r =>
    filter === 'all' ? true : filter === 'active' ? !r.completed : r.completed
  )
  const totalActive = reminders.filter(r => !r.completed).length
  const totalDone = reminders.filter(r => r.completed).length

  return (
    <MavrickShell active="calendar">
      <div className="mvk-page-title">
        <CalendarIcon size={20} color="#E85D50" />
        <span className="mvk-page-title-text">CALENDAR</span>
      </div>
      <div className="mvk-page-sub">
        Plan <span className="mvk-coral">smart</span>. Stay <span className="mvk-coral">ahead</span>. Beat every <span className="mvk-coral">crisis</span>.
      </div>

      {/* ── Calendar card ── */}
      <motion.div
        className="mvk-card mvk-card-pad"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
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
              <button
                key={i}
                className={`mvk-cal-cell ${c.out ? 'out' : ''} ${isToday ? 'today' : ''}`}
                onClick={() => !c.out && openModal(c.n)}
                disabled={c.out}
                aria-label={c.out ? undefined : `${MONTH_NAMES[month].slice(0, 3)} ${c.n}`}
              >
                {c.n}
                {ev && <span className="mvk-cal-dot" style={{ background: TYPE_COLOR[ev] }} />}
              </button>
            )
          })}
        </div>
        <div className="mvk-cal-legend">
          <span><i style={{ background: TYPE_COLOR.critical }} /> CRITICAL</span>
          <span><i style={{ background: TYPE_COLOR.normal }} /> NORMAL</span>
          <span><i style={{ background: TYPE_COLOR.completed }} /> COMPLETED</span>
          <span><i style={{ background: TYPE_COLOR.bill }} /> MEETING / BILL</span>
        </div>
      </motion.div>

      {/* ── AI Coach tip ── */}
      <div className="mvk-card mvk-card-pad" style={{ marginBottom: 14 }}>
        <div className="mvk-cal-ai-intro">
          <RobotMascot size={34} mood="coach" />
          <span>{suggestions[0]}</span>
        </div>
        <div className="mvk-cal-suggestions" style={{ marginTop: 8 }}>
          {suggestions.slice(1).map((s, i) => (
            <div key={i} className="mvk-cal-suggestion"><PlayIcon size={8} color="#2A8090" /> {s}</div>
          ))}
        </div>
      </div>

      {/* ── Task list ── */}
      <div className="mvk-sec-head" style={{ marginTop: 4 }}>
        <BellIcon size={13} color="#E85D50" />
        <span className="mvk-sec-title">ALL TASKS</span>
      </div>
      <div className="mvk-on-bg-text" style={{ fontSize: 7, marginBottom: 12, fontFamily: "'Press Start 2P', cursive" }}>
        {totalActive} active · {totalDone} done — tap any date to add
      </div>

      <div className="mvk-pills" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 12 }}>
        {(['all', 'active', 'done'] as Filter[]).map(f => (
          <button key={f} className={`mvk-pill ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="mvk-card mvk-card-pad" style={{ textAlign: 'center', padding: 28 }}>
          <BellIcon size={28} color="#5FD0E6" />
          <div style={{ fontSize: 8, color: 'var(--mvk-label)', marginTop: 12, lineHeight: 1.7, fontFamily: "'Press Start 2P', cursive" }}>
            No tasks here yet.<br />Tap a date on the calendar to add one.
          </div>
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
                  <button key={p} className={`mvk-pill ${editForm.priority === p ? 'active' : ''}`}
                    onClick={() => setEditForm(f => ({ ...f, priority: p }))}>
                    {PRIORITY_LABEL[p]}
                  </button>
                ))}
              </div>
              <div className="mvk-rescue-actions" style={{ marginTop: 12 }}>
                <button className="mvk-btn mvk-btn-outline mvk-btn-sm" onClick={() => setEditId(null)}>
                  <CloseIcon size={12} /> CANCEL
                </button>
                <button className="mvk-btn mvk-btn-coral mvk-btn-sm" onClick={saveEdit}>
                  <CheckIcon size={12} color="#FFF6E6" /> SAVE
                </button>
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

      {/* ── Date modal (bottom-sheet) ── */}
      <AnimatePresence>
        {modalDay !== null && (
          <div className="mvk-modal-overlay" onClick={closeModal}>
            <motion.div
              className="mvk-modal"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              onClick={e => e.stopPropagation()}
            >
              <div className="mvk-modal-handle" />
              <div className="mvk-modal-head">
                <span className="mvk-modal-title">
                  {MONTH_NAMES[modalMonth].slice(0, 3)} {modalDay}
                  {modalYear === today.getFullYear() && modalMonth === today.getMonth() && modalDay === today.getDate() && ' · TODAY'}
                </span>
                <span className="mvk-modal-sub">{modalDayTasks.length} TASK{modalDayTasks.length !== 1 ? 'S' : ''}</span>
                <button className="mvk-modal-close" onClick={closeModal} aria-label="Close">
                  <CloseIcon size={12} />
                </button>
              </div>

              {/* Tasks for this day */}
              {modalDayTasks.length > 0 && (
                <div className="mvk-modal-day-tasks">
                  {modalDayTasks.map(r => {
                    const Icon = eventIcon(r)
                    return (
                      <div key={r.id} className="mvk-modal-task-item">
                        <button
                          className={`mvk-rmd-check ${r.completed ? 'on' : ''}`}
                          onClick={() => toggle(r.id)}
                          aria-label="Toggle"
                        >
                          {r.completed && <CheckIcon size={11} color="#fff" />}
                        </button>
                        <Icon size={14} color={TYPE_COLOR[eventType(r)]} />
                        <div className="mvk-li-body" style={{ flex: 1 }}>
                          <div className="mvk-li-title" style={{ textDecoration: r.completed ? 'line-through' : 'none', opacity: r.completed ? 0.5 : 1 }}>
                            {r.title}
                          </div>
                          {r.due_date && (
                            <div className="mvk-li-sub">
                              {new Date(r.due_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          )}
                        </div>
                        <button className="mvk-rmd-icon mvk-rmd-del" onClick={() => remove(r.id)} aria-label="Delete">
                          <TrashIcon size={11} />
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}

              {modalDayTasks.length === 0 && !showModalAdd && (
                <div className="mvk-modal-empty">
                  No tasks for this day.<br />Tap ADD TASK to schedule one.
                </div>
              )}

              {/* Add task form */}
              {showModalAdd ? (
                <div className="mvk-modal-add-form">
                  <input
                    className="mvk-textarea"
                    style={{ minHeight: 'auto' }}
                    placeholder="Task title…"
                    value={modalForm.title}
                    onChange={e => setModalForm(f => ({ ...f, title: e.target.value }))}
                    autoFocus
                  />
                  <textarea
                    className="mvk-textarea"
                    style={{ minHeight: 56 }}
                    placeholder="Notes (optional)…"
                    value={modalForm.description}
                    onChange={e => setModalForm(f => ({ ...f, description: e.target.value }))}
                  />
                  <input
                    type="datetime-local"
                    className="mvk-textarea"
                    style={{ minHeight: 'auto' }}
                    value={modalForm.due_date || `${modalYear}-${String(modalMonth + 1).padStart(2, '0')}-${String(modalDay).padStart(2, '0')}T09:00`}
                    onChange={e => setModalForm(f => ({ ...f, due_date: e.target.value }))}
                  />
                  <div className="mvk-pills" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
                    {(['high', 'medium', 'low'] as const).map(p => (
                      <button key={p} className={`mvk-pill ${modalForm.priority === p ? 'active' : ''}`}
                        onClick={() => setModalForm(f => ({ ...f, priority: p }))}>
                        {PRIORITY_LABEL[p]}
                      </button>
                    ))}
                  </div>
                  <div className="mvk-rescue-actions">
                    <button className="mvk-btn mvk-btn-outline mvk-btn-sm" onClick={() => setShowModalAdd(false)}>
                      <CloseIcon size={12} /> CANCEL
                    </button>
                    <button className="mvk-btn mvk-btn-coral mvk-btn-sm" onClick={addTask}>
                      <CheckIcon size={12} color="#FFF6E6" /> SAVE
                    </button>
                  </div>
                </div>
              ) : (
                <button className="mvk-save-btn" style={{ marginTop: 4 }} onClick={() => setShowModalAdd(true)}>
                  <PlusIcon size={15} color="#FFF6E6" /> ADD TASK
                </button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </MavrickShell>
  )
}
