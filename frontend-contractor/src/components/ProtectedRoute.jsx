import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ContractorRegistrationStatus from '../pages/ContractorRegistrationStatus';
import PortalLogo from './PortalLogo';

function isContractorPortalEligible(user) {
  if (!user || user.role !== 'contractor') return true;
  const st = user.contractorVerification?.status;
  if (!user.contractorVerification || st === undefined || st === 'none') {
    return true;
  }
  return st === 'eligible';
}

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, token, user } = useAuth();

  const hasToken = token || localStorage.getItem('token');

  if (loading && hasToken) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <PortalLogo className="h-16 w-auto object-contain" />
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!isAuthenticated && !hasToken) {
    return <Navigate to="/login" replace />;
  }

  // Only allow contractor role
  if (user && user.role !== 'contractor') {
    return <Navigate to="/login" replace />;
  }

  if (user && user.role === 'contractor' && !isContractorPortalEligible(user)) {
    return <ContractorRegistrationStatus />;
  }

  return children;
};

export default ProtectedRoute;

