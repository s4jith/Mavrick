// Firebase client — single source of truth for Auth + Firestore.
// Config comes from frontend/.env (VITE_FIREBASE_*).
import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const googleProvider = new GoogleAuthProvider()

/** Map raw Firebase auth error codes to friendly, on-brand messages. */
export function firebaseAuthError(err: unknown): string {
  const code = (err as { code?: string })?.code || ''
  switch (code) {
    case 'auth/invalid-email': return 'That email address looks invalid.'
    case 'auth/user-disabled': return 'This account has been disabled.'
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential': return 'Wrong email or password.'
    case 'auth/email-already-in-use': return 'That email is already registered. Try logging in.'
    case 'auth/weak-password': return 'Password is too weak — use at least 6 characters.'
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request': return 'Google sign-in was cancelled.'
    case 'auth/popup-blocked': return 'Your browser blocked the Google popup. Allow popups and retry.'
    case 'auth/network-request-failed': return 'Network error. Check your connection and retry.'
    case 'auth/too-many-requests': return 'Too many attempts. Please wait a moment and retry.'
    default: return (err as { message?: string })?.message || 'Authentication failed. Please try again.'
  }
}
