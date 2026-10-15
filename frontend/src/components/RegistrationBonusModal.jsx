import { Award, X } from 'lucide-react';

const RegistrationBonusModal = ({ points = 20, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center shadow-2xl relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
          <Award className="w-8 h-8 text-amber-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Welcome to CivicFix</h2>
        <p className="mt-3 text-gray-600">
          You have been credited <span className="font-semibold text-amber-700">{points} points</span> for
          registering.
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Your points are shown on the dashboard. Confirmed fake complaints will deduct points.
        </p>
        <button type="button" onClick={onClose} className="btn-primary mt-6 w-full">
          Got it
        </button>
      </div>
    </div>
  );
};

export default RegistrationBonusModal;
