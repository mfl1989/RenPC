import { Navigate, Outlet } from 'react-router-dom'
import type { ReactElement } from 'react'
import { useAuth } from '../contexts/AuthContext'

type ProtectedRouteProps = {
  children?: ReactElement
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }
  return children ?? <Outlet />
}

