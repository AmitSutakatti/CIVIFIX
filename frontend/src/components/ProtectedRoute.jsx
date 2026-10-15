import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PortalLogo from './PortalLogo';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, loading, token, user } = useAuth();

  // Check if token exists in localStorage (for initial page load)
  const hasToken = token || localStorage.getItem('token');

  // Show loading if we're still checking authentication
  if (loading && hasToken) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <PortalLogo className="h-16 w-auto object-contain" />
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // If not authenticated, redirect to appropriate login
  if (!isAuthenticated && !hasToken) {
    if (allowedRoles.includes('MUNICIPAL_OFFICER')) {
      return <Navigate to="/municipal/login" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  // Check role-based access
  if (allowedRoles.length > 0 && user) {
    if (!allowedRoles.includes(user.role)) {
      // Redirect based on user role
      if (user.role === 'MUNICIPAL_OFFICER') {
        return <Navigate to="/municipal/dashboard" replace />;
      }
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Allow access
  return children;
};

export default ProtectedRoute;

