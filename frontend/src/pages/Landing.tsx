import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { HeroScene } from '../components/3d/HeroScene'

export function Landing() {
  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100dvh', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <HeroScene />
      
      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '20px' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="brand-mark" style={{ width: 80, height: 80, fontSize: 40, margin: '0 auto 24px', borderRadius: 24 }}>
            M
          </div>
          <h1 style={{ fontSize: 'clamp(48px, 8vw, 80px)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 16 }}>
            Panic to Plan.<br />
            <span style={{ background: 'var(--gradient-aurora)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              In Seconds.
            </span>
          </h1>
          <p style={{ fontSize: 'clamp(18px, 4vw, 22px)', color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto 40px', lineHeight: 1.5 }}>
            The AI-powered productivity companion that proactively assists you in planning, prioritizing, and surviving the chaos.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          style={{ display: 'flex', gap: 16, justifyContent: 'center' }}
        >
          <Link to="/register" style={{ textDecoration: 'none' }}>
            <button className="panic-btn" style={{ width: 200, height: 56, fontSize: 18 }}>
              Start for free
            </button>
          </Link>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <button className="reset-btn" style={{ width: 200, height: 56, fontSize: 18, background: 'var(--glass-strong)' }}>
              Sign In
            </button>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
