/**
 * Hand-drawn 24×40 pixel art character — a panicked person turning their
 * crisis into a plan. Each rect is one "pixel" on the grid.
 */

interface Props { size?: number }

export function PanickedAvatar({ size = 120 }: Props) {
  const h = Math.round(size * 40 / 24)
  // Helper: rect shorthand
  const p = (x: number, y: number, w: number, h: number, fill: string) => (
    <rect key={`${x}-${y}`} x={x} y={y} width={w} height={h} fill={fill} />
  )

  const SKIN  = '#f4c87a'
  const HAIR  = '#6b3a1f'
  const SHIRT = '#f0f0f8'
  const PANTS = '#3b6ec8'
  const SHOE  = '#1a1a2e'
  const BLUE  = '#5bc8f5'
  const PURP  = '#a855f7'
  const PINK  = '#f0507a'

  return (
    <svg
      width={size}
      height={h}
      viewBox="0 0 24 40"
      style={{ imageRendering: 'pixelated', display: 'block' }}
      aria-hidden="true"
    >
      {/* ── Exclamation marks (panic symbols) ── */}
      {p(1,  0, 2, 5, PINK)}
      {p(1,  6, 2, 2, PINK)}
      {p(21, 0, 2, 5, PURP)}
      {p(21, 6, 2, 2, PURP)}

      {/* ── Sweat drops ── */}
      {p(18, 8,  2, 3, BLUE)}
      {p(19, 11, 1, 1, BLUE)}
      {p(4,  10, 2, 3, BLUE)}
      {p(4,  13, 1, 1, BLUE)}

      {/* ── Hair ── */}
      {p(7,  4, 10, 2, HAIR)}
      {p(6,  5, 12, 3, HAIR)}
      {p(5,  6,  2, 2, HAIR)}
      {p(17, 6,  2, 2, HAIR)}

      {/* ── Head / face ── */}
      {p(6,  7, 12, 8, SKIN)}
      {p(5,  8,  1, 6, SKIN)}
      {p(18, 8,  1, 6, SKIN)}

      {/* Worried eyes (wide open) */}
      {p(8,  9, 2, 3, '#1a0a00')}
      {p(14, 9, 2, 3, '#1a0a00')}
      {/* Eye whites */}
      {p(8,  9, 1, 1, 'white')}
      {p(14, 9, 1, 1, 'white')}

      {/* Worried mouth (open O shape) */}
      {p(9,  13, 6, 1, '#1a0a00')}
      {p(8,  14, 1, 1, '#1a0a00')}
      {p(15, 14, 1, 1, '#1a0a00')}
      {p(9,  15, 6, 1, '#1a0a00')}
      {/* Inside mouth */}
      {p(9,  14, 6, 1, '#5a0020')}

      {/* ── Neck ── */}
      {p(10, 15, 4, 2, SKIN)}

      {/* ── Body / shirt ── */}
      {p(6, 17, 12, 10, SHIRT)}
      {p(5, 18,  1,  8, SHIRT)}
      {p(18,18,  1,  8, SHIRT)}

      {/* Left arm raised in panic */}
      {p(2, 17, 3, 2, SKIN)}
      {p(1, 16, 2, 3, SKIN)}
      {p(0, 14, 2, 3, SKIN)}
      {p(1, 13, 2, 2, SKIN)}

      {/* Right arm raised */}
      {p(19, 17, 3, 2, SKIN)}
      {p(21, 16, 2, 3, SKIN)}
      {p(22, 14, 2, 3, SKIN)}
      {p(21, 13, 2, 2, SKIN)}

      {/* Shirt collar */}
      {p(10, 17, 4, 1, '#d0d0e0')}

      {/* ── Legs / pants ── */}
      {p(7,  27, 4, 8, PANTS)}
      {p(13, 27, 4, 8, PANTS)}
      {p(6,  27, 1, 6, PANTS)}
      {p(17, 27, 1, 6, PANTS)}

      {/* Crotch gap */}
      {p(11, 27, 2, 4, SHOE)}

      {/* ── Shoes ── */}
      {p(5,  35, 7, 3, SHOE)}
      {p(4,  36, 1, 2, SHOE)}
      {p(12, 35, 7, 3, SHOE)}
      {p(19, 36, 1, 2, SHOE)}
    </svg>
  )
}

/** Calm version used in the plan success state */
export function CalmAvatar({ size = 80 }: Props) {
  const h = Math.round(size * 40 / 24)
  const p = (x: number, y: number, w: number, h: number, fill: string) => (
    <rect key={`${x}-${y}`} x={x} y={y} width={w} height={h} fill={fill} />
  )

  const SKIN  = '#f4c87a'
  const HAIR  = '#6b3a1f'
  const SHIRT = '#4ade80'  // green shirt = calm!
  const PANTS = '#3b6ec8'
  const SHOE  = '#1a1a2e'
  const STAR  = '#f9a825'

  return (
    <svg
      width={size}
      height={h}
      viewBox="0 0 24 40"
      style={{ imageRendering: 'pixelated', display: 'block' }}
      aria-hidden="true"
    >
      {/* Stars */}
      {p(0, 2, 2, 2, STAR)}
      {p(22, 2, 2, 2, STAR)}
      {p(1, 0, 1, 1, STAR)}
      {p(23, 0, 1, 1, STAR)}

      {/* Hair */}
      {p(7,  4, 10, 2, HAIR)}
      {p(6,  5, 12, 3, HAIR)}

      {/* Head */}
      {p(6, 7, 12, 8, SKIN)}
      {p(5, 8,  1, 6, SKIN)}
      {p(18,8,  1, 6, SKIN)}

      {/* Happy eyes (narrow, smiling) */}
      {p(8,  10, 3, 1, '#1a0a00')}
      {p(13, 10, 3, 1, '#1a0a00')}

      {/* Big smile */}
      {p(8,  13, 1, 1, '#1a0a00')}
      {p(9,  14, 6, 1, '#1a0a00')}
      {p(15, 13, 1, 1, '#1a0a00')}

      {/* Neck */}
      {p(10, 15, 4, 2, SKIN)}

      {/* Body */}
      {p(6, 17, 12, 10, SHIRT)}
      {p(5, 18,  1,  8, SHIRT)}
      {p(18,18,  1,  8, SHIRT)}

      {/* Arms relaxed */}
      {p(2, 20, 3, 5, SKIN)}
      {p(19,20, 3, 5, SKIN)}

      {/* Legs */}
      {p(7,  27, 4, 8, PANTS)}
      {p(13, 27, 4, 8, PANTS)}
      {p(11, 27, 2, 4, SHOE)}

      {/* Shoes */}
      {p(5,  35, 7, 3, SHOE)}
      {p(12, 35, 7, 3, SHOE)}
    </svg>
  )
}
