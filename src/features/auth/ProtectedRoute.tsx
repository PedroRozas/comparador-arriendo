import { Navigate, Outlet } from 'react-router-dom'
import { SplashScreen } from './SplashScreen'
import { useAuth } from './useAuth'

export const ProtectedRoute = () => {
  const { session, isLoading } = useAuth()

  if (isLoading) {
    return <SplashScreen />
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
