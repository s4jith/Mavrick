import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ApiError, getPlan, addHistory } from '../api'
import { MavrickShell } from '../components/pixel/MavrickShell'
import { RobotMascot } from '../components/pixel/RobotMascot'
import { LockIcon, PlayIcon, MicIcon, WarningIcon, FireIcon } from '../components/icons/PixelIcons'
import type { PlanResponse } from '../types'

const EXAMPLES = [
  'Presentation in 2 hours',
  'Assignment due tonight',
  'Rent due tomorrow',
]

const TIME_OPTIONS = [
  { label: '30 MINS',  minutes: 30 },
  { label: '1 HOUR',   minutes: 60 },
  { label: '3 HOURS',  minutes: 180 },
  { label: 'TOMORROW', minutes: 1440 },
]

const LOADING_LINES = [
  'Reading your crisis...',
  'Classifying the situation...',
  'Doing the time math...',
  'Building your rescue plan...',
  'Almost there...',
]

type Status = 'input' | 'loading' | 'done'

/* ── Inline voice input (Web Speech API) ── */
function useVoice(onText: (t: string) => void) {
  const [listening, setListening] = useState(false)
  const recRef = useRef<any>(null)
  const supported =
    typeof window !== 'undefined' &&
    !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)

  function toggle() {
    if (!supported) return
    if (listening) { recRef.current?.stop(); setListening(false); return }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const rec = new SR()
    rec.continuous = false
    rec.interimResults = false
    rec.lang = 'en-US'
    rec.onresult = (e: any) => {
      let t = ''
      for (let i = e.resultIndex; i < e.results.length; i++) t += e.results[i][0].transcript
      if (t.trim()) onText(t.trim())
    }
    rec.onerror = () => setListening(false)
    rec.onend = () => setListening(false)
    recRef.current = rec
    rec.start()
    setListening(true)
  }

  return { listening, toggle, supported }
}

export function PanicMode() {
  const navigate = useNavigate()
  const [text, setText] = useState('')
  const [minutes, setMinutes] = useState<number | null>(null)
  const [status, setStatus] = useState<Status>('input')
  const [error, setError] = useState<string | null>(null)
  const [line, setLine] = useState(LOADING_LINES[0])
  const [result, setResult] = useState<PlanResponse | null>(null)

  const voice = useVoice(t => setText(prev => (prev ? `${prev} ${t}` : t)))

  useEffect(() => {
    if (status !== 'loading') return
    let i = 0
    const id = setInterval(() => { i = (i + 1) % LOADING_LINES.length; setLine(LOADING_LINES[i]) }, 1100)
    return () => clearInterval(id)
  }, [status])

  async function save() {
    if (!text.trim()) { setError("Tell me what's wrong first — describe your crisis."); return }
    if (!minutes)     { setError('How much time is left? Pick one below.'); return }
    setError(null)
    setStatus('loading')
    setLine(LOADING_LINES[0])
    try {
      const res = await getPlan({ text: text.trim(), minutes_left: minutes })
      setResult(res)
      setStatus('done')
      try { sessionStorage.setItem('mavrick_plan', JSON.stringify(res)) } catch { /* ignore */ }
      // Persist to Firestore (best-effort; don't block the UI on it).
      addHistory({
        text: text.trim(),
        cluster: res.plan.cluster,
        sub_type: res.plan.sub_type,
        severity: res.plan.severity,
        urgency_score: res.urgency_score,
        evaluator_score: res.evaluator_score,
        steps_count: res.plan.steps.length,
        completed_at: new Date().toISOString(),
      }).catch(() => { /* offline / not signed in — non-fatal */ })
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Could not reach Mavrick. Is the backend running on :8000?'
      setError(msg)
      setStatus('input')
    }
  }

  function reset() {
    setText(''); setMinutes(null); setResult(null); setError(null); setStatus('input')
  }

  return (
    <MavrickShell active="panic">
      {/* ── Hero ── */}
      <div className="mvk-hero">
        <div className="mvk-hero-robot">
          <span className="mvk-burst" />
          <RobotMascot size={62} mood="panic" />
          <span className="mvk-bang">!</span>
        </div>
        <div className="mvk-screen-title-row">
          <LockIcon size={20} color="#E85D50" />
          <span className="mvk-screen-title">PANIC MODE</span>
        </div>
        <div className="mvk-badge">AI CRISIS COMMANDER</div>
        <div className="mvk-hero-sub">Tell me what's <span className="mvk-coral">wrong</span>.</div>
      </div>

      {status === 'done' && result ? (
        <DoneCard result={result} onReset={reset} onView={() => navigate('/app/rescue')} />
      ) : status === 'loading' ? (
        <div className="mvk-card mvk-loading">
          <RobotMascot size={56} mood="panic" />
          <span className="mvk-spinner" />
          <div className="mvk-loading-line">{line}</div>
          <div className="mvk-loading-sub">Turning panic into a plan.</div>
        </div>
      ) : (
        <motion.section
          className="mvk-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Describe your crisis */}
          <div className="mvk-sec-head"><span className="mvk-sec-title">DESCRIBE YOUR CRISIS</span></div>
          <textarea
            className="mvk-textarea"
            placeholder="Describe your crisis..."
            value={text}
            onChange={e => setText(e.target.value)}
            rows={4}
          />

          {/* Examples */}
          <div className="mvk-mini-label">EXAMPLES</div>
          <div className="mvk-examples">
            {EXAMPLES.map(ex => (
              <button key={ex} className="mvk-example" onClick={() => setText(ex)}>
                <PlayIcon size={9} color="#E85D50" />
                <span>{ex}</span>
              </button>
            ))}
          </div>

          {/* Voice input */}
          <div className="mvk-mini-label mvk-voice-title">+ VOICE INPUT +</div>
          <div className={`mvk-voice ${voice.listening ? 'listening' : ''}`}>
            <div className="mvk-wave mvk-wave-l">
              {Array.from({ length: 7 }).map((_, i) => <span key={`l${i}`} />)}
            </div>
            <button
              className="mvk-mic-btn"
              onClick={voice.toggle}
              disabled={!voice.supported}
              title={voice.supported ? 'Tap to speak' : 'Voice not supported'}
              aria-label="Voice input"
            >
              <MicIcon size={22} color="#FFF6E6" />
            </button>
            <div className="mvk-wave mvk-wave-r">
              {Array.from({ length: 7 }).map((_, i) => <span key={`r${i}`} />)}
            </div>
          </div>
          <div className="mvk-voice-hint">
            {voice.listening ? 'Listening…' : voice.supported ? 'Tap to speak' : 'Voice not supported — type above'}
          </div>

          {/* Time remaining */}
          <div className="mvk-mini-label">TIME REMAINING</div>
          <div className="mvk-pills">
            {TIME_OPTIONS.map(t => (
              <button
                key={t.label}
                className={`mvk-pill ${minutes === t.minutes ? 'active' : ''}`}
                onClick={() => setMinutes(t.minutes)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {error && <div className="mvk-error">{error}</div>}

          {/* Save me */}
          <button className="mvk-save-btn" onClick={save}>
            <WarningIcon size={20} color="#FFF6E6" /> SAVE ME
          </button>

          <div className="mvk-reassure">
            <span className="mvk-inline-heart">♥</span> I'm here to help. You're not alone. <span className="mvk-inline-heart">♥</span>
          </div>
        </motion.section>
      )}
    </MavrickShell>
  )
}

/* ── Result handoff: shows the immediate first action, links to full rescue plan ── */
function DoneCard({ result, onReset, onView }: { result: PlanResponse; onReset: () => void; onView: () => void }) {
  const colour = result.urgency_colour
  return (
    <motion.section
      className="mvk-card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="mvk-done-head">
        <RobotMascot size={48} mood="coach" />
        <div>
          <div className="mvk-done-title">PLAN READY</div>
          <div className={`mvk-urgency-pill mvk-u-${colour}`}>URGENCY {result.urgency_score}/100</div>
        </div>
      </div>

      <div className="mvk-now-card">
        <div className="mvk-now-label"><FireIcon size={12} color="#E85D50" /> DO THIS RIGHT NOW</div>
        <div className="mvk-now-action">{result.plan.first_action}</div>
      </div>

      <div className="mvk-done-meta">
        {result.plan.cluster} · {result.plan.steps.length} steps · {result.total_planned_minutes} min planned
      </div>

      <button className="mvk-save-btn" onClick={onView}>VIEW FULL RESCUE PLAN</button>
      <button className="mvk-btn mvk-btn-outline" onClick={onReset} style={{ marginTop: 10 }}>NEW CRISIS</button>
    </motion.section>
  )
}
