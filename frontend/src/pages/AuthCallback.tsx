import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { MavrickShell } from '../components/pixel/MavrickShell'
import { RobotMascot } from '../components/pixel/RobotMascot'
import { useAuth } from '../context/AuthContext'
import { getMe } from '../api'

const ERRORS: Record<string, string> = {
  access_denied: 'You cancelled the Google sign-in.',
  google_oauth_not_configured: 'Google sign-in is not configured on the server.',
  token_exchange_failed: 'Could not complete Google sign-in. Please try again.',
  missing_code: 'Google did not return an authorization code.',
  no_email: 'Your Google account did not share an email address.',
}

export function AuthCallback() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { login } = useAuth()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = params.get('token')
    const err = params.get('error')
    if (err) { setError(ERRORS[err] || `Sign-in failed (${err}).`); return }
    if (!token) { setError('No sign-in token received.'); return }

    ;(async () => {
      try {
        const user = await getMe(token)
        login(token, user)
        navigate('/app', { replace: true })
      } catch {
        setError('Signed in, but failed to load your profile. Please try again.')
      }
    })()
  }, [params, login, navigate])

  return (
    <MavrickShell>
      <div className="mvk-hero" style={{ marginTop: 60 }}>
        <RobotMascot size={64} mood={error ? 'panic' : 'happy'} />
        <div className="mvk-hero-word">MAVRICK</div>
        {!error ? (
          <>
            <div className="mvk-badge">SIGNING YOU IN…</div>
            <div className="mvk-spinner" style={{ marginTop: 22 }} />
            <div className="mvk-hero-sub" style={{ marginTop: 18 }}>
              Connecting your <span className="mvk-coral">Google</span> account.
            </div>
          </>
        ) : (
          <>
            <div className="mvk-badge" style={{ background: '#E85D50' }}>SIGN-IN FAILED</div>
            <div className="mvk-error" style={{ marginTop: 18 }}>{error}</div>
            <Link to="/login" className="mvk-btn mvk-btn-coral mvk-btn-sm" style={{ marginTop: 18 }}>
              BACK TO LOGIN
            </Link>
          </>
        )}
      </div>
    </MavrickShell>
  )
}
