import type { ReactElement } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/auth-context'

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

