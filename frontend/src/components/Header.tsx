import type { Health } from '../types'

export function Header({ health }: { health: Health | null }) {
  const remaining = health?.calls_remaining_today
  const dotClass =
    remaining === undefined ? '' : remaining === 0 ? 'empty' : remaining <= 10 ? 'low' : ''

  return (
    <header className="header">
      <div className="brand">
        <div className="brand-mark">M</div>
        <div>
          <div className="brand-name">Mavrick</div>
          <div className="brand-tag">Panic to plan, in seconds</div>
        </div>
      </div>
      {health && (
        <div className="budget-pill" title="Gemini calls left across all keys today">
          <span className={`budget-dot ${dotClass}`} />
          {remaining} calls left
        </div>
      )}
    </header>
  )
}
