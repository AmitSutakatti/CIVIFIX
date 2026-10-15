import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';
import { Mail, Lock, User, Phone, Building2, FileBadge, ArrowLeft } from 'lucide-react';
import PortalLogo from '../components/PortalLogo';

const ContractorRegister = () => {
  const navigate = useNavigate();
  const certificateInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    companyName: '',
    licenseNumber: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const certificate = certificateInputRef.current?.files?.[0];
    if (!certificate || certificate.size === 0) {
      toast.error('Please upload your degree or qualification certificate.');
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append('degreeCertificate', certificate);
      await authAPI.registerContractor(fd);
      toast.success('Registration submitted. Sign in after municipal approval and scheduling.');
      navigate('/login', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-100 py-12 px-4 sm:px-6">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <PortalLogo className="h-20 w-auto object-contain mx-auto mb-4" />
          <h2 className="text-3xl font-extrabold text-gray-900">Contractor registration</h2>
          <p className="mt-2 text-sm text-gray-600">
            Your profile and certificate are sent to the municipal office for verification. An
            in-person appointment is scheduled before your account becomes active.
          </p>
        </div>

        <div className="card">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  name="name"
                  required
                  className="input-field pl-10"
                  value={form.name}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  name="email"
                  type="email"
                  required
                  className="input-field pl-10"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  name="phone"
                  className="input-field pl-10"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  className="input-field pl-10"
                  value={form.password}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company name</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  name="companyName"
                  required
                  className="input-field pl-10"
                  value={form.companyName}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                License number
              </label>
              <input
                name="licenseNumber"
                required
                className="input-field"
                value={form.licenseNumber}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Degree / qualification certificate
              </label>
              <div className="relative">
                <FileBadge className="absolute left-3 top-3 text-gray-400 w-5 h-5 pointer-events-none" />
                <input
                  ref={certificateInputRef}
                  type="file"
                  name="degreeCertificate"
                  accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                  required
                  className="input-field pl-10 file:mr-3 file:py-1 file:px-2 file:rounded file:border-0 file:bg-orange-50 file:text-orange-800"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">PDF or image, up to 10 MB.</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary bg-orange-600 hover:bg-orange-700"
            >
              {loading ? 'Submitting…' : 'Submit for municipal review'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1 text-sm text-orange-700 hover:text-orange-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractorRegister;
