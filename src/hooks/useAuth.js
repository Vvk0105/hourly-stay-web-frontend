import { useSelector } from 'react-redux'
import {
  selectCurrentUser,
  selectIsAuthenticated,
  selectToken,
  selectAuthLoading,
  selectAuthError,
} from '@/features/auth/authSlice'

/**
 * Hook to access auth state from any component.
 * Usage: const { user, isAuthenticated, token } = useAuth()
 */
export const useAuth = () => {
  const user = useSelector(selectCurrentUser)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const token = useSelector(selectToken)
  const loading = useSelector(selectAuthLoading)
  const error = useSelector(selectAuthError)

  return { user, isAuthenticated, token, loading, error }
}
