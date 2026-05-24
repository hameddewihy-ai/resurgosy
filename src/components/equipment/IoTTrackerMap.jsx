import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Wifi, WifiOff, Gauge, Thermometer, MapPin, Truck, Radio } from 'lucide-react';
import { CATEGORY_COLORS } from '../../data/equipmentData';

// Syria bounding box: lat 32.3–37.3, lng 35.7–42.4
const MAP_LAT = [32.3, 37.3];
const MAP_LNG = [35.7, 42.4];

// Transform EQUIPMENT_SEED items → IoT display format
function seedToIot(seed) {
  return seed
    .filter(eq => eq.lat && eq.lng)
    .map(eq => ({
      id:     eq.id,
      name:   eq.name,
      plate:  eq.inspectionHash || eq.id,
      lat:    eq.lat,
      lng:    eq.lng,
      speed:  eq.telematics.state === 'running' ? Math.round((eq.telematics.engineLoad || 0) * 0.6) : 0,
      signal: eq.telematics.engineHoursTotal > 0
        ? (eq.telematics.fuelLevel > 25 ? 'good' : 'weak')
        : 'offline',
      engine: eq.telematics.state !== 'stopped',
      tenant: eq.provider,
      color:  CATEGORY_COLORS[eq.category] || '#5979bb',
    }));
}

const W = 500, H = 340;
function toXY(lat, lng) {
  const x = ((lng - MAP_LNG[0]) / (MAP_LNG[1] - MAP_LNG[0])) * W;
  const y = H - ((lat - MAP_LAT[0]) / (MAP_LAT[1] - MAP_LAT[0])) * H;
  return [x, y];
}

// Simple Syria outline polygon (simplified ~30 points)
const SYRIA_POLY = [
  [37.19,42.38],[37.10,42.20],[37.07,41.66],[36.63,41.29],[36.46,41.25],
  [36.16,41.35],[36.02,41.01],[35.88,40.69],[36.01,39.60],[36.63,38.39],
  [36.71,37.67],[36.53,37.07],[36.08,36.62],[35.98,36.17],[35.93,35.77],
  [35.73,35.82],[35.60,36.02],[35.89,36.45],[35.69,36.62],[35.68,36.93],
  [35.89,37.15],[35.80,37.39],[35.73,38.03],[33.38,38.79],[33.19,39.00],
  [32.73,39.36],[32.31,39.15],[32.31,40.21],[32.49,40.70],[32.65,41.38],
  [33.06,41.21],[33.50,41.25],[33.93,41.29],[34.38,40.69],[35.00,41.50],
  [35.30,41.70],[35.60,42.00],[36.00,42.38],[37.19,42.38],
].map(([lat, lng]) => toXY(lat, lng));

const POLY_D = SYRIA_POLY.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ') + ' Z';

// Cities for reference
const CITIES = [
  { name: 'دمشق',    lat: 33.51, lng: 36.29 },
  { name: 'حلب',     lat: 36.20, lng: 37.16 },
  { name: 'حمص',     lat: 34.73, lng: 36.72 },
  { name: 'اللاذقية',lat: 35.52, lng: 35.79 },
];

// Initial equipment positions
const INITIAL_EQUIPMENT = [
  { id: 'eq1', name: 'رافعة شوكية تويوتا', plate: 'د-12345', lat: 33.52, lng: 36.32, speed: 0, signal: 'good', engine: true,  tenant: 'مؤسسة الأمل للبناء', color: '#5979bb' },
  { id: 'eq2', name: 'حفارة كاتربيلر 320', plate: 'ح-98765', lat: 36.22, lng: 37.18, speed: 35, signal: 'good', engine: true,  tenant: 'شركة الإعمار السورية', color: '#f37124' },
  { id: 'eq3', name: 'رافعة برجية 40 طن',  plate: 'ل-55443', lat: 34.74, lng: 36.73, speed: 0, signal: 'weak', engine: false, tenant: 'مجموعة الإنشاءات', color: '#16a34a' },
  { id: 'eq4', name: 'خلاطة خرسانة موبايل',plate: 'م-33210', lat: 33.51, lng: 36.21, speed: 22, signal: 'good', engine: true,  tenant: 'مقاول مشروع المزة', color: '#9333ea' },
];

const SIGNAL_CFG = {
  good:       { label: 'متصل',    icon: Wifi,    color: 'text-emerald-500', dot: 'bg-emerald-400' },
  weak:       { label: 'ضعيف',    icon: Wifi,    color: 'text-amber-500',   dot: 'bg-amber-400'   },
  offline:    { label: 'منقطع',   icon: WifiOff, color: 'text-red-500',     dot: 'bg-red-400'     },
};

function PingDot({ x, y, color, selected, onClick }) {
  return (
    <g onClick={onClick} style={{ cursor: 'pointer' }}>
      {/* Pulse rings */}
      <motion.circle cx={x} cy={y} r={16} fill={color} fillOpacity={0}
        stroke={color} strokeOpacity={0.3} strokeWidth={1}
        animate={{ r: [14, 24], opacity: [0.4, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }} />
      <motion.circle cx={x} cy={y} r={10} fill={color} fillOpacity={0}
        stroke={color} strokeOpacity={0.4} strokeWidth={1.5}
        animate={{ r: [8, 18], opacity: [0.5, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut', delay: 0.4 }} />
      {/* Core dot */}
      <motion.circle cx={x} cy={y} r={selected ? 10 : 7}
        fill={color} stroke="white" strokeWidth={2}
        animate={{ r: selected ? 10 : 7 }}
        transition={{ type: 'spring', damping: 15, stiffness: 300 }} />
      {/* Truck icon placeholder */}
      <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle"
        fontSize={selected ? 8 : 6} fill="white" fontWeight="bold">🚛</text>
    </g>
  );
}

export default function IoTTrackerMap({ equipment: equipmentProp, equipmentSeed }) {
  const [equipment, setEquipment] = useState(() => {
    if (equipmentSeed?.length) return seedToIot(equipmentSeed);
    return equipmentProp || INITIAL_EQUIPMENT;
  });
  const [selected, setSelected] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [tick, setTick] = useState(0);
  const intervalRef = useRef(null);

  // Simulate GPS movement
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setEquipment(prev => prev.map(eq => {
        if (!eq.engine) return eq;
        const dlat = (Math.random() - 0.5) * 0.04;
        const dlng = (Math.random() - 0.5) * 0.04;
        const newLat = Math.max(MAP_LAT[0] + 0.3, Math.min(MAP_LAT[1] - 0.3, eq.lat + dlat));
        const newLng = Math.max(MAP_LNG[0] + 0.3, Math.min(MAP_LNG[1] - 0.3, eq.lng + dlng));
        const signals = ['good', 'good', 'good', 'weak', 'good'];
        return { ...eq, lat: newLat, lng: newLng, speed: Math.floor(Math.random() * 65 + 5), signal: signals[Math.floor(Math.random() * signals.length)] };
      }));
      setLastUpdate(new Date());
      setTick(t => t + 1);
    }, 4000);
    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-black text-navy flex items-center gap-2">
            <Radio size={18} className="text-brand" /> تتبع المعدات (IoT)
          </h2>
          <p className="text-xs text-charcoal/50 mt-0.5">محاكاة GPS مباشرة — يتحدث كل 4 ثوانٍ</p>
        </div>
        <div className="flex items-center gap-3">
          <motion.div key={tick} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }}
            className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            آخر تحديث: {lastUpdate.toLocaleTimeString('ar-SY')}
          </motion.div>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'معدات مؤجرة', val: equipment.length, color: 'text-navy', icon: Truck },
          { label: 'تعمل الآن', val: equipment.filter(e => e.engine).length, color: 'text-emerald-600', icon: Gauge },
          { label: 'متوقفة', val: equipment.filter(e => !e.engine).length, color: 'text-amber-600', icon: Thermometer },
          { label: 'إشارة ضعيفة', val: equipment.filter(e => e.signal === 'weak' || e.signal === 'offline').length, color: 'text-red-500', icon: WifiOff },
        ].map(({ label, val, color, icon: Icon }) => (
          <div key={label} className="bg-white border border-navy/8 rounded-2xl p-3 flex items-center gap-3">
            <Icon size={16} className={color} />
            <div>
              <p className={`text-xl font-black ${color}`}>{val}</p>
              <p className="text-[10px] text-charcoal/50">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Map + Detail */}
      <div className="grid lg:grid-cols-[1fr_280px] gap-4">
        {/* SVG Map */}
        <div className="bg-white border border-navy/8 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-navy/5 flex items-center gap-2">
            <MapPin size={13} className="text-brand" />
            <p className="text-xs font-bold text-navy">الجمهورية العربية السورية</p>
            <span className="mr-auto text-[10px] text-charcoal/40">إحداثيات حقيقية مُحاكاة</span>
          </div>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 340 }}>
            {/* Background */}
            <rect width={W} height={H} fill="#f8fafc" />
            {/* Syria outline */}
            <path d={POLY_D} fill="#e2e8f0" stroke="#cbd5e1" strokeWidth={1.5} />
            {/* City labels */}
            {CITIES.map(city => {
              const [cx, cy] = toXY(city.lat, city.lng);
              return (
                <g key={city.name}>
                  <circle cx={cx} cy={cy} r={3} fill="#94a3b8" />
                  <text x={cx + 5} y={cy + 1} fontSize={9} fill="#64748b" fontFamily="sans-serif">{city.name}</text>
                </g>
              );
            })}
            {/* Equipment dots */}
            {equipment.map(eq => {
              const [x, y] = toXY(eq.lat, eq.lng);
              return (
                <PingDot key={eq.id} x={x} y={y} color={eq.color}
                  selected={selected === eq.id}
                  onClick={() => setSelected(selected === eq.id ? null : eq.id)} />
              );
            })}
          </svg>
        </div>

        {/* Equipment list / Detail */}
        <div className="flex flex-col gap-3">
          {equipment.map(eq => {
            const sigCfg = SIGNAL_CFG[eq.signal] || SIGNAL_CFG.good;
            const SigIcon = sigCfg.icon;
            const isSelected = selected === eq.id;
            return (
              <motion.button key={eq.id} layout onClick={() => setSelected(isSelected ? null : eq.id)}
                className={`w-full text-right bg-white border rounded-2xl p-3.5 transition-all hover:shadow-sm ${isSelected ? 'border-brand/40 ring-1 ring-brand/10' : 'border-navy/8'}`}>
                <div className="flex items-start gap-2.5 mb-2">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: eq.color + '20', border: `2px solid ${eq.color}40` }}>
                    <span className="text-sm">🚛</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-navy font-bold text-xs leading-tight truncate">{eq.name}</p>
                    <p className="text-charcoal/40 text-[9px]">{eq.plate}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${sigCfg.dot} ${eq.signal !== 'offline' ? 'animate-pulse' : ''}`} />
                    <SigIcon size={10} className={sigCfg.color} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[9px]">
                  <div className="bg-cream rounded-lg px-2 py-1">
                    <p className="text-charcoal/40">الحالة</p>
                    <p className={`font-bold ${eq.engine ? 'text-emerald-600' : 'text-charcoal/50'}`}>{eq.engine ? '🟢 تعمل' : '⚫ متوقفة'}</p>
                  </div>
                  <div className="bg-cream rounded-lg px-2 py-1">
                    <p className="text-charcoal/40">السرعة</p>
                    <p className="font-bold text-navy">{eq.engine ? `${eq.speed} كم/ساعة` : '— متوقفة'}</p>
                  </div>
                </div>
                {isSelected && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-2 pt-2 border-t border-navy/5">
                    <p className="text-[9px] text-charcoal/40 mb-0.5">المستأجر</p>
                    <p className="text-xs font-bold text-navy">{eq.tenant}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin size={9} className="text-charcoal/40" />
                      <p className="text-[9px] text-charcoal/50">{eq.lat.toFixed(4)}°N, {eq.lng.toFixed(4)}°E</p>
                    </div>
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
