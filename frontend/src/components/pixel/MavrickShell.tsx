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
    <div className={`mvk-app ${night ? 'mvk-app--night' : ''} ${active ? '' : 'mvk-app--nonav'}`}>
      <PixelScene />

      <div className="mvk-frame">
        <div className="mvk-scroll">{children}</div>

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
  )
}
