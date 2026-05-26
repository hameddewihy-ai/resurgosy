import { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';

const SY_CENTER = [34.8, 38.2]; // Center of Syria

// ── Custom SVG Icon for Markers ────────────────────────────────────────────────
// Instead of using image files, we draw a custom SVG icon so we can color it dynamically.
const createCustomIcon = (status) => {
  const color = status === 'للبيع' ? '#f37124' : '#5979bb';
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="32" height="32">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  `;
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: svg,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

// ── Auto-Bounds Component ──────────────────────────────────────────────────────
// This component listens for properties changes and adjusts the map bounds automatically.
function MapBoundsManager({ properties }) {
  const map = useMap();
  
  useMemo(() => {
    if (!properties || properties.length === 0) return;
    const valid = properties.filter(p => p.lat != null && p.lng != null);
    if (valid.length === 0) return;
    const bounds = L.latLngBounds(valid.map(p => [p.lat, p.lng]));
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [map, properties]);

  return null;
}

// ── Main Map Component ────────────────────────────────────────────────────────
export default function MapSection({ properties = [] }) {
  const [, setActivePopup] = useState(null);

  if (!properties || properties.length === 0) {
    return (
      <div className="w-full h-full bg-cream flex flex-col items-center justify-center p-5 text-center">
        <MapPin size={32} className="text-charcoal/20 mb-3" />
        <p className="text-navy font-bold text-sm mb-1">لا يوجد عقارات لعرضها</p>
        <p className="text-charcoal/50 text-xs">يرجى تغيير فلاتر البحث لرؤية النتائج على الخريطة.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative" dir="ltr">
      <MapContainer 
        center={SY_CENTER} 
        zoom={6} 
        style={{ width: '100%', height: '100%', zIndex: 10 }}
        scrollWheelZoom={true}
      >
        {/* Modern OpenStreetMap Tile Layer (CartoDB Positron - Light Theme) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        <MapBoundsManager properties={properties} />

        {properties.filter(p => p.lat != null && p.lng != null).map((p) => (
          <Marker
            key={p.id}
            position={[p.lat, p.lng]}
            icon={createCustomIcon(p.status)}
            eventHandlers={{
              click: () => setActivePopup(p.id)
            }}
          >
            <Popup className="resurgo-custom-popup" closeButton={false}>
              <div dir="rtl" className="w-[200px] font-sans">
                {p.images?.[0] && (
                  <div className="relative h-24 mb-2 rounded-lg overflow-hidden">
                    <img 
                      src={p.images[0]} 
                      alt={p.title} 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                    <span className={`absolute top-1 right-1 text-[10px] px-1.5 py-0.5 rounded font-bold text-white ${p.status === 'للبيع' ? 'bg-cta' : 'bg-brand'}`}>
                      {p.status}
                    </span>
                  </div>
                )}
                <h4 className="font-bold text-navy text-xs leading-tight mb-1 truncate">{p.title}</h4>
                <p className="text-[10px] text-charcoal/60 mb-2 truncate">{p.city} — {p.district}</p>
                <p className="font-black text-brand text-sm mb-3">{p.priceDisplay}</p>
                
                <a 
                  href={`/properties/${p.id}`}
                  className="block w-full text-center bg-navy hover:bg-brand text-white transition-colors py-1.5 rounded-lg text-xs font-bold"
                >
                  عرض العقار
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Custom Styles for Leaflet Popups to match Resurgo theme */}
      <style>{`
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          padding: 4px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
        }
        .leaflet-popup-content {
          margin: 8px;
        }
        .leaflet-container {
          font-family: 'Cairo', sans-serif;
        }
        .leaflet-control-attribution {
          font-size: 9px !important;
        }
      `}</style>
    </div>
  );
}
