import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { adminDeleteUser, adminGetStats, adminGetUsers, getHealth } from '../api'
import type { AdminStats, AdminUser, Health } from '../types'
import {
  UsersIcon, ChartIcon, DatabaseIcon, ActivityIcon,
  ShieldIcon, TrashIcon, RefreshIcon, HomeIcon, LogoutIcon,
  KeyIcon, EyeIcon,
} from '../components/icons/PixelIcons'

type Tab = 'users' | 'stats' | 'health' | 'cache'

export function Admin() {
  const { isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('users')
  const [users, setUsers] = useState<AdminUser[]>([])
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [health, setHealth] = useState<Health | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    if (!isAdmin) { navigate('/app'); return }
    load()
  }, [isAdmin])

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const [u, s, h] = await Promise.all([
        adminGetUsers(),
        adminGetStats(),
        getHealth(),
      ])
      setUsers(u)
      setStats(s)
      setHealth(h)
    } catch (e: any) {
      setError(e.message ?? 'Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string, email: string) {
    if (!confirm(`Delete user ${email}? This cannot be undone.`)) return
    setDeleting(id)
    try {
      await adminDeleteUser(id)
      setUsers(prev => prev.filter(u => u.id !== id))
    } catch (e: any) {
      alert(e.message ?? 'Delete failed')
    } finally {
      setDeleting(null)
    }
  }

  function handleLogout() { logout(); navigate('/login') }

  const filtered = users.filter(
    u => u.email.includes(search) || u.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <div className="brand-mark" style={{ width: 36, height: 36, fontSize: 14 }}>M</div>
          <div>
            <div className="brand-name" style={{ fontSize: 10 }}>MAVRICK</div>
            <div style={{ fontSize: 7, fontFamily: "'Press Start 2P', cursive", color: 'var(--px-pink)', marginTop: 3 }}>ADMIN</div>
          </div>
        </div>

        <nav className="admin-nav">
          {([
            ['users',  'USERS',   <UsersIcon   size={14} />],
            ['stats',  'API BUDGET', <ChartIcon size={14} />],
            ['health', 'HEALTH',  <ActivityIcon size={14} />],
            ['cache',  'CACHE',   <DatabaseIcon size={14} />],
          ] as const).map(([t, label, icon]) => (
            <button
              key={t}
              className={`admin-nav-btn ${tab === t ? 'active' : ''}`}
              onClick={() => setTab(t)}
            >
              {icon} {label}
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <Link to="/app" className="admin-nav-btn" style={{ textDecoration: 'none', display: 'flex' }}>
            <HomeIcon size={14} /> APP
          </Link>
          <button className="admin-nav-btn admin-nav-btn--danger" onClick={handleLogout}>
            <LogoutIcon size={14} /> LOGOUT
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="admin-main">
        {/* Top bar */}
        <div className="admin-topbar">
          <div className="admin-topbar-title">
            <ShieldIcon size={16} color="var(--px-pink)" />
            <span style={{ fontFamily: "'Press Start 2P', cursive", fontSize: 11 }}>
              {tab === 'users'  ? 'USER MANAGEMENT' :
               tab === 'stats'  ? 'API BUDGET' :
               tab === 'health' ? 'SYSTEM HEALTH' : 'CACHE'}
            </span>
          </div>
          <button className="admin-refresh-btn" onClick={load} disabled={loading} title="Refresh data">
            <RefreshIcon size={14} />
          </button>
        </div>

        {error && (
          <div className="form-error" style={{ margin: '0 0 16px' }}>{error}</div>
        )}

        {loading ? (
          <div className="loading" style={{ padding: '40px 0' }}>
            <div className="spinner" />
            <p className="big">LOADING...</p>
          </div>
        ) : (
          <>
            {/* ── OVERVIEW STAT CARDS ── */}
            {stats && (
              <div className="admin-stats-row">
                <AdminStatCard label="TOTAL USERS" value={stats.total_users} color="var(--px-blue)" />
                <AdminStatCard label="CALLS LEFT" value={stats.calls_remaining_today} color="var(--px-green)" />
                <AdminStatCard label="CALLS USED" value={stats.calls_used_today} color="var(--px-orange)" />
                <AdminStatCard label="CACHE SIZE" value={stats.cache_entries} color="var(--px-purple)" />
              </div>
            )}

            {/* ── USERS TAB ── */}
            {tab === 'users' && (
              <div className="admin-section">
                <div className="admin-section-head">
                  <input
                    className="num-input admin-search"
                    type="text"
                    placeholder="Search users..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                  <span className="admin-count">{filtered.length} users</span>
                </div>
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>EMAIL</th>
                        <th>NAME</th>
                        <th>JOINED</th>
                        <th>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.length === 0 ? (
                        <tr>
                          <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '24px 0' }}>
                            No users found
                          </td>
                        </tr>
                      ) : filtered.map(u => (
                        <tr key={u.id}>
                          <td>
                            <span className="admin-email">{u.email}</span>
                          </td>
                          <td>{u.name || '—'}</td>
                          <td style={{ color: 'var(--text-tertiary)', fontSize: 10 }}>
                            {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                          </td>
                          <td>
                            <button
                              className="admin-action-btn admin-action-btn--danger"
                              onClick={() => handleDelete(u.id, u.email)}
                              disabled={deleting === u.id}
                              title="Delete user"
                            >
                              <TrashIcon size={12} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── STATS / API BUDGET TAB ── */}
            {tab === 'stats' && stats && (
              <div className="admin-section">
                <div className="admin-cards-grid">
                  {stats.keys.map((k, i) => {
                    const pct = Math.round((k.used_today / k.limit) * 100)
                    const color = pct > 80 ? 'var(--px-pink)' : pct > 50 ? 'var(--px-orange)' : 'var(--px-green)'
                    return (
                      <div className="admin-key-card" key={i}>
                        <div className="admin-key-header">
                          <KeyIcon size={14} color={color} />
                          <span style={{ fontFamily: "'Press Start 2P', cursive", fontSize: 8 }}>
                            KEY #{i + 1}
                          </span>
                          <span style={{ marginLeft: 'auto', color, fontFamily: "'Press Start 2P', cursive", fontSize: 8 }}>
                            {pct}%
                          </span>
                        </div>
                        <div className="bar" style={{ height: 10, marginTop: 8 }}>
                          <span style={{ width: `${pct}%`, background: color }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, color: 'var(--text-secondary)' }}>
                          <span>{k.used_today} used</span>
                          <span>{k.limit - k.used_today} left</span>
                        </div>
                        {k.cooling > 0 && (
                          <div style={{ marginTop: 6, fontSize: 9, color: 'var(--px-orange)', fontFamily: "'Press Start 2P', cursive" }}>
                            COOLING: {Math.ceil(k.cooling)}s
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
                <div className="admin-key-card" style={{ marginTop: 12 }}>
                  <div style={{ fontFamily: "'Press Start 2P', cursive", fontSize: 8, color: 'var(--text-tertiary)', marginBottom: 8 }}>TOTAL BUDGET</div>
                  <div className="bar">
                    <span style={{
                      width: `${Math.round((stats.calls_used_today / (stats.calls_used_today + stats.calls_remaining_today)) * 100)}%`,
                      background: 'linear-gradient(90deg, var(--px-purple), var(--px-blue))',
                    }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, color: 'var(--text-secondary)' }}>
                    <span>{stats.calls_used_today} calls used today</span>
                    <span>{stats.calls_remaining_today} remaining</span>
                  </div>
                </div>
              </div>
            )}

            {/* ── HEALTH TAB ── */}
            {tab === 'health' && health && (
              <div className="admin-section">
                <div className="admin-cards-grid">
                  <AdminHealthCard
                    label="BACKEND"
                    status={health.status === 'ok'}
                    detail={`v${health.version}`}
                    icon={<ActivityIcon size={16} />}
                  />
                  <AdminHealthCard
                    label="AI MODEL"
                    status={true}
                    detail={health.model}
                    icon={<EyeIcon size={16} />}
                  />
                  <AdminHealthCard
                    label="API KEYS"
                    status={health.calls_remaining_today > 0}
                    detail={`${health.calls_remaining_today} calls left`}
                    icon={<KeyIcon size={16} />}
                  />
                  <AdminHealthCard
                    label="CACHE"
                    status={true}
                    detail={`${stats?.cache_entries ?? '?'} entries`}
                    icon={<DatabaseIcon size={16} />}
                  />
                </div>
                <div className="admin-key-card" style={{ marginTop: 16 }}>
                  <div style={{ fontFamily: "'Press Start 2P', cursive", fontSize: 8, color: 'var(--text-tertiary)', marginBottom: 12 }}>RAW API KEY STATUS</div>
                  {health.keys.map((k, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8, fontSize: 11 }}>
                      <span style={{ fontFamily: "'Press Start 2P', cursive", fontSize: 7, color: 'var(--text-tertiary)', width: 50 }}>KEY {i+1}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{k.used_today}/{k.limit} used</span>
                      {k.cooling > 0 && <span style={{ color: 'var(--px-orange)', fontSize: 10 }}>cooling {Math.ceil(k.cooling)}s</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── CACHE TAB ── */}
            {tab === 'cache' && (
              <div className="admin-section">
                <div className="admin-key-card">
                  <div style={{ fontFamily: "'Press Start 2P', cursive", fontSize: 8, color: 'var(--text-tertiary)', marginBottom: 12 }}>SQLITE PLAN CACHE</div>
                  <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                    <div>
                      <div className="stat-num" style={{ fontSize: 28 }}>{stats?.cache_entries ?? '—'}</div>
                      <div className="stat-label">CACHED PLANS</div>
                    </div>
                    <div>
                      <div className="stat-num" style={{ fontSize: 28, color: 'var(--px-green)' }}>24h</div>
                      <div className="stat-label">TTL PER ENTRY</div>
                    </div>
                  </div>
                  <div className="admin-cache-info">
                    <p>Cache is backed by SQLite at <code>backend/data/cache.db</code>. Plans survive backend restarts. Each cached response returns in &lt;5ms and costs 0 Gemini calls.</p>
                    <p style={{ marginTop: 8 }}>To pre-seed the demo cache, run the three example crises before your presentation — they will be cached automatically.</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

/* ─── sub-components ────────────────────────────────────────────────── */

function AdminStatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="admin-stat-card">
      <div className="admin-stat-num" style={{ color }}>{value}</div>
      <div className="admin-stat-label">{label}</div>
    </div>
  )
}

function AdminHealthCard({
  label, status, detail, icon,
}: {
  label: string; status: boolean; detail: string; icon: React.ReactNode
}) {
  const color = status ? 'var(--px-green)' : 'var(--px-pink)'
  return (
    <div className="admin-key-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ color }}>{icon}</span>
        <span style={{ fontFamily: "'Press Start 2P', cursive", fontSize: 8 }}>{label}</span>
        <span style={{
          marginLeft: 'auto',
          fontFamily: "'Press Start 2P', cursive",
          fontSize: 7,
          color,
          background: status ? 'rgba(74,222,128,0.1)' : 'rgba(240,80,122,0.1)',
          border: `2px solid ${color}`,
          padding: '2px 6px',
          borderRadius: 20,
        }}>
          {status ? 'OK' : 'ERR'}
        </span>
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{detail}</div>
    </div>
  )
}
