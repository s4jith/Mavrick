/**
 * MAVRICK bottom navigation — 5 tabs, present on every in-app screen.
 * HOME · PANIC · EXECUTE · CALENDAR · PROFILE
 * Active tab turns coral. Sits directly above the "AI PARTNER" strip.
 */
import { useNavigate } from 'react-router-dom'
import { HomeIcon, WarningIcon, RocketIcon, CalendarIcon, UserIcon } from '../icons/PixelIcons'

export type NavTab = 'home' | 'panic' | 'execute' | 'calendar' | 'profile'

const TABS: { id: NavTab; label: string; to: string; Icon: typeof HomeIcon }[] = [
  { id: 'home',     label: 'HOME',     to: '/app',           Icon: HomeIcon },
  { id: 'panic',    label: 'PANIC',    to: '/app/plan',      Icon: WarningIcon },
  { id: 'execute',  label: 'EXECUTE',  to: '/app/execute',   Icon: RocketIcon },
  { id: 'calendar', label: 'CALENDAR', to: '/app/calendar',  Icon: CalendarIcon },
  { id: 'profile',  label: 'PROFILE',  to: '/app/profile',   Icon: UserIcon },
]

export function BottomNav({ active }: { active: NavTab }) {
  const navigate = useNavigate()
  return (
    <nav className="mvk-nav" aria-label="Primary">
      {TABS.map(({ id, label, to, Icon }) => {
        const on = id === active
        return (
          <button
            key={id}
            className={`mvk-nav-item ${on ? 'active' : ''}`}
            onClick={() => navigate(to)}
            aria-current={on ? 'page' : undefined}
          >
            <span className="mvk-nav-ico">
              <Icon size={18} color={on ? '#E85D50' : '#9FB4BE'} />
            </span>
            <span className="mvk-nav-label">{label}</span>
          </button>
        )
      })}
    </nav>
  )
}
