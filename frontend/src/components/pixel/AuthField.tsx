import { useState } from 'react'
import { EyeIcon } from '../icons/PixelIcons'

interface Props {
  icon: React.ReactNode
  label?: string
  type?: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  password?: boolean
}

/** Cream pixel form field with a coral icon tile (auth + onboarding screens). */
export function AuthField({ icon, label, type = 'text', placeholder, value, onChange, password }: Props) {
  const [show, setShow] = useState(false)
  return (
    <div className="mvk-ifield">
      <span className="mvk-ifield-icon">{icon}</span>
      <div className="mvk-ifield-main">
        {label && <span className="mvk-ifield-label">{label}</span>}
        <input
          className="mvk-ifield-input"
          type={password ? (show ? 'text' : 'password') : type}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
        />
      </div>
      {password && (
        <button type="button" className="mvk-ifield-eye" onClick={() => setShow(s => !s)} aria-label="Toggle password">
          <EyeIcon size={16} color="#6A7F8C" />
        </button>
      )}
    </div>
  )
}
