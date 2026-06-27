/**
 * Small provider brand tiles (Gmail, Google, Microsoft, Outlook, Drive).
 * Per the design system, brand marks keep their real colors (not pixel-art)
 * but sit on the same small rounded tile used everywhere else.
 */
type Provider = 'gmail' | 'google' | 'microsoft' | 'outlook' | 'drive'

export function BrandMark({ provider, size = 24 }: { provider: Provider; size?: number }) {
  const tile = (bg: string, content: React.ReactNode, border = 'rgba(0,0,0,0.12)') => (
    <span
      style={{
        width: size, height: size, borderRadius: 5, background: bg,
        border: `1px solid ${border}`, display: 'grid', placeItems: 'center',
        flexShrink: 0, fontFamily: "'Press Start 2P', cursive",
        fontSize: Math.round(size * 0.42), lineHeight: 1,
      }}
    >
      {content}
    </span>
  )

  switch (provider) {
    case 'gmail':   return tile('#fff', <span style={{ color: '#EA4335' }}>M</span>)
    case 'google':  return tile('#fff', <span style={{ color: '#4285F4' }}>G</span>)
    case 'outlook': return tile('#0F6CBD', <span style={{ color: '#fff' }}>O</span>, '#0A4E8A')
    case 'drive':   return tile('#fff', <span style={{ color: '#00AC47', fontSize: Math.round(size * 0.5) }}>▲</span>)
    case 'microsoft':
      return (
        <span style={{ width: size, height: size, display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 1, flexShrink: 0 }}>
          <span style={{ background: '#F25022' }} />
          <span style={{ background: '#7FBA00' }} />
          <span style={{ background: '#00A4EF' }} />
          <span style={{ background: '#FFB900' }} />
        </span>
      )
  }
}
