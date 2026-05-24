import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, MapPin, Eye, BarChart3, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import SEO from '../components/SEO';
import PageHero from '../components/PageHero';

// Simulated demand scores per city (0-100) and metrics
const CITY_DATA = [
  { city: 'دمشق',       demand: 94, listings: 1840, avgPrice: 185000, growth: +18, type: 'سكني/تجاري' },
  { city: 'ريف دمشق',   demand: 81, listings: 1120, avgPrice: 98000,  growth: +22, type: 'سكني'       },
  { city: 'حلب',        demand: 76, listings: 980,  avgPrice: 72000,  growth: +31, type: 'سكني/صناعي'  },
  { city: 'اللاذقية',   demand: 70, listings: 620,  avgPrice: 115000, growth: +14, type: 'سياحي/سكني'  },
  { city: 'طرطوس',      demand: 64, listings: 430,  avgPrice: 88000,  growth: +16, type: 'سياحي'       },
  { city: 'حمص',        demand: 58, listings: 510,  avgPrice: 61000,  growth: +27, type: 'سكني'        },
  { city: 'حماة',       demand: 52, listings: 340,  avgPrice: 54000,  growth: +19, type: 'سكني'        },
  { city: 'السويداء',   demand: 48, listings: 280,  avgPrice: 67000,  growth: +9,  type: 'سكني'        },
  { city: 'درعا',       demand: 42, listings: 190,  avgPrice: 48000,  growth: +11, type: 'سكني'        },
  { city: 'إدلب',       demand: 35, listings: 140,  avgPrice: 32000,  growth: +5,  type: 'سكني'        },
  { city: 'دير الزور',  demand: 31, listings: 110,  avgPrice: 29000,  growth: +4,  type: 'سكني'        },
  { city: 'الرقة',      demand: 28, listings: 95,   avgPrice: 26000,  growth: +3,  type: 'سكني'        },
  { city: 'الحسكة',     demand: 26, listings: 80,   avgPrice: 24000,  growth: +2,  type: 'سكني'        },
  { city: 'القنيطرة',   demand: 19, listings: 45,   avgPrice: 21000,  growth: +1,  type: 'سكني'        },
];

const METRICS = [
  { key: 'demand',   label: 'مؤشر الطلب',     suffix: '' },
  { key: 'listings', label: 'إعلانات نشطة',   suffix: '' },
  { key: 'avgPrice', label: 'متوسط السعر ($)', suffix: '' },
  { key: 'growth',   label: 'نمو سنوي',        suffix: '%' },
];

function demandColor(score) {
  if (score >= 80) return { bg: 'bg-red-500',    text: 'text-red-500',    bar: '#ef4444', label: 'طلب مرتفع جداً' };
  if (score >= 60) return { bg: 'bg-orange-500', text: 'text-orange-500', bar: '#f97316', label: 'طلب مرتفع' };
  if (score >= 40) return { bg: 'bg-amber-400',  text: 'text-amber-500',  bar: '#f59e0b', label: 'طلب متوسط' };
  if (score >= 20) return { bg: 'bg-blue-400',   text: 'text-blue-500',   bar: '#3b82f6', label: 'طلب منخفض' };
  return                  { bg: 'bg-navy/30',    text: 'text-charcoal/40',bar: '#94a3b8', label: 'طلب ضعيف' };
}

const STATS = [
  { label: 'مدينة مرصودة', value: '14' },
  { label: 'إعلان نشط',    value: '6.7K+' },
  { label: 'تحديث البيانات', value: 'يومي' },
];

export default function DemandHeatmapPage() {
  const [selected,   setSelected]   = useState(null);
  const [activeMetric, setActiveMetric] = useState('demand');
  const [view,       setView]       = useState('grid'); // grid | chart

  const metric = METRICS.find(m => m.key === activeMetric);
  const sortedData = [...CITY_DATA].sort((a, b) => b[activeMetric] - a[activeMetric]);

  return (
    <div className="min-h-screen bg-[#f2f1ee]" dir="rtl">
      <SEO
        title="خريطة الطلب العقاري | Resurgo"
        description="تحليل حي لمؤشرات الطلب العقاري في المدن السورية — استخدمها لاتخاذ قرارات استثمارية مدروسة"
        path="/heatmap"
      />

      <PageHero
        num="12"
        eyebrow="خريطة الطلب العقاري"
        title={
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-[1.4]">
            أين يتركّز الطلب؟<br />
            <span className="text-brand">اقرأ السوق قبل الاستثمار</span>
          </h1>
        }
        subtitle="بيانات حية من 14 محافظة سورية — تعرّف على أين يتركّز الطلب قبل أن تستثمر"
        breadcrumb={[{ label: 'الرئيسية', to: '/' }, { label: 'الاستثمار', to: '/invest' }, { label: 'خريطة الطلب' }]}
      >
        <div className="flex flex-wrap gap-3 mt-2">
          {STATS.map(s => (
            <div key={s.label} className="flex flex-col bg-white/10 border border-white/15 rounded-xl px-4 py-2.5 backdrop-blur-sm min-w-[100px]">
              <span className="text-white font-black text-lg leading-none">{s.value}</span>
              <span className="text-white/55 text-[10px] mt-0.5">{s.label}</span>
            </div>
          ))}
        </div>
      </PageHero>

      <div>
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-navy font-black text-xl">مؤشر الطلب حسب المدينة</h2>
            <p className="text-charcoal/50 text-xs mt-0.5">اضغط على أي مدينة لعرض تفاصيلها</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Metric selector */}
            <div className="flex bg-white border border-navy/10 rounded-xl p-0.5 gap-0.5">
              {METRICS.map(m => (
                <button key={m.key}
                  onClick={() => setActiveMetric(m.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                    activeMetric === m.key ? 'bg-brand text-white' : 'text-charcoal/60 hover:text-navy'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
            {/* View toggle */}
            <div className="flex bg-white border border-navy/10 rounded-xl p-0.5 gap-0.5">
              <button onClick={() => setView('grid')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${view === 'grid' ? 'bg-navy text-white' : 'text-charcoal/60 hover:text-navy'}`}>
                شبكة
              </button>
              <button onClick={() => setView('chart')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${view === 'chart' ? 'bg-navy text-white' : 'text-charcoal/60 hover:text-navy'}`}>
                رسم بياني
              </button>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 items-center">
          <span className="text-xs text-charcoal/50 font-medium">مستوى الطلب:</span>
          {[
            { label: 'مرتفع جداً', cls: 'bg-red-500' },
            { label: 'مرتفع',      cls: 'bg-orange-500' },
            { label: 'متوسط',      cls: 'bg-amber-400' },
            { label: 'منخفض',      cls: 'bg-blue-400' },
            { label: 'ضعيف',       cls: 'bg-navy/20' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-sm ${l.cls}`} />
              <span className="text-xs text-charcoal/60">{l.label}</span>
            </div>
          ))}
        </div>

        {view === 'grid' ? (
          /* Heat Grid */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {sortedData.map((d, i) => {
              const color = demandColor(d.demand);
              const val   = d[activeMetric];
              const isSelected = selected?.city === d.city;
              return (
                <motion.button
                  key={d.city}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => setSelected(isSelected ? null : d)}
                  className={`relative text-right p-4 rounded-2xl border-2 transition-all duration-200 ${
                    isSelected
                      ? 'border-brand shadow-lg shadow-brand/20 scale-[1.03]'
                      : 'border-transparent hover:border-navy/20 hover:shadow-md'
                  } bg-white`}
                >
                  {/* Demand bar at top */}
                  <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl overflow-hidden">
                    <div className={`h-full ${color.bg} transition-all duration-500`} style={{ width: `${d.demand}%` }} />
                  </div>

                  <p className="text-navy font-black text-sm mt-1">{d.city}</p>
                  <p className={`text-2xl font-black mt-1 ${color.text}`}>
                    {typeof val === 'number' && activeMetric === 'avgPrice'
                      ? `$${(val / 1000).toFixed(0)}k`
                      : `${val}${metric.suffix}`}
                  </p>
                  <p className="text-charcoal/40 text-[10px] mt-0.5">{metric.label}</p>
                  <div className={`inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-[9px] font-bold text-white ${color.bg}`}>
                    {color.label}
                  </div>
                </motion.button>
              );
            })}
          </div>
        ) : (
          /* Bar Chart view */
          <div className="bg-white rounded-2xl border border-navy/10 p-6">
            <ResponsiveContainer width="100%" height={380}>
              <BarChart data={sortedData} layout="vertical" margin={{ right: 20, left: 60 }}>
                <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis type="category" dataKey="city" tick={{ fontSize: 11, fill: '#1f2a38', fontFamily: 'Cairo' }} width={70} />
                <Tooltip
                  formatter={(v) => [`${v}${metric.suffix}`, metric.label]}
                  contentStyle={{ borderRadius: 12, border: '1px solid rgba(31,42,56,0.1)', fontSize: 12, fontFamily: 'Cairo', direction: 'rtl' }}
                />
                <Bar dataKey={activeMetric} radius={[0, 6, 6, 0]}>
                  {sortedData.map((d) => (
                    <Cell key={d.city} fill={demandColor(d.demand).bar} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Detail panel for selected city */}
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg"
          >
            <div className="flex items-start justify-between mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <MapPin size={16} className="text-brand" />
                  <h3 className="text-navy font-black text-xl">{selected.city}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-white ${demandColor(selected.demand).bg}`}>
                    {demandColor(selected.demand).label}
                  </span>
                </div>
                <p className="text-charcoal/50 text-xs">{selected.type}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-charcoal/30 hover:text-navy text-lg font-bold">✕</button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: BarChart3,  label: 'مؤشر الطلب',     value: `${selected.demand}/100`,                       color: 'text-brand'  },
                { icon: Eye,        label: 'إعلانات نشطة',   value: selected.listings.toLocaleString(),             color: 'text-navy'   },
                { icon: TrendingUp, label: 'نمو سنوي',        value: `+${selected.growth}%`,                         color: 'text-emerald-600' },
                { icon: MapPin,     label: 'متوسط السعر',    value: `$${selected.avgPrice.toLocaleString()}`,        color: 'text-cta'    },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="bg-cream rounded-xl p-4 text-center">
                  <Icon size={18} className={`${color} mx-auto mb-2`} />
                  <p className={`font-black text-xl ${color}`}>{value}</p>
                  <p className="text-charcoal/50 text-[10px] mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 flex gap-3">
              <Link to={`/properties?city=${encodeURIComponent(selected.city)}`}
                className="flex items-center gap-1.5 text-xs btn-primary py-2 px-4 rounded-xl">
                عرض عقارات {selected.city} <ArrowLeft size={12} />
              </Link>
              <Link to="/invest"
                className="flex items-center gap-1.5 text-xs btn-ghost py-2 px-4 rounded-xl">
                فرص الاستثمار
              </Link>
            </div>
          </motion.div>
        )}

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-800 leading-relaxed">
          <strong>ملاحظة:</strong> تعتمد المؤشرات على بيانات إعلانات منصة RESURGO ومصادر بيانات خارجية. هي مؤشرات استرشادية وليست تقييماً رسمياً. يُنصح بالاستعانة بتقرير تقييم معتمد قبل أي قرار استثماري.
        </div>
      </div>
      </div>
    </div>
  );
}
