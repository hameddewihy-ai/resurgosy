import { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { MapPin, Clock } from 'lucide-react';

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_KEY || '';

const STATUS_COLORS = {
  pending:     '#F97316',
  in_progress: '#5B7DBE',
  completed:   '#22c55e',
};
const PRIORITY_ICON = { high: '🔴', medium: '🟡', low: '🟢' };

const darkStyles = [
  { elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1e293b' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#334155' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3b5280' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0f172a' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
];

const container = { width: '100%', height: '100%' };
const center = { lat: 33.52, lng: 36.30 };

export default function TaskMap({ tasks, selectedTask, onSelectTask }) {
  const [hovered, setHovered] = useState(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    language: 'ar',
    region: 'SY',
  });

  const onMapClick = useCallback(() => setHovered(null), []);

  if (!GOOGLE_MAPS_API_KEY || !isLoaded) {
    return <TaskMapPlaceholder tasks={tasks} onSelectTask={onSelectTask} selectedTask={selectedTask} />;
  }

  return (
    <GoogleMap
      mapContainerStyle={container}
      center={selectedTask ? { lat: selectedTask.lat, lng: selectedTask.lng } : center}
      zoom={selectedTask ? 14 : 11}
      options={{ styles: darkStyles, zoomControl: true, mapTypeControl: false, streetViewControl: false, fullscreenControl: false }}
      onClick={onMapClick}
    >
      {tasks.map((task) => (
        <Marker
          key={task.id}
          position={{ lat: task.lat, lng: task.lng }}
          onClick={() => { onSelectTask(task); setHovered(task); }}
          icon={{
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: selectedTask?.id === task.id ? 14 : 10,
            fillColor: STATUS_COLORS[task.status],
            fillOpacity: 1,
            strokeColor: selectedTask?.id === task.id ? '#ffffff' : 'rgba(255,255,255,0.4)',
            strokeWeight: selectedTask?.id === task.id ? 3 : 1.5,
          }}
        />
      ))}

      {hovered && (
        <InfoWindow
          position={{ lat: hovered.lat, lng: hovered.lng }}
          onCloseClick={() => setHovered(null)}
        >
          <div dir="rtl" className="p-1 min-w-[180px]">
            <p className="font-bold text-slate-800 text-sm">{hovered.property}</p>
            <p className="text-xs text-slate-500 mt-0.5">{hovered.city}</p>
            <div className="flex items-center justify-between mt-2 gap-2">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium text-white`}
                style={{ background: STATUS_COLORS[hovered.status] }}>
                {hovered.status === 'pending' ? 'معلّق' : hovered.status === 'in_progress' ? 'جارٍ' : 'مكتمل'}
              </span>
              <span>{PRIORITY_ICON[hovered.priority]}</span>
            </div>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}

// Fallback when no API key
function TaskMapPlaceholder({ tasks, onSelectTask, selectedTask }) {
  return (
    <div className="w-full h-full bg-slate-800/40 rounded-2xl flex flex-col overflow-auto p-4 gap-2" dir="rtl">
      <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
        <MapPin size={13} className="text-brand" />
        <span>أضف <code className="bg-slate-700 px-1 rounded text-brand">REACT_APP_GOOGLE_MAPS_KEY</code> لتفعيل الخريطة التفاعلية</span>
      </div>
      {tasks.map((task) => (
        <button key={task.id} onClick={() => onSelectTask(task)}
          className={`flex items-start gap-3 p-3 rounded-xl border text-right transition-all ${selectedTask?.id === task.id ? 'border-brand bg-brand/10' : 'border-slate-700 hover:border-slate-500 bg-slate-800/30'}`}>
          <span className="text-xl mt-0.5">{PRIORITY_ICON[task.priority]}</span>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">{task.property}</p>
            <p className="text-slate-400 text-xs flex items-center gap-1 mt-0.5">
              <MapPin size={10} />{task.city}
              {task.status === 'pending' && <span className="flex items-center gap-0.5 mr-2"><Clock size={10} /> معلّق</span>}
              {task.status === 'in_progress' && <span className="text-brand mr-2">جارٍ التنفيذ</span>}
            </p>
          </div>
          <span className="w-2.5 h-2.5 rounded-full shrink-0 mt-1.5" style={{ background: STATUS_COLORS[task.status] }} />
        </button>
      ))}
    </div>
  );
}
