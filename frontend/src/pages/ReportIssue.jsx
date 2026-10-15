import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserNavbar from '../components/UserNavbar';
import GoogleMapPicker from '../components/GoogleMapPicker';
import LetterPreview from '../components/LetterPreview';
import { complaintAPI, letterAPI } from '../services/user/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { MapPin, Camera, Upload, X, Loader, Map, FileText, Download } from 'lucide-react';
import { buildComplaintLetter, downloadComplaintLetter } from '../utils/complaintLetter';

const ReportIssue = () => {
  const DEFAULT_CENTER = { lat: 28.6139, lng: 77.209 }; // New Delhi fallback

  const [formData, setFormData] = useState({
    category: '',
    description: '',
    address: '',
  });
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
    loading: false,
    error: null,
  });
  const [showMap, setShowMap] = useState(false);
  const [mapLocation, setMapLocation] = useState(DEFAULT_CENTER);
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [showLetterPreview, setShowLetterPreview] = useState(false);
  const [generatingLetter, setGeneratingLetter] = useState(false);
  const fileInputRef = useRef(null);
  const letterRequestKey = useRef('');
  const navigate = useNavigate();
  const { user } = useAuth();

  const categories = [
    { value: 'road', label: 'Road Issues' },
    { value: 'drainage', label: 'Drainage Problems' },
    { value: 'electricity', label: 'Electricity Issues' },
    { value: 'garbage', label: 'Garbage Collection' },
    { value: 'water', label: 'Water Supply' },
    { value: 'streetlight', label: 'Street Light' },
    { value: 'parks', label: 'Parks & Recreation' },
    { value: 'other', label: 'Other' },
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const getCategoryLabel = (value) =>
    categories.find((cat) => cat.value === value)?.label || value || 'Civic Issue';

  const makeLetter = () =>
    buildComplaintLetter({
      categoryLabel: getCategoryLabel(formData.category),
      description: formData.description,
      user,
      location,
      address: formData.address,
    });

  // Always build a local letter, then try to improve it via the API
  useEffect(() => {
    if (!formData.category || !formData.description?.trim() || !location.latitude || !location.longitude) {
      return;
    }

    const key = [
      formData.category,
      formData.description.trim(),
      formData.address,
      location.latitude,
      location.longitude,
      user?.name,
    ].join('|');

    const timer = setTimeout(async () => {
      const localLetter = makeLetter();
      setGeneratedLetter(localLetter);

      if (letterRequestKey.current === key) return;
      letterRequestKey.current = key;
      setGeneratingLetter(true);

      try {
        const response = await letterAPI.generateLetter({
          category: formData.category,
          description: formData.description,
          user,
          location: {
            latitude: location.latitude,
            longitude: location.longitude,
          },
          address: formData.address,
        });

        if (response.data.success && response.data.data?.letter) {
          setGeneratedLetter(response.data.data.letter);
        }
      } catch (error) {
        console.error('Error generating letter:', error);
      } finally {
        setGeneratingLetter(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [
    formData.category,
    formData.description,
    formData.address,
    location.latitude,
    location.longitude,
    user,
  ]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocation({ ...location, error: 'Geolocation is not supported by your browser' });
      return;
    }

    setLocation({ ...location, loading: true, error: null });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        setLocation({
          latitude: lat,
          longitude: lng,
          loading: false,
          error: null,
        });
        
        setMapLocation({ lat, lng });
        setShowMap(true); // reveal map and move marker to detected position
        await reverseGeocode(lat, lng);
        toast.success('Location detected successfully!');
      },
      (error) => {
        setLocation({
          latitude: null,
          longitude: null,
          loading: false,
          error: 'Location access denied. Please select location on the map.',
        });
        setMapLocation(DEFAULT_CENTER);
        setShowMap(true); // show map so user can pick manually
        toast.error('Location access denied. Please use the map to select location.');
      }
    );
  };

  // Reverse geocoding to get address from coordinates (OpenStreetMap Nominatim)
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            Accept: 'application/json',
            // Light usage for development; for heavier usage consider a hosted geocoding service.
            'User-Agent': 'CivicFix/1.0 (development)',
          },
        }
      );
      const data = await response.json();
      
      if (data && data.display_name) {
        setFormData({
          ...formData,
          address: data.display_name,
        });
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    }
  };

  // Manual lat/lng setter (also moves marker on map)
  const handleManualCoords = async () => {
    if (location.latitude == null || location.longitude == null) {
      toast.error('Enter both latitude and longitude');
      return;
    }
    const lat = parseFloat(location.latitude);
    const lng = parseFloat(location.longitude);
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      toast.error('Latitude/Longitude must be valid numbers');
      return;
    }
    setMapLocation({ lat, lng });
    setShowMap(true);
    await reverseGeocode(lat, lng);
    toast.success('Location set from coordinates');
  };

  // Handle map location selection
  const handleMapLocationSelect = async (position) => {
    const { lat, lng } = position;
    setLocation({
      latitude: lat,
      longitude: lng,
      loading: false,
      error: null,
    });
    setMapLocation({ lat, lng });
    await reverseGeocode(lat, lng);
    toast.success('Location selected on map!');
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max size is 5MB.`);
        return false;
      }
      return true;
    });

    if (images.length + validFiles.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    const newImages = [...images, ...validFiles];
    setImages(newImages);

    // Create previews
    const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
    setPreviewImages([...previewImages, ...newPreviews]);
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = previewImages.filter((_, i) => i !== index);
    setImages(newImages);
    setPreviewImages(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.category || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!location.latitude || !location.longitude) {
      toast.error('Please provide location (auto-detect or manual)');
      return;
    }

    const letter = generatedLetter || makeLetter();
    setGeneratedLetter(letter);
    setShowLetterPreview(true);
  };

  const submitComplaint = async (finalLetter = null) => {
    setSubmitting(true);

    try {
      const submitData = new FormData();
      submitData.append('category', formData.category);
      submitData.append('description', formData.description);
      submitData.append('latitude', location.latitude);
      submitData.append('longitude', location.longitude);
      submitData.append('address', formData.address);
      
      if (finalLetter) {
        submitData.append('letter', finalLetter);
      }

      images.forEach((image) => {
        submitData.append('images', image);
      });

      const response = await complaintAPI.create(submitData);

      if (response.data.success) {
        toast.success(
          response.data.data?.reviewNotice || 'Complaint submitted successfully!'
        );
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveLetter = (editedLetter) => {
    submitComplaint(editedLetter);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <UserNavbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Report an Issue</h1>
          <p className="mt-2 text-gray-600">
            Help us improve your community by reporting civic issues
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Problem Category <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                required
                className="input-field"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={5}
                className="input-field"
                placeholder="Describe the problem in detail..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location <span className="text-red-500">*</span>
              </label>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    disabled={location.loading}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    {location.loading ? (
                      <Loader className="w-5 h-5 animate-spin" />
                    ) : (
                      <MapPin className="w-5 h-5" />
                    )}
                    <span>
                      {location.loading ? 'Detecting location...' : 'Auto-detect Location'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowMap(!showMap)}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <Map className="w-5 h-5" />
                    <span>{showMap ? 'Hide Map' : 'Select on Map'}</span>
                  </button>
                </div>

                {location.error && (
                  <p className="text-sm text-red-600">{location.error}</p>
                )}

                {/* Manual latitude/longitude input */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      className="input-field"
                      value={location.latitude ?? ''}
                      onChange={(e) =>
                        setLocation({
                          ...location,
                          latitude: e.target.value === '' ? null : e.target.value,
                        })
                      }
                      placeholder="e.g. 28.6139"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      className="input-field"
                      value={location.longitude ?? ''}
                      onChange={(e) =>
                        setLocation({
                          ...location,
                          longitude: e.target.value === '' ? null : e.target.value,
                        })
                      }
                      placeholder="e.g. 77.2090"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleManualCoords}
                    className="btn-secondary"
                  >
                    Set coordinates on map
                  </button>
                </div>

                {/* Google Map Picker */}
                {showMap && (
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <GoogleMapPicker
                      onLocationSelect={handleMapLocationSelect}
                      initialLocation={mapLocation}
                    />
                  </div>
                )}

                {location.latitude && location.longitude && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-green-800">
                        ✓ Location Selected
                      </p>
                      <p className="text-sm text-green-700">
                        <strong>Coordinates:</strong>{' '}
                        {Number(location.latitude).toFixed(6)},{' '}
                        {Number(location.longitude).toFixed(6)}
                      </p>
                      {formData.address && (
                        <p className="text-sm text-green-700">
                          <strong>Address:</strong> {formData.address}
                        </p>
                      )}
                      <a
                        href={`https://www.openstreetmap.org/?mlat=${location.latitude}&mlon=${location.longitude}#map=18/${location.latitude}/${location.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary-600 hover:text-primary-700 underline inline-block"
                      >
                        View on OpenStreetMap →
                      </a>
                    </div>
                  </div>
                )}

                <div>
                  <input
                    type="text"
                    name="address"
                    className="input-field"
                    placeholder="Address will be auto-filled from map selection, or enter manually"
                    value={formData.address}
                    onChange={handleChange}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Address is automatically detected from map selection. You can also edit it manually.
                  </p>
                </div>
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Images (Optional, max 5)
              </label>
              <div className="space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Camera className="w-5 h-5" />
                  <span>Choose Images</span>
                </button>

                {previewImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {previewImages.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Auto-generated complaint report */}
            {generatedLetter && (
              <div className="border border-blue-200 bg-blue-50 rounded-lg p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-blue-700" />
                    <p className="text-sm font-semibold text-blue-900">
                      Complaint report (review before sending to municipal office)
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {generatingLetter && (
                      <span className="text-xs text-blue-700 flex items-center gap-1">
                        <Loader className="w-3 h-3 animate-spin" />
                        Improving with AI…
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        downloadComplaintLetter(generatedLetter);
                        toast.success('Letter downloaded');
                      }}
                      className="btn-secondary text-sm flex items-center space-x-1 py-1 px-3"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowLetterPreview(true)}
                      className="text-sm text-blue-800 hover:text-blue-950 underline"
                    >
                      Open full preview
                    </button>
                  </div>
                </div>
                <pre className="whitespace-pre-wrap text-sm bg-white border border-blue-100 rounded-md p-4 max-h-64 overflow-y-auto font-serif text-gray-800">
                  {generatedLetter}
                </pre>
                <p className="text-xs text-blue-800">
                  Download or edit this letter, then click Review &amp; Submit. It is sent to the municipal office only after you approve it.
                </p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary flex items-center space-x-2"
              >
                {submitting ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <Upload className="w-5 h-5" />
                )}
                <span>
                  {submitting
                    ? 'Submitting...'
                    : 'Review & Submit'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Letter Preview Modal */}
      {showLetterPreview && generatedLetter && (
        <LetterPreview
          isOpen={showLetterPreview}
          onClose={() => setShowLetterPreview(false)}
          letter={generatedLetter}
          onApprove={handleApproveLetter}
          onEdit={(edited) => setGeneratedLetter(edited)}
          category={formData.category}
          description={formData.description}
          user={user}
          location={location}
        />
      )}
    </div>
  );
};

export default ReportIssue;

