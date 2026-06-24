import { useCallback, useState } from 'react'
import type { CoachResponse, PlanResponse } from '../types'
import { StepCard } from './StepCard'
import { StressMeter } from './StressMeter'
import { TimeWarp } from './TimeWarp'
import { SpeakerIcon, WarningIcon, FlaskIcon, PlayIcon } from './icons/PixelIcons'

interface Props {
  resp: PlanResponse
  onReset: () => void
}

export function PlanView({ resp, onReset }: Props) {
  const { plan } = resp
  const pct = Math.min(100, Math.round((resp.total_planned_minutes / resp.minutes_left) * 100))
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [coachMessages, setCoachMessages] = useState<CoachResponse[]>([])

  const handleStepToggle = useCallback((order: number, done: boolean) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev)
      if (done) next.add(order)
      else next.delete(order)
      return next
    })
  }, [])

  const handleCoachMessage = useCallback((msg: CoachResponse) => {
    setCoachMessages((prev) => [msg, ...prev].slice(0, 10))
  }, [])

  const speakPlan = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const text = `Your crisis is classified as ${plan.cluster}, ${plan.sub_type}. Severity: ${plan.severity}. ${plan.summary}. Here is your plan: ${plan.steps.map((s) => `Step ${s.order}: ${s.title}, ${s.minutes} minutes. ${s.detail}`).join('. ')}. Start right now with: ${plan.first_action}.`
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.95
      utterance.pitch = 1.0
      window.speechSynthesis.speak(utterance)
    }
  }

  return (
    <section className="plan fade-in">
      {/* Stress Meter */}
      <StressMeter
        stepsCompleted={completedSteps.size}
        totalSteps={plan.steps.length}
        evaluatorScore={resp.evaluator_score}
      />

      {/* Plan Header */}
      <div className="plan-head">
        <div className="top">
          <span className="cluster-line">
            <strong>{plan.cluster}</strong> · {plan.sub_type} · {plan.severity}
          </span>
          <div className="badges">
            <span className={`urgency-badge ${resp.urgency_colour}`}>
              ● {resp.urgency_score}/100
            </span>
            <span className="eval-badge">
              <FlaskIcon size={12} /> {resp.evaluator_score}/100
            </span>
          </div>
        </div>
        <p className="summary">{plan.summary}</p>
        <button className="speak-plan-btn" onClick={speakPlan} title="Read entire plan aloud">
          <SpeakerIcon size={14} /> Read Plan Aloud
        </button>
      </div>

      {/* NOW card */}
      <div className="now-card">
        <span className="label"><PlayIcon size={12} /> Do this right now</span>
        <p className="action">{plan.first_action}</p>
      </div>

      {/* Budget bar */}
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

      {/* Steps */}
      <div className="section-title">Your plan</div>
      <div className="steps">
        {plan.steps.map((s) => (
          <StepCard key={s.order} step={s} onToggle={handleStepToggle} />
        ))}
      </div>

      {/* Evaluator Notes */}
      {resp.evaluator_notes.length > 0 && (
        <div className="eval-notes">
          <h4><FlaskIcon size={14} /> Evaluator Notes</h4>
          <ul>
            {resp.evaluator_notes.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings */}
      {plan.warnings.length > 0 && (
        <div className="warnings">
          <h4><WarningIcon size={14} /> Honest heads-up</h4>
          <ul>
            {plan.warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Time Warp Demo */}
      <TimeWarp
        plan={plan}
        minutesLeft={resp.minutes_left}
        stepsCompleted={completedSteps.size}
        onCoachMessage={handleCoachMessage}
      />

      {/* Coach Messages */}
      {coachMessages.length > 0 && (
        <div className="coach-feed">
          <div className="section-title">Coach Check-ins</div>
          {coachMessages.map((msg, i) => (
            <div key={i} className={`coach-msg tone-${msg.tone}`}>
              <span className="coach-bubble">{msg.message}</span>
              <span className="coach-progress">{msg.progress_pct}% done</span>
            </div>
          ))}
        </div>
      )}

      {/* Meta */}
      <div className="meta">
        <span>{resp.cached ? 'cached (0 calls)' : `via key #${resp.key_index}`}</span>
        {!resp.cached && <span>{resp.latency_ms} ms</span>}
        {resp.cached && <span className="cached">instant</span>}
      </div>

      <button className="reset-btn" onClick={onReset}>
        ← New crisis
      </button>
    </section>
  )
}
