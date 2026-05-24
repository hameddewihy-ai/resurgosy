import { useEffect, useRef, useState } from 'react';
import { Flame, Filter } from 'lucide-react';

// Industrial zones in Homs with demand gap data
const ZONES = [
  { id: 'z1',  name: 'المنطقة الصناعية الأولى',   sector: 'heavy',    demand: 0.92, supply: 0.38, lat: 34.740, lng: 36.705, gap: 'حاد جداً',  area: 850  },
  { id: 'z2',  name: 'الرستن — تصنيع خفيف',        sector: 'light',    demand: 0.74, supply: 0.51, lat: 34.912, lng: 36.731, gap: 'متوسط',     area: 320  },
  { id: 'z3',  name: 'تلبيسة — مواد بناء',          sector: 'construction', demand: 0.88, supply: 0.29, lat: 34.831, lng: 36.741, gap: 'حاد',  area: 510  },
  { id: 'z4',  name: 'الزعفرانة — أغذية',           sector: 'food',     demand: 0.65, supply: 0.55, lat: 34.770, lng: 36.760, gap: 'منخفض',    area: 240  },
  { id: 'z5',  name: 'حمص الجديدة — نسيج',          sector: 'textile',  demand: 0.80, supply: 0.33, lat: 34.698, lng: 36.720, gap: 'حاد',      area: 430  },
  { id: 'z6',  name: 'مصفاة حمص — بتروكيماويات',    sector: 'chemical', demand: 0.95, supply: 0.20, lat: 34.753, lng: 36.795, gap: 'حاد جداً', area: 1200 },
  { id: 'z7',  name: 'العاصي — صناعة ورق',           sector: 'light',    demand: 0.58, supply: 0.60, lat: 34.775, lng: 36.672, gap: 'فائض',     area: 180  },
  { id: 'z8',  name: 'القصير — تعدين',               sector: 'heavy',    demand: 0.70, supply: 0.25, lat: 34.508, lng: 36.584, gap: 'حاد',      area: 760  },
];

const SECTORS = {
  all:          { label: 'الكل',            color: '#5B7DBE' },
  heavy:        { label: 'صناعة ثقيلة',    color: '#ef4444' },
  light:        { label: 'صناعة خفيفة',    color: '#f97316' },
  construction: { label: 'مواد بناء',       color: '#eab308' },
  food:         { label: 'صناعة غذائية',   color: '#22c55e' },
  textile:      { label: 'نسيج وملابس',    color: '#a78bfa' },
  chemical:     { label: 'بتروكيماويات',   color: '#ec4899' },
};

// Demand gap → heat color (blue=low gap, red=high gap)
function gapToColor(demand, supply) {
  const gap = Math.max(0, demand - supply);
  const r = Math.round(gap * 240);
  const g = Math.round((1 - gap) * 100);
  const b = Math.round((1 - gap) * 30 + 20);
  return `rgb(${r},${g},${b})`;
}

function gapAlpha(demand, supply) {
  return 0.3 + Math.max(0, demand - supply) * 0.65;
}

// Map coordinate → canvas pixel (rough bounding box for Homs region)
const BOUNDS = { minLat: 34.48, maxLat: 34.94, minLng: 36.55, maxLng: 36.82 };
function toCanvas(lat, lng, W, H) {
  const x = ((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * W;
  const y = H - ((lat - BOUNDS.minLat) / (BOUNDS.maxLat - BOUNDS.minLat)) * H;
  return { x, y };
}

export default function DemandHeatMap() {
  const canvasRef = useRef(null);
  const [sector, setSector] = useState('all');
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null);

  // Draw heat map on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = canvas.width;
    const H = canvas.height;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, W, H);

    // Grid lines
    ctx.strokeStyle = '#1e3a5f22';
    ctx.lineWidth = 1;
    for (let i = 0; i < W; i += 40) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, H); ctx.stroke(); }
    for (let i = 0; i < H; i += 40) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(W, i); ctx.stroke(); }

    // Draw heat blobs
    ZONES.forEach((z) => {
      if (sector !== 'all' && z.sector !== sector) return;

      const { x, y } = toCanvas(z.lat, z.lng, W, H);
      const radius = 40 + (z.area / 1200) * 60;
      const alpha = gapAlpha(z.demand, z.supply);
      const col = gapToColor(z.demand, z.supply);

      const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
      grad.addColorStop(0, col.replace('rgb', 'rgba').replace(')', `,${alpha})`));
      grad.addColorStop(0.5, col.replace('rgb', 'rgba').replace(')', `,${alpha * 0.5})`));
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    });

    // Zone markers
    ZONES.forEach((z) => {
      if (sector !== 'all' && z.sector !== sector) return;
      const { x, y } = toCanvas(z.lat, z.lng, W, H);
      const isHov = hovered?.id === z.id || selected?.id === z.id;
      ctx.beginPath();
      ctx.arc(x, y, isHov ? 9 : 6, 0, Math.PI * 2);
      ctx.fillStyle = isHov ? '#ffffff' : gapToColor(z.demand, z.supply);
      ctx.fill();
      ctx.strokeStyle = '#ffffff88';
      ctx.lineWidth = isHov ? 2 : 1;
      ctx.stroke();

      if (isHov) {
        ctx.fillStyle = '#ffffffcc';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(z.name.split('—')[0].trim(), x + 12, y + 4);
      }
    });
  }, [sector, hovered, selected]);

  const handleMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvasRef.current.width / rect.width);
    const my = (e.clientY - rect.top)  * (canvasRef.current.height / rect.height);
    const W = canvasRef.current.width;
    const H = canvasRef.current.height;
    const hit = ZONES.find((z) => {
      if (sector !== 'all' && z.sector !== sector) return false;
      const { x, y } = toCanvas(z.lat, z.lng, W, H);
      return Math.hypot(mx - x, my - y) < 20;
    });
    setHovered(hit || null);
  };

  const handleClick = () => {
    if (hovered) setSelected(hovered);
    else setSelected(null);
  };

  const zone = selected || hovered;

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header + sector filter */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-white font-bold text-sm flex items-center gap-2">
            <Flame size={16} className="text-cta" />
            خريطة حرارية — فجوات الطلب الصناعي · محافظة حمص
          </h3>
          <p className="text-slate-400 text-xs mt-1">اللون الأحمر = فجوة طلب حادة · الأزرق = فائض عرض</p>
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          <Filter size={12} className="text-slate-500 ml-1" />
          {Object.entries(SECTORS).map(([k, v]) => (
            <button key={k} onClick={() => setSector(k)}
              className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${sector === k ? 'text-white border-transparent' : 'text-slate-400 border-slate-700 hover:text-white'}`}
              style={sector === k ? { background: v.color + '33', borderColor: v.color } : {}}>
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
        {/* Canvas map */}
        <div className="rounded-2xl overflow-hidden relative bg-slate-900 border border-slate-700/50">
          <canvas
            ref={canvasRef}
            width={640} height={380}
            style={{ width: '100%', height: 'auto', cursor: hovered ? 'pointer' : 'default', display: 'block' }}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHovered(null)}
            onClick={handleClick}
          />
          {/* Legend */}
          <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-slate-900/80 backdrop-blur rounded-lg px-3 py-1.5">
            <div className="flex items-center gap-1">
              {['#1460e8','#e88a14','#e81414'].map((c, i) => (
                <div key={i} className="w-4 h-2 rounded-sm" style={{ background: c }} />
              ))}
            </div>
            <span className="text-xs text-slate-400">منخفض ← عالي</span>
          </div>
        </div>

        {/* Zone detail panel */}
        <div className="space-y-3">
          {zone ? (
            <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl p-4 space-y-3" key={zone.id}>
              <div>
                <p className="text-white font-bold text-sm">{zone.name}</p>
                <p className="text-xs mt-1 px-2 py-0.5 rounded-full border inline-block"
                  style={{ color: SECTORS[zone.sector].color, borderColor: SECTORS[zone.sector].color + '44', background: SECTORS[zone.sector].color + '11' }}>
                  {SECTORS[zone.sector].label}
                </p>
              </div>

              {/* Demand vs Supply bars */}
              {[['الطلب', zone.demand, '#ef4444'], ['العرض', zone.supply, '#5B7DBE']].map(([label, val, color]) => (
                <div key={label}>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>{label}</span><span style={{ color }}>{(val * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${val * 100}%`, background: color }} />
                  </div>
                </div>
              ))}

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-800/60 rounded-lg p-2 text-center">
                  <p className="text-slate-400 mb-0.5">فجوة الطلب</p>
                  <p className="font-bold" style={{ color: gapToColor(zone.demand, zone.supply) }}>
                    {((zone.demand - zone.supply) * 100).toFixed(0)}%
                  </p>
                </div>
                <div className="bg-slate-800/60 rounded-lg p-2 text-center">
                  <p className="text-slate-400 mb-0.5">المساحة المتاحة</p>
                  <p className="text-white font-bold">{zone.area.toLocaleString()} م²</p>
                </div>
                <div className="bg-slate-800/60 rounded-lg p-2 text-center col-span-2">
                  <p className="text-slate-400 mb-0.5">تقييم الفرصة</p>
                  <p className={`font-bold ${zone.gap === 'حاد جداً' ? 'text-red-400' : zone.gap === 'حاد' ? 'text-orange-400' : zone.gap === 'متوسط' ? 'text-yellow-400' : 'text-green-400'}`}>
                    {zone.gap}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl p-6 text-center text-slate-500">
              <Flame size={28} className="mx-auto mb-2 text-slate-700" />
              <p className="text-xs">انقر على نقطة في الخريطة لعرض تفاصيل المنطقة الصناعية</p>
            </div>
          )}

          {/* Top gaps leaderboard */}
          <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl p-4">
            <p className="text-white text-xs font-bold mb-3">أعلى فجوات الطلب</p>
            {[...ZONES]
              .filter((z) => sector === 'all' || z.sector === sector)
              .sort((a, b) => (b.demand - b.supply) - (a.demand - a.supply))
              .slice(0, 4)
              .map((z) => (
                <button key={z.id} onClick={() => setSelected(z)}
                  className="w-full flex items-center gap-2 py-2 border-b border-slate-800/60 last:border-0 hover:bg-slate-800/30 rounded transition-colors text-right">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: gapToColor(z.demand, z.supply) }} />
                  <span className="text-slate-300 text-xs flex-1 truncate">{z.name.split('—')[0].trim()}</span>
                  <span className="text-xs font-bold" style={{ color: gapToColor(z.demand, z.supply) }}>
                    {((z.demand - z.supply) * 100).toFixed(0)}%
                  </span>
                </button>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
