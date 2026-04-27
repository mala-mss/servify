import { Navigate } from 'react-router-dom'
import { useAuth } from '@/controllers/context/AuthContext'

export default function RoleRedirect() {
  const { user, role } = useAuth()

  if (!user) return <Navigate to="/login" replace />

  switch (role) {
    case 'client':     return <Navigate to="/client/home"           replace />
    case 'provider':   return <Navigate to="/provider/dashboard"    replace />
    case 'admin':      return <Navigate to="/admin/dashboard"       replace />
    case 'authorized': return <Navigate to="/authorized/approvals"  replace />
    default:           return <Navigate to="/login"                 replace />
  }
}










