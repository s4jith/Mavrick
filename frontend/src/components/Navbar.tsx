import { Link, useNavigate } from 'react-router-dom'
import type { Health } from '../types'
import { useAuth } from '../context/AuthContext'
import { TrophyIcon, LogoutIcon, ShieldIcon } from './icons/PixelIcons'

interface Props {
  health: Health | null
  onHistoryClick: () => void
}

export function Navbar({ health, onHistoryClick }: Props) {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const remaining = health?.calls_remaining_today
  const dotClass =
    remaining === undefined ? '' : remaining === 0 ? 'empty' : remaining <= 10 ? 'low' : ''

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      {/* Brand */}
      <Link to="/app" className="navbar-brand" style={{ textDecoration: 'none' }}>
        <div className="brand-mark" style={{ width: 36, height: 36, fontSize: 14 }}>M</div>
        <div className="navbar-brand-text">
          <span className="brand-name" style={{ fontSize: 11 }}>MAVRICK</span>
          <span className="brand-tag">panic to plan</span>
        </div>
      </Link>

      {/* Center nav items */}
      <div className="navbar-center">
        {health && (
          <div className="budget-pill" title={`${remaining} Gemini calls left today`}>
            <span className={`budget-dot ${dotClass}`} />
            <span>{remaining} calls left</span>
          </div>
        )}
      </div>

      {/* Right actions */}
      <div className="navbar-actions">
        {user && (
          <span className="navbar-user">{user.email}</span>
        )}
        <button
          className="navbar-icon-btn"
          onClick={onHistoryClick}
          title="Crisis history"
        >
          <TrophyIcon size={16} />
        </button>
        {isAdmin && (
          <Link to="/admin" className="navbar-icon-btn" title="Admin panel" style={{ textDecoration: 'none', display: 'grid', placeItems: 'center' }}>
            <ShieldIcon size={16} />
          </Link>
        )}
        <button
          className="navbar-icon-btn navbar-icon-btn--danger"
          onClick={handleLogout}
          title="Logout"
        >
          <LogoutIcon size={16} />
        </button>
      </div>
    </nav>
  )
}
