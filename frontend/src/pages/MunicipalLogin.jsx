import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { LogIn, Mail, Lock, Building2 } from 'lucide-react';

const MunicipalLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const { login, logout, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated as MUNICIPAL_OFFICER
  useEffect(() => {
    if (isAuthenticated && user?.role === 'MUNICIPAL_OFFICER') {
      navigate('/municipal/dashboard', { replace: true });
    }
    // Don't redirect regular users - let them see the login page
    // They can logout if they want to login as municipal officer
  }, [isAuthenticated, user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        // Check if user is MUNICIPAL_OFFICER
        if (result.user?.role === 'MUNICIPAL_OFFICER') {
          toast.success('Login successful!');
          setTimeout(() => {
            window.location.href = '/municipal/dashboard';
          }, 100);
        } else {
          toast.error('This account is not authorized for municipal officer access');
          setLoading(false);
        }
      } else {
        toast.error(result.message || 'Login failed');
        setLoading(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred during login');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto bg-blue-600 text-white w-16 h-16 rounded-2xl flex items-center justify-center mb-4">
            <Building2 className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">Municipal Officer Portal</h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access your municipal dashboard
          </p>
        </div>

        <div className="card">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="input-field pl-10"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="input-field pl-10"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700"
              >
                <LogIn className="w-5 h-5" />
                <span>{loading ? 'Signing in...' : 'Sign in'}</span>
              </button>
            </div>
          </form>

          <div className="mt-6 text-center space-y-2">
            {isAuthenticated && user?.role !== 'MUNICIPAL_OFFICER' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-yellow-800">
                  You are logged in as a regular user. Please{' '}
                  <button
                    onClick={() => {
                      logout();
                      window.location.reload();
                    }}
                    className="font-medium text-yellow-900 underline hover:text-yellow-950"
                  >
                    logout
                  </button>{' '}
                  first to login as a municipal officer.
                </p>
              </div>
            )}
            <p className="text-sm text-gray-600">
              Citizen portal?{' '}
              <a href="/login" className="font-medium text-blue-600 hover:text-blue-700">
                Go to citizen login
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MunicipalLogin;
