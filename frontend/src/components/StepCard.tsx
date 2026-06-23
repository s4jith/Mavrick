import { useState } from 'react'
import type { Step } from '../types'

const BREAK_HINT = /break|rest|breathe|pause/i

export function StepCard({ step }: { step: Step }) {
  const [done, setDone] = useState(false)
  const isBreak = BREAK_HINT.test(step.title)
  const cls = [
    'step',
    done ? 'done' : '',
    step.is_right_now ? 'now' : '',
    isBreak ? 'break' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={cls} onClick={() => setDone((d) => !d)} role="button" tabIndex={0}>
      <div className="step-check">✓</div>
      <div className="step-body">
        <div className="step-title-row">
          <span className="step-title">
            {step.order}. {step.title}
          </span>
          <span className="step-mins">{step.minutes}m</span>
        </div>
        <p className="step-detail">{step.detail}</p>
      </div>
    </div>
  )
}
