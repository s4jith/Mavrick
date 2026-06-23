interface Props {
  stepsCompleted: number
  totalSteps: number
  evaluatorScore: number
}

export function StressMeter({ stepsCompleted, totalSteps, evaluatorScore }: Props) {
  const progress = totalSteps > 0 ? stepsCompleted / totalSteps : 0
  const stressLevel = 1 - progress // 1 = max stress, 0 = calm

  // Interpolate from red (stressed) through amber to green (calm)
  const hue = progress * 120 // 0=red, 60=amber, 120=green
  const saturation = 75
  const lightness = 50
  const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`
  const glowColor = `hsla(${hue}, ${saturation}%, ${lightness}%, 0.4)`

  const label =
    stressLevel > 0.7
      ? '😰 High Stress'
      : stressLevel > 0.4
        ? '😤 Working...'
        : stressLevel > 0.1
          ? '😌 Almost There'
          : '🎉 Crisis Handled!'

  const angle = progress * 180 // 0° to 180° for the gauge arc

  return (
    <div className="stress-meter">
      <div className="stress-gauge">
        <svg viewBox="0 0 200 110" className="gauge-svg">
          {/* Background arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="var(--surface-3)"
            strokeWidth="14"
            strokeLinecap="round"
          />
          {/* Progress arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke={color}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={`${angle * 1.4} 999`}
            style={{
              filter: `drop-shadow(0 0 8px ${glowColor})`,
              transition: 'stroke-dasharray 0.6s cubic-bezier(0.2, 0.8, 0.2, 1), stroke 0.6s ease',
            }}
          />
          {/* Center text */}
          <text x="100" y="80" textAnchor="middle" className="gauge-pct">
            {Math.round(progress * 100)}%
          </text>
          <text x="100" y="100" textAnchor="middle" className="gauge-label">
            complete
          </text>
        </svg>
      </div>
      <div className="stress-info">
        <span className="stress-label" style={{ color }}>{label}</span>
        <span className="stress-eval">
          Evaluator: <strong>{evaluatorScore}/100</strong>
        </span>
        <span className="stress-steps">
          {stepsCompleted}/{totalSteps} steps done
        </span>
      </div>
    </div>
  )
}
