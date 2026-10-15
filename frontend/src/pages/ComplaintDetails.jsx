import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import UserNavbar from '../components/UserNavbar';
import { complaintAPI } from '../services/user/api';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
} from 'lucide-react';

const ComplaintDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  const fetchComplaint = async () => {
    try {
      setLoading(true);
      const response = await complaintAPI.getComplaint(id);
      setComplaint(response.data.data.complaint);
    } catch (error) {
      toast.error('Failed to fetch complaint details');
      navigate('/dashboard');
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

  const getImageUrl = (image) => {
    if (image.url.startsWith('http')) {
      return image.url;
    }
    return `http://localhost:5000${image.url}`;
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

  if (!complaint) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserNavbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          to="/dashboard"
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Complaint Info */}
            <div className="card">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {getCategoryLabel(complaint.category)}
                  </h1>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      complaint.status
                    )}`}
                  >
                    {complaint.status}
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{complaint.description}</p>
              </div>

              {/* Location */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                  <MapPin className="w-5 h-5" />
                  <span>Location</span>
                </h3>
                {complaint.location.address && (
                  <p className="text-gray-700 mb-2">{complaint.location.address}</p>
                )}
                <p className="text-sm text-gray-500">
                  Coordinates: {complaint.location.latitude.toFixed(6)},{' '}
                  {complaint.location.longitude.toFixed(6)}
                </p>
                <a
                  href={`https://www.google.com/maps?q=${complaint.location.latitude},${complaint.location.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 text-sm mt-2 inline-block"
                >
                  View on Google Maps →
                </a>
              </div>

              {/* Images */}
              {complaint.images && complaint.images.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <ImageIcon className="w-5 h-5" />
                    <span>Images ({complaint.images.length})</span>
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {complaint.images.map((image, index) => (
                      <div
                        key={index}
                        onClick={() => setSelectedImage(image)}
                        className="relative cursor-pointer group"
                      >
                        <img
                          src={getImageUrl(image)}
                          alt={`Complaint image ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 group-hover:border-primary-500 transition-colors"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity rounded-lg flex items-center justify-center">
                          <span className="text-white opacity-0 group-hover:opacity-100 text-sm">
                            Click to enlarge
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Status Timeline</h3>
              <div className="space-y-4">
                {complaint.statusHistory && complaint.statusHistory.length > 0 ? (
                  complaint.statusHistory
                    .slice()
                    .reverse()
                    .map((history, index) => (
                      <div key={index} className="flex space-x-4">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              index === 0 ? 'bg-primary-600' : 'bg-gray-300'
                            }`}
                          ></div>
                          {index < complaint.statusHistory.length - 1 && (
                            <div className="w-0.5 h-full bg-gray-300 mt-2"></div>
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-gray-900">{history.status}</p>
                              {history.note && (
                                <p className="text-sm text-gray-600 mt-1">{history.note}</p>
                              )}
                            </div>
                            <p className="text-xs text-gray-500">
                              {new Date(history.updatedAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <p className="text-gray-500">No status history available</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Details Card */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Details</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Reported</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(complaint.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(complaint.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Last Updated</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(complaint.updatedAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(complaint.updatedAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                {complaint.assignedOfficer && (
                  <div className="flex items-start space-x-3">
                    <User className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Assigned Officer</p>
                      <p className="text-sm font-medium text-gray-900">
                        {complaint.assignedOfficer.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {complaint.assignedOfficer.email}
                      </p>
                    </div>
                  </div>
                )}

                {complaint.assignedContractor && (
                  <div className="flex items-start space-x-3">
                    <User className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Assigned Contractor</p>
                      <p className="text-sm font-medium text-gray-900">
                        {complaint.assignedContractor.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {complaint.assignedContractor.email}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Priority */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Priority</h3>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  complaint.priority === 'urgent'
                    ? 'bg-red-100 text-red-800'
                    : complaint.priority === 'high'
                    ? 'bg-orange-100 text-orange-800'
                    : complaint.priority === 'medium'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {complaint.priority.charAt(0).toUpperCase() + complaint.priority.slice(1)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-4xl max-h-full">
            <img
              src={getImageUrl(selectedImage)}
              alt="Enlarged view"
              className="max-w-full max-h-[90vh] rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintDetails;

