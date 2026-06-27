import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './context/AuthContext'
import { Landing } from './pages/Landing'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { AuthCallback } from './pages/AuthCallback'
import { HomeDashboard } from './pages/HomeDashboard'
import { PanicMode } from './pages/PanicMode'
import { AIRescuePlan } from './pages/AIRescuePlan'
import { ExecutionMode } from './pages/ExecutionMode'
import { Onboarding } from './pages/Onboarding'
import { ConnectDigitalLife } from './pages/ConnectDigitalLife'
import { Insights } from './pages/Insights'
import { Calendar } from './pages/Calendar'
import { Profile } from './pages/Profile'
import { Reminders } from './pages/Reminders'
import { Settings } from './pages/Settings'
import { Admin } from './pages/Admin'
import './App.css'

import type { ReactNode } from 'react'

function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AdminGuard() {
  const { isAuthenticated, isAdmin } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/app" replace />
  return <Admin />
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* Onboarding flow (pixel shell, no bottom nav) */}
            <Route path="/onboarding" element={<RequireAuth><Onboarding /></RequireAuth>} />
            <Route path="/connect" element={<RequireAuth><ConnectDigitalLife /></RequireAuth>} />

            {/* Reference pixel shell screens (bottom nav, no sidebar) */}
            <Route path="/app" element={<RequireAuth><HomeDashboard /></RequireAuth>} />
            <Route path="/app/plan" element={<RequireAuth><PanicMode /></RequireAuth>} />
            <Route path="/app/rescue" element={<RequireAuth><AIRescuePlan /></RequireAuth>} />
            <Route path="/app/execute" element={<RequireAuth><ExecutionMode /></RequireAuth>} />
            <Route path="/app/calendar" element={<RequireAuth><Calendar /></RequireAuth>} />
            <Route path="/app/profile" element={<RequireAuth><Profile /></RequireAuth>} />
            <Route path="/app/insights" element={<RequireAuth><Insights /></RequireAuth>} />
            <Route path="/app/reminders" element={<RequireAuth><Reminders /></RequireAuth>} />
            <Route path="/app/settings" element={<RequireAuth><Settings /></RequireAuth>} />

            {/* Admin — own layout */}
            <Route path="/admin" element={<AdminGuard />} />
          </Routes>
        </AnimatePresence>
      </Router>
    </AuthProvider>
  )
}

export default App
