import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { contractorAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  Wrench,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  MapPin,
  Eye,
  MessageSquare,
  LogOut,
  Bell,
} from 'lucide-react';
import ChatModal from '../components/ChatModal';
import QuotationModal from '../components/QuotationModal';
import PortalLogo from '../components/PortalLogo';

const ContractorDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
  });
  const [complaints, setComplaints] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showQuotationModal, setShowQuotationModal] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'contractor') {
      navigate('/login');
      return;
    }
    fetchDashboardData();
    fetchNotifications();
    
    // Refresh data every 30 seconds
    const interval = setInterval(() => {
      fetchDashboardData();
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await contractorAPI.getComplaints();
      const complaintsData = response.data.data.complaints || [];
      
      setComplaints(complaintsData);
      
      // Calculate stats
      const statsData = {
        total: complaintsData.length,
        pending: complaintsData.filter(c => c.status === 'Assigned').length,
        inProgress: complaintsData.filter(c => c.status === 'In-progress').length,
        completed: complaintsData.filter(c => c.status === 'Completed').length,
      };
      setStats(statsData);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch dashboard data';
      console.error('Dashboard fetch error:', error);
      console.error('Error details:', error.response?.data);
      
      // Only show error if it's not a 401 (handled by interceptor)
      if (error.response?.status !== 401) {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await contractorAPI.getNotifications();
      setNotifications(response.data.data.notifications || []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const handleOpenChat = (complaint) => {
    setSelectedComplaint(complaint);
    setShowChatModal(true);
  };

  const handleCloseChat = () => {
    setShowChatModal(false);
    setSelectedComplaint(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getStatusColor = (status) => {
    const colors = {
      Assigned: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'In-progress': 'bg-blue-100 text-blue-800 border-blue-200',
      Completed: 'bg-green-100 text-green-800 border-green-200',
      Closed: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
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

  if (loading && complaints.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <PortalLogo className="h-16 w-auto object-contain" />
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <PortalLogo className="h-12 w-auto object-contain" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Contractor Dashboard
                </h1>
                <p className="text-sm text-gray-500">
                  {user?.contractorInfo?.companyName || user?.name}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {notifications.length > 0 && (
                <div className="relative">
                  <Bell className="w-6 h-6 text-gray-600" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notifications.length}
                  </span>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard title="Total Projects" value={stats.total} icon={AlertCircle} color="blue" />
          <StatCard title="Pending" value={stats.pending} icon={Clock} color="yellow" />
          <StatCard title="In Progress" value={stats.inProgress} icon={Clock} color="blue" />
          <StatCard title="Completed" value={stats.completed} icon={CheckCircle} color="green" />
        </div>

        {/* Complaints List */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Assigned Projects</h2>
          </div>

          {complaints.length === 0 ? (
            <div className="p-12 text-center">
              <Wrench className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No projects assigned yet</p>
              <p className="text-gray-400 text-sm mt-2">
                You'll see assigned projects here once municipal officers assign them to you.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {complaints.map((complaint) => (
                <div
                  key={complaint._id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {getCategoryLabel(complaint.category)}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                            complaint.status
                          )}`}
                        >
                          {complaint.status}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{complaint.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>
                            {complaint.location?.address || 'Location not specified'}
                          </span>
                        </div>
                        <span>
                          Assigned: {new Date(complaint.assignedAt || complaint.createdAt).toLocaleDateString()}
                        </span>
                        {complaint.deadline && (
                          <span className="text-orange-600 font-medium">
                            Deadline: {new Date(complaint.deadline).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {complaint.assignedOfficer && (
                        <div className="mt-2 text-sm text-gray-600">
                          <span className="font-medium">Assigned by:</span>{' '}
                          {complaint.assignedOfficer.name} ({complaint.assignedOfficer.municipalOffice?.name})
                        </div>
                      )}
                    </div>
                    <div className="ml-4 flex space-x-2">
                      <button
                        onClick={() => handleOpenChat(complaint)}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Chat</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedComplaint(complaint);
                          setShowQuotationModal(true);
                        }}
                        className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                      >
                        <span>Generate Quotation</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showChatModal && selectedComplaint && (
        <ChatModal
          complaint={selectedComplaint}
          onClose={handleCloseChat}
        />
      )}

      {showQuotationModal && selectedComplaint && (
        <QuotationModal
          complaint={selectedComplaint}
          onClose={() => {
            setShowQuotationModal(false);
            setSelectedComplaint(null);
          }}
          onSuccess={() => {
            fetchDashboardData();
          }}
        />
      )}
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    red: 'bg-red-50 text-red-600 border-red-200',
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border-2 ${colorClasses[color]} p-4`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <Icon className="w-8 h-8 opacity-60" />
      </div>
    </div>
  );
};

export default ContractorDashboard;

