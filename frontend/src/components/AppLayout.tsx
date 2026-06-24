import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Sidebar } from './Sidebar'

interface Props {
  children: React.ReactNode
}

export function AppLayout({ children }: Props) {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated) navigate('/login')
  }, [isAuthenticated, navigate])

  if (!isAuthenticated) return null

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="page-content">
        {children}
      </main>
    </div>
  )
}
