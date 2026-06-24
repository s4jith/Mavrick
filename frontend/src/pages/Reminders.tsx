import { useEffect, useState } from 'react'
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
const PRIORITY_COLOR = { high: '#f72585', medium: '#b5179e', low: '#4361ee' }
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
    const newItem: Reminder = {
      ...form,
      id: Date.now().toString(36),
      created_at: new Date().toISOString(),
      completed: false,
    }
    persist([newItem, ...items])
    setForm({ ...BLANK })
    setShowAdd(false)
  }

  function toggle(id: string) {
    persist(items.map(r => r.id === id ? { ...r, completed: !r.completed } : r))
  }

  function remove(id: string) {
    persist(items.filter(r => r.id !== id))
  }

  function startEdit(r: Reminder) {
    setEditId(r.id)
    setEditForm({ title: r.title, description: r.description, due_date: r.due_date, priority: r.priority })
  }

  function saveEdit() {
    if (!editForm.title.trim()) return
    persist(items.map(r => r.id === editId ? { ...r, ...editForm } : r))
    setEditId(null)
  }

  function cancelEdit() { setEditId(null) }

  const filtered = items.filter(r =>
    filter === 'all' ? true : filter === 'active' ? !r.completed : r.completed
  )
  const activeCount = items.filter(r => !r.completed).length
  const doneCount   = items.filter(r => r.completed).length

  const isOverdue = (r: Reminder) =>
    !r.completed && r.due_date && new Date(r.due_date) < new Date()

  return (
    <div className="remind-page">
      {/* Header */}
      <div className="remind-header">
        <div>
          <div style={{ fontFamily: "'Press Start 2P', cursive", fontSize: 11, color: 'var(--text-primary)', marginBottom: 4 }}>
            REMINDERS
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
            {activeCount} active · {doneCount} done
          </div>
        </div>
        <button className="rmd-add-btn" onClick={() => setShowAdd(!showAdd)}>
          <PlusIcon size={14} /> ADD
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="rmd-add-form px-card">
          <div className="rmd-form-title">
            <BellIcon size={14} color="var(--px-purple)" /> NEW REMINDER
          </div>
          <div className="rmd-field-row">
            <div className="rmd-field">
              <label className="rmd-label">TITLE *</label>
              <input
                className="rmd-input"
                placeholder="What do you need to remember?"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && add()}
              />
            </div>
          </div>
          <div className="rmd-field">
            <label className="rmd-label">DESCRIPTION</label>
            <textarea
              className="rmd-input rmd-textarea"
              placeholder="Additional notes…"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div className="rmd-field-row">
            <div className="rmd-field">
              <label className="rmd-label">DUE DATE</label>
              <input
                type="datetime-local"
                className="rmd-input"
                value={form.due_date}
                onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
              />
            </div>
            <div className="rmd-field">
              <label className="rmd-label">PRIORITY</label>
              <div className="rmd-priority-row">
                {(['high', 'medium', 'low'] as const).map(p => (
                  <button
                    key={p}
                    className={`rmd-priority-btn ${form.priority === p ? 'active' : ''}`}
                    style={{ '--p-color': PRIORITY_COLOR[p] } as React.CSSProperties}
                    onClick={() => setForm(f => ({ ...f, priority: p }))}
                  >
                    {PRIORITY_LABEL[p]}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button className="rmd-save-btn" onClick={add}>
              <PlusIcon size={12} /> Save Reminder
            </button>
            <button className="rmd-cancel-btn" onClick={() => setShowAdd(false)}>
              <CloseIcon size={12} /> Cancel
            </button>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="rmd-filter-bar">
        {(['all', 'active', 'done'] as Filter[]).map(f => (
          <button
            key={f}
            className={`rmd-filter-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="rmd-empty">
          <BellIcon size={32} color="var(--border)" />
          <p>No reminders {filter !== 'all' ? `in "${filter}"` : ''}.</p>
          {filter === 'all' && (
            <button className="rmd-add-btn" style={{ marginTop: 12 }} onClick={() => setShowAdd(true)}>
              <PlusIcon size={12} /> Add First Reminder
            </button>
          )}
        </div>
      ) : (
        <div className="rmd-list">
          {filtered.map(r => (
            <div
              key={r.id}
              className={`rmd-item px-card ${r.completed ? 'rmd-done' : ''} ${isOverdue(r) ? 'rmd-overdue' : ''}`}
            >
              {editId === r.id ? (
                /* ── Inline Edit Form ── */
                <div className="rmd-edit-form">
                  <input
                    className="rmd-input"
                    value={editForm.title}
                    onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                    autoFocus
                  />
                  <textarea
                    className="rmd-input rmd-textarea"
                    value={editForm.description}
                    onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                  />
                  <div className="rmd-field-row">
                    <input
                      type="datetime-local"
                      className="rmd-input"
                      value={editForm.due_date}
                      onChange={e => setEditForm(f => ({ ...f, due_date: e.target.value }))}
                    />
                    <div className="rmd-priority-row">
                      {(['high', 'medium', 'low'] as const).map(p => (
                        <button
                          key={p}
                          className={`rmd-priority-btn ${editForm.priority === p ? 'active' : ''}`}
                          style={{ '--p-color': PRIORITY_COLOR[p] } as React.CSSProperties}
                          onClick={() => setEditForm(f => ({ ...f, priority: p }))}
                        >
                          {PRIORITY_LABEL[p]}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button className="rmd-save-btn" onClick={saveEdit}><CheckIcon size={12} /> Save</button>
                    <button className="rmd-cancel-btn" onClick={cancelEdit}><CloseIcon size={12} /> Cancel</button>
                  </div>
                </div>
              ) : (
                /* ── Normal Row ── */
                <div className="rmd-row">
                  <button
                    className={`rmd-check ${r.completed ? 'checked' : ''}`}
                    onClick={() => toggle(r.id)}
                    title={r.completed ? 'Mark active' : 'Mark complete'}
                  >
                    {r.completed && <CheckIcon size={12} color="white" />}
                  </button>
                  <div className="rmd-body" onClick={() => startEdit(r)} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && startEdit(r)}>
                    <div className="rmd-item-title">
                      <span
                        className="rmd-priority-dot"
                        style={{ background: PRIORITY_COLOR[r.priority] }}
                        title={`Priority: ${r.priority}`}
                      />
                      {r.title}
                    </div>
                    {r.description && (
                      <div className="rmd-item-desc">{r.description}</div>
                    )}
                    <div className="rmd-item-meta">
                      {r.due_date && (
                        <span className={`rmd-due ${isOverdue(r) ? 'overdue' : ''}`}>
                          {isOverdue(r) ? 'OVERDUE: ' : 'Due: '}
                          {new Date(r.due_date).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                      <span className="rmd-created">
                        Added {new Date(r.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="rmd-actions">
                    <button className="rmd-icon-btn" onClick={() => startEdit(r)} title="Edit">
                      <RefreshIcon size={12} />
                    </button>
                    <button className="rmd-icon-btn rmd-delete" onClick={() => remove(r.id)} title="Delete">
                      <TrashIcon size={12} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
