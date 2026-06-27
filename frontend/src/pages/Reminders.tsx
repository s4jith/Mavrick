import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { MavrickShell } from '../components/pixel/MavrickShell'
import { BrandHeader } from '../components/pixel/BrandHeader'
import { PlusIcon, TrashIcon, CheckIcon, BellIcon, CloseIcon, RefreshIcon } from '../components/icons/PixelIcons'

export interface Reminder {
  id: string
  title: string
  description: string
  due_date: string
  priority: 'low' | 'medium' | 'high'
  completed: boolean
  created_at: string
}

const STORAGE_KEY = 'mavrick_reminders'
const PRIORITY_COLOR = { high: '#E85D50', medium: '#B5179E', low: '#4361EE' }
const PRIORITY_LABEL = { high: 'HIGH', medium: 'MED', low: 'LOW' }

function loadReminders(): Reminder[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') } catch { return [] }
}
function saveReminders(list: Reminder[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

const BLANK: Omit<Reminder, 'id' | 'created_at' | 'completed'> = {
  title: '', description: '', due_date: '', priority: 'medium',
}

type Filter = 'all' | 'active' | 'done'

export function Reminders() {
  const [items, setItems] = useState<Reminder[]>([])
  const [form, setForm] = useState({ ...BLANK })
  const [editId, setEditId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ ...BLANK })
  const [filter, setFilter] = useState<Filter>('all')
  const [showAdd, setShowAdd] = useState(false)

  useEffect(() => { setItems(loadReminders()) }, [])

  function persist(next: Reminder[]) { setItems(next); saveReminders(next) }

  function add() {
    if (!form.title.trim()) return
    persist([{ ...form, id: Date.now().toString(36), created_at: new Date().toISOString(), completed: false }, ...items])
    setForm({ ...BLANK }); setShowAdd(false)
  }
  function toggle(id: string) { persist(items.map(r => r.id === id ? { ...r, completed: !r.completed } : r)) }
  function remove(id: string) { persist(items.filter(r => r.id !== id)) }
  function startEdit(r: Reminder) {
    setEditId(r.id)
    setEditForm({ title: r.title, description: r.description, due_date: r.due_date, priority: r.priority })
  }
  function saveEdit() {
    if (!editForm.title.trim()) return
    persist(items.map(r => r.id === editId ? { ...r, ...editForm } : r))
    setEditId(null)
  }

  const filtered = items.filter(r => filter === 'all' ? true : filter === 'active' ? !r.completed : r.completed)
  const activeCount = items.filter(r => !r.completed).length
  const doneCount = items.filter(r => r.completed).length
  const isOverdue = (r: Reminder) => !r.completed && r.due_date && new Date(r.due_date) < new Date()

  return (
    <MavrickShell active="home">
      <BrandHeader />

      <div className="mvk-page-title">
        <BellIcon size={18} color="#E85D50" />
        <span className="mvk-page-title-text">REMINDERS</span>
      </div>
      <div className="mvk-page-sub">{activeCount} active · {doneCount} done</div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <button className="mvk-save-btn" style={{ marginTop: 0 }} onClick={() => setShowAdd(s => !s)}>
          <PlusIcon size={15} color="#FFF6E6" /> ADD REMINDER
        </button>

        {showAdd && (
          <div className="mvk-card mvk-card-pad" style={{ marginTop: 12 }}>
            <input className="mvk-textarea" style={{ minHeight: 'auto' }} placeholder="What to remember?"
              value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} onKeyDown={e => e.key === 'Enter' && add()} />
            <textarea className="mvk-textarea" style={{ marginTop: 10, minHeight: 64 }} placeholder="Notes (optional)…"
              value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            <input type="datetime-local" className="mvk-textarea" style={{ marginTop: 10, minHeight: 'auto' }}
              value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
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
            <div style={{ fontSize: 8, color: 'var(--mvk-label)', marginTop: 12, lineHeight: 1.7 }}>No reminders here yet.</div>
          </div>
        ) : (
          <div className="mvk-list">
            {filtered.map(r => editId === r.id ? (
              <div key={r.id} className="mvk-card mvk-card-pad">
                <input className="mvk-textarea" style={{ minHeight: 'auto' }} value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} autoFocus />
                <input type="datetime-local" className="mvk-textarea" style={{ marginTop: 10, minHeight: 'auto' }} value={editForm.due_date} onChange={e => setEditForm(f => ({ ...f, due_date: e.target.value }))} />
                <div className="mvk-rescue-actions" style={{ marginTop: 12 }}>
                  <button className="mvk-btn mvk-btn-outline mvk-btn-sm" onClick={() => setEditId(null)}><CloseIcon size={12} /> CANCEL</button>
                  <button className="mvk-btn mvk-btn-coral mvk-btn-sm" onClick={saveEdit}><CheckIcon size={12} color="#FFF6E6" /> SAVE</button>
                </div>
              </div>
            ) : (
              <div key={r.id} className={`mvk-list-item ${r.completed ? 'mvk-rmd-done' : ''}`} style={isOverdue(r) ? { borderColor: 'rgba(232,93,80,0.45)' } : undefined}>
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
      </motion.div>
    </MavrickShell>
  )
}
