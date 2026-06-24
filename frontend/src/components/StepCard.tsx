import { useCallback, useState } from 'react'
import type { Step } from '../types'
import { CheckIcon, SpeakerIcon } from './icons/PixelIcons'

const BREAK_HINT = /break|rest|breathe|pause/i

interface Props {
  step: Step
  onToggle: (order: number, done: boolean) => void
}

export function StepCard({ step, onToggle }: Props) {
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

  const toggle = () => {
    const next = !done
    setDone(next)
    onToggle(step.order, next)
  }

  const speak = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
        const utterance = new SpeechSynthesisUtterance(
          `Step ${step.order}. ${step.title}. ${step.detail}`
        )
        utterance.rate = 1.0
        utterance.pitch = 1.0
        window.speechSynthesis.speak(utterance)
      }
    },
    [step]
  )

  return (
    <div className={cls} onClick={toggle} role="button" tabIndex={0}>
      <div className="step-check"><CheckIcon size={14} /></div>
      <div className="step-body">
        <div className="step-title-row">
          <span className="step-title">
            {step.order}. {step.title}
          </span>
          <div className="step-actions">
            <button
              className="speak-btn"
              onClick={speak}
              title="Read aloud"
              aria-label={`Read step ${step.order} aloud`}
            >
              <SpeakerIcon size={14} />
            </button>
            <span className="step-mins">{step.minutes}m</span>
          </div>
        </div>
        <p className="step-detail">{step.detail}</p>
      </div>
    </div>
  )
}
