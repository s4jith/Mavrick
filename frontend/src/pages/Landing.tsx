import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const PIXEL_COLORS = ['#f72585', '#7209b7', '#4361ee', '#4cc9f0', '#b5179e']

const PIXELS = Array.from({ length: 16 }, (_, i) => ({
  size: 6 + (i % 5) * 4,
  color: PIXEL_COLORS[i % 5],
  left: `${8 + (i * 6.5) % 84}%`,
  top:  `${4 + (i * 9.7) % 88}%`,
  delay: i * 0.4,
  duration: 4 + (i % 4),
  animIdx: i % 3,
}))

const FEATURES = [
  { label: 'INSTANT PLAN', color: '#f72585', border: 'rgba(247,37,133,0.25)' },
  { label: 'STEP BY STEP', color: '#7209b7', border: 'rgba(114,9,183,0.25)' },
  { label: 'AI POWERED',   color: '#4361ee', border: 'rgba(67,97,238,0.25)'  },
  { label: 'FIRST STEP NOW', color: '#4cc9f0', border: 'rgba(76,201,240,0.25)' },
]

export function Landing() {
  return (
    <div style={{
      position: 'relative',
      width: '100%',
      minHeight: '100dvh',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      background: '#f8f9ff',
    }}>

      {/* Floating pixel squares — light, on-white */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0, pointerEvents: 'none' }}>
        {PIXELS.map((px, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: px.size,
              height: px.size,
              background: px.color,
              opacity: 0.07 + (i % 3) * 0.04,
              left: px.left,
              top: px.top,
              borderRadius: 2,
              animation: `px-float-${px.animIdx} ${px.duration}s ease-in-out ${px.delay}s infinite`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes px-float-0 {
          0%, 100% { transform: translate(0,0) rotate(0deg); }
          50%       { transform: translate(8px,-14px) rotate(45deg); }
        }
        @keyframes px-float-1 {
          0%, 100% { transform: translate(0,0) rotate(0deg); }
          50%       { transform: translate(-10px,9px) rotate(-30deg); }
        }
        @keyframes px-float-2 {
          0%, 100% { transform: translate(0,0) rotate(0deg); }
          50%       { transform: translate(6px,15px) rotate(60deg); }
        }
      `}</style>

      {/* Main content */}
      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', maxWidth: 560, width: '100%' }}>

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
        >
          <div style={{
            width: 88, height: 88,
            margin: '0 auto 28px',
            background: 'linear-gradient(135deg, #f72585, #7209b7)',
            border: '4px solid #560bad',
            borderRadius: 20,
            boxShadow: '0 7px 0 #3a0ca3, inset 0 0 0 2px rgba(255,255,255,0.15)',
            display: 'grid',
            placeItems: 'center',
            fontFamily: "'Press Start 2P', cursive",
            fontSize: 36,
            color: 'white',
          }}>
            M
          </div>

          <h1 style={{
            fontFamily: "'Press Start 2P', cursive",
            fontSize: 'clamp(20px, 5vw, 36px)',
            fontWeight: 400,
            letterSpacing: '0.06em',
            lineHeight: 1.25,
            marginBottom: 14,
            color: '#1a0030',
            textShadow: '0 2px 0 rgba(114,9,183,0.15)',
          }}>
            MAVRICK
          </h1>

          {/* Gradient tagline */}
          <p style={{
            fontFamily: "'Press Start 2P', cursive",
            fontSize: 'clamp(8px, 2vw, 11px)',
            background: 'linear-gradient(90deg, #f72585, #7209b7, #4361ee)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '0.05em',
            marginBottom: 24,
            lineHeight: 1.8,
          }}>
            PANIC TO PLAN. IN SECONDS.
          </p>

          <p style={{
            fontSize: 'clamp(14px, 3.5vw, 16px)',
            color: '#480ca8',
            maxWidth: 440,
            margin: '0 auto 40px',
            lineHeight: 1.75,
            opacity: 0.75,
          }}>
            The AI execution engine that turns your crisis into a clear,
            time-blocked action plan — first step you can do right now.
          </p>
        </motion.div>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.45 }}
          style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}
        >
          <Link to="/register" style={{ textDecoration: 'none' }}>
            <button className="panic-btn" style={{ width: 210, height: 56, fontSize: 10 }}>
              ▶ START FREE
            </button>
          </Link>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <button className="reset-btn" style={{ width: 190, height: 56, fontSize: 10 }}>
              SIGN IN
            </button>
          </Link>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.8 }}
          style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 40, flexWrap: 'wrap' }}
        >
          {FEATURES.map((f) => (
            <span key={f.label} style={{
              fontFamily: "'Press Start 2P', cursive",
              fontSize: 7,
              color: f.color,
              letterSpacing: '0.04em',
              padding: '7px 14px',
              background: 'white',
              border: `2px solid ${f.border}`,
              borderRadius: 20,
              boxShadow: '0 2px 0 rgba(114,9,183,0.07)',
            }}>
              {f.label}
            </span>
          ))}
        </motion.div>

        {/* Social proof / trust */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 1.1 }}
          style={{
            marginTop: 40, fontSize: 11,
            color: 'rgba(114,9,183,0.5)',
            fontFamily: "'Press Start 2P', cursive",
            letterSpacing: '0.03em',
            lineHeight: 1.9,
          }}
        >
          Built for Vibe2Ship Hackathon · Gemini 2.5 Flash
        </motion.p>
      </div>
    </div>
  )
}
