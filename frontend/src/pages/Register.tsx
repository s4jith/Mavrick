import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup } from 'firebase/auth'
import { auth, googleProvider, firebaseAuthError } from '../firebase'
import { MavrickShell } from '../components/pixel/MavrickShell'
import { RobotMascot } from '../components/pixel/RobotMascot'
import { AuthField } from '../components/pixel/AuthField'
import { BrandMark } from '../components/pixel/BrandMark'
import { UserIcon, CalendarIcon, MailIcon, PhoneIcon, LockIcon, CheckIcon, PlayIcon } from '../components/icons/PixelIcons'

export function Register() {
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [agree, setAgree] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!agree) { setError('Please accept the Terms of Service to continue.'); return }
    if (password !== confirm) { setError("Passwords don't match."); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true)
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password)
      await updateProfile(cred.user, { displayName: name })
      // Force a token refresh so AuthContext picks up the new displayName.
      await cred.user.getIdToken(true)
      navigate('/onboarding')
    } catch (err) {
      setError(firebaseAuthError(err))
    } finally {
      setLoading(false)
    }
  }

  async function googleSignUp() {
    setError(null)
    setLoading(true)
    try {
      await signInWithPopup(auth, googleProvider)
      navigate('/onboarding')
    } catch (err) {
      setError(firebaseAuthError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <MavrickShell>
      <div className="mvk-hero">
        <RobotMascot size={54} />
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
        <div className="mvk-sec-head"><span className="mvk-sec-title">CREATE YOUR ACCOUNT</span></div>
        <div className="mvk-card-subtitle">Join Mavrick and let's save your time.</div>

        <div className="mvk-form">
          <AuthField icon={<UserIcon size={16} color="#E85D50" />} label="Full Name" placeholder="Enter your full name" value={name} onChange={setName} />
          <AuthField icon={<CalendarIcon size={16} color="#E85D50" />} label="Age" placeholder="Enter your age" type="number" value={age} onChange={setAge} />
          <AuthField icon={<MailIcon size={16} color="#E85D50" />} label="Email" placeholder="Enter your email address" type="email" value={email} onChange={setEmail} />
          <AuthField icon={<PhoneIcon size={16} color="#E85D50" />} label="Phone Number" placeholder="Enter your phone number" value={phone} onChange={setPhone} />
          <AuthField icon={<LockIcon size={16} color="#E85D50" />} label="Password" placeholder="Create a strong password" value={password} onChange={setPassword} password />
          <AuthField icon={<LockIcon size={16} color="#E85D50" />} label="Confirm Password" placeholder="Re-enter your password" value={confirm} onChange={setConfirm} password />
        </div>

        <button type="button" className="mvk-check-row" onClick={() => setAgree(a => !a)} style={{ marginTop: 14 }}>
          <span className={`mvk-checkbox ${agree ? 'on' : ''}`}>{agree && <CheckIcon size={10} color="#FFF6E6" />}</span>
          I agree to the <span className="mvk-coral">Terms of Service</span>
        </button>

        {error && <div className="mvk-error">{error}</div>}

        <button type="submit" className="mvk-save-btn" disabled={loading}>
          <PlayIcon size={16} color="#FFF6E6" /> {loading ? 'CREATING…' : 'CREATE ACCOUNT'}
        </button>

        <div className="mvk-or"><span>OR</span></div>

        <button type="button" className="mvk-social-btn" onClick={googleSignUp} disabled={loading}><BrandMark provider="google" size={20} /> SIGN UP WITH GOOGLE</button>
        <button type="button" className="mvk-social-btn mvk-social-disabled" disabled title="Coming soon"><BrandMark provider="microsoft" size={20} /> SIGN UP WITH MICROSOFT</button>

        <div className="mvk-auth-foot">Already have an account? <Link to="/login" className="mvk-auth-link">Login</Link></div>
      </motion.form>
    </MavrickShell>
  )
}
