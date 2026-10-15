import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, LogOut } from 'lucide-react';
import PortalLogo from '../components/PortalLogo';

const ContractorRegistrationStatus = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const cv = user?.contractorVerification;
  const status = cv?.status;

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-100 py-12 px-4">
      <div className="max-w-lg w-full card space-y-6">
        <div className="text-center">
          <PortalLogo className="h-16 w-auto object-contain mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-gray-900">Contractor account</h1>
          <p className="text-sm text-gray-600 mt-1">{user?.email}</p>
        </div>

        {status === 'pending' && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 flex gap-3">
            <Clock className="w-6 h-6 text-amber-700 shrink-0" />
            <div>
              <p className="font-medium text-amber-900">Under municipal review</p>
              <p className="text-sm text-amber-800 mt-1">
                Your details and degree certificate have been sent to the municipal office. An
                officer will verify them before scheduling your in-person appointment.
              </p>
            </div>
          </div>
        )}

        {status === 'verified' && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 flex gap-3">
            <CheckCircle className="w-6 h-6 text-blue-700 shrink-0" />
            <div>
              <p className="font-medium text-blue-900">Verified — appointment pending</p>
              <p className="text-sm text-blue-800 mt-1">
                Your documents were accepted. Municipal staff will assign your in-person
                appointment. You will get full portal access once that appointment is recorded.
              </p>
            </div>
          </div>
        )}

        {status === 'rejected' && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex gap-3">
            <XCircle className="w-6 h-6 text-red-700 shrink-0" />
            <div>
              <p className="font-medium text-red-900">Registration not approved</p>
              {cv?.rejectionReason && (
                <p className="text-sm text-red-800 mt-2">{cv.rejectionReason}</p>
              )}
              <p className="text-sm text-red-800 mt-2">
                Contact your municipal office if you need to resubmit or appeal.
              </p>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </div>
  );
};

export default ContractorRegistrationStatus;
