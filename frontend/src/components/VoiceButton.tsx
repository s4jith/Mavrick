import { useCallback, useEffect, useRef, useState } from 'react'

interface Props {
  onTranscript: (text: string) => void
  disabled?: boolean
}

export function VoiceButton({ onTranscript, disabled }: Props) {
  const [listening, setListening] = useState(false)
  const [supported, setSupported] = useState(true)
  const recognitionRef = useRef<ReturnType<typeof createRecognition> | null>(null)

  useEffect(() => {
    const SR =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) {
      setSupported(false)
    }
  }, [])

  const toggle = useCallback(() => {
    if (listening) {
      recognitionRef.current?.stop()
      setListening(false)
      return
    }

    const recognition = createRecognition()
    if (!recognition) return

    recognitionRef.current = recognition

    recognition.onresult = (event: any) => {
      let transcript = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript
      }
      if (transcript.trim()) {
        onTranscript(transcript.trim())
      }
    }

    recognition.onerror = () => {
      setListening(false)
    }

    recognition.onend = () => {
      setListening(false)
    }

    recognition.start()
    setListening(true)
  }, [listening, onTranscript])

  if (!supported) return null

  return (
    <button
      type="button"
      className={`voice-btn ${listening ? 'recording' : ''}`}
      onClick={toggle}
      disabled={disabled}
      title={listening ? 'Stop recording' : 'Speak your crisis'}
      aria-label={listening ? 'Stop voice input' : 'Start voice input'}
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
      </svg>
      {listening && <span className="voice-pulse" />}
    </button>
  )
}

function createRecognition() {
  const SR =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  if (!SR) return null

  const recognition = new SR()
  recognition.continuous = false
  recognition.interimResults = false
  recognition.lang = 'en-US'
  return recognition
}
