import { useEffect, useState } from 'react'
import './App.css'
import { ApiError, getHealth, getPlan } from './api'
import { Header } from './components/Header'
import { PanicForm } from './components/PanicForm'
import { PlanView } from './components/PlanView'
import type { Health, PlanRequest, PlanResponse } from './types'

type Status = 'idle' | 'loading' | 'done'

const LOADING_LINES = [
  'Reading your crisis…',
  'Classifying the situation…',
  'Doing the time math…',
  'Building your step-by-step plan…',
]

function App() {
  const [status, setStatus] = useState<Status>('idle')
  const [resp, setResp] = useState<PlanResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [health, setHealth] = useState<Health | null>(null)
  const [loadingLine, setLoadingLine] = useState(LOADING_LINES[0])

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
    }, 1400)
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
      <Header health={health} />

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

      <div className="footer">Mavrick · built for Vibe2Ship</div>
    </main>
  )
}

export default App
