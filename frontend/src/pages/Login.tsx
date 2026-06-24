import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { loginUser } from '../api'
import { useAuth } from '../context/AuthContext'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const tokenData = await loginUser({ email, password })
      // For now, we mock the user response here since login endpoint doesn't return user details directly in our simple setup,
      // but typically we'd fetch `/api/auth/me` next. Let's just create a dummy object based on email.
      login(tokenData.access_token, { id: 'temp', email, name: email.split('@')[0] })
      navigate('/app')
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', padding: 20 }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-card"
        style={{ width: '100%', maxWidth: 400, padding: 40 }}
      >
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div className="brand-mark" style={{ margin: '0 auto 18px' }}>M</div>
          <h2 style={{ margin: 0, fontSize: 14, fontWeight: 400, fontFamily: "'Press Start 2P', cursive", letterSpacing: '0.04em', lineHeight: 1.5 }}>WELCOME BACK</h2>
          <p style={{ color: 'var(--text-secondary)', margin: '10px 0 0', fontSize: 13 }}>Enter your details to access your plans.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="field">
            <label>Email</label>
            <input 
              type="email" 
              className="num-input" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input 
              type="password" 
              className="num-input" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="form-error">{error}</div>}

          <button type="submit" className="panic-btn" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-secondary)' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--accent-light)', textDecoration: 'none', fontWeight: 600 }}>Sign up</Link>
        </p>
      </motion.div>
    </div>
  )
}
