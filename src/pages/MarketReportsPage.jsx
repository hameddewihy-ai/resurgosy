import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  TrendingUp, TrendingDown, Download, FileJson, Table2,
  Building2, MapPin, BarChart3, Clock, Percent, Info,
  ChevronDown, Globe,
} from 'lucide-react';
import PageHero from '../components/PageHero';
import SEO from '../components/SEO';
import {
  QUARTERLY_INDEX, COMPOSITE_INDEX, LATEST_BY_CITY,
  DAYS_ON_MARKET, RENTAL_YIELDS, REPORT_META,
} from '../data/marketIndex';

// ── Export helpers ─────────────────────────────────────────────────────────────
function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function downloadCSV(rows, filename) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]).join(',');
  const lines   = rows.map(r => Object.values(r).map(v => `"${v ?? ''}"`).join(','));
  const blob    = new Blob([[headers, ...lines].join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url     = URL.createObjectURL(blob);
  const a       = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ── Sub-components ─────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, trend, icon: Icon, accent = 'brand' }) {
  const accentMap = { brand: 'text-brand bg-brand/8 border-brand/15', emerald: 'text-emerald-600 bg-emerald-50 border-emerald-200', amber: 'text-amber-600 bg-amber-50 border-amber-200' };
  return (
    <div className="bg-white border border-navy/8 rounded-xl p-4 flex items-start gap-3">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 ${accentMap[accent]}`}>
        <Icon size={16} />
      </div>
      <div className="min-w-0">
        <p className="text-charcoal/50 text-[10px] font-bold uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-navy font-black text-lg leading-tight">{value}</p>
        {sub && <p className="text-charcoal/50 text-[10px] mt-0.5">{sub}</p>}
        {trend != null && (
          <span className={`flex items-center gap-0.5 text-xs font-bold mt-0.5 ${trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {trend >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {trend >= 0 ? '+' : ''}{trend}% سنوياً
          </span>
        )}
      </div>
    </div>
  );
}

function SectionHead({ title, sub, action }) {
  return (
    <div className="flex items-end justify-between mb-4">
      <div>
        <p className="text-brand text-xs font-bold uppercase tracking-widest mb-0.5">{sub}</p>
        <h2 className="text-navy font-black text-lg">{title}</h2>
      </div>
      {action}
    </div>
  );
}

const CITY_COLORS = {
  'دمشق': '#5979bb', 'حلب': '#f37124', 'اللاذقية': '#0ea5e9',
  'طرطوس': '#10b981', 'حمص': '#8b5cf6',
};

// ── Custom recharts tooltip (RTL-friendly) ─────────────────────────────────────
function RtlTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-navy text-white text-xs rounded-xl px-3 py-2 shadow-xl" dir="rtl">
      <p className="font-bold mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: {p.value} $/م²
        </p>
      ))}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function MarketReportsPage() {
  const [cityFilter, setCityFilter] = useState('الكل');
  const [typeFilter, setTypeFilter] = useState('سكني');
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  const CITIES = ['الكل', 'دمشق', 'حلب', 'اللاذقية', 'طرطوس', 'حمص'];
  const TYPES  = ['سكني', 'تجاري', 'صناعي', 'أرض'];

  // Latest residential stats per city for the bar chart
  const latestResidential = useMemo(() =>
    LATEST_BY_CITY.filter(r => r.type === 'سكني')
      .sort((a, b) => b.avg_price_sqm - a.avg_price_sqm),
  []);

  // Filtered trend data for line chart
  const trendData = useMemo(() => {
    const periods = [...new Set(QUARTERLY_INDEX.map(r => r.period))].sort();
    return periods.map(period => {
      const entry = { period };
      const cities = cityFilter === 'الكل' ? Object.keys(CITY_COLORS) : [cityFilter];
      cities.forEach(city => {
        const row = QUARTERLY_INDEX.find(r => r.period === period && r.city === city && r.type === typeFilter);
        if (row) entry[city] = row.avg_price_sqm;
      });
      return entry;
    }).filter(e => Object.keys(e).length > 1);
  }, [cityFilter, typeFilter]);

  // Composite index for separate chart
  const compositeData = COMPOSITE_INDEX.filter(r => r.avg_price_sqm != null);

  // Summary stats
  const damascusLatest   = latestResidential.find(r => r.city === 'دمشق');
  const avgYield         = (RENTAL_YIELDS.reduce((s, r) => s + r.yield_pct, 0) / RENTAL_YIELDS.length).toFixed(1);
  const avgDays          = Math.round(DAYS_ON_MARKET.reduce((s, r) => s + r.avg_days, 0) / DAYS_ON_MARKET.length);
  const totalTransactions = QUARTERLY_INDEX.filter(r => r.period === '2025-Q2').reduce((s, r) => s + (r.transactions || 0), 0);

  const handleExportJSON = () => {
    downloadJSON({
      meta: REPORT_META,
      index: QUARTERLY_INDEX,
      composite: compositeData,
      rental_yields: RENTAL_YIELDS,
      days_on_market: DAYS_ON_MARKET,
    }, 'resurgo-market-index-2025-Q2.json');
  };

  const handleExportCSV = () => {
    downloadCSV(QUARTERLY_INDEX, 'resurgo-market-index-2025-Q2.csv');
  };

  return (
    <div className="min-h-screen bg-[#f2f1ee]" dir="rtl">
      <SEO
        title="تقارير السوق"
        description="تقارير وإحصاءات السوق العقاري السوري — أسعار، اتجاهات، توقعات"
        path="/market-reports"
      />

      <PageHero
        num="12"
        eyebrow="بيانات السوق"
        title={
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-[1.4]">
            مؤشر الأسعار<br />
            <span className="text-brand">العقارية السورية.</span>
          </h1>
        }
        subtitle="بيانات ربعية موثّقة لأسعار العقارات في المحافظات الرئيسية — قابلة للتصدير للباحثين والمستثمرين"
        breadcrumb={[{ label: 'الرئيسية', to: '/' }, { label: 'تقارير السوق' }]}
      >
        <div className="flex flex-wrap gap-3 mt-2">
          <div className="flex items-center gap-2 bg-white/10 border border-white/15 rounded-xl px-4 py-2">
            <Globe size={13} className="text-brand" />
            <span className="text-white/70 text-xs">{REPORT_META.standard}</span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 border border-white/15 rounded-xl px-4 py-2">
            <BarChart3 size={13} className="text-brand" />
            <span className="text-white/70 text-xs">آخر تحديث: {REPORT_META.latest_period}</span>
          </div>
        </div>
      </PageHero>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">

        {/* ── Export bar ──────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-navy/8 rounded-xl px-5 py-3">
          <div>
            <p className="text-navy font-bold text-sm">{REPORT_META.title}</p>
            <p className="text-charcoal/50 text-xs">{REPORT_META.publisher} · {REPORT_META.latest_period} · {REPORT_META.currency}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl border border-navy/15 text-charcoal/70 hover:border-brand/40 hover:text-brand transition-all">
              <Table2 size={13} /> تصدير CSV
            </button>
            <button onClick={handleExportJSON}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-brand text-white hover:bg-navy transition-all">
              <FileJson size={13} /> تصدير JSON
            </button>
          </div>
        </div>

        {/* ── KPI cards ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="متوسط سعر م² — دمشق سكني"  value={`${damascusLatest?.avg_price_sqm ?? '—'} $`}
            sub="Q2 2025" trend={damascusLatest?.yoy_change_pct ?? null} icon={Building2} accent="brand" />
          <StatCard label="عدد الصفقات المرصودة Q2-2025" value={totalTransactions.toLocaleString()}
            sub="تقديري — المناطق الرئيسية" icon={BarChart3} accent="emerald" />
          <StatCard label="متوسط عائد الإيجار السنوي"  value={`${avgYield}%`}
            sub="عبر المدن الرئيسية" icon={Percent} accent="amber" />
          <StatCard label="متوسط أيام البيع"            value={`${avgDays} يوم`}
            sub="من الإدراج حتى التعاقد" icon={Clock} accent="brand" />
        </div>

        {/* ── Composite index ─────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="bg-white border border-navy/8 rounded-2xl p-5">
          <SectionHead title="مؤشر RESURGO المركّب" sub="السعر المرجّح / م²"
            action={
              <div className="text-[10px] text-charcoal/40 bg-cream px-3 py-1.5 rounded-lg">
                دمشق 40% · حلب 25% · اللاذقية 15% · طرطوس 10% · حمص 10%
              </div>
            }
          />
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={compositeData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="period" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} unit=" $" width={52} />
              <Tooltip content={<RtlTooltip />} />
              <Line
                type="monotone" dataKey="avg_price_sqm" name="المؤشر المركّب"
                stroke="#5979bb" strokeWidth={2.5} dot={{ r: 3, fill: '#5979bb' }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* ── City price trend + filter ───────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.08 }}
          className="bg-white border border-navy/8 rounded-2xl p-5">
          <SectionHead title="تطور الأسعار حسب المدينة" sub="مسار ربعي"
            action={
              <div className="flex gap-2 flex-wrap">
                {CITIES.map(c => (
                  <button key={c} onClick={() => setCityFilter(c)}
                    className={`px-2.5 py-1 text-xs rounded-lg border font-medium transition-all ${cityFilter === c ? 'bg-brand border-brand text-white' : 'border-navy/15 text-charcoal/60 hover:border-brand/30'}`}>
                    {c}
                  </button>
                ))}
                <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
                  className="text-xs px-2 py-1 rounded-lg border border-navy/15 text-navy outline-none bg-white">
                  {TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            }
          />
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={trendData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="period" tick={{ fontSize: 9, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} unit=" $" width={52} />
                <Tooltip content={<RtlTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, direction: 'rtl' }} />
                {(cityFilter === 'الكل' ? Object.keys(CITY_COLORS) : [cityFilter]).map(city => (
                  <Line key={city} type="monotone" dataKey={city} name={city}
                    stroke={CITY_COLORS[city] ?? '#94a3b8'} strokeWidth={2}
                    dot={{ r: 2.5 }} activeDot={{ r: 5 }} connectNulls />
                ))}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-charcoal/40 text-sm">لا توجد بيانات للفلتر المحدد</div>
          )}
        </motion.div>

        {/* ── Latest price by city bar chart ─────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.12 }}
          className="bg-white border border-navy/8 rounded-2xl p-5">
          <SectionHead title="مقارنة الأسعار الحالية" sub="متوسط $/م² — Q2 2025 — سكني" />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={latestResidential} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="city" tick={{ fontSize: 11, fill: '#334155' }} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} unit=" $" width={52} />
              <Tooltip content={<RtlTooltip />} />
              <Bar dataKey="avg_price_sqm" name="$/م²" radius={[4, 4, 0, 0]}
                fill="#5979bb"
                label={{ position: 'top', fontSize: 10, fill: '#334155', formatter: v => `${v}$` }}
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* ── Rental yields + days on market ──────────────────────────────── */}
        <div className="grid lg:grid-cols-2 gap-5">
          {/* Rental yields */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.16 }}
            className="bg-white border border-navy/8 rounded-2xl p-5">
            <SectionHead title="عوائد الإيجار السنوية" sub="تقديرية" />
            <div className="space-y-2">
              {RENTAL_YIELDS.map(r => (
                <div key={`${r.city}-${r.type}`}
                  className="flex items-center gap-3 py-2 border-b border-navy/5 last:border-0">
                  <div className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: CITY_COLORS[r.city] ?? '#94a3b8' }} />
                  <span className="text-charcoal/70 text-xs flex-1">{r.city} — {r.type}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-navy font-black text-sm">{r.yield_pct}%</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${r.trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                      {r.trend === 'up' ? '↑ ارتفاع' : '→ مستقر'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Days on market */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-white border border-navy/8 rounded-2xl p-5">
            <SectionHead title="متوسط أيام الإدراج" sub="من النشر حتى التعاقد" />
            <div className="space-y-2">
              {DAYS_ON_MARKET.map(r => (
                <div key={`${r.city}-${r.type}`}
                  className="flex items-center gap-3 py-2 border-b border-navy/5 last:border-0">
                  <div className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: CITY_COLORS[r.city] ?? '#94a3b8' }} />
                  <span className="text-charcoal/70 text-xs flex-1">{r.city} — {r.type}</span>
                  <div className="flex items-center gap-1 bg-cream px-2.5 py-1 rounded-lg">
                    <Clock size={11} className="text-brand" />
                    <span className="text-navy font-black text-sm">{r.avg_days}</span>
                    <span className="text-charcoal/50 text-[10px]">يوم</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── Detailed data table ──────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.24 }}
          className="bg-white border border-navy/8 rounded-2xl p-5">
          <SectionHead title="جدول البيانات الكامل" sub="مؤشر ربعي"
            action={
              <button onClick={handleExportCSV}
                className="flex items-center gap-1.5 text-xs font-bold text-brand hover:text-navy transition-colors">
                <Download size={13} /> تحميل CSV
              </button>
            }
          />
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-navy/10">
                  {['الفترة', 'المدينة', 'النوع', 'متوسط $/م²', 'الصفقات', 'ت-ع-ر %', 'ت-س-س %'].map(h => (
                    <th key={h} className="text-right py-2 px-3 text-charcoal/50 font-bold text-[10px] uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {QUARTERLY_INDEX.slice().reverse().map((r, i) => (
                  <tr key={i} className="border-b border-navy/5 hover:bg-cream/50 transition-colors">
                    <td className="py-2 px-3 text-navy font-bold">{r.period}</td>
                    <td className="py-2 px-3">
                      <span className="flex items-center gap-1.5">
                        <MapPin size={10} className="text-charcoal/40" />{r.city}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-charcoal/60">{r.type}</td>
                    <td className="py-2 px-3 font-black text-navy">{r.avg_price_sqm} $</td>
                    <td className="py-2 px-3 text-charcoal/60">{r.transactions?.toLocaleString() ?? '—'}</td>
                    <td className={`py-2 px-3 font-bold ${r.qoq_change_pct == null ? 'text-charcoal/30' : r.qoq_change_pct >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {r.qoq_change_pct != null ? `${r.qoq_change_pct >= 0 ? '+' : ''}${r.qoq_change_pct}%` : '—'}
                    </td>
                    <td className={`py-2 px-3 font-bold ${r.yoy_change_pct == null ? 'text-charcoal/30' : r.yoy_change_pct >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {r.yoy_change_pct != null ? `${r.yoy_change_pct >= 0 ? '+' : ''}${r.yoy_change_pct}%` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* ── Data licensing CTA ───────────────────────────────────────────── */}
        <div className="bg-gradient-to-l from-navy to-[#1a2540] rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <p className="text-brand text-xs font-bold uppercase tracking-widest mb-1">ترخيص البيانات</p>
            <h3 className="text-white font-black text-lg mb-1">تحتاج بيانات مخصصة لمنطقة أو قطاع؟</h3>
            <p className="text-white/60 text-xs">نوفر بيانات مرخّصة للمؤسسات المالية، صناديق الاستثمار، والباحثين الأكاديميين. تواصل للحصول على عرض مخصص.</p>
          </div>
          <a href="mailto:data@resurgosy.com"
            className="shrink-0 bg-brand hover:bg-brand/80 text-white text-sm font-black px-5 py-3 rounded-xl transition-all hover:-translate-y-0.5 shadow-lg shadow-brand/20 whitespace-nowrap">
            data@resurgosy.com
          </a>
        </div>

        {/* ── Disclaimer ───────────────────────────────────────────────────── */}
        <button onClick={() => setShowDisclaimer(v => !v)}
          className="flex items-center gap-2 text-charcoal/40 text-xs hover:text-charcoal/60 transition-colors w-full text-right">
          <Info size={13} /> إخلاء مسؤولية
          <ChevronDown size={13} className={`transition-transform ${showDisclaimer ? 'rotate-180' : ''}`} />
        </button>
        {showDisclaimer && (
          <p className="text-charcoal/40 text-[11px] leading-relaxed bg-white border border-navy/8 rounded-xl p-4">
            {REPORT_META.disclaimer}
          </p>
        )}
      </div>
    </div>
  );
}
