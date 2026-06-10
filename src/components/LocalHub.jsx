import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Filter } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { SAMPLE_LOCATIONS } from '../context/dataHelpers';

// Fix default marker icons in Leaflet + bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const TYPE_COLORS = {
  recycling: '#4CAF50',
  transit: '#42A5F5',
  composting: '#FF8F00',
};
const TYPE_ICONS = {
  recycling: '♻️',
  transit: '🚌',
  composting: '🪱',
};

function createCustomIcon(type) {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background: ${TYPE_COLORS[type] || '#999'};
      width: 32px; height: 32px;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 16px;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    ">${TYPE_ICONS[type] || '📍'}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -20],
  });
}

function FlyToUser({ userPos }) {
  const map = useMap();
  useEffect(() => {
    if (userPos) {
      map.flyTo(userPos, 14, { duration: 1.5 });
    }
  }, [userPos, map]);
  return null;
}

export default function LocalHub() {
  const [filter, setFilter] = useState('all');
  const [userPos, setUserPos] = useState(null);
  const [loading, setLoading] = useState(false);

  const defaultCenter = [12.9716, 77.5946]; // Bangalore

  const handleLocate = () => {
    if (!navigator.geolocation) return;
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos([pos.coords.latitude, pos.coords.longitude]);
        setLoading(false);
      },
      () => setLoading(false),
      { enableHighAccuracy: true }
    );
  };

  const filteredLocations = filter === 'all'
    ? SAMPLE_LOCATIONS
    : SAMPLE_LOCATIONS.filter(loc => loc.type === filter);

  const filters = [
    { id: 'all', label: 'All', icon: '📍' },
    { id: 'recycling', label: 'Recycling', icon: '♻️' },
    { id: 'transit', label: 'Transit', icon: '🚌' },
    { id: 'composting', label: 'Composting', icon: '🪱' },
  ];

  return (
    <div>
      <div className="section-header">
        <div>
          <h1 className="text-3xl text-bold" style={{ marginBottom: 4 }}>
            <span className="flex items-center gap-sm">
              <MapPin size={28} style={{ color: 'var(--accent-green)' }} />
              Local Hub
            </span>
          </h1>
          <p className="text-secondary">Find recycling centres, transit stations, and composting hubs near you</p>
        </div>
        <motion.button
          className="btn btn-primary"
          onClick={handleLocate}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={loading}
          id="locate-me-btn"
        >
          <Navigation size={16} /> {loading ? 'Locating…' : 'Locate Me'}
        </motion.button>
      </div>

      {/* Filters */}
      <div className="map-filters">
        {filters.map(f => (
          <motion.button
            key={f.id}
            className={`category-pill ${filter === f.id ? 'active' : ''}`}
            onClick={() => setFilter(f.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>{f.icon}</span> {f.label}
          </motion.button>
        ))}
      </div>

      {/* Map */}
      <div className="map-container">
        <MapContainer
          center={userPos || defaultCenter}
          zoom={13}
          style={{ width: '100%', height: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FlyToUser userPos={userPos} />
          {filteredLocations.map(loc => (
            <Marker key={loc.id} position={[loc.lat, loc.lng]} icon={createCustomIcon(loc.type)}>
              <Popup>
                <div style={{ fontFamily: 'Inter', minWidth: 180 }}>
                  <strong style={{ fontSize: 14 }}>{loc.name}</strong>
                  <div style={{ fontSize: 12, color: '#636E72', marginTop: 4 }}>
                    {TYPE_ICONS[loc.type]} {loc.type.charAt(0).toUpperCase() + loc.type.slice(1)}
                  </div>
                  <div style={{ fontSize: 12, marginTop: 4 }}>📍 {loc.address}</div>
                  <div style={{ fontSize: 12, color: '#95A5A6' }}>🕐 {loc.hours}</div>
                </div>
              </Popup>
            </Marker>
          ))}
          {userPos && (
            <Marker position={userPos}>
              <Popup>
                <strong>📍 Your Location</strong>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {/* Location List */}
      <div style={{ marginTop: 'var(--space-lg)' }}>
        <h3 className="text-md text-semibold" style={{ marginBottom: 'var(--space-md)' }}>
          Nearby Locations ({filteredLocations.length})
        </h3>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 'var(--space-md)' }}>
          {filteredLocations.map((loc, i) => (
            <motion.div
              key={loc.id}
              className="card"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4, boxShadow: 'var(--shadow-md)' }}
            >
              <div className="flex items-center gap-sm" style={{ marginBottom: 'var(--space-sm)' }}>
                <span style={{ fontSize: 20 }}>{TYPE_ICONS[loc.type]}</span>
                <span
                  className="badge"
                  style={{
                    background: `${TYPE_COLORS[loc.type]}18`,
                    color: TYPE_COLORS[loc.type],
                  }}
                >
                  {loc.type}
                </span>
              </div>
              <h4 className="text-sm text-semibold">{loc.name}</h4>
              <p className="text-xs text-tertiary" style={{ marginTop: 4 }}>📍 {loc.address}</p>
              <p className="text-xs text-tertiary">🕐 {loc.hours}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
