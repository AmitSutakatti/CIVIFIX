import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { municipalAPI } from '../services/municipal/api';
import toast from 'react-hot-toast';
import {
  Building2,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  MapPin,
  Filter,
  Eye,
  Check,
  X,
  UserPlus,
  TrendingUp,
  BarChart3,
  PieChart,
  LogOut,
  Calendar,
} from 'lucide-react';
import MunicipalComplaintMap from '../components/MunicipalComplaintMap';
import MunicipalAnalytics from '../components/MunicipalAnalytics';

const MunicipalDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    verified: 0,
    inProgress: 0,
    completed: 0,
    closed: 0,
  });
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    page: 1,
  });
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [contractors, setContractors] = useState([]);
  const [municipalOffice, setMunicipalOffice] = useState(null);
  const [activeTab, setActiveTab] = useState('complaints'); // 'complaints', 'map', 'analytics'

  useEffect(() => {
    if (!user || user.role !== 'MUNICIPAL_OFFICER') {
      navigate('/municipal/login');
      return;
    }
    fetchDashboardData();
    fetchContractors();
  }, [user, filters]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, complaintsRes] = await Promise.all([
        municipalAPI.getDashboardStats(),
        municipalAPI.getComplaints(filters),
      ]);

      setStats(statsRes.data.data.stats);
      setComplaints(complaintsRes.data.data.complaints);
      setMunicipalOffice(statsRes.data.data.municipalOffice);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchContractors = async () => {
    try {
      const response = await municipalAPI.getContractors();
      setContractors(response.data.data.contractors);
    } catch (error) {
      console.error('Failed to fetch contractors:', error);
    }
  };

  const handleVerify = async (action, reason = '') => {
    try {
      await municipalAPI.verifyComplaint(selectedComplaint._id, { action, reason });
      toast.success(`Complaint ${action === 'verify' ? 'verified' : 'rejected'} successfully`);
      setShowVerifyModal(false);
      setSelectedComplaint(null);
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update complaint');
    }
  };

  const handleAssign = async (contractorId, deadline) => {
    try {
      await municipalAPI.assignContractor(selectedComplaint._id, {
        contractorId,
        deadline,
      });
      toast.success('Contractor assigned successfully');
      setShowAssignModal(false);
      setSelectedComplaint(null);
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign contractor');
    }
  };

  const handleStatusUpdate = async (status, note = '') => {
    try {
      await municipalAPI.updateComplaintStatus(selectedComplaint._id, { status, note });
      toast.success('Status updated successfully');
      setSelectedComplaint(null);
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleClose = async (note = '') => {
    try {
      await municipalAPI.closeComplaint(selectedComplaint._id, { note });
      toast.success('Complaint closed successfully');
      setSelectedComplaint(null);
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to close complaint');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Submitted: 'bg-red-100 text-red-800 border-red-200',
      Verified: 'bg-purple-100 text-purple-800 border-purple-200',
      Assigned: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'In-progress': 'bg-yellow-100 text-yellow-800 border-yellow-200',
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

  const handleLogout = () => {
    logout();
    navigate('/municipal/login');
  };

  if (loading && complaints.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {municipalOffice?.name || 'Municipal Dashboard'}
                </h1>
                <p className="text-sm text-gray-500">
                  {municipalOffice?.type} • {user?.name}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <StatCard
            title="Total"
            value={stats.total}
            icon={AlertCircle}
            color="blue"
          />
          <StatCard
            title="Pending"
            value={stats.pending}
            icon={Clock}
            color="red"
          />
          <StatCard
            title="Verified"
            value={stats.verified}
            icon={CheckCircle}
            color="purple"
          />
          <StatCard
            title="In Progress"
            value={stats.inProgress}
            icon={TrendingUp}
            color="yellow"
          />
          <StatCard
            title="Completed"
            value={stats.completed}
            icon={CheckCircle}
            color="green"
          />
          <StatCard
            title="Closed"
            value={stats.closed}
            icon={XCircle}
            color="gray"
          />
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('complaints')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                  activeTab === 'complaints'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Complaints
              </button>
              <button
                onClick={() => setActiveTab('map')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                  activeTab === 'map'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Map View
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                  activeTab === 'analytics'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Analytics
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'complaints' && (
          <ComplaintsPanel
            complaints={complaints}
            filters={filters}
            setFilters={setFilters}
            onSelectComplaint={setSelectedComplaint}
            getStatusColor={getStatusColor}
            getCategoryLabel={getCategoryLabel}
            municipalOffice={municipalOffice}
          />
        )}

        {activeTab === 'map' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Complaint Map</h2>
            <MunicipalComplaintMap
              complaints={complaints}
              municipalOffice={municipalOffice}
              onComplaintClick={setSelectedComplaint}
            />
          </div>
        )}

        {activeTab === 'analytics' && (
          <MunicipalAnalytics municipalOffice={municipalOffice} />
        )}
      </div>

      {/* Verify Modal */}
      {showVerifyModal && selectedComplaint && (
        <VerifyModal
          complaint={selectedComplaint}
          onClose={() => {
            setShowVerifyModal(false);
            setSelectedComplaint(null);
          }}
          onVerify={handleVerify}
        />
      )}

      {/* Assign Modal */}
      {showAssignModal && selectedComplaint && (
        <AssignModal
          complaint={selectedComplaint}
          contractors={contractors}
          onClose={() => {
            setShowAssignModal(false);
            setSelectedComplaint(null);
          }}
          onAssign={handleAssign}
        />
      )}

      {/* Complaint Details Modal */}
      {selectedComplaint && !showVerifyModal && !showAssignModal && (
        <ComplaintDetailsModal
          complaint={selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          onVerify={() => setShowVerifyModal(true)}
          onAssign={() => setShowAssignModal(true)}
          onStatusUpdate={handleStatusUpdate}
          onCloseComplaint={handleClose}
          getCategoryLabel={getCategoryLabel}
        />
      )}
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    gray: 'bg-gray-50 text-gray-600 border-gray-200',
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

// Complaints Panel Component
const ComplaintsPanel = ({
  complaints,
  filters,
  setFilters,
  onSelectComplaint,
  getStatusColor,
  getCategoryLabel,
  municipalOffice,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <h2 className="text-xl font-bold text-gray-900">Complaints Management</h2>
          <div className="flex flex-wrap gap-3">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
              className="input-field text-sm"
            >
              <option value="all">All Status</option>
              <option value="Submitted">Pending</option>
              <option value="Verified">Verified</option>
              <option value="Assigned">Assigned</option>
              <option value="In-progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })}
              className="input-field text-sm"
            >
              <option value="all">All Categories</option>
              <option value="road">Road Issues</option>
              <option value="drainage">Drainage</option>
              <option value="electricity">Electricity</option>
              <option value="garbage">Garbage</option>
              <option value="water">Water</option>
              <option value="streetlight">Street Light</option>
              <option value="parks">Parks</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Distance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {complaints.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                  No complaints found
                </td>
              </tr>
            ) : (
              complaints.map((complaint) => (
                <tr key={complaint._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{complaint._id.toString().slice(-6)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getCategoryLabel(complaint.category)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate max-w-xs">
                        {complaint.location.address || 'Location not specified'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(complaint.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                        complaint.status
                      )}`}
                    >
                      {complaint.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {complaint.distance ? `${complaint.distance} km` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => onSelectComplaint(complaint)}
                      className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Verify Modal Component
const VerifyModal = ({ complaint, onClose, onVerify }) => {
  const [action, setAction] = useState('verify');
  const [reason, setReason] = useState('');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Verify Complaint</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="input-field w-full"
            >
              <option value="verify">Verify</option>
              <option value="reject">Reject</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Reason/Note</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="input-field w-full"
              rows="3"
              placeholder="Enter reason or note..."
            />
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => onVerify(action, reason)}
              className={`flex-1 btn-primary ${
                action === 'verify' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {action === 'verify' ? 'Verify' : 'Reject'}
            </button>
            <button onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Assign Modal Component
const AssignModal = ({ complaint, contractors, onClose, onAssign }) => {
  const [contractorId, setContractorId] = useState('');
  const [deadline, setDeadline] = useState('');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Assign Contractor</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contractor</label>
            <select
              value={contractorId}
              onChange={(e) => setContractorId(e.target.value)}
              className="input-field w-full"
            >
              <option value="">Select contractor</option>
              {contractors.map((contractor) => (
                <option key={contractor._id} value={contractor._id}>
                  {contractor.name} {contractor.contractorInfo?.rating ? `(${contractor.contractorInfo.rating}★)` : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Deadline (Optional)</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="input-field w-full"
            />
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => onAssign(contractorId, deadline)}
              disabled={!contractorId}
              className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Assign
            </button>
            <button onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Complaint Details Modal
const ComplaintDetailsModal = ({
  complaint,
  onClose,
  onVerify,
  onAssign,
  onStatusUpdate,
  onCloseComplaint,
  getCategoryLabel,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-3xl w-full p-6 my-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Complaint Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Category</label>
              <p className="text-gray-900">{getCategoryLabel(complaint.category)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <p className="text-gray-900">{complaint.status}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Submitted</label>
              <p className="text-gray-900">
                {new Date(complaint.createdAt).toLocaleString()}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">User</label>
              <p className="text-gray-900">
                {complaint.user?.name || 'Unknown'}
              </p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">Description</label>
            <p className="text-gray-900 mt-1">{complaint.description}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">Location</label>
            <p className="text-gray-900 mt-1">
              {complaint.location.address || 'Not specified'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {complaint.location.latitude}, {complaint.location.longitude}
            </p>
          </div>

          {complaint.images && complaint.images.length > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-500">Images</label>
              <div className="grid grid-cols-3 gap-4 mt-2">
                {complaint.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={`http://localhost:5000${img.url}`}
                    alt={`Complaint ${idx + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-4 border-t">
            {complaint.status === 'Submitted' && (
              <>
                <button onClick={onVerify} className="btn-primary bg-green-600 hover:bg-green-700">
                  <Check className="w-4 h-4 mr-2" />
                  Verify/Reject
                </button>
              </>
            )}
            {complaint.status === 'Verified' && (
              <button onClick={onAssign} className="btn-primary">
                <UserPlus className="w-4 h-4 mr-2" />
                Assign Contractor
              </button>
            )}
            {complaint.status === 'Completed' && (
              <button
                onClick={() => onCloseComplaint('Complaint closed after verification')}
                className="btn-primary bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Close Complaint
              </button>
            )}
            {['Assigned', 'In-progress'].includes(complaint.status) && (
              <button
                onClick={() => onStatusUpdate('In-progress', 'Status updated')}
                className="btn-secondary"
              >
                Mark In Progress
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MunicipalDashboard;
