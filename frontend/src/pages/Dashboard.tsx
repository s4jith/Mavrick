import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getHealth } from '../api'
import { loadHistory } from '../components/HistoryPanel'
import { CalmAvatar, PanickedAvatar } from '../components/PixelAvatar'
import { ZapIcon, ChartIcon, TimerIcon, ActivityIcon } from '../components/icons/PixelIcons'
import type { CrisisHistory, Health } from '../types'

function modeOf(arr: string[]): string {
  const freq: Record<string, number> = {}
  arr.forEach(v => { freq[v] = (freq[v] ?? 0) + 1 })
  return Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'
}

function thisWeek(history: CrisisHistory[]) {
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000
  return history.filter(h => new Date(h.completed_at).getTime() > cutoff).length
}

const CLUSTER_COLOR: Record<string, string> = {
  Work: '#f72585', Academic: '#7209b7', Health: '#4895ef',
  Financial: '#b5179e', Legal: '#3f37c9', Family: '#4cc9f0',
  Digital: '#4361ee', Social: '#560bad', General: '#480ca8',
}

export function Dashboard() {
  const [history, setHistory] = useState<CrisisHistory[]>([])
  const [health, setHealth] = useState<Health | null>(null)

  useEffect(() => {
    setHistory(loadHistory())
    getHealth().then(setHealth).catch(() => null)
  }, [])

  const total   = history.length
  const week    = thisWeek(history)
  const avgUrgency = total ? Math.round(history.reduce((a, h) => a + h.urgency_score, 0) / total) : 0
  const avgEval    = total ? Math.round(history.reduce((a, h) => a + h.evaluator_score, 0) / total) : 0
  const topCluster = total ? modeOf(history.map(h => h.cluster)) : null
  const recent = history.slice(0, 5)

  return (
    <div className="dash-page">
      {/* Hero row */}
      <div className="dash-hero">
        <div className="dash-hero-text">
          <h1 className="dash-title">DASHBOARD</h1>
          <p className="dash-subtitle">
            {total === 0
              ? 'No crises solved yet — go handle one!'
              : `You've survived ${total} crisis${total !== 1 ? 'es' : ''}. You've got this.`}
          </p>
          {total === 0 && (
            <Link to="/app/plan" className="dash-cta-btn">
              <ZapIcon size={14} /> Handle a Crisis
            </Link>
          )}
        </div>
        <div className="dash-hero-avatar">
          {total > 0 ? <CalmAvatar size={110} /> : <PanickedAvatar size={110} />}
        </div>
      </div>

      {/* Stat cards */}
      <div className="dash-stats">
        <div className="dash-stat-card" style={{ '--card-color': '#f72585' } as React.CSSProperties}>
          <ZapIcon size={18} color="#f72585" />
          <div className="dash-stat-num">{total}</div>
          <div className="dash-stat-label">TOTAL CRISES</div>
        </div>
        <div className="dash-stat-card" style={{ '--card-color': '#7209b7' } as React.CSSProperties}>
          <ChartIcon size={18} color="#7209b7" />
          <div className="dash-stat-num">{week}</div>
          <div className="dash-stat-label">THIS WEEK</div>
        </div>
        <div className="dash-stat-card" style={{ '--card-color': '#4361ee' } as React.CSSProperties}>
          <ActivityIcon size={18} color="#4361ee" />
          <div className="dash-stat-num">{avgUrgency || '—'}</div>
          <div className="dash-stat-label">AVG URGENCY</div>
        </div>
        <div className="dash-stat-card" style={{ '--card-color': '#4cc9f0' } as React.CSSProperties}>
          <TimerIcon size={18} color="#4cc9f0" />
          <div className="dash-stat-num">{avgEval || '—'}</div>
          <div className="dash-stat-label">AVG SCORE</div>
        </div>
      </div>

      {/* Two-column row */}
      <div className="dash-row">
        {/* Recent crises */}
        <div className="px-card dash-card">
          <div className="dash-card-head">
            <span className="dash-card-title">RECENT CRISES</span>
            {total > 0 && <Link to="/app/plan" className="dash-card-link">+ New</Link>}
          </div>
          {recent.length === 0 ? (
            <div className="dash-empty">
              <PanickedAvatar size={60} />
              <p>No plans yet. Describe your first crisis!</p>
            </div>
          ) : (
            <div className="dash-recent-list">
              {recent.map(h => (
                <div key={h.id} className="dash-recent-item">
                  <div
                    className="dash-cluster-dot"
                    style={{ background: CLUSTER_COLOR[h.cluster] ?? '#7209b7' }}
                  />
                  <div className="dash-recent-body">
                    <div className="dash-recent-text">{h.text.slice(0, 55)}{h.text.length > 55 ? '…' : ''}</div>
                    <div className="dash-recent-meta">
                      <span className="dash-cluster-chip"
                        style={{ borderColor: CLUSTER_COLOR[h.cluster] ?? '#7209b7', color: CLUSTER_COLOR[h.cluster] ?? '#7209b7' }}>
                        {h.cluster}
                      </span>
                      <span>Score {h.evaluator_score}/100</span>
                      <span>{new Date(h.completed_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* API Budget + top cluster */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Top cluster */}
          {topCluster && (
            <div className="px-card dash-card">
              <div className="dash-card-head">
                <span className="dash-card-title">TOP CATEGORY</span>
              </div>
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div style={{
                  fontFamily: "'Press Start 2P', cursive",
                  fontSize: 12,
                  color: CLUSTER_COLOR[topCluster] ?? '#7209b7',
                  marginBottom: 6,
                }}>
                  {topCluster}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                  most common crisis type
                </div>
              </div>
              {/* Mini distribution */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                {Object.entries(
                  history.reduce((acc: Record<string, number>, h) => {
                    acc[h.cluster] = (acc[h.cluster] ?? 0) + 1; return acc
                  }, {})
                ).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([cluster, count]) => (
                  <div key={cluster}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 3, color: 'var(--text-secondary)' }}>
                      <span>{cluster}</span><span>{count}</span>
                    </div>
                    <div className="mini-bar">
                      <span style={{ width: `${(count / total) * 100}%`, background: CLUSTER_COLOR[cluster] ?? '#7209b7' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* API Budget */}
          {health && (
            <div className="px-card dash-card">
              <div className="dash-card-head">
                <span className="dash-card-title">AI BUDGET</span>
              </div>
              <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontFamily: "'Press Start 2P', cursive", fontSize: 16, color: '#4cc9f0' }}>
                    {health.calls_remaining_today}
                  </div>
                  <div style={{ fontSize: 9, color: 'var(--text-tertiary)', fontFamily: "'Press Start 2P', cursive" }}>LEFT</div>
                </div>
              </div>
              <div className="mini-bar">
                <span style={{
                  width: `${Math.max(5, Math.round(health.calls_remaining_today / (health.calls_remaining_today + health.keys.reduce((a, k) => a + k.used_today, 0)) * 100))}%`,
                  background: health.calls_remaining_today > 20 ? '#4cc9f0' : health.calls_remaining_today > 5 ? '#b5179e' : '#f72585',
                }} />
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 6 }}>
                {health.model}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick action */}
      <div className="dash-quick-action">
        <Link to="/app/plan" className="dash-cta-btn" style={{ fontSize: 11, padding: '14px 28px' }}>
          <ZapIcon size={16} /> NEW CRISIS PLAN
        </Link>
        <Link to="/app/reminders" className="dash-outline-btn">
          Set Reminder
        </Link>
      </div>
    </div>
  )
}
