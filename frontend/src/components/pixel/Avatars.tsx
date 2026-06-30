/**
 * MAVRICK player avatars — pixel-art character portraits the user picks from.
 * 8 characters (4 men, 4 women) with varied skin tones, hair and outfits, drawn
 * parametrically on a 16×16 grid so they stay crisp at any size. The chosen id
 * is saved to Firestore settings ({ avatar: id }) via `useAvatar`, so the same
 * face appears on every screen and survives refreshes / new devices.
 */
import { useCallback, useEffect, useState } from 'react'
import { getSettings, putSettings } from '../../api'

export type AvatarId =
  | 'alex' | 'finn' | 'ravi' | 'kojo'      // men
  | 'mira' | 'ella' | 'zoe'  | 'nina'      // women

type HairStyle = 'short' | 'spiky' | 'long' | 'bob' | 'ponytail'

interface Params {
  id: AvatarId
  label: string
  sex: 'M' | 'F'
  bg: string
  skin: string
  skinShade: string
  hair: string
  top: string
  style: HairStyle
}

const PALETTE = {
  bgWarm: '#23384A',
  bgCool: '#2A3A52',
  bgPlum: '#34293F',
}

const DEFS: Params[] = [
  { id: 'alex', label: 'ALEX', sex: 'M', bg: PALETTE.bgWarm, skin: '#F0C49C', skinShade: '#D9A878', hair: '#2A2438', top: '#E85D50', style: 'short' },
  { id: 'finn', label: 'FINN', sex: 'M', bg: PALETTE.bgCool, skin: '#F2CBA4', skinShade: '#DCAE80', hair: '#E0B84C', top: '#4361EE', style: 'spiky' },
  { id: 'ravi', label: 'RAVI', sex: 'M', bg: PALETTE.bgWarm, skin: '#C68642', skinShade: '#A86A30', hair: '#1B1B2A', top: '#2A8090', style: 'short' },
  { id: 'kojo', label: 'KOJO', sex: 'M', bg: PALETTE.bgCool, skin: '#8D5524', skinShade: '#6E3F18', hair: '#15131F', top: '#3FA776', style: 'spiky' },
  { id: 'mira', label: 'MIRA', sex: 'F', bg: PALETTE.bgPlum, skin: '#F0C49C', skinShade: '#D9A878', hair: '#2A2438', top: '#E06C9A', style: 'long' },
  { id: 'ella', label: 'ELLA', sex: 'F', bg: PALETTE.bgCool, skin: '#F2CBA4', skinShade: '#DCAE80', hair: '#E0B84C', top: '#6B4AA0', style: 'long' },
  { id: 'zoe',  label: 'ZOE',  sex: 'F', bg: PALETTE.bgWarm, skin: '#D9A066', skinShade: '#B97E40', hair: '#6B4226', top: '#E85D50', style: 'bob' },
  { id: 'nina', label: 'NINA', sex: 'F', bg: PALETTE.bgPlum, skin: '#C68642', skinShade: '#A86A30', hair: '#1B1B2A', top: '#2A8090', style: 'ponytail' },
]

export const AVATAR_IDS: AvatarId[] = DEFS.map(d => d.id)
export const DEFAULT_AVATAR: AvatarId = 'alex'

export function avatarLabel(id: AvatarId): string {
  return DEFS.find(d => d.id === id)?.label ?? 'ALEX'
}

function R({ x, y, w, h, f }: { x: number; y: number; w: number; h: number; f: string }) {
  return <rect x={x} y={y} width={w} height={h} fill={f} />
}

function Portrait({ p }: { p: Params }) {
  const { bg, skin, skinShade, hair, top, style } = p
  const longHair = style === 'long' || style === 'bob'
  const eye = '#22303E'
  return (
    <>
      {/* background */}
      <R x={0} y={0} w={16} h={16} f={bg} />

      {/* long hair behind head + shoulders */}
      {longHair && <R x={2} y={3} w={12} h={style === 'long' ? 12 : 9} f={hair} />}

      {/* shoulders / clothing */}
      <R x={2} y={12} w={12} h={4} f={top} />
      <R x={3} y={11} w={2} h={2} f={top} />
      <R x={11} y={11} w={2} h={2} f={top} />
      {/* collar */}
      <R x={7} y={12} w={2} h={1} f={skinShade} />

      {/* neck */}
      <R x={7} y={10} w={2} h={2} f={skinShade} />

      {/* face */}
      <R x={5} y={4} w={6} h={7} f={skin} />
      {/* ears */}
      <R x={4} y={6} w={1} h={2} f={skin} />
      <R x={11} y={6} w={1} h={2} f={skin} />
      {/* jaw shading */}
      <R x={5} y={10} w={6} h={1} f={skinShade} />

      {/* hair on top by style */}
      {style === 'short' && (
        <>
          <R x={4} y={2} w={8} h={2} f={hair} />
          <R x={4} y={4} w={1} h={2} f={hair} />
          <R x={11} y={4} w={1} h={2} f={hair} />
          <R x={5} y={3} w={6} h={1} f={hair} />
        </>
      )}
      {style === 'spiky' && (
        <>
          <R x={5} y={1} w={1} h={1} f={hair} />
          <R x={7} y={1} w={1} h={1} f={hair} />
          <R x={9} y={1} w={1} h={1} f={hair} />
          <R x={4} y={2} w={8} h={2} f={hair} />
          <R x={4} y={4} w={1} h={1} f={hair} />
          <R x={11} y={4} w={1} h={1} f={hair} />
        </>
      )}
      {style === 'long' && (
        <>
          <R x={4} y={2} w={8} h={3} f={hair} />
          <R x={3} y={4} w={2} h={9} f={hair} />
          <R x={11} y={4} w={2} h={9} f={hair} />
          <R x={5} y={4} w={6} h={1} f={hair} />
        </>
      )}
      {style === 'bob' && (
        <>
          <R x={4} y={2} w={8} h={3} f={hair} />
          <R x={3} y={4} w={2} h={5} f={hair} />
          <R x={11} y={4} w={2} h={5} f={hair} />
          <R x={5} y={4} w={6} h={1} f={hair} />
        </>
      )}
      {style === 'ponytail' && (
        <>
          <R x={4} y={2} w={8} h={2} f={hair} />
          <R x={5} y={3} w={6} h={1} f={hair} />
          <R x={4} y={4} w={1} h={1} f={hair} />
          <R x={11} y={4} w={1} h={1} f={hair} />
          {/* tail */}
          <R x={12} y={4} w={2} h={6} f={hair} />
          <R x={13} y={9} w={1} h={2} f={hair} />
        </>
      )}

      {/* brows */}
      <R x={6} y={6} w={1} h={1} f={hair} />
      <R x={9} y={6} w={1} h={1} f={hair} />
      {/* eyes */}
      <R x={6} y={7} w={1} h={1} f={eye} />
      <R x={9} y={7} w={1} h={1} f={eye} />
      {/* mouth */}
      <R x={7} y={9} w={2} h={1} f="#B5564B" />
    </>
  )
}

export function PlayerAvatar({
  id = DEFAULT_AVATAR,
  size = 64,
  framed = false,
}: { id?: AvatarId; size?: number; framed?: boolean }) {
  const p = DEFS.find(d => d.id === id) ?? DEFS[0]
  const svg = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      style={{ imageRendering: 'pixelated', display: 'block' }}
      aria-hidden="true"
    >
      <Portrait p={p} />
    </svg>
  )
  if (!framed) return svg
  return <span className="mvk-avatar-framed">{svg}</span>
}

export function AvatarGrid({
  selected,
  onSelect,
}: {
  selected: AvatarId
  onSelect: (id: AvatarId) => void
}) {
  return (
    <div className="mvk-avatar-grid">
      {DEFS.map(d => (
        <button
          key={d.id}
          type="button"
          className={`mvk-avatar-opt ${selected === d.id ? 'active' : ''}`}
          onClick={() => onSelect(d.id)}
          aria-pressed={selected === d.id}
          title={`${d.label} (${d.sex === 'M' ? 'Male' : 'Female'})`}
        >
          <PlayerAvatar id={d.id} size={46} />
          <span className="mvk-avatar-opt-label">{d.label}</span>
        </button>
      ))}
    </div>
  )
}

/**
 * Shared avatar state. Loads the saved avatar from Firestore settings on mount
 * and persists changes. Every page that shows the user's face uses this so the
 * selection stays consistent across the whole app.
 */
export function useAvatar() {
  const [avatar, setAvatarState] = useState<AvatarId>(DEFAULT_AVATAR)

  useEffect(() => {
    getSettings()
      .then(s => {
        if (typeof s.avatar === 'string' && AVATAR_IDS.includes(s.avatar as AvatarId)) {
          setAvatarState(s.avatar as AvatarId)
        }
      })
      .catch(() => { /* offline / not signed in */ })
  }, [])

  const setAvatar = useCallback((id: AvatarId) => {
    setAvatarState(id)
    putSettings({ avatar: id }).catch(() => { /* best-effort */ })
  }, [])

  return { avatar, setAvatar }
}
