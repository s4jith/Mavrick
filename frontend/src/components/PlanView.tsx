import type { PlanResponse } from '../types'
import { StepCard } from './StepCard'

interface Props {
  resp: PlanResponse
  onReset: () => void
}

export function PlanView({ resp, onReset }: Props) {
  const { plan } = resp
  const pct = Math.min(100, Math.round((resp.total_planned_minutes / resp.minutes_left) * 100))

  return (
    <section className="plan fade-in">
      <div className="plan-head">
        <div className="top">
          <span className="cluster-line">
            <strong>{plan.cluster}</strong> · {plan.sub_type} · {plan.severity}
          </span>
          <span className={`urgency-badge ${resp.urgency_colour}`}>
            ● {resp.urgency_score}/100
          </span>
        </div>
        <p className="summary">{plan.summary}</p>
      </div>

      <div className="now-card">
        <span className="label">▶ Do this right now</span>
        <p className="action">{plan.first_action}</p>
      </div>

      <div className="budget-bar-wrap">
        <div className="budget-bar-top">
          <span>
            {resp.total_planned_minutes} min planned of {resp.minutes_left} available
          </span>
          <span className={resp.fits ? 'ok' : 'over'}>
            {resp.fits ? 'Fits ✓' : 'Tight!'}
          </span>
        </div>
        <div className="bar">
          <span style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="section-title">Your plan</div>
      <div className="steps">
        {plan.steps.map((s) => (
          <StepCard key={s.order} step={s} />
        ))}
      </div>

      {plan.warnings.length > 0 && (
        <div className="warnings">
          <h4>⚠ Honest heads-up</h4>
          <ul>
            {plan.warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="meta">
        <span>{resp.cached ? '⚡ cached (0 calls)' : `via key #${resp.key_index}`}</span>
        {!resp.cached && <span>{resp.latency_ms} ms</span>}
        {resp.cached && <span className="cached">instant</span>}
      </div>

      <button className="reset-btn" onClick={onReset}>
        ← New crisis
      </button>
    </section>
  )
}
