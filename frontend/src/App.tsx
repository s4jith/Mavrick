import { useEffect, useState } from 'react'
import './App.css'
import { ApiError, getPlan } from './api'
import { getHealth } from './api'
import { Header } from './components/Header'
import { HistoryPanel, saveToHistory } from './components/HistoryPanel'
import { PanicForm } from './components/PanicForm'
import { PlanView } from './components/PlanView'
import type { Health, PlanRequest, PlanResponse } from './types'

type Status = 'idle' | 'loading' | 'done'

const LOADING_LINES = [
  'Reading your crisis…',
  'Classifying the situation…',
  'Doing the time math…',
  'Building your step-by-step plan…',
  'Running the evaluator…',
]

function App() {
  const [status, setStatus] = useState<Status>('idle')
  const [resp, setResp] = useState<PlanResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [health, setHealth] = useState<Health | null>(null)
  const [loadingLine, setLoadingLine] = useState(LOADING_LINES[0])
  const [showHistory, setShowHistory] = useState(false)

  const refreshHealth = () => {
    getHealth()
      .then(setHealth)
      .catch(() => setHealth(null))
  }

  useEffect(refreshHealth, [])

  useEffect(() => {
    if (status !== 'loading') return
    let i = 0
    const id = setInterval(() => {
      i = (i + 1) % LOADING_LINES.length
      setLoadingLine(LOADING_LINES[i])
    }, 1200)
    return () => clearInterval(id)
  }, [status])

  async function handleSubmit(req: PlanRequest) {
    setError(null)
    setStatus('loading')
    setLoadingLine(LOADING_LINES[0])
    try {
      const result = await getPlan(req)
      setResp(result)
      setStatus('done')
      refreshHealth()

      // Save to history
      saveToHistory({
        id: Date.now().toString(36),
        text: req.text,
        cluster: result.plan.cluster,
        sub_type: result.plan.sub_type,
        severity: result.plan.severity,
        urgency_score: result.urgency_score,
        evaluator_score: result.evaluator_score,
        steps_count: result.plan.steps.length,
        completed_at: new Date().toISOString(),
      })
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : 'Could not reach Mavrick. Is the backend running on :8000?'
      setError(msg)
      setStatus('idle')
    }
  }

  function reset() {
    setResp(null)
    setStatus('idle')
    setError(null)
    refreshHealth()
  }

  return (
    <main className="app">
      <Header health={health} onHistoryClick={() => setShowHistory(true)} />

      {status === 'idle' && (
        <PanicForm onSubmit={handleSubmit} loading={false} error={error} />
      )}

      {status === 'loading' && (
        <div className="loading">
          <div className="spinner" />
          <p className="big">{loadingLine}</p>
          <p>Mavrick is turning panic into a plan.</p>
        </div>
      )}

      {status === 'done' && resp && <PlanView resp={resp} onReset={reset} />}

      <div className="footer">
        Mavrick · AI Execution Engine · Built for Vibe2Ship
      </div>

      {showHistory && <HistoryPanel onClose={() => setShowHistory(false)} />}
    </main>
  )
}

export default App
