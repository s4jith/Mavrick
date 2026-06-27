/**
 * MAVRICK background scene — the fixed pixel-art world behind every screen.
 * Coral-pink sky → teal city. Clouds, crescent moon, stars, floating hearts,
 * a skyline whose side buildings spell PLAN (left) and FOCUS (right), and the
 * cat sitting in the bottom-left corner.
 *
 * This scene is IDENTICAL on every screen — never vary it per page.
 */

// Deterministic star field
const STARS = [
  { x: '12%', y: '6%', s: 3 }, { x: '24%', y: '14%', s: 2 },
  { x: '40%', y: '5%', s: 2 }, { x: '58%', y: '10%', s: 3 },
  { x: '72%', y: '6%', s: 2 }, { x: '85%', y: '16%', s: 2 },
  { x: '8%', y: '22%', s: 2 }, { x: '92%', y: '26%', s: 3 },
  { x: '33%', y: '20%', s: 2 }, { x: '66%', y: '22%', s: 2 },
]

function Heart({ x, y, s = 10 }: { x: string; y: string; s?: number }) {
  return (
    <svg
      style={{ position: 'absolute', left: x, top: y, imageRendering: 'pixelated' }}
      width={s} height={s} viewBox="0 0 8 8" aria-hidden="true"
    >
      <rect x="1" y="1" width="2" height="1" fill="#E85080" />
      <rect x="5" y="1" width="2" height="1" fill="#E85080" />
      <rect x="0" y="2" width="8" height="2" fill="#E85080" />
      <rect x="1" y="4" width="6" height="1" fill="#E85080" />
      <rect x="2" y="5" width="4" height="1" fill="#E85080" />
      <rect x="3" y="6" width="2" height="1" fill="#E85080" />
    </svg>
  )
}

function SideLetters({ side, letters }: { side: 'left' | 'right'; letters: string }) {
  return (
    <div className={`mvk-side-letters mvk-side-${side}`} aria-hidden="true">
      {letters.split('').map((ch, i) => (
        <span key={i}>{ch}</span>
      ))}
    </div>
  )
}

export function PixelScene() {
  return (
    <div className="mvk-bg" aria-hidden="true">
      {/* Sky gradient handled in CSS (.mvk-bg) */}

      {/* Crescent moon (top-right) */}
      <svg className="mvk-moon" width="34" height="40" viewBox="0 0 17 20" aria-hidden="true">
        <rect x="6" y="1" width="6" height="2" fill="#F8E8A0" />
        <rect x="3" y="3" width="5" height="2" fill="#F8E8A0" />
        <rect x="2" y="5" width="4" height="3" fill="#F8E8A0" />
        <rect x="1" y="8" width="3" height="4" fill="#F8E8A0" />
        <rect x="2" y="12" width="4" height="3" fill="#F8E8A0" />
        <rect x="3" y="15" width="5" height="2" fill="#F8E8A0" />
        <rect x="6" y="17" width="6" height="2" fill="#F8E8A0" />
      </svg>

      {/* Clouds */}
      <div className="mvk-cloud mvk-cloud-1" />
      <div className="mvk-cloud mvk-cloud-2" />
      <div className="mvk-cloud mvk-cloud-3" />

      {/* Stars */}
      {STARS.map((st, i) => (
        <div
          key={i}
          className="mvk-star"
          style={{ left: st.x, top: st.y, width: st.s, height: st.s }}
        />
      ))}

      {/* Floating hearts */}
      <Heart x="18%" y="30%" s={11} />
      <Heart x="80%" y="34%" s={9} />
      <Heart x="50%" y="3%" s={8} />

      {/* Side building lettering */}
      <SideLetters side="left" letters="PLAN" />
      <SideLetters side="right" letters="FOCUS" />

      {/* Skyline + cat anchored to bottom */}
      <svg
        className="mvk-skyline"
        viewBox="0 0 200 80"
        preserveAspectRatio="xMidYMax slice"
        aria-hidden="true"
      >
        {/* far buildings */}
        <g fill="#123243">
          <rect x="0" y="40" width="22" height="40" />
          <rect x="26" y="30" width="16" height="50" />
          <rect x="60" y="46" width="20" height="34" />
          <rect x="120" y="44" width="18" height="36" />
          <rect x="158" y="32" width="18" height="48" />
          <rect x="180" y="42" width="20" height="38" />
        </g>
        {/* near buildings */}
        <g fill="#0C2330">
          <rect x="14" y="22" width="20" height="58" />
          <rect x="44" y="48" width="18" height="32" />
          <rect x="78" y="36" width="22" height="44" />
          <rect x="100" y="50" width="20" height="30" />
          <rect x="136" y="26" width="22" height="54" />
          <rect x="172" y="20" width="16" height="60" />
        </g>
        {/* lit windows */}
        <g fill="#F2C84B" opacity="0.85">
          <rect x="18" y="28" width="2" height="2" /><rect x="24" y="28" width="2" height="2" />
          <rect x="18" y="34" width="2" height="2" /><rect x="24" y="34" width="2" height="2" />
          <rect x="18" y="40" width="2" height="2" /><rect x="24" y="40" width="2" height="2" />
          <rect x="83" y="42" width="2" height="2" /><rect x="89" y="42" width="2" height="2" /><rect x="95" y="42" width="2" height="2" />
          <rect x="83" y="48" width="2" height="2" /><rect x="89" y="48" width="2" height="2" /><rect x="95" y="48" width="2" height="2" />
          <rect x="140" y="32" width="2" height="2" /><rect x="146" y="32" width="2" height="2" /><rect x="152" y="32" width="2" height="2" />
          <rect x="140" y="38" width="2" height="2" /><rect x="146" y="38" width="2" height="2" /><rect x="152" y="38" width="2" height="2" />
          <rect x="140" y="44" width="2" height="2" /><rect x="146" y="44" width="2" height="2" /><rect x="152" y="44" width="2" height="2" />
          <rect x="176" y="26" width="2" height="2" /><rect x="182" y="26" width="2" height="2" />
          <rect x="176" y="32" width="2" height="2" /><rect x="182" y="32" width="2" height="2" />
        </g>
        {/* ground */}
        <rect x="0" y="74" width="200" height="6" fill="#081A24" />
      </svg>

      {/* Cat silhouette — bottom-left, always present */}
      <svg className="mvk-cat" width="40" height="34" viewBox="0 0 20 17" aria-hidden="true">
        {/* ears */}
        <rect x="2" y="1" width="2" height="3" fill="#081A24" />
        <rect x="7" y="1" width="2" height="3" fill="#081A24" />
        {/* head */}
        <rect x="1" y="3" width="9" height="6" fill="#081A24" />
        {/* body */}
        <rect x="1" y="9" width="13" height="6" fill="#081A24" />
        {/* tail */}
        <rect x="14" y="6" width="2" height="9" fill="#081A24" />
        <rect x="16" y="6" width="2" height="3" fill="#081A24" />
        {/* eyes */}
        <rect x="3" y="5" width="2" height="1" fill="#F2C84B" />
        <rect x="6" y="5" width="2" height="1" fill="#F2C84B" />
      </svg>
    </div>
  )
}
