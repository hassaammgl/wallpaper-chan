import { Navigate } from 'react-router'
import useAuthStore from '../utils/authStore'

function ProtectedRoute({ children }) {
  const { currentUser } = useAuthStore()

  if (!currentUser) return <Navigate to="/login" replace />
  if (currentUser.role !== 'admin') return <Navigate to="/login" replace state={{ error: 'Admin access required' }} />

  return children
}

export default ProtectedRoute
