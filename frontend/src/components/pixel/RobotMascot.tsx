/**
 * MAVRICK robot mascot — the official AI Crisis Commander companion.
 * White rounded body, dark face screen, cyan eyes, coral heart on chest.
 * Pixel art drawn on a 30×32 grid. Each <rect> is one pixel.
 *
 * Matches the robot in every App-images reference screen.
 * Mood variants change the face only — body never changes.
 */

type Mood = 'happy' | 'wave' | 'panic' | 'coach'

interface Props {
  size?: number
  mood?: Mood
  className?: string
}

const VBW = 30
const VBH = 32

export function RobotMascot({ size = 64, mood = 'happy', className = '' }: Props) {
  const h = Math.round((size * VBH) / VBW)
  let k = 0
  const p = (x: number, y: number, w: number, hh: number, fill: string) => (
    <rect key={k++} x={x} y={y} width={w} height={hh} fill={fill} />
  )

  // Palette — locked to the reference robot
  const WHITE = '#FDF6E8'
  const SHADE = '#E6D9BC'
  const SCREEN = '#15323F'
  const EYE = mood === 'panic' ? '#F0604E' : '#5FD0E6'
  const HEART = '#E85D50'
  const ANT = '#E85D50'

  return (
    <svg
      width={size}
      height={h}
      viewBox={`0 0 ${VBW} ${VBH}`}
      style={{ imageRendering: 'pixelated', display: 'block', flexShrink: 0 }}
      className={className}
      aria-hidden="true"
    >
      {/* ── Antennae ── */}
      {p(9, 0, 2, 2, ANT)}
      {p(10, 2, 1, 2, WHITE)}
      {p(19, 0, 2, 2, ANT)}
      {p(19, 2, 1, 2, WHITE)}

      {/* ── Head (rounded white square) ── */}
      {p(8, 4, 14, 1, WHITE)}
      {p(7, 5, 16, 1, WHITE)}
      {p(6, 6, 18, 8, WHITE)}
      {p(7, 14, 16, 1, WHITE)}
      {p(8, 15, 14, 1, WHITE)}
      {/* head right shading */}
      {p(22, 6, 1, 8, SHADE)}

      {/* ── Face screen (dark) ── */}
      {p(8, 6, 13, 7, SCREEN)}

      {/* ── Eyes ── */}
      {p(10, 8, 3, 3, EYE)}
      {p(16, 8, 3, 3, EYE)}
      {/* eye shine */}
      {p(10, 8, 1, 1, '#FFFFFF')}
      {p(16, 8, 1, 1, '#FFFFFF')}

      {/* ── Mouth ── */}
      {mood === 'panic' ? (
        <>
          {p(13, 11, 3, 2, EYE)}
        </>
      ) : (
        <>
          {p(11, 11, 1, 1, EYE)}
          {p(18, 11, 1, 1, EYE)}
          {p(12, 12, 6, 1, EYE)}
        </>
      )}

      {/* ── Neck ── */}
      {p(12, 16, 6, 1, SHADE)}

      {/* ── Body (rounded white) ── */}
      {p(6, 17, 16, 1, WHITE)}
      {p(5, 18, 18, 1, WHITE)}
      {p(4, 19, 20, 7, WHITE)}
      {p(5, 26, 18, 1, WHITE)}
      {p(6, 27, 16, 1, WHITE)}
      {/* body right shading */}
      {p(22, 19, 1, 7, SHADE)}

      {/* ── Heart on chest ── */}
      {p(10, 20, 3, 1, HEART)}
      {p(15, 20, 3, 1, HEART)}
      {p(10, 21, 8, 1, HEART)}
      {p(10, 22, 8, 1, HEART)}
      {p(11, 23, 6, 1, HEART)}
      {p(12, 24, 4, 1, HEART)}
      {p(13, 25, 2, 1, HEART)}

      {/* ── Arms ── */}
      {mood === 'wave' ? (
        <>
          {/* left arm raised (waving) */}
          {p(2, 15, 2, 4, WHITE)}
          {p(1, 13, 2, 3, WHITE)}
          {/* right arm down */}
          {p(24, 20, 2, 5, WHITE)}
          {p(24, 24, 2, 1, SHADE)}
        </>
      ) : (
        <>
          {p(2, 20, 2, 5, WHITE)}
          {p(2, 24, 2, 1, SHADE)}
          {p(24, 20, 2, 5, WHITE)}
          {p(24, 24, 2, 1, SHADE)}
        </>
      )}

      {/* ── Feet ── */}
      {p(8, 28, 4, 2, WHITE)}
      {p(16, 28, 4, 2, WHITE)}
      {p(8, 30, 4, 1, SHADE)}
      {p(16, 30, 4, 1, SHADE)}
    </svg>
  )
}
