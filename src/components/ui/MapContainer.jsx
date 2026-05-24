import React, { useEffect, useRef } from 'react';
import { MapContainer as LeafletMap, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { MapPin } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet icon issues in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

L.Marker.prototype.options.icon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Normal brand icon (gold)
const brandIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Active (hovered) icon — red and slightly larger
const activeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [32, 52],
  iconAnchor: [16, 52],
  popupAnchor: [1, -44],
  shadowSize: [52, 52],
});

// Emits plain-object bounds on every pan/zoom
function MapBoundsTracker({ onBoundsChange }) {
  useMapEvents({
    moveend: (e) => {
      const b = e.target.getBounds();
      onBoundsChange({ north: b.getNorth(), south: b.getSouth(), east: b.getEast(), west: b.getWest() });
    },
    zoomend: (e) => {
      const b = e.target.getBounds();
      onBoundsChange({ north: b.getNorth(), south: b.getSouth(), east: b.getEast(), west: b.getWest() });
    },
  });
  return null;
}

// Sync map view when center changes
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center.length === 2) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
}

// Opens popup for active marker automatically
function ActiveMarkerController({ properties, activePropertyId }) {
  const map = useMap();
  const markersRef = useRef({});

  useEffect(() => {
    if (!activePropertyId) {
      // Close all popups when no active property
      map.closePopup();
      return;
    }
    const marker = markersRef.current[activePropertyId];
    if (marker) {
      marker.openPopup();
      const prop = properties.find(p => p.id === activePropertyId);
      if (prop?.location?.lat && prop?.location?.lng) {
        map.panTo([prop.location.lat, prop.location.lng], { animate: true, duration: 0.5 });
      }
    }
  }, [activePropertyId, map, properties]);

  return null;
}

export default function MapContainer({ properties = [], activePropertyId = null, center = [34.8021, 38.9968], zoom = 6, onBoundsChange = null }) {
  const markerRefs = useRef({});

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden border border-navy/5 shadow-inner relative z-0">
      <LeafletMap center={center} zoom={zoom} scrollWheelZoom={true} className="w-full h-full">
        {/* OpenStreetMap tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ChangeView center={center} zoom={zoom} />
        <ActiveMarkerController properties={properties} activePropertyId={activePropertyId} />
        {onBoundsChange && <MapBoundsTracker onBoundsChange={onBoundsChange} />}

        {properties.map((prop) => {
          if (!prop.location?.lat || !prop.location?.lng) return null;
          const isActive = prop.id === activePropertyId;

          return (
            <Marker
              key={prop.id}
              position={[prop.location.lat, prop.location.lng]}
              icon={isActive ? activeIcon : brandIcon}
              ref={(ref) => { if (ref) markerRefs.current[prop.id] = ref; }}
            >
              <Popup className="resurgo-popup">
                <div className="text-right font-sans min-w-[160px]" dir="rtl">
                  {/* Image */}
                  <div className="h-24 w-full bg-navy/10 rounded-md mb-2 overflow-hidden">
                    {prop.images?.[0] && (
                      <img src={prop.images[0]} alt={prop.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    )}
                    {!prop.images?.[0] && prop.image && (
                      <img src={prop.image} alt={prop.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    )}
                  </div>
                  {/* Status badge */}
                  {prop.status && (
                    <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-bold mb-1 ${prop.status === 'للبيع' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {prop.status}
                    </span>
                  )}
                  <h3 className="font-bold text-navy text-sm mb-1 leading-snug">{prop.title}</h3>
                  <p className="text-brand font-black text-sm mb-1">
                    {prop.priceDisplay || (prop.price ? `${prop.price.toLocaleString()} $` : '—')}
                  </p>
                  <p className="text-charcoal/60 text-xs flex items-center gap-1">
                    <MapPin size={10} /> {prop.city}{prop.district ? ` - ${prop.district}` : ''}
                  </p>
                  {prop.area && (
                    <p className="text-charcoal/50 text-[11px] mt-0.5">المساحة: {prop.area} م²</p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </LeafletMap>
    </div>
  );
}
