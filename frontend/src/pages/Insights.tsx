import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { MavrickShell } from '../components/pixel/MavrickShell'
import { BrandHeader } from '../components/pixel/BrandHeader'
import { RobotMascot } from '../components/pixel/RobotMascot'
import { getHistory } from '../api'
import type { CrisisHistory } from '../types'
import { ChartIcon, ShieldIcon, TimerIcon, ClipboardIcon, AlarmIcon } from '../components/icons/PixelIcons'

function mode(arr: string[]): string {
  const f: Record<string, number> = {}
  arr.forEach(v => { f[v] = (f[v] ?? 0) + 1 })
  return Object.entries(f).sort((a, b) => b[1] - a[1])[0]?.[0] ?? ''
}

export function Insights() {
  const [history, setHistory] = useState<CrisisHistory[]>([])
  useEffect(() => { getHistory().then(setHistory).catch(() => setHistory([])) }, [])
  const total = history.length

  const crisesSolved = total || 42
  const completion = total ? Math.round(history.reduce((a, h) => a + h.evaluator_score, 0) / total) : 84
  const hoursSaved = total ? Math.max(1, Math.round(total * 3.25)) : 137
  const common = total ? mode(history.map(h => h.cluster)).toUpperCase() : 'ASSIGNMENTS'

  return (
    <MavrickShell active="profile">
      <BrandHeader />

      <div className="mvk-page-title">
        <ChartIcon size={20} color="#E85D50" />
        <span className="mvk-page-title-text">PRODUCTIVITY<br />INSIGHTS</span>
      </div>
      <div className="mvk-page-sub">Data-driven insights for a <span className="mvk-coral">better</span> you.</div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Stat grid */}
        <div className="mvk-ins-grid">
          <div className="mvk-ins-card">
            <div className="mvk-ins-label" style={{ color: '#4cc9f0' }}>COMPLETION RATE</div>
            <div className="mvk-ins-main">
              <div className="mvk-donut" style={{ background: `conic-gradient(#E85D50 ${completion * 3.6}deg, rgba(26,46,60,0.12) 0)` }}>
                <span>{completion}%</span>
              </div>
            </div>
            <div className="mvk-ins-sub">Tasks completed successfully</div>
          </div>

          <div className="mvk-ins-card">
            <div className="mvk-ins-label" style={{ color: '#E85D50' }}>CRISES SOLVED</div>
            <div className="mvk-ins-main">
              <ShieldIcon size={26} color="#E85D50" />
              <span className="mvk-ins-num">{crisesSolved}</span>
            </div>
            <div className="mvk-ins-sub">Crisis handled with MAVRICK</div>
          </div>

          <div className="mvk-ins-card">
            <div className="mvk-ins-label" style={{ color: '#4361EE' }}>HOURS SAVED</div>
            <div className="mvk-ins-main">
              <TimerIcon size={26} color="#4361EE" />
              <span className="mvk-ins-num">{hoursSaved}</span>
            </div>
            <div className="mvk-ins-sub">Hours saved using AI assistance</div>
          </div>

          <div className="mvk-ins-card">
            <div className="mvk-ins-label" style={{ color: '#B5179E' }}>MOST COMMON</div>
            <div className="mvk-ins-main">
              <ClipboardIcon size={24} color="#B5179E" />
              <span className="mvk-ins-word">{common}</span>
            </div>
            <div className="mvk-ins-sub">You stress most about this</div>
          </div>
        </div>

        {/* Best productivity time */}
        <div className="mvk-card mvk-card-pad mvk-best-time">
          <AlarmIcon size={24} color="#E85D50" />
          <div>
            <div className="mvk-best-time-val">9 PM - 11 PM</div>
            <div className="mvk-best-time-sub">BEST PRODUCTIVITY TIME</div>
            <div className="mvk-best-time-hint">You're most productive during this time.</div>
          </div>
        </div>

        {/* AI recommendation */}
        <div className="mvk-sec-head"><span className="mvk-sec-title">AI RECOMMENDATION</span></div>
        <div className="mvk-airec">
          <RobotMascot size={42} mood="coach" />
          <div className="mvk-airec-body">
            <div className="mvk-airec-title">START ASSIGNMENTS 48 HOURS EARLIER</div>
            <div className="mvk-airec-desc">You'll reduce stress and improve the quality of your work.</div>
          </div>
        </div>
      </motion.div>
    </MavrickShell>
  )
}
