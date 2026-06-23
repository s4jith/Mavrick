import { useCallback, useEffect, useRef, useState } from 'react'
import { getCoachMessage } from '../api'
import type { CoachResponse, Plan } from '../types'

interface Props {
  plan: Plan
  minutesLeft: number
  stepsCompleted: number
  onCoachMessage: (msg: CoachResponse) => void
}

export function TimeWarp({ plan, minutesLeft, onCoachMessage }: Props) {
  const [active, setActive] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [speed, setSpeed] = useState(60) // 1 real second = 60 simulated seconds (1 min)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastCheckRef = useRef(0)

  const totalPlanned = plan.steps.reduce((s, st) => s + st.minutes, 0)

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  const sendNotification = useCallback(
    (title: string, body: string) => {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
          body,
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          tag: 'mavrick-coach',
        })
      }
    },
    []
  )

  const stop = useCallback(() => {
    setActive(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const start = useCallback(() => {
    setActive(true)
    setElapsed(0)
    lastCheckRef.current = 0

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    intervalRef.current = setInterval(async () => {
      setElapsed((prev) => {
        const next = prev + 1 // each tick = 1 simulated minute

        // Find which step we should be on
        let accumulated = 0
        let currentIdx = 0
        for (let i = 0; i < plan.steps.length; i++) {
          accumulated += plan.steps[i].minutes
          if (next <= accumulated) {
            currentIdx = i
            break
          }
          currentIdx = i + 1
        }

        // Send coach check-in every ~5 simulated minutes
        if (next - lastCheckRef.current >= 5) {
          lastCheckRef.current = next

          getCoachMessage({
            plan,
            current_step_index: currentIdx,
            steps_completed: Math.min(currentIdx, plan.steps.length),
            minutes_elapsed: next,
            minutes_left: minutesLeft,
          })
            .then((coach) => {
              onCoachMessage(coach)
              sendNotification('🏃 Mavrick Coach', coach.message)
            })
            .catch(() => {})
        }

        // At each step boundary, send a notification
        let stepAcc = 0
        for (const step of plan.steps) {
          stepAcc += step.minutes
          if (next === stepAcc) {
            sendNotification(
              `✅ Step complete: ${step.title}`,
              `Move on to the next step!`
            )
            break
          }
        }

        // Stop when plan time is exhausted
        if (next >= totalPlanned) {
          if (intervalRef.current) clearInterval(intervalRef.current)
          intervalRef.current = null
          sendNotification('🎉 Plan Complete!', 'You crushed it. Crisis handled.')
        }

        return next
      })
    }, 1000 / (speed / 60)) // Adjust tick speed
  }, [plan, minutesLeft, speed, totalPlanned, onCoachMessage, sendNotification])

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const progressPct = Math.min(100, Math.round((elapsed / totalPlanned) * 100))

  return (
    <div className="time-warp">
      <div className="tw-header">
        <span className="tw-icon">⏱️</span>
        <span className="tw-title">Time Warp Demo</span>
        <span className="tw-speed">{speed}x speed</span>
      </div>

      {!active ? (
        <div className="tw-controls">
          <div className="tw-speed-select">
            {[30, 60, 120].map((s) => (
              <button
                key={s}
                className={`chip ${speed === s ? 'active' : ''}`}
                onClick={() => setSpeed(s)}
              >
                {s}x
              </button>
            ))}
          </div>
          <button className="tw-start-btn" onClick={start}>
            ▶ Start Simulation
          </button>
          <p className="tw-hint">
            Watch the full plan execute in fast-forward with live coach check-ins
            and browser notifications.
          </p>
        </div>
      ) : (
        <div className="tw-running">
          <div className="tw-progress">
            <div className="bar">
              <span
                style={{ width: `${progressPct}%` }}
                className="tw-bar-fill"
              />
            </div>
            <span className="tw-elapsed">
              {elapsed} / {totalPlanned} min simulated
            </span>
          </div>
          <button className="tw-stop-btn" onClick={stop}>
            ⏹ Stop
          </button>
        </div>
      )}
    </div>
  )
}
