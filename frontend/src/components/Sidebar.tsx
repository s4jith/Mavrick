import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { loadHistory } from './HistoryPanel'
import {
  HomeIcon, ZapIcon, BellIcon, ShieldIcon,
  GearIcon, LogoutIcon,
} from './icons/PixelIcons'

export function Sidebar() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const planCount = loadHistory().length

  function handleLogout() { logout(); navigate('/login') }

  const initial = (user?.name || user?.email || 'U')[0].toUpperCase()

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-brand-mark">M</div>
        <div>
          <div className="sidebar-brand-name">MAVRICK</div>
          <div className="sidebar-brand-tag">panic to plan</div>
        </div>
      </div>

      {/* User card */}
      <div className="sidebar-user">
        <div className="sidebar-avatar">{initial}</div>
        <div className="sidebar-user-info">
          <div className="sidebar-user-name">{user?.name || 'User'}</div>
          <div className="sidebar-user-email">{user?.email}</div>
        </div>
      </div>

      {/* Primary nav */}
      <nav className="sidebar-nav">
        <NavLink to="/app" end className={({ isActive }) => `snav-item ${isActive ? 'active' : ''}`}>
          <HomeIcon size={15} /> <span>Dashboard</span>
        </NavLink>
        <NavLink to="/app/plan" className={({ isActive }) => `snav-item ${isActive ? 'active' : ''}`}>
          <ZapIcon size={15} /> <span>Crisis Plan</span>
        </NavLink>
        <NavLink to="/app/reminders" className={({ isActive }) => `snav-item ${isActive ? 'active' : ''}`}>
          <BellIcon size={15} />
          <span>Reminders</span>
          {planCount > 0 && <span className="snav-badge">{planCount > 9 ? '9+' : planCount}</span>}
        </NavLink>
        {isAdmin && (
          <NavLink to="/admin" className={({ isActive }) => `snav-item ${isActive ? 'active' : ''}`}>
            <ShieldIcon size={15} /> <span>Admin</span>
          </NavLink>
        )}
      </nav>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Bottom nav */}
      <div className="sidebar-bottom">
        <NavLink to="/app/settings" className={({ isActive }) => `snav-item ${isActive ? 'active' : ''}`}>
          <GearIcon size={15} /> <span>Settings</span>
        </NavLink>
        <button className="snav-item snav-logout" onClick={handleLogout}>
          <LogoutIcon size={15} /> <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
