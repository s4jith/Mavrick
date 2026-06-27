/**
 * Pixel-art SVG icons drawn on a 16×16 pixel grid.
 * Each rect is one "pixel". Colors inherit from `currentColor`.
 * Use: <MicIcon size={20} /> or <MicIcon size={20} color="#f0507a" />
 */

interface IconProps {
  size?: number
  color?: string
  className?: string
}

const ic = (viewBox: string, paths: React.ReactNode) =>
  function Icon({ size = 16, color = 'currentColor', className = '' }: IconProps) {
    return (
      <svg
        width={size}
        height={size}
        viewBox={viewBox}
        fill={color}
        style={{ imageRendering: 'pixelated', display: 'block', flexShrink: 0 }}
        className={className}
        aria-hidden="true"
      >
        {paths}
      </svg>
    )
  }

/* ─── Mic ─────────────────────────────────── */
export const MicIcon = ic('0 0 16 16', <>
  <rect x="5" y="0" width="6" height="1" />
  <rect x="4" y="1" width="8" height="7" />
  <rect x="3" y="3" width="1" height="5" />
  <rect x="12" y="3" width="1" height="5" />
  <rect x="4" y="8" width="8" height="1" />
  <rect x="5" y="9" width="6" height="1" />
  <rect x="2" y="8" width="2" height="3" />
  <rect x="12" y="8" width="2" height="3" />
  <rect x="2" y="11" width="12" height="1" />
  <rect x="7" y="12" width="2" height="3" />
  <rect x="5" y="15" width="6" height="1" />
</>)

/* ─── Mic Off ─────────────────────────────── */
export const MicOffIcon = ic('0 0 16 16', <>
  <rect x="5" y="0" width="6" height="1" />
  <rect x="4" y="1" width="8" height="7" />
  <rect x="5" y="9" width="6" height="1" />
  <rect x="2" y="11" width="12" height="1" />
  <rect x="7" y="12" width="2" height="3" />
  <rect x="5" y="15" width="6" height="1" />
  {/* X mark */}
  <rect x="0" y="13" width="2" height="2" />
  <rect x="2" y="11" width="2" height="2" />
  <rect x="4" y="9" width="2" height="2" />
  <rect x="10" y="9" width="2" height="2" />
  <rect x="12" y="11" width="2" height="2" />
  <rect x="14" y="13" width="2" height="2" />
</>)

/* ─── Speaker / Volume ────────────────────── */
export const SpeakerIcon = ic('0 0 16 16', <>
  <rect x="0" y="5" width="4" height="6" />
  <rect x="4" y="3" width="2" height="10" />
  <rect x="6" y="1" width="2" height="14" />
  <rect x="10" y="4" width="2" height="1" />
  <rect x="11" y="5" width="2" height="6" />
  <rect x="10" y="11" width="2" height="1" />
  <rect x="13" y="2" width="2" height="1" />
  <rect x="14" y="3" width="1" height="10" />
  <rect x="13" y="13" width="2" height="1" />
</>)

/* ─── Trophy ──────────────────────────────── */
export const TrophyIcon = ic('0 0 16 16', <>
  <rect x="3" y="0" width="10" height="1" />
  <rect x="2" y="1" width="12" height="6" />
  <rect x="1" y="1" width="2" height="4" />
  <rect x="13" y="1" width="2" height="4" />
  <rect x="1" y="5" width="2" height="1" />
  <rect x="13" y="5" width="2" height="1" />
  <rect x="3" y="7" width="10" height="1" />
  <rect x="4" y="8" width="8" height="1" />
  <rect x="5" y="9" width="6" height="1" />
  <rect x="6" y="10" width="4" height="1" />
  <rect x="7" y="11" width="2" height="2" />
  <rect x="4" y="13" width="8" height="2" />
  <rect x="3" y="15" width="10" height="1" />
</>)

/* ─── Check ───────────────────────────────── */
export const CheckIcon = ic('0 0 16 16', <>
  <rect x="0" y="8" width="2" height="2" />
  <rect x="2" y="10" width="2" height="2" />
  <rect x="4" y="12" width="2" height="2" />
  <rect x="6" y="10" width="2" height="2" />
  <rect x="8" y="8" width="2" height="2" />
  <rect x="10" y="6" width="2" height="2" />
  <rect x="12" y="4" width="2" height="2" />
  <rect x="14" y="2" width="2" height="2" />
</>)

/* ─── Lightning / Zap ────────────────────── */
export const ZapIcon = ic('0 0 16 16', <>
  <rect x="9" y="0" width="5" height="1" />
  <rect x="7" y="1" width="5" height="1" />
  <rect x="5" y="2" width="5" height="1" />
  <rect x="4" y="3" width="5" height="1" />
  <rect x="3" y="4" width="8" height="1" />
  <rect x="2" y="5" width="8" height="1" />
  <rect x="6" y="6" width="5" height="1" />
  <rect x="5" y="7" width="5" height="1" />
  <rect x="4" y="8" width="5" height="1" />
  <rect x="3" y="9" width="5" height="1" />
  <rect x="2" y="10" width="5" height="1" />
  <rect x="1" y="11" width="5" height="1" />
  <rect x="0" y="12" width="5" height="1" />
</>)

/* ─── Warning / Alert ────────────────────── */
export const WarningIcon = ic('0 0 16 16', <>
  <rect x="7" y="0" width="2" height="1" />
  <rect x="6" y="1" width="4" height="1" />
  <rect x="5" y="2" width="6" height="1" />
  <rect x="4" y="3" width="8" height="1" />
  <rect x="3" y="4" width="10" height="1" />
  <rect x="2" y="5" width="12" height="1" />
  <rect x="1" y="6" width="14" height="1" />
  <rect x="0" y="7" width="16" height="1" />
  <rect x="0" y="8" width="16" height="1" />
  <rect x="1" y="9" width="14" height="1" />
  <rect x="2" y="10" width="12" height="1" />
  <rect x="3" y="11" width="10" height="1" />
  <rect x="4" y="12" width="8" height="1" />
  <rect x="5" y="13" width="6" height="1" />
  <rect x="6" y="14" width="4" height="1" />
  <rect x="7" y="15" width="2" height="1" />
  {/* Exclamation inside */}
  <rect x="7" y="4" width="2" height="5" fill="var(--bg-primary)" />
  <rect x="7" y="11" width="2" height="2" fill="var(--bg-primary)" />
</>)

/* ─── Play ────────────────────────────────── */
export const PlayIcon = ic('0 0 16 16', <>
  <rect x="2" y="0" width="2" height="16" />
  <rect x="4" y="1" width="2" height="14" />
  <rect x="6" y="2" width="2" height="12" />
  <rect x="8" y="3" width="2" height="10" />
  <rect x="10" y="4" width="2" height="8" />
  <rect x="12" y="5" width="2" height="6" />
  <rect x="14" y="6" width="2" height="4" />
</>)

/* ─── Timer ───────────────────────────────── */
export const TimerIcon = ic('0 0 16 16', <>
  <rect x="5" y="0" width="6" height="1" />
  <rect x="3" y="1" width="10" height="2" />
  <rect x="2" y="3" width="12" height="10" />
  <rect x="1" y="4" width="1" height="8" />
  <rect x="14" y="4" width="1" height="8" />
  <rect x="2" y="13" width="12" height="2" />
  <rect x="3" y="15" width="10" height="1" />
  {/* Clock hands */}
  <rect x="7" y="5" width="2" height="4" fill="var(--bg-primary)" />
  <rect x="8" y="9" width="3" height="2" fill="var(--bg-primary)" />
</>)

/* ─── User / Person ──────────────────────── */
export const UserIcon = ic('0 0 16 16', <>
  <rect x="5" y="0" width="6" height="1" />
  <rect x="4" y="1" width="8" height="6" />
  <rect x="3" y="2" width="1" height="4" />
  <rect x="12" y="2" width="1" height="4" />
  <rect x="4" y="7" width="8" height="1" />
  <rect x="5" y="8" width="6" height="1" />
  <rect x="3" y="9" width="10" height="1" />
  <rect x="1" y="10" width="14" height="6" />
</>)

/* ─── Shield / Admin ─────────────────────── */
export const ShieldIcon = ic('0 0 16 16', <>
  <rect x="3" y="0" width="10" height="1" />
  <rect x="2" y="1" width="12" height="1" />
  <rect x="1" y="2" width="14" height="8" />
  <rect x="0" y="3" width="1" height="6" />
  <rect x="15" y="3" width="1" height="6" />
  <rect x="1" y="10" width="14" height="2" />
  <rect x="2" y="12" width="12" height="1" />
  <rect x="3" y="13" width="10" height="1" />
  <rect x="5" y="14" width="6" height="1" />
  <rect x="7" y="15" width="2" height="1" />
  {/* Check inside */}
  <rect x="4" y="6" width="2" height="2" fill="var(--bg-primary)" />
  <rect x="6" y="8" width="2" height="2" fill="var(--bg-primary)" />
  <rect x="8" y="6" width="2" height="2" fill="var(--bg-primary)" />
  <rect x="10" y="4" width="2" height="2" fill="var(--bg-primary)" />
</>)

/* ─── Chart / Stats ──────────────────────── */
export const ChartIcon = ic('0 0 16 16', <>
  <rect x="0" y="14" width="16" height="2" />
  <rect x="0" y="0" width="2" height="16" />
  <rect x="3" y="8" width="3" height="6" />
  <rect x="7" y="4" width="3" height="10" />
  <rect x="11" y="6" width="3" height="8" />
</>)

/* ─── Users list ─────────────────────────── */
export const UsersIcon = ic('0 0 16 16', <>
  {/* Person 1 */}
  <rect x="0" y="1" width="5" height="4" />
  <rect x="0" y="5" width="7" height="4" />
  {/* Person 2 */}
  <rect x="6" y="0" width="5" height="4" />
  <rect x="4" y="4" width="9" height="4" />
  {/* Body row */}
  <rect x="0" y="9" width="16" height="7" />
</>)

/* ─── Home ───────────────────────────────── */
export const HomeIcon = ic('0 0 16 16', <>
  <rect x="7" y="0" width="2" height="1" />
  <rect x="6" y="1" width="4" height="1" />
  <rect x="5" y="2" width="6" height="1" />
  <rect x="4" y="3" width="8" height="1" />
  <rect x="3" y="4" width="10" height="1" />
  <rect x="2" y="5" width="12" height="1" />
  <rect x="1" y="6" width="14" height="1" />
  <rect x="0" y="7" width="16" height="1" />
  <rect x="1" y="8" width="14" height="7" />
  <rect x="1" y="15" width="5" height="1" />
  <rect x="10" y="15" width="5" height="1" />
  {/* Door */}
  <rect x="6" y="10" width="4" height="5" fill="var(--bg-primary)" />
</>)

/* ─── Logout / Exit ──────────────────────── */
export const LogoutIcon = ic('0 0 16 16', <>
  <rect x="0" y="1" width="10" height="14" />
  <rect x="10" y="7" width="6" height="2" />
  <rect x="12" y="5" width="2" height="2" />
  <rect x="12" y="9" width="2" height="2" />
  <rect x="14" y="6" width="2" height="4" />
</>)

/* ─── X / Close ──────────────────────────── */
export const CloseIcon = ic('0 0 16 16', <>
  <rect x="0" y="0" width="2" height="2" />
  <rect x="2" y="2" width="2" height="2" />
  <rect x="4" y="4" width="2" height="2" />
  <rect x="6" y="6" width="2" height="2" />  {/* skip center */}
  <rect x="8" y="8" width="2" height="2" />
  <rect x="10" y="10" width="2" height="2" />
  <rect x="12" y="12" width="2" height="2" />
  <rect x="14" y="14" width="2" height="2" />
  <rect x="14" y="0" width="-12" height="2" />
  <rect x="12" y="2" width="2" height="2" />
  <rect x="10" y="4" width="2" height="2" />
  <rect x="2" y="10" width="2" height="2" />
  <rect x="0" y="12" width="2" height="2" />
  <rect x="0" y="14" width="2" height="2" />
</>)

/* ─── Refresh ────────────────────────────── */
export const RefreshIcon = ic('0 0 16 16', <>
  <rect x="5" y="0" width="6" height="2" />
  <rect x="3" y="2" width="2" height="2" />
  <rect x="1" y="4" width="2" height="6" />
  <rect x="3" y="10" width="2" height="2" />
  <rect x="5" y="12" width="2" height="2" />
  <rect x="7" y="14" width="2" height="2" />
  <rect x="9" y="12" width="4" height="2" />
  <rect x="13" y="4" width="2" height="8" />
  <rect x="11" y="2" width="2" height="2" />
  {/* Arrow tip */}
  <rect x="11" y="0" width="4" height="2" />
  <rect x="13" y="2" width="2" height="4" />
  <rect x="11" y="4" width="2" height="2" />
</>)

/* ─── Database ───────────────────────────── */
export const DatabaseIcon = ic('0 0 16 16', <>
  <rect x="2" y="0" width="12" height="3" />
  <rect x="0" y="1" width="2" height="2" />
  <rect x="14" y="1" width="2" height="2" />
  <rect x="0" y="3" width="16" height="1" />
  <rect x="0" y="4" width="2" height="4" />
  <rect x="14" y="4" width="2" height="4" />
  <rect x="2" y="7" width="12" height="1" />
  <rect x="0" y="8" width="16" height="1" />
  <rect x="0" y="9" width="2" height="4" />
  <rect x="14" y="9" width="2" height="4" />
  <rect x="2" y="12" width="12" height="1" />
  <rect x="0" y="13" width="16" height="1" />
  <rect x="2" y="14" width="12" height="2" />
  <rect x="0" y="14" width="2" height="2" />
  <rect x="14" y="14" width="2" height="2" />
</>)

/* ─── Key ────────────────────────────────── */
export const KeyIcon = ic('0 0 16 16', <>
  <rect x="0" y="5" width="6" height="6" />
  <rect x="6" y="6" width="2" height="4" />
  <rect x="6" y="3" width="2" height="3" />
  <rect x="8" y="3" width="2" height="2" />
  <rect x="8" y="5" width="8" height="6" />
  <rect x="10" y="11" width="2" height="2" />
  <rect x="13" y="11" width="2" height="2" />
  {/* Keyhole */}
  <rect x="2" y="7" width="2" height="2" fill="var(--bg-primary)" />
</>)

/* ─── Flask / Lab ────────────────────────── */
export const FlaskIcon = ic('0 0 16 16', <>
  <rect x="5" y="0" width="6" height="1" />
  <rect x="6" y="1" width="4" height="5" />
  <rect x="5" y="6" width="6" height="1" />
  <rect x="3" y="7" width="10" height="1" />
  <rect x="2" y="8" width="12" height="6" />
  <rect x="1" y="9" width="1" height="4" />
  <rect x="14" y="9" width="1" height="4" />
  <rect x="2" y="14" width="12" height="2" />
  {/* Bubbles */}
  <rect x="5" y="10" width="2" height="2" fill="var(--bg-primary)" />
  <rect x="9" y="12" width="2" height="2" fill="var(--bg-primary)" />
</>)

/* ─── Trash / Delete ─────────────────────── */
export const TrashIcon = ic('0 0 16 16', <>
  <rect x="4" y="0" width="8" height="2" />
  <rect x="2" y="2" width="12" height="1" />
  <rect x="0" y="3" width="16" height="2" />
  <rect x="1" y="5" width="14" height="11" />
  <rect x="0" y="5" width="1" height="11" />
  <rect x="15" y="5" width="1" height="11" />
  {/* Lid handle */}
  <rect x="6" y="0" width="4" height="1" fill="var(--bg-primary)" />
  {/* Inner lines */}
  <rect x="4" y="7" width="2" height="7" fill="var(--bg-primary)" />
  <rect x="7" y="7" width="2" height="7" fill="var(--bg-primary)" />
  <rect x="10" y="7" width="2" height="7" fill="var(--bg-primary)" />
</>)

/* ─── Eye / View ─────────────────────────── */
export const EyeIcon = ic('0 0 16 16', <>
  <rect x="0" y="6" width="4" height="4" />
  <rect x="4" y="4" width="2" height="2" />
  <rect x="4" y="10" width="2" height="2" />
  <rect x="6" y="3" width="4" height="2" />
  <rect x="6" y="11" width="4" height="2" />
  <rect x="10" y="4" width="2" height="2" />
  <rect x="10" y="10" width="2" height="2" />
  <rect x="12" y="6" width="4" height="4" />
  {/* Pupil */}
  <rect x="6" y="6" width="4" height="4" fill="var(--bg-primary)" />
  <rect x="7" y="7" width="2" height="2" />
</>)

/* ─── Activity / Pulse ───────────────────── */
export const ActivityIcon = ic('0 0 16 16', <>
  <rect x="0" y="8" width="3" height="1" />
  <rect x="3" y="6" width="1" height="3" />
  <rect x="4" y="4" width="1" height="5" />
  <rect x="5" y="2" width="1" height="7" />
  <rect x="6" y="5" width="1" height="4" />
  <rect x="7" y="7" width="1" height="2" />
  <rect x="8" y="8" width="1" height="1" />
  <rect x="9" y="3" width="1" height="6" />
  <rect x="10" y="5" width="1" height="4" />
  <rect x="11" y="7" width="1" height="2" />
  <rect x="12" y="8" width="1" height="1" />
  <rect x="13" y="8" width="3" height="1" />
  <rect x="0" y="14" width="16" height="1" />
</>)

/* ─── Menu / Hamburger ───────────────────── */
export const MenuIcon = ic('0 0 16 16', <>
  <rect x="0" y="2" width="16" height="2" />
  <rect x="0" y="7" width="16" height="2" />
  <rect x="0" y="12" width="16" height="2" />
</>)

/* ─── Plus ───────────────────────────────── */
export const PlusIcon = ic('0 0 16 16', <>
  <rect x="6" y="0" width="4" height="6" />
  <rect x="0" y="6" width="16" height="4" />
  <rect x="6" y="10" width="4" height="6" />
</>)

/* ─── Gear / Settings ────────────────────── */
export const GearIcon = ic('0 0 16 16', <>
  {/* Top/bottom teeth */}
  <rect x="6" y="0" width="4" height="2" />
  <rect x="6" y="14" width="4" height="2" />
  {/* Left/right teeth */}
  <rect x="0" y="6" width="2" height="4" />
  <rect x="14" y="6" width="2" height="4" />
  {/* Diagonal teeth */}
  <rect x="2" y="2" width="2" height="2" />
  <rect x="12" y="2" width="2" height="2" />
  <rect x="2" y="12" width="2" height="2" />
  <rect x="12" y="12" width="2" height="2" />
  {/* Outer ring */}
  <rect x="4" y="2" width="8" height="2" />
  <rect x="4" y="12" width="8" height="2" />
  <rect x="2" y="4" width="2" height="8" />
  <rect x="12" y="4" width="2" height="8" />
  {/* Inner ring fill */}
  <rect x="4" y="4" width="8" height="8" />
  {/* Center hole */}
  <rect x="5" y="5" width="6" height="6" fill="var(--bg-primary)" />
  <rect x="6" y="6" width="4" height="4" fill="var(--bg-primary)" />
</>)

/* ─── Bell / Reminder ────────────────────── */
export const BellIcon = ic('0 0 16 16', <>
  {/* Top knob */}
  <rect x="7" y="0" width="2" height="2" />
  {/* Bell curve top */}
  <rect x="4" y="2" width="8" height="1" />
  <rect x="3" y="3" width="10" height="1" />
  {/* Bell body */}
  <rect x="2" y="4" width="12" height="7" />
  <rect x="1" y="5" width="1" height="5" />
  <rect x="14" y="5" width="1" height="5" />
  {/* Bell bottom flare */}
  <rect x="0" y="10" width="16" height="2" />
  {/* Clapper */}
  <rect x="6" y="13" width="4" height="2" />
  <rect x="7" y="15" width="2" height="1" />
</>)

/* ─── Fire / Flame ───────────────────────── */
export const FireIcon = ic('0 0 16 16', <>
  <rect x="7" y="0" width="2" height="2" />
  <rect x="6" y="2" width="3" height="2" />
  <rect x="9" y="3" width="2" height="2" />
  <rect x="5" y="4" width="3" height="3" />
  <rect x="9" y="5" width="3" height="3" />
  <rect x="4" y="7" width="3" height="4" />
  <rect x="10" y="7" width="2" height="4" />
  <rect x="3" y="10" width="10" height="4" />
  <rect x="4" y="14" width="8" height="2" />
</>)

/* ─── Book / Assignment ──────────────────── */
export const BookIcon = ic('0 0 16 16', <>
  {/* Left page */}
  <rect x="1" y="2" width="6" height="12" />
  {/* Right page */}
  <rect x="9" y="2" width="6" height="12" />
  {/* Spine */}
  <rect x="7" y="3" width="2" height="11" />
</>)

/* ─── Briefcase / Interview ──────────────── */
export const BriefcaseIcon = ic('0 0 16 16', <>
  {/* Handle */}
  <rect x="6" y="1" width="4" height="1" />
  <rect x="6" y="2" width="1" height="2" />
  <rect x="9" y="2" width="1" height="2" />
  {/* Case top half */}
  <rect x="1" y="4" width="14" height="4" />
  {/* Case bottom half (gap at y8 = clasp line) */}
  <rect x="1" y="9" width="14" height="5" />
</>)

/* ─── Hourglass / Time Left ──────────────── */
export const HourglassIcon = ic('0 0 16 16', <>
  <rect x="2" y="1" width="12" height="2" />
  <rect x="3" y="3" width="10" height="2" />
  <rect x="5" y="5" width="6" height="2" />
  <rect x="7" y="7" width="2" height="2" />
  <rect x="5" y="9" width="6" height="2" />
  <rect x="3" y="11" width="10" height="2" />
  <rect x="2" y="13" width="12" height="2" />
</>)

/* ─── Calendar / Date ────────────────────── */
export const CalendarIcon = ic('0 0 16 16', <>
  {/* Rings */}
  <rect x="3" y="0" width="2" height="3" />
  <rect x="11" y="0" width="2" height="3" />
  {/* Header bar */}
  <rect x="1" y="2" width="14" height="3" />
  {/* Body */}
  <rect x="1" y="6" width="14" height="9" />
  {/* Date dots (holes) */}
  <rect x="3" y="8" width="2" height="2" fill="var(--mvk-input)" />
  <rect x="7" y="8" width="2" height="2" fill="var(--mvk-input)" />
  <rect x="11" y="8" width="2" height="2" fill="var(--mvk-input)" />
  <rect x="3" y="11" width="2" height="2" fill="var(--mvk-input)" />
  <rect x="7" y="11" width="2" height="2" fill="var(--mvk-input)" />
</>)

/* ─── Siren / Alarm light ────────────────── */
export const SirenIcon = ic('0 0 16 16', <>
  {/* Rays */}
  <rect x="0" y="3" width="2" height="1" />
  <rect x="14" y="3" width="2" height="1" />
  <rect x="2" y="1" width="2" height="1" />
  <rect x="12" y="1" width="2" height="1" />
  <rect x="7" y="0" width="2" height="2" />
  {/* Dome */}
  <rect x="5" y="3" width="6" height="1" />
  <rect x="4" y="4" width="8" height="5" />
  <rect x="3" y="9" width="10" height="2" />
  {/* Base */}
  <rect x="2" y="11" width="12" height="3" />
</>)

/* ─── Search / Magnifier ─────────────────── */
export const SearchIcon = ic('0 0 16 16', <>
  {/* Ring */}
  <rect x="3" y="1" width="5" height="1" />
  <rect x="2" y="2" width="1" height="6" />
  <rect x="8" y="2" width="1" height="6" />
  <rect x="1" y="3" width="1" height="4" />
  <rect x="9" y="3" width="1" height="4" />
  <rect x="3" y="8" width="5" height="1" />
  {/* Handle */}
  <rect x="9" y="9" width="2" height="2" />
  <rect x="11" y="11" width="2" height="2" />
  <rect x="13" y="13" width="2" height="2" />
</>)

/* ─── Image / Picture ────────────────────── */
export const ImageIcon = ic('0 0 16 16', <>
  {/* Frame */}
  <rect x="1" y="2" width="14" height="2" />
  <rect x="1" y="12" width="14" height="2" />
  <rect x="1" y="2" width="2" height="12" />
  <rect x="13" y="2" width="2" height="12" />
  {/* Sun */}
  <rect x="4" y="5" width="2" height="2" />
  {/* Mountains */}
  <rect x="3" y="10" width="3" height="2" />
  <rect x="6" y="8" width="2" height="4" />
  <rect x="8" y="6" width="2" height="6" />
  <rect x="10" y="9" width="3" height="3" />
</>)

/* ─── Lock / Padlock ─────────────────────── */
export const LockIcon = ic('0 0 16 16', <>
  {/* Shackle */}
  <rect x="4" y="1" width="8" height="1" />
  <rect x="3" y="2" width="2" height="4" />
  <rect x="11" y="2" width="2" height="4" />
  {/* Body */}
  <rect x="2" y="6" width="12" height="9" />
  {/* Keyhole */}
  <rect x="7" y="9" width="2" height="3" fill="var(--mvk-input)" />
</>)

/* ─── Mail / Envelope ────────────────────── */
export const MailIcon = ic('0 0 16 16', <>
  <rect x="1" y="3" width="14" height="2" />
  <rect x="1" y="3" width="2" height="10" />
  <rect x="13" y="3" width="2" height="10" />
  <rect x="1" y="11" width="14" height="2" />
  {/* Flap V */}
  <rect x="3" y="5" width="2" height="2" />
  <rect x="5" y="7" width="2" height="2" />
  <rect x="7" y="8" width="2" height="1" />
  <rect x="9" y="7" width="2" height="2" />
  <rect x="11" y="5" width="2" height="2" />
</>)

/* ─── Phone ──────────────────────────────── */
export const PhoneIcon = ic('0 0 16 16', <>
  <rect x="4" y="0" width="8" height="16" />
  {/* Screen */}
  <rect x="5" y="2" width="6" height="11" fill="var(--mvk-input)" />
  {/* Home button */}
  <rect x="7" y="14" width="2" height="1" />
</>)

/* ─── Graduation Cap (Student) ───────────── */
export const GraduationCapIcon = ic('0 0 16 16', <>
  <rect x="6" y="2" width="4" height="1" />
  <rect x="3" y="3" width="10" height="1" />
  <rect x="0" y="4" width="16" height="2" />
  <rect x="3" y="6" width="10" height="1" />
  <rect x="5" y="7" width="6" height="3" />
  {/* Tassel */}
  <rect x="13" y="6" width="1" height="4" />
  <rect x="12" y="10" width="2" height="2" />
</>)

/* ─── Palette (Freelancer) ───────────────── */
export const PaletteIcon = ic('0 0 16 16', <>
  <rect x="3" y="2" width="8" height="1" />
  <rect x="2" y="3" width="11" height="1" />
  <rect x="1" y="4" width="13" height="6" />
  <rect x="2" y="10" width="11" height="1" />
  <rect x="3" y="11" width="6" height="1" />
  {/* Thumb hole */}
  <rect x="9" y="7" width="3" height="3" fill="var(--mvk-input)" />
</>)

/* ─── Alarm Clock ────────────────────────── */
export const AlarmIcon = ic('0 0 16 16', <>
  {/* Bells */}
  <rect x="2" y="0" width="3" height="2" />
  <rect x="11" y="0" width="3" height="2" />
  {/* Feet */}
  <rect x="3" y="13" width="2" height="2" />
  <rect x="11" y="13" width="2" height="2" />
  {/* Body */}
  <rect x="4" y="2" width="8" height="1" />
  <rect x="3" y="3" width="10" height="10" />
  <rect x="2" y="5" width="1" height="6" />
  <rect x="13" y="5" width="1" height="6" />
  {/* Hands */}
  <rect x="7" y="5" width="1" height="3" fill="var(--mvk-input)" />
  <rect x="8" y="7" width="2" height="1" fill="var(--mvk-input)" />
</>)

/* ─── Clipboard ──────────────────────────── */
export const ClipboardIcon = ic('0 0 16 16', <>
  {/* Clip */}
  <rect x="6" y="0" width="4" height="2" />
  {/* Board */}
  <rect x="2" y="1" width="12" height="14" />
  {/* Paper lines */}
  <rect x="4" y="4" width="8" height="1" fill="var(--mvk-input)" />
  <rect x="4" y="7" width="8" height="1" fill="var(--mvk-input)" />
  <rect x="4" y="10" width="6" height="1" fill="var(--mvk-input)" />
</>)

/* ─── Rocket / Execute ───────────────────── */
export const RocketIcon = ic('0 0 16 16', <>
  <rect x="7" y="0" width="2" height="2" />
  <rect x="6" y="2" width="4" height="2" />
  <rect x="5" y="4" width="6" height="5" />
  {/* Fins */}
  <rect x="4" y="6" width="1" height="3" />
  <rect x="11" y="6" width="1" height="3" />
  <rect x="3" y="9" width="2" height="2" />
  <rect x="11" y="9" width="2" height="2" />
  {/* Lower body */}
  <rect x="6" y="9" width="4" height="2" />
  {/* Flame */}
  <rect x="7" y="11" width="2" height="2" />
  <rect x="6" y="13" width="4" height="1" />
  <rect x="7" y="14" width="2" height="2" />
</>)
