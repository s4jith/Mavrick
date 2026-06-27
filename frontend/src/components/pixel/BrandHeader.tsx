import { RobotMascot } from './RobotMascot'

/** Compact MAVRICK header used at the top of the in-app screens. */
export function BrandHeader() {
  return (
    <header className="mvk-header">
      <div className="mvk-logo">
        <RobotMascot size={28} />
        <div>
          <div className="mvk-wordmark">MAVRICK</div>
          <div className="mvk-badge">AI CRISIS COMMANDER</div>
        </div>
      </div>
    </header>
  )
}
