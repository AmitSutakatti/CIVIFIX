import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UserNavbar from '../components/UserNavbar';
import RegistrationBonusModal from '../components/RegistrationBonusModal';
import { complaintAPI } from '../services/user/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { PlusCircle, Eye, AlertCircle, CheckCircle, Clock, XCircle, Camera, Award } from 'lucide-react';

const UserDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bonusPoints, setBonusPoints] = useState(null);
  const { user, fetchUser } = useAuth();

  useEffect(() => {
    fetchComplaints();
    fetchUser?.();
    const stored = sessionStorage.getItem('civicfix_bonus_popup');
    if (stored) {
      setBonusPoints(Number(stored) || 20);
      sessionStorage.removeItem('civicfix_bonus_popup');
    }
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await complaintAPI.getMyComplaints();
      setComplaints(response.data.data.complaints);
    } catch (error) {
      toast.error('Failed to fetch complaints');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Submitted: 'bg-blue-100 text-blue-800',
      Verified: 'bg-purple-100 text-purple-800',
      Assigned: 'bg-yellow-100 text-yellow-800',
      'In-progress': 'bg-orange-100 text-orange-800',
      Completed: 'bg-green-100 text-green-800',
      Closed: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Submitted':
        return <Clock className="w-4 h-4" />;
      case 'Verified':
        return <CheckCircle className="w-4 h-4" />;
      case 'Assigned':
        return <AlertCircle className="w-4 h-4" />;
      case 'In-progress':
        return <Clock className="w-4 h-4" />;
      case 'Completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'Closed':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusProgress = (status) => {
    const statuses = ['Submitted', 'Verified', 'Assigned', 'In-progress', 'Completed', 'Closed'];
    const currentIndex = statuses.indexOf(status);
    return ((currentIndex + 1) / statuses.length) * 100;
  };

  const getCategoryLabel = (category) => {
    const categories = {
      road: 'Road Issues',
      drainage: 'Drainage Problems',
      electricity: 'Electricity Issues',
      garbage: 'Garbage Collection',
      water: 'Water Supply',
      streetlight: 'Street Light',
      parks: 'Parks & Recreation',
      other: 'Other',
    };
    return categories[category] || category;
  };

  const stats = {
    total: complaints.length,
    submitted: complaints.filter((c) => c.status === 'Submitted').length,
    inProgress: complaints.filter((c) => ['Assigned', 'In-progress'].includes(c.status)).length,
    completed: complaints.filter((c) => ['Completed', 'Closed'].includes(c.status)).length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserNavbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserNavbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
            <p className="mt-2 text-gray-600">Track and manage your reported issues</p>
          </div>
          <Link
            to="/report"
            className="btn-primary flex items-center space-x-2"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Report New Issue</span>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="card border-2 border-amber-200 bg-amber-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-800">CivicFix Points</p>
                <p className="text-2xl font-bold text-amber-900">{user?.rewardPoints ?? 0}</p>
              </div>
              <div className="bg-amber-100 p-3 rounded-lg">
                <Award className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Complaints</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="bg-primary-100 p-3 rounded-lg">
                <AlertCircle className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Submitted</p>
                <p className="text-2xl font-bold text-gray-900">{stats.submitted}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Complaints List */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">My Complaints</h2>

          {complaints.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No complaints yet</p>
              <Link to="/report" className="btn-primary inline-flex items-center space-x-2">
                <PlusCircle className="w-5 h-5" />
                <span>Report Your First Issue</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {complaints.map((complaint) => (
                <div
                  key={complaint._id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(
                            complaint.status
                          )}`}
                        >
                          {getStatusIcon(complaint.status)}
                          <span>{complaint.status}</span>
                        </span>
                        <span className="text-sm text-gray-500">
                          {getCategoryLabel(complaint.category)}
                        </span>
                      </div>

                      <p className="text-gray-800 mb-3 line-clamp-2">
                        {complaint.description}
                      </p>

                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{Math.round(getStatusProgress(complaint.status))}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${getStatusProgress(complaint.status)}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>
                          Reported: {new Date(complaint.createdAt).toLocaleDateString()}
                        </span>
                        {complaint.images && complaint.images.length > 0 && (
                          <span className="flex items-center space-x-1">
                            <Camera className="w-4 h-4" />
                            <span>{complaint.images.length} image(s)</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <Link
                      to={`/complaint/${complaint._id}`}
                      className="ml-4 btn-secondary flex items-center space-x-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Details</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {bonusPoints != null && (
        <RegistrationBonusModal points={bonusPoints} onClose={() => setBonusPoints(null)} />
      )}
    </div>
  );
};

export default UserDashboard;

