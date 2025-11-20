import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { LocationPoint } from '../types';

const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

const defaultIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Component to auto-center the map when points change
const MapUpdater: React.FC<{ points: LocationPoint[] }> = ({ points }) => {
  const map = useMap();

  useEffect(() => {
    if (points.length > 0) {
      const bounds = L.latLngBounds(points.map(p => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    }
  }, [points, map]);

  return null;
};

interface MapComponentProps {
  points: LocationPoint[];
  isRoute: boolean;
}

const MapComponent: React.FC<MapComponentProps> = ({ points, isRoute }) => {
  const caliCenter: [number, number] = [3.4516, -76.5320];

  const polylinePositions = points.map(p => [p.lat, p.lng] as [number, number]);

  return (
    <MapContainer 
      center={caliCenter} 
      zoom={13} 
      scrollWheelZoom={true} 
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <MapUpdater points={points} />

      {points.map((point) => (
        <Marker 
          key={point.id} 
          position={[point.lat, point.lng]} 
          icon={defaultIcon}
        >
          <Popup>
            <div className="text-sm">
              <h3 className="font-bold text-indigo-600">{point.name}</h3>
              <p className="text-slate-600 mt-1">{point.description}</p>
              <div className="text-xs text-slate-400 mt-2">
                {point.lat.toFixed(4)}, {point.lng.toFixed(4)}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}

      {isRoute && points.length > 1 && (
        <Polyline 
          positions={polylinePositions} 
          color="#4f46e5" // indigo-600
          weight={4}
          opacity={0.7}
          dashArray="10, 10" 
        />
      )}
    </MapContainer>
  );
};

export default MapComponent;
