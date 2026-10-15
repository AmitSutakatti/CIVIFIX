import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const MunicipalComplaintMap = ({ complaints, municipalOffice, onComplaintClick }) => {
  const mapRef = useRef(null);

  // Get status color for marker
  const getStatusColor = (status) => {
    const colors = {
      Submitted: '#ef4444', // red
      Verified: '#a855f7', // purple
      Assigned: '#eab308', // yellow
      'In-progress': '#f97316', // orange
      Completed: '#22c55e', // green
      Closed: '#6b7280', // gray
    };
    return colors[status] || '#6b7280';
  };

  // Create custom icon based on status
  const createStatusIcon = (status) => {
    const color = getStatusColor(status);
    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
  };

  // Calculate center point (municipal office or first complaint)
  const getCenter = () => {
    if (municipalOffice?.latitude && municipalOffice?.longitude) {
      return [municipalOffice.latitude, municipalOffice.longitude];
    }
    if (complaints.length > 0) {
      return [complaints[0].location.latitude, complaints[0].location.longitude];
    }
    return [15.85, 74.5]; // Default: Belagavi
  };

  const center = getCenter();

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden border border-gray-200">
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Municipal Office Marker */}
        {municipalOffice?.latitude && municipalOffice?.longitude && (
          <>
            <Marker
              position={[municipalOffice.latitude, municipalOffice.longitude]}
              icon={L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
              })}
            >
              <Popup>
                <div className="font-bold text-blue-600">{municipalOffice.name}</div>
                <div className="text-sm text-gray-600">{municipalOffice.type}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Jurisdiction: {municipalOffice.jurisdictionRadius} km
                </div>
              </Popup>
            </Marker>
            {/* Jurisdiction Circle */}
            {municipalOffice.jurisdictionRadius && (
              <Circle
                center={[municipalOffice.latitude, municipalOffice.longitude]}
                radius={municipalOffice.jurisdictionRadius * 1000} // Convert km to meters
                pathOptions={{
                  color: '#3b82f6',
                  fillColor: '#3b82f6',
                  fillOpacity: 0.1,
                  weight: 2,
                }}
              />
            )}
          </>
        )}

        {/* Complaint Markers */}
        {complaints.map((complaint) => (
          <Marker
            key={complaint._id}
            position={[complaint.location.latitude, complaint.location.longitude]}
            icon={createStatusIcon(complaint.status)}
            eventHandlers={{
              click: () => {
                if (onComplaintClick) {
                  onComplaintClick(complaint);
                }
              },
            }}
          >
            <Popup>
              <div>
                <div className="font-semibold text-gray-900">
                  Complaint #{complaint._id.toString().slice(-6)}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {complaint.category} • {complaint.status}
                </div>
                {complaint.distance && (
                  <div className="text-xs text-gray-500 mt-1">
                    {complaint.distance} km away
                  </div>
                )}
                <button
                  onClick={() => onComplaintClick && onComplaintClick(complaint)}
                  className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  View Details
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MunicipalComplaintMap;
