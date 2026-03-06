import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Need } from '../types';
import StatusBadge from './StatusBadge';
import { useTheme } from '../context/ThemeContext';

// Fix default Leaflet marker icons (Vite breaks them)
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

// Custom gold marker
const goldIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="40" viewBox="0 0 28 40">
      <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 26 14 26S28 24.5 28 14C28 6.268 21.732 0 14 0z" fill="#C9933A"/>
      <circle cx="14" cy="14" r="6" fill="#0F1117"/>
      <circle cx="14" cy="14" r="3" fill="#C9933A"/>
    </svg>
  `),
  iconSize: [28, 40],
  iconAnchor: [14, 40],
  popupAnchor: [0, -40],
  shadowUrl: shadowUrl,
  shadowSize: [41, 41],
  shadowAnchor: [14, 41],
});

interface MapViewProps {
  needs: Need[];
  height?: number | string;
  center?: [number, number];
  zoom?: number;
}

// Nouakchott center
const DEFAULT_CENTER: [number, number] = [18.0858, -15.9785];

const MapView: React.FC<MapViewProps> = ({
  needs,
  height = 420,
  center = DEFAULT_CENTER,
  zoom = 12,
}) => {
  const { theme } = useTheme();

  return (
    <div style={{ height, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        attributionControl={false}
      >
        <TileLayer
          url={theme === 'dark' 
            ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" 
            : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
        />
        {needs.map(need => (
          need.approxLat && need.approxLng ? (
            <Marker
              key={need.id}
              position={[need.approxLat, need.approxLng]}
              icon={goldIcon}
            >
              <Popup>
                <div style={{ background: 'var(--card)', color: 'var(--text)', padding: '0.5rem', minWidth: 200 }}>
                  <strong style={{ fontSize: '0.92rem', display: 'block', marginBottom: '0.35rem' }}>
                    {need.title}
                  </strong>
                  <StatusBadge status={need.status} size="sm" />
                  {need.city && (
                    <div style={{ marginTop: '0.35rem', fontSize: '0.8rem', color: '#6B6760' }}>
                      📍 {need.city}
                    </div>
                  )}
                  <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#C9933A' }}>
                    {need.amount?.toLocaleString('fr-MR')} MRU
                  </div>
                </div>
              </Popup>
            </Marker>
          ) : null
        ))}
      </MapContainer>
    </div>
  );
};

export default MapView;
