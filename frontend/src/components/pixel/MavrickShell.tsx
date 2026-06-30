/**
 * MAVRICK screen shell — the fixed frame every in-app screen lives inside.
 *  • Pixel city background (always identical)
 *  • Centered phone-width content column (scrolls)
 *  • Fixed bottom navigation (5 tabs)
 *  • "YOUR AI PARTNER IN EVERY CRISIS" strip — on every screen, no exception
 *
 * Pass the active nav tab; put the screen body in children.
 */
import type { ReactNode } from 'react'
import { PixelScene } from './PixelScene'
import { BottomNav } from './BottomNav'
import { RobotMascot } from './RobotMascot'
import type { NavTab } from './BottomNav'
import '../../styles/mavrick.css'

interface Props {
  /** Active bottom-nav tab. Omit to hide the nav (auth / onboarding flow). */
  active?: NavTab
  children: ReactNode
  /** Darker, night-time variant of the background (used by Execution Mode). */
  night?: boolean
}

export function MavrickShell({ active, children, night = false }: Props) {
  return (
    <div className="mvk-desktop-wrap">
      {/* Banner — only visible on desktop via CSS */}
      <p className="mvk-phone-banner" aria-hidden="true">
        Designed for the best experience on mobile.
      </p>

      {/* Phone shell — transparent pass-through on mobile, realistic frame on desktop */}
      <div className="mvk-phone-shell">
        {/* Dynamic island / notch */}
        <div className="mvk-phone-notch" aria-hidden="true">
          <span className="mvk-phone-speaker" />
          <span className="mvk-phone-cam" />
        </div>

        <div className={`mvk-app ${night ? 'mvk-app--night' : ''} ${active ? '' : 'mvk-app--nonav'}`}>
          <PixelScene />

          <div className="mvk-frame">
            {/* Desktop-only left panel — hidden on mobile via CSS */}
            <aside className="mvk-desktop-panel" aria-hidden="true">
              <RobotMascot size={96} mood="wave" />
              <div className="mvk-desktop-logo">MAVRICK</div>
              <div className="mvk-badge">AI CRISIS COMMANDER</div>
              <div className="mvk-desktop-tagline">
                Turn <span className="mvk-coral">Panic</span> into a{' '}
                <span className="mvk-coral">Plan</span>. Instantly.
              </div>
              <div className="mvk-desktop-features">
                <div className="mvk-desktop-feat"><span className="mvk-coral">✦</span> One AI call, full time-blocked plan</div>
                <div className="mvk-desktop-feat"><span className="mvk-coral">✦</span> First step always doable right now</div>
                <div className="mvk-desktop-feat"><span className="mvk-coral">✦</span> AI coach guides every step</div>
                <div className="mvk-desktop-feat"><span className="mvk-coral">✦</span> Crisis history & smart insights</div>
              </div>
              <div className="mvk-desktop-clusters">
                {['FINANCIAL','ACADEMIC','HEALTH','WORK','LEGAL','FAMILY'].map(c => (
                  <span key={c} className="mvk-desktop-cluster">{c}</span>
                ))}
              </div>
              <div className="mvk-desktop-quote">
                "I needed a plan. Mavrick gave me one in 4 seconds."
              </div>
            </aside>

            <div className="mvk-scroll">
              {active && <div className="mvk-brand-space" aria-hidden="true" />}
              {children}
            </div>

            <div className="mvk-footer">
              {active && <BottomNav active={active} />}
              <div className="mvk-strip">
                <span className="mvk-strip-heart">♥</span>
                YOUR AI PARTNER IN EVERY CRISIS
                <span className="mvk-strip-heart">♥</span>
              </div>
            </div>
          </div>
        </div>

        {/* Home indicator bar — only visible on desktop */}
        <div className="mvk-phone-home" aria-hidden="true" />
      </div>
    </div>
  )
}
