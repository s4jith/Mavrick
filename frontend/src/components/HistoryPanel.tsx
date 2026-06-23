import { useEffect, useState } from 'react'
import type { CrisisHistory } from '../types'

const STORAGE_KEY = 'mavrick_history'

export function saveToHistory(entry: CrisisHistory) {
  const existing = loadHistory()
  existing.unshift(entry)
  // Keep last 20
  const trimmed = existing.slice(0, 20)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
}

export function loadHistory(): CrisisHistory[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

interface Props {
  onClose: () => void
}

export function HistoryPanel({ onClose }: Props) {
  const [history, setHistory] = useState<CrisisHistory[]>([])

  useEffect(() => {
    setHistory(loadHistory())
  }, [])

  const clearHistory = () => {
    localStorage.removeItem(STORAGE_KEY)
    setHistory([])
  }

  const clusterEmoji: Record<string, string> = {
    Financial: '💰',
    Academic: '📚',
    Health: '🏥',
    Work: '💼',
    Legal: '⚖️',
    Social: '🎉',
    Family: '👨‍👩‍👧',
    Digital: '💻',
    General: '📋',
  }

  return (
    <div className="history-overlay" onClick={onClose}>
      <div className="history-panel" onClick={(e) => e.stopPropagation()}>
        <div className="history-header">
          <h3>🏆 Crises Survived</h3>
          <button className="history-close" onClick={onClose}>✕</button>
        </div>

        {history.length === 0 ? (
          <div className="history-empty">
            <p>No crises handled yet.</p>
            <p className="text-dim">Complete a plan to build your streak!</p>
          </div>
        ) : (
          <>
            <div className="history-stats">
              <div className="stat-card">
                <span className="stat-num">{history.length}</span>
                <span className="stat-label">Crises Handled</span>
              </div>
              <div className="stat-card">
                <span className="stat-num">
                  {Math.round(
                    history.reduce((a, h) => a + h.evaluator_score, 0) / history.length
                  )}
                </span>
                <span className="stat-label">Avg Score</span>
              </div>
              <div className="stat-card">
                <span className="stat-num">
                  {history.reduce((a, h) => a + h.steps_count, 0)}
                </span>
                <span className="stat-label">Steps Completed</span>
              </div>
            </div>

            <div className="history-list">
              {history.map((h) => (
                <div key={h.id} className="history-item">
                  <span className="history-emoji">
                    {clusterEmoji[h.cluster] || '📋'}
                  </span>
                  <div className="history-body">
                    <div className="history-text">{h.text.slice(0, 60)}…</div>
                    <div className="history-meta">
                      <span>{h.cluster} · {h.sub_type}</span>
                      <span>Score: {h.evaluator_score}/100</span>
                      <span>{new Date(h.completed_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button className="history-clear" onClick={clearHistory}>
              Clear History
            </button>
          </>
        )}
      </div>
    </div>
  )
}
