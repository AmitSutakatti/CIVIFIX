import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Leaflet default marker fix (ensures marker icons load correctly)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const defaultCenter = {
  lat: 28.6139, // Default to Delhi, India (change as desired)
  lng: 77.209,
};

const MapEvents = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onLocationSelect({ lat, lng });
    },
  });
  return null;
};

const GoogleMapPicker = ({ onLocationSelect, initialLocation }) => {
  const [position, setPosition] = useState(initialLocation || defaultCenter);

  useEffect(() => {
    if (initialLocation) {
      setPosition(initialLocation);
    }
  }, [initialLocation]);

  const handleSelect = (coords) => {
    setPosition(coords);
    onLocationSelect(coords);
  };

  return (
    <div className="w-full">
      <MapContainer
        center={position}
        zoom={15}
        style={{ height: '400px', width: '100%', borderRadius: '0.5rem' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker
          position={position}
          draggable={true}
          eventHandlers={{
            dragend: (event) => {
              const marker = event.target;
              const { lat, lng } = marker.getLatLng();
              handleSelect({ lat, lng });
            },
          }}
        />
        <MapEvents onLocationSelect={handleSelect} />
      </MapContainer>
      <p className="text-sm text-gray-600 mt-2">
        Click on the map or drag the marker to select the location
      </p>
    </div>
  );
};

export default GoogleMapPicker;

