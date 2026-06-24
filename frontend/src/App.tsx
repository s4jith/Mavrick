import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './context/AuthContext'
import { AppLayout } from './components/AppLayout'
import { Landing } from './pages/Landing'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Dashboard } from './pages/Dashboard'
import { PlanPage } from './pages/PlanPage'
import { Reminders } from './pages/Reminders'
import { Settings } from './pages/Settings'
import { Admin } from './pages/Admin'
import './App.css'

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

            {/* Authenticated app shell */}
            <Route path="/app" element={<AppLayout><Dashboard /></AppLayout>} />
            <Route path="/app/plan" element={<AppLayout><PlanPage /></AppLayout>} />
            <Route path="/app/reminders" element={<AppLayout><Reminders /></AppLayout>} />
            <Route path="/app/settings" element={<AppLayout><Settings /></AppLayout>} />

            {/* Admin — own layout */}
            <Route path="/admin" element={<AdminGuard />} />
          </Routes>
        </AnimatePresence>
      </Router>
    </AuthProvider>
  )
}

export default App
