import { useState } from 'react'
import type { PlanRequest } from '../types'
import { VoiceButton } from './VoiceButton'

const QUICK_TIMES = [
  { label: '30 min', value: 30 },
  { label: '1 hr', value: 60 },
  { label: '2 hr', value: 120 },
  { label: 'Today', value: 480 },
  { label: 'Tomorrow', value: 1440 },
]

const EXAMPLES = [
  'I have a client presentation in 90 minutes and I have not prepared anything.',
  'Rent, electricity, internet and credit card are all due and I have limited money.',
  'My assignment is due tonight and I have not started it.',
]

interface Props {
  onSubmit: (req: PlanRequest) => void
  loading: boolean
  error: string | null
}

export function PanicForm({ onSubmit, loading, error }: Props) {
  const [text, setText] = useState('')
  const [minutes, setMinutes] = useState<number>(60)
  const [age, setAge] = useState<string>('')

  const canSubmit = text.trim().length >= 3 && minutes > 0 && !loading

  function submit() {
    if (!canSubmit) return
    onSubmit({
      text: text.trim(),
      minutes_left: minutes,
      age: age ? Number(age) : null,
    })
  }

  function handleVoiceTranscript(transcript: string) {
    setText((prev) => (prev ? prev + ' ' + transcript : transcript))
  }

  function useExample(idx: number) {
    setText(EXAMPLES[idx])
  }

  return (
    <section className="hero">
      <h1>What's your crisis?</h1>
      <p className="sub">
        Tell Mavrick what you're facing and how long you have. You'll get an exact,
        step-by-step plan — starting with one thing you can do right now.
      </p>

      <div className="field">
        <label htmlFor="crisis">Your situation</label>
        <div className="input-row">
          <textarea
            id="crisis"
            className="crisis-input"
            placeholder={EXAMPLES[0]}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit()
            }}
          />
          <VoiceButton onTranscript={handleVoiceTranscript} disabled={loading} />
        </div>
      </div>

      <div className="examples">
        <span className="examples-label">Try:</span>
        {EXAMPLES.map((ex, i) => (
          <button key={i} className="example-chip" onClick={() => useExample(i)}>
            {ex.slice(0, 40)}…
          </button>
        ))}
      </div>

      <div className="row">
        <div className="field">
          <label htmlFor="minutes">Minutes left</label>
          <input
            id="minutes"
            className="num-input"
            type="number"
            min={1}
            value={minutes}
            onChange={(e) => setMinutes(Math.max(1, Number(e.target.value)))}
          />
        </div>
        <div className="field">
          <label htmlFor="age">Age (optional)</label>
          <input
            id="age"
            className="num-input"
            type="number"
            min={5}
            max={120}
            placeholder="—"
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />
        </div>
      </div>

      <div className="quick-times">
        {QUICK_TIMES.map((q) => (
          <button
            key={q.value}
            type="button"
            className={`chip ${minutes === q.value ? 'active' : ''}`}
            onClick={() => setMinutes(q.value)}
          >
            {q.label}
          </button>
        ))}
      </div>

      <button className="panic-btn" onClick={submit} disabled={!canSubmit}>
        {loading ? 'Building your plan…' : '⚡ Make my plan'}
      </button>

      {error && <div className="form-error">{error}</div>}
    </section>
  )
}
