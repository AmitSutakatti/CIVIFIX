import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PortalLogo from './PortalLogo';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, token, user } = useAuth();

  const hasToken = token || localStorage.getItem('token');

  if (loading && hasToken) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <PortalLogo className="h-16 w-auto object-contain" />
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated && !hasToken) {
    return <Navigate to="/login" replace />;
  }

  // Only allow MUNICIPAL_OFFICER role
  if (user && user.role !== 'MUNICIPAL_OFFICER') {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
