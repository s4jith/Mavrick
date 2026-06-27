import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { loginUser, getMe, googleLoginUrl } from '../api'
import { useAuth } from '../context/AuthContext'
import { MavrickShell } from '../components/pixel/MavrickShell'
import { RobotMascot } from '../components/pixel/RobotMascot'
import { AuthField } from '../components/pixel/AuthField'
import { BrandMark } from '../components/pixel/BrandMark'
import { MailIcon, LockIcon, CheckIcon, PlayIcon } from '../components/icons/PixelIcons'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const t = await loginUser({ email, password })
      const me = await getMe(t.access_token)
      login(t.access_token, me)
      navigate('/app')
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <MavrickShell>
      <div className="mvk-hero">
        <RobotMascot size={58} />
        <div className="mvk-hero-word">MAVRICK</div>
        <div className="mvk-badge">AI CRISIS COMMANDER</div>
        <div className="mvk-hero-sub">Turn <span className="mvk-coral">Panic</span> into a <span className="mvk-coral">Plan</span>. Instantly.</div>
      </div>

      <motion.form
        className="mvk-card"
        onSubmit={submit}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="mvk-sec-head"><span className="mvk-sec-title">WELCOME BACK</span></div>
        <div className="mvk-card-subtitle">Log in to continue your mission</div>

        <div className="mvk-form">
          <AuthField icon={<MailIcon size={16} color="#E85D50" />} placeholder="Email address" type="email" value={email} onChange={setEmail} />
          <AuthField icon={<LockIcon size={16} color="#E85D50" />} placeholder="Password" value={password} onChange={setPassword} password />
        </div>

        <div className="mvk-form-row">
          <button type="button" className="mvk-check-row" onClick={() => setRemember(r => !r)}>
            <span className={`mvk-checkbox ${remember ? 'on' : ''}`}>{remember && <CheckIcon size={10} color="#FFF6E6" />}</span>
            Remember me
          </button>
          <span className="mvk-auth-link">Forgot password?</span>
        </div>

        {error && <div className="mvk-error">{error}</div>}

        <button type="submit" className="mvk-save-btn" disabled={loading}>
          <PlayIcon size={16} color="#FFF6E6" /> {loading ? 'LOGGING IN…' : 'LOGIN'}
        </button>

        <div className="mvk-or"><span>OR</span></div>

        <button type="button" className="mvk-social-btn" onClick={() => { window.location.href = googleLoginUrl() }}><BrandMark provider="google" size={20} /> CONTINUE WITH GOOGLE</button>
        <button type="button" className="mvk-social-btn mvk-social-disabled" disabled title="Coming soon"><BrandMark provider="microsoft" size={20} /> CONTINUE WITH MICROSOFT</button>

        <div className="mvk-auth-foot">New here? <Link to="/register" className="mvk-auth-link">Create an account</Link></div>
      </motion.form>
    </MavrickShell>
  )
}
