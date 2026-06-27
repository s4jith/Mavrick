import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MavrickShell } from '../components/pixel/MavrickShell'
import { RobotMascot } from '../components/pixel/RobotMascot'
import {
  LockIcon, HourglassIcon, BookIcon, PlayIcon, RocketIcon,
} from '../components/icons/PixelIcons'
import { ttsAvailable, synthesizeSpeech } from '../api'
import type { PlanResponse } from '../types'

/* Tiny pixel speaker icon for the voice toggle (on/off) */
function SpeakerIcon({ on, size = 14 }: { on: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ imageRendering: 'pixelated' }} aria-hidden="true">
      <rect x="2" y="6" width="3" height="4" fill="currentColor" />
      <rect x="5" y="4" width="2" height="8" fill="currentColor" />
      <rect x="7" y="2" width="2" height="12" fill="currentColor" />
      {on ? (
        <>
          <rect x="11" y="5" width="2" height="2" fill="currentColor" />
          <rect x="11" y="9" width="2" height="2" fill="currentColor" />
          <rect x="13" y="3" width="2" height="2" fill="currentColor" />
          <rect x="13" y="11" width="2" height="2" fill="currentColor" />
        </>
      ) : (
        <>
          <rect x="11" y="6" width="2" height="2" fill="currentColor" transform="rotate(45 12 8)" />
          <rect x="11" y="6" width="2" height="2" fill="currentColor" transform="rotate(-45 12 8)" />
        </>
      )}
    </svg>
  )
}

/* ── Fallback demo plan (matches the rescue-plan demo) ── */
const DEMO: PlanResponse = {
  plan: {
    cluster: 'Work',
    sub_type: 'Presentation',
    severity: 'critical',
    summary: 'Build and rehearse a client presentation in the time you have left.',
    first_action: 'Open your slide deck and write the title slide right now.',
    steps: [
      { order: 1, title: 'RESEARCH', detail: 'Gather info and key overview points.',     minutes: 20, is_right_now: true },
      { order: 2, title: 'SLIDES',   detail: 'Create and organize the content.',          minutes: 40, is_right_now: false },
      { order: 3, title: 'VISUALS',  detail: 'Add details, examples and supporting points.', minutes: 30, is_right_now: false },
      { order: 4, title: 'PRACTICE', detail: 'Rehearse and improve the flow.',            minutes: 30, is_right_now: false },
    ],
    warnings: [],
  },
  urgency_score: 92,
  urgency_colour: 'red',
  total_planned_minutes: 135,
  minutes_left: 180,
  fits: true,
  cached: false,
  key_index: null,
  latency_ms: 0,
  evaluator_score: 90,
  evaluator_notes: [],
}

function fmtClock(sec: number): string {
  const m = Math.floor(sec / 60), s = sec % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function ExecutionMode() {
  const navigate = useNavigate()

  const plan = useMemo<PlanResponse>(() => {
    try {
      const raw = sessionStorage.getItem('mavrick_plan')
      if (raw) return JSON.parse(raw) as PlanResponse
    } catch { /* ignore */ }
    return DEMO
  }, [])

  const steps = plan.plan.steps
  const [idx, setIdx] = useState(0)
  const [complete, setComplete] = useState(false)

  const current = steps[idx]
  const next = steps[idx + 1]
  const stepTotal = (current?.minutes ?? 1) * 60
  const [secondsLeft, setSecondsLeft] = useState(stepTotal)

  // Reset the clock whenever the active step changes
  useEffect(() => { setSecondsLeft((steps[idx]?.minutes ?? 1) * 60) }, [idx, steps])

  // Live countdown
  useEffect(() => {
    if (complete) return
    const id = setInterval(() => setSecondsLeft(s => (s > 0 ? s - 1 : 0)), 1000)
    return () => clearInterval(id)
  }, [complete, idx])

  const elapsed = stepTotal - secondsLeft
  const progress = Math.min(100, Math.round(((idx + (stepTotal ? elapsed / stepTotal : 0)) / steps.length) * 100))
  const segCount = 16
  const filledSeg = Math.round((progress / 100) * segCount)

  const overdue = secondsLeft <= 0
  const behind = !overdue && secondsLeft <= stepTotal * 0.25
  const coachMsg = overdue
    ? "Time's up here. Wrap it and move on — done beats perfect."
    : behind
      ? "You're falling behind. Focus on content first."
      : 'Great pace. Head down and finish this block.'

  /* ── AI coach voice (Google TTS → browser speechSynthesis fallback) ── */
  const [voiceOn, setVoiceOn] = useState(true)
  const voiceOnRef = useRef(true)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const ttsBackend = useRef<boolean | null>(null)

  useEffect(() => { ttsAvailable().then(v => { ttsBackend.current = v }) }, [])

  function stopVoice() {
    try { window.speechSynthesis?.cancel() } catch { /* ignore */ }
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }
  }

  function browserSpeak(text: string) {
    try {
      const u = new SpeechSynthesisUtterance(text)
      u.rate = 1.02; u.pitch = 1
      window.speechSynthesis.speak(u)
    } catch { /* speech not supported */ }
  }

  async function speak(text: string) {
    if (!voiceOnRef.current) return
    stopVoice()
    if (ttsBackend.current) {
      const audio = await synthesizeSpeech(text)
      if (audio) {
        const el = new Audio(audio)
        audioRef.current = el
        el.play().catch(() => browserSpeak(text))
        return
      }
    }
    browserSpeak(text)
  }

  useEffect(() => { voiceOnRef.current = voiceOn; if (!voiceOn) stopVoice() }, [voiceOn])
  useEffect(() => stopVoice, [])

  // Announce each new mission step.
  useEffect(() => {
    if (!complete) speak(`Now: ${current?.title}. ${current?.detail ?? ''}`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx])

  // Voice the coach nudge when you slip behind / run out of time.
  useEffect(() => {
    if (overdue) speak("Time's up. Wrap it up and move on. Done beats perfect.")
    else if (behind) speak("You're falling behind. Focus on content first.")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overdue, behind])

  function completeTask() {
    if (idx + 1 >= steps.length) { stopVoice(); setComplete(true); return }
    setIdx(i => i + 1)
  }

  /* ── Mission complete ── */
  if (complete) {
    return (
      <MavrickShell active="execute" night>
        <Header />
        <motion.section
          className="mvk-card mvk-card-dark mvk-exec-done"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <RobotMascot size={72} mood="wave" />
          <div className="mvk-done-title">MISSION COMPLETE</div>
          <div className="mvk-exec-done-sub">
            You crushed all {steps.length} tasks. Crisis handled, commander.
          </div>
          <div className="mvk-now-card">
            <div className="mvk-now-label"><RocketIcon size={12} color="#E85D50" /> WHAT'S NEXT</div>
            <div className="mvk-now-action">Take a breath. You earned it. Then check your dashboard for what's coming up.</div>
          </div>
          <button className="mvk-save-btn" onClick={() => navigate('/app')}>BACK TO BASE</button>
          <button className="mvk-btn mvk-btn-outline" onClick={() => navigate('/app/plan')} style={{ marginTop: 10 }}>
            NEW CRISIS
          </button>
        </motion.section>
      </MavrickShell>
    )
  }

  /* ── Active mission ── */
  return (
    <MavrickShell active="execute" night>
      <Header />

      {/* EXECUTION MODE banner */}
      <div className="mvk-exec-banner">
        <LockIcon size={18} color="#E85D50" />
        <span>EXECUTION MODE</span>
      </div>

      <motion.section
        className="mvk-card mvk-card-dark"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="mvk-sec-head"><span className="mvk-sec-title">MISSION ACTIVE</span></div>

        {/* Current mission + timer */}
        <div className="mvk-mission-label">CURRENT MISSION</div>
        <div className="mvk-mission-title">{current.title}</div>
        <div className="mvk-timer-box">
          <HourglassIcon size={26} color="#E85D50" />
          <span className="mvk-timer">{fmtClock(secondsLeft)}</span>
        </div>

        {/* Mission progress */}
        <div className="mvk-progress-row">
          <span>MISSION PROGRESS</span>
          <span className="mvk-progress-pct">{progress}%</span>
        </div>
        <div className="mvk-seg-bar">
          {Array.from({ length: segCount }).map((_, i) => (
            <span key={i} className={`mvk-seg ${i < filledSeg ? 'on' : ''}`} />
          ))}
        </div>

        {/* Current / Next task */}
        <div className="mvk-task-grid">
          <div className="mvk-task-card">
            <div className="mvk-task-label">CURRENT TASK</div>
            <span className="mvk-task-ico"><BookIcon size={18} color="#E85D50" /></span>
            <div className="mvk-task-title">{current.title}</div>
            <div className="mvk-task-desc">{current.detail}</div>
            <div className="mvk-task-badge in-progress"><PlayIcon size={8} color="#FFF6E6" /> IN PROGRESS</div>
          </div>
          <div className="mvk-task-card">
            <div className="mvk-task-label">NEXT TASK</div>
            <span className="mvk-task-ico"><BookIcon size={18} color="#2A8090" /></span>
            <div className="mvk-task-title">{next ? next.title : 'FINISH LINE'}</div>
            <div className="mvk-task-desc">{next ? next.detail : "Last task — then you're done!"}</div>
            <div className="mvk-task-badge pending">○ PENDING</div>
          </div>
        </div>

        {/* AI Coach */}
        <div className="mvk-coach">
          <RobotMascot size={44} mood={overdue || behind ? 'panic' : 'coach'} />
          <div className="mvk-coach-bubble">
            <div className="mvk-coach-head">
              <span className="mvk-coach-name">AI COACH</span>
              <button
                type="button"
                className={`mvk-voice-toggle ${voiceOn ? 'on' : 'off'}`}
                onClick={() => { if (voiceOn) { setVoiceOn(false) } else { setVoiceOn(true); voiceOnRef.current = true; speak(coachMsg) } }}
                title={voiceOn ? 'Mute coach voice' : 'Unmute coach voice'}
              >
                <SpeakerIcon on={voiceOn} size={12} /> {voiceOn ? 'VOICE ON' : 'MUTED'}
              </button>
            </div>
            {coachMsg}
          </div>
        </div>

        {/* Complete task */}
        <button className="mvk-save-btn" onClick={completeTask}>
          <RocketIcon size={18} color="#FFF6E6" /> COMPLETE TASK
        </button>
      </motion.section>
    </MavrickShell>
  )
}

function Header() {
  return (
    <header className="mvk-header">
      <div className="mvk-logo">
        <RobotMascot size={28} />
        <div>
          <div className="mvk-wordmark">MAVRICK</div>
          <div className="mvk-badge">AI CRISIS COMMANDER</div>
        </div>
      </div>
    </header>
  )
}
