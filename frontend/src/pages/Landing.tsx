import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const PIXEL_COLORS = ['#a855f7', '#5bc8f5', '#f0507a', '#f9a825']

// Deterministic floating pixel squares for background decoration
const PIXELS = Array.from({ length: 14 }, (_, i) => ({
  size: 6 + (i % 5) * 4,
  color: PIXEL_COLORS[i % 4],
  left: `${8 + (i * 6.5) % 84}%`,
  top:  `${4 + (i * 9.7) % 88}%`,
  delay: i * 0.4,
  duration: 4 + (i % 4),
  animIdx: i % 3,
}))

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
    }}>

      {/* Floating pixel squares */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0, pointerEvents: 'none' }}>
        {PIXELS.map((px, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: px.size,
              height: px.size,
              background: px.color,
              opacity: 0.12 + (i % 3) * 0.06,
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
            width: 80, height: 80,
            margin: '0 auto 28px',
            background: '#a855f7',
            border: '4px solid #6820b8',
            borderRadius: 18,
            boxShadow: '0 7px 0 #3e0880, inset 0 0 0 2px rgba(255,255,255,0.18)',
            display: 'grid',
            placeItems: 'center',
            fontFamily: "'Press Start 2P', cursive",
            fontSize: 34,
            color: 'white',
          }}>
            M
          </div>

          {/* Title */}
          <h1 style={{
            fontFamily: "'Press Start 2P', cursive",
            fontSize: 'clamp(18px, 5vw, 34px)',
            fontWeight: 400,
            letterSpacing: '0.06em',
            lineHeight: 1.25,
            marginBottom: 14,
            color: '#f0f2f8',
          }}>
            MAVRICK
          </h1>

          {/* Tagline */}
          <p style={{
            fontFamily: "'Press Start 2P', cursive",
            fontSize: 'clamp(8px, 2vw, 11px)',
            color: '#f9a825',
            letterSpacing: '0.04em',
            marginBottom: 24,
            lineHeight: 1.8,
          }}>
            PANIC TO PLAN. IN SECONDS.
          </p>

          {/* Description */}
          <p style={{
            fontSize: 'clamp(14px, 3.5vw, 16px)',
            color: '#9ba8cc',
            maxWidth: 440,
            margin: '0 auto 36px',
            lineHeight: 1.7,
          }}>
            The AI execution engine that turns your crisis into a clear, time-blocked action plan — with a first step you can do right now.
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.45 }}
          style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}
        >
          <Link to="/register" style={{ textDecoration: 'none' }}>
            <button className="panic-btn" style={{ width: 200, height: 54, fontSize: 10 }}>
              ▶ START FREE
            </button>
          </Link>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <button className="reset-btn" style={{ width: 180, height: 54, fontSize: 10 }}>
              SIGN IN
            </button>
          </Link>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.75 }}
          style={{ display: 'flex', gap: 18, justifyContent: 'center', marginTop: 36, flexWrap: 'wrap' }}
        >
          {['⚡ INSTANT', '📋 STEP BY STEP', '🎯 AI POWERED'].map((feat) => (
            <span key={feat} style={{
              fontFamily: "'Press Start 2P', cursive",
              fontSize: 7,
              color: '#5a6490',
              letterSpacing: '0.04em',
              padding: '6px 10px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 20,
            }}>
              {feat}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
