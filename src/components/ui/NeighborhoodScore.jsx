import { useState, useEffect } from 'react';
import { School, Hospital, ShoppingBag, Train, TreePine, Loader2 } from 'lucide-react';

const AMENITY_TYPES = [
  { key: 'school',      label: 'مدارس',          icon: School,      amenity: 'school',    color: 'text-blue-500',   bg: 'bg-blue-50'   },
  { key: 'hospital',    label: 'مستشفيات',        icon: Hospital,    amenity: 'hospital',  color: 'text-red-500',    bg: 'bg-red-50'    },
  { key: 'supermarket', label: 'مراكز تسوق',      icon: ShoppingBag, amenity: 'supermarket',color:'text-green-500',  bg: 'bg-green-50'  },
  { key: 'bus_stop',    label: 'نقل عام',          icon: Train,       amenity: 'bus_station',color:'text-purple-500', bg: 'bg-purple-50' },
  { key: 'park',        label: 'حدائق',            icon: TreePine,    leisure: 'park',      color: 'text-emerald-500',bg: 'bg-emerald-50'},
];

const RADIUS = 1000; // metres

function scoreFromCount(count) {
  if (count >= 5) return 5;
  if (count >= 3) return 4;
  if (count >= 2) return 3;
  if (count >= 1) return 2;
  return 1;
}

function ScoreBar({ score, color }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i <= score ? color.replace('text-','bg-') : 'bg-navy/10'}`} />
      ))}
    </div>
  );
}

export default function NeighborhoodScore({ lat, lng }) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(false);

  useEffect(() => {
    if (!lat || !lng) return;
    setLoading(true);
    setError(false);

    const overpassQuery = `[out:json];(${AMENITY_TYPES.map(t => {
      const filter = t.leisure
        ? `node["leisure"="${t.leisure}"](around:${RADIUS},${lat},${lng});`
        : `node["amenity"="${t.amenity}"](around:${RADIUS},${lat},${lng});`;
      return filter;
    }).join('')});out count;`;

    fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`)
      .then(r => r.json())
      .then(json => {
        const counts = {};
        AMENITY_TYPES.forEach(t => { counts[t.key] = 0; });
        json?.elements?.forEach(el => {
          const a = el.tags?.amenity || el.tags?.leisure;
          const match = AMENITY_TYPES.find(t => t.amenity === a || t.leisure === a);
          if (match) counts[match.key] = (counts[match.key] || 0) + 1;
        });
        setData(counts);
        setLoading(false);
      })
      .catch(() => { setError(true); setLoading(false); });
  }, [lat, lng]);

  const overall = data
    ? Math.round(AMENITY_TYPES.reduce((s, t) => s + scoreFromCount(data[t.key] || 0), 0) / AMENITY_TYPES.length)
    : null;

  if (!lat || !lng) return null;

  return (
    <div className="bg-white border border-navy/10 rounded-2xl p-5" dir="rtl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-navy font-bold text-sm">نقاط الحي</h3>
        {overall != null && !loading && (
          <div className="flex items-center gap-1.5 bg-brand/10 rounded-xl px-3 py-1">
            <span className="text-brand font-black text-lg">{overall}</span>
            <span className="text-charcoal/50 text-xs">/5</span>
          </div>
        )}
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-charcoal/50 text-sm py-4 justify-center">
          <Loader2 size={16} className="animate-spin text-brand" />
          جارٍ تحليل الحي...
        </div>
      )}

      {error && (
        <p className="text-charcoal/40 text-xs text-center py-3">تعذّر تحميل البيانات — تحقق من الاتصال</p>
      )}

      {data && !loading && (
        <div className="space-y-3">
          {AMENITY_TYPES.map(t => {
            const count = data[t.key] || 0;
            const score = scoreFromCount(count);
            const Icon  = t.icon;
            return (
              <div key={t.key} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${t.bg}`}>
                      <Icon size={13} className={t.color} />
                    </div>
                    <span className="text-xs text-charcoal/70">{t.label}</span>
                  </div>
                  <span className="text-[10px] text-charcoal/45">{count > 0 ? `${count} في دائرة 1كم` : 'لا يوجد'}</span>
                </div>
                <ScoreBar score={score} color={t.color} />
              </div>
            );
          })}
          <p className="text-[10px] text-charcoal/30 text-center pt-1">
            البيانات من OpenStreetMap · دائرة {RADIUS/1000}كم
          </p>
        </div>
      )}
    </div>
  );
}
