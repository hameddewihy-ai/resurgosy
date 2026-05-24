import { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Clock, BarChart3, RefreshCw, Info } from 'lucide-react';
import { useNPV, calcNPV } from '../../hooks/useNPV';

// ── Tiny SVG chart ────────────────────────────────────────────────────
function MiniChart({ data, width = 560, height = 120, colorPos = '#22c55e', colorNeg = '#ef4444' }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pad = { t: 12, b: 20, l: 10, r: 10 };
  const W = width - pad.l - pad.r;
  const H = height - pad.t - pad.b;
  const zero = pad.t + H - ((0 - min) / range) * H;

  const points = data.map((v, i) => ({
    x: pad.l + (i / (data.length - 1)) * W,
    y: pad.t + H - ((v - min) / range) * H,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = `${pathD} L ${points[points.length-1].x} ${zero} L ${points[0].x} ${zero} Z`;

  const fmt = (v) => v >= 1e6 ? `$${(v / 1e6).toFixed(1)}M` : v >= 1e3 ? `$${(v / 1e3).toFixed(0)}K` : `$${v.toFixed(0)}`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-28" preserveAspectRatio="none">
      <defs>
        <linearGradient id="posGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={colorPos} stopOpacity="0.3" />
          <stop offset="100%" stopColor={colorPos} stopOpacity="0" />
        </linearGradient>
        <linearGradient id="negGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={colorNeg} stopOpacity="0" />
          <stop offset="100%" stopColor={colorNeg} stopOpacity="0.3" />
        </linearGradient>
      </defs>
      <line x1={pad.l} y1={zero} x2={width - pad.r} y2={zero} stroke="#94a3b8" strokeWidth="1" strokeDasharray="4 4" />
      <path d={areaD} fill={min < 0 ? 'url(#negGrad)' : 'url(#posGrad)'} />
      <path d={pathD} fill="none" stroke={data[data.length - 1] >= 0 ? colorPos : colorNeg} strokeWidth="2" strokeLinejoin="round" />
      {points.map((p, i) => (
        <text key={i} x={p.x} y={height - 4} textAnchor="middle" fontSize="10" fill="#64748b">Y{i}</text>
      ))}
      <text x={points[0].x} y={points[0].y - 5} textAnchor="middle" fontSize="9" fill="#94a3b8">{fmt(data[0])}</text>
      <text x={points[points.length-1].x} y={points[points.length-1].y - 5} textAnchor="middle" fontSize="9" fill="#94a3b8">{fmt(data[data.length-1])}</text>
    </svg>
  );
}

// ── KPI metric card ───────────────────────────────────────────────────
function KPICard({ label, value, sub, positive, icon: Icon, highlight }) {
  return (
    <div className={`bg-white p-4 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg ${highlight ? 'ring-1 ring-brand/30' : ''}`}>
      <div className="flex items-start justify-between mb-2">
        <p className="text-charcoal/60 text-xs font-medium">{label}</p>
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${positive ? 'bg-green-50' : 'bg-red-50'}`}>
          <Icon size={14} className={positive ? 'text-green-600' : 'text-red-500'} />
        </div>
      </div>
      <p className={`text-2xl font-black ${positive ? 'text-green-600' : 'text-red-500'} ${highlight ? 'text-3xl text-brand' : ''}`}>
        {value}
      </p>
      {sub && <p className="text-charcoal/50 text-xs mt-1">{sub}</p>}
    </div>
  );
}

// ── Sensitivity table ─────────────────────────────────────────────────
function SensitivityTable({ initialInvestment, annualCashFlows }) {
  const rates = [0.06, 0.08, 0.10, 0.12, 0.15, 0.18, 0.20];
  const cfs = [-initialInvestment, ...annualCashFlows];
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs" dir="rtl">
        <thead>
          <tr className="border-b border-navy/10">
            <th className="text-charcoal/60 font-medium py-2 text-right pr-2">معدل الخصم (r)</th>
            <th className="text-charcoal/60 font-medium py-2 text-right">صافي القيمة الحالية</th>
            <th className="text-charcoal/60 font-medium py-2 text-right">القرار</th>
          </tr>
        </thead>
        <tbody>
          {rates.map((r) => {
            const npv = calcNPV(cfs, r);
            const positive = npv > 0;
            return (
              <tr key={r} className="border-b border-navy/[0.06] hover:bg-cream/60">
                <td className="py-2 pr-2 text-charcoal/70">{(r * 100).toFixed(0)}%</td>
                <td className={`py-2 font-mono font-bold ${positive ? 'text-green-600' : 'text-red-500'}`}>
                  {npv >= 0 ? '+' : ''}{(npv / 1000).toFixed(0)} K$
                </td>
                <td className="py-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${positive ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-red-50 text-red-500 border border-red-200'}`}>
                    {positive ? 'مُربح' : 'خسارة'}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const DEFAULT = {
  initialInvestment: 2500000,
  discountRate: 0.10,
  cashFlows: [420000, 510000, 620000, 750000, 890000, 1050000, 1200000],
};

export default function NPVDashboard({ project = null }) {
  const [inv, setInv]   = useState(project?.minInvest ?? DEFAULT.initialInvestment);
  const [rate, setRate] = useState(DEFAULT.discountRate);
  const [cfs, setCfs]   = useState(DEFAULT.cashFlows);
  const [tab, setTab]   = useState('kpis');

  const { npv, irr, payback, roi, moic, cumulative } = useNPV({
    initialInvestment: inv,
    annualCashFlows: cfs,
    discountRate: rate,
  });

  const fmt$ = (v) => {
    const abs = Math.abs(v);
    const s = v < 0 ? '-' : '+';
    if (abs >= 1e6) return `${s}$${(abs / 1e6).toFixed(2)}M`;
    return `${s}$${(abs / 1000).toFixed(0)}K`;
  };

  const isPositive = npv > 0;

  return (
    <div className="space-y-5" dir="rtl">
      {/* Tabs */}
      <div className="flex gap-2 text-xs flex-wrap">
        {[['kpis','المؤشرات المالية'],['chart','منحنى التدفق'],['sensitivity','تحليل الحساسية'],['inputs','تعديل المعطيات']].map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${tab===k ? 'bg-brand text-white' : 'bg-white text-charcoal/60 hover:text-navy border border-navy/12'}`}>
            {l}
          </button>
        ))}
      </div>

      {/* KPIs */}
      {tab === 'kpis' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KPICard label="صافي القيمة الحالية NPV" value={fmt$(npv)} positive={isPositive} icon={isPositive ? TrendingUp : TrendingDown} highlight />
            <KPICard label="معدل العائد الداخلي IRR" value={`${(irr * 100).toFixed(1)}%`} positive={irr > rate} icon={BarChart3} sub={`الحاجز: ${(rate * 100).toFixed(0)}%`} />
            <KPICard label="فترة الاسترداد" value={payback ? `${payback.toFixed(1)} سنة` : '—'} positive={(payback || 99) < 5} icon={Clock} sub="Payback Period" />
            <KPICard label="مضاعف الاستثمار MOIC" value={`${moic.toFixed(2)}×`} positive={moic > 1.5} icon={DollarSign} sub={`عائد الاستثمار: ${roi.toFixed(0)}%`} />
          </div>

          <div className={`p-4 border-2 flex items-start gap-3 rounded-lg ${isPositive ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'}`}>
            <Info size={18} className={isPositive ? 'text-green-600 shrink-0 mt-0.5' : 'text-red-500 shrink-0 mt-0.5'} />
            <div>
              <p className={`font-bold text-sm ${isPositive ? 'text-green-700' : 'text-red-600'}`}>
                {isPositive ? 'المشروع مُجدٍ اقتصادياً' : 'المشروع غير مُجدٍ بالمعطيات الحالية'}
              </p>
              <p className="text-charcoal/60 text-xs mt-1">
                {isPositive
                  ? `يُدرّ هذا المشروع NPV إيجابياً قدره ${fmt$(npv)} عند خصم ${(rate*100).toFixed(0)}%. IRR = ${(irr*100).toFixed(1)}% يتجاوز معدل الحاجز.`
                  : `NPV سلبي بمقدار ${fmt$(npv)}. يُنصح بمراجعة هيكل التدفقات النقدية أو خفض تكاليف الاستثمار.`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Cumulative cash flow chart */}
      {tab === 'chart' && (
        <div className="bg-white p-5 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-navy font-bold text-sm">منحنى التدفق النقدي التراكمي</h3>
            <span className="text-xs text-charcoal/50">{cfs.length} سنوات</span>
          </div>
          <MiniChart data={cumulative} height={160} />
          <div className="flex items-center gap-4 mt-3 text-xs text-charcoal/60">
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-green-500 inline-block"/>إيجابي</span>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-red-400 inline-block"/>سلبي</span>
            <span className="flex items-center gap-1"><span className="w-6 border-t border-dashed border-navy/30 inline-block"/>نقطة الصفر</span>
          </div>
        </div>
      )}

      {/* Sensitivity */}
      {tab === 'sensitivity' && (
        <div className="bg-white p-5 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
          <h3 className="text-navy font-bold text-sm mb-4">تحليل الحساسية — تأثير معدل الخصم على NPV</h3>
          <SensitivityTable initialInvestment={inv} annualCashFlows={cfs} />
        </div>
      )}

      {/* Inputs */}
      {tab === 'inputs' && (
        <div className="bg-white p-5 space-y-5 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
          <h3 className="text-navy font-bold text-sm mb-1">تعديل معطيات المشروع</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-charcoal/60 block mb-1.5">الاستثمار الأولي (USD)</label>
              <input type="number" value={inv} onChange={(e) => setInv(Number(e.target.value))}
                step={50000} className="input-field font-mono" />
            </div>
            <div>
              <label className="text-xs text-charcoal/60 block mb-1.5">معدل الخصم (%)</label>
              <input type="number" value={(rate * 100).toFixed(0)} onChange={(e) => setRate(Number(e.target.value) / 100)}
                min={1} max={40} step={1} className="input-field font-mono" />
            </div>
          </div>

          <div>
            <label className="text-xs text-charcoal/60 block mb-2">التدفقات النقدية السنوية (USD)</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {cfs.map((cf, i) => (
                <div key={i}>
                  <label className="text-[10px] text-charcoal/50 block mb-1">السنة {i + 1}</label>
                  <input type="number" value={cf} step={10000}
                    onChange={(e) => setCfs(cfs.map((v, j) => j === i ? Number(e.target.value) : v))}
                    className="input-field font-mono text-sm py-2" />
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={() => setCfs([...cfs, 0])}
                className="text-xs btn-primary py-1.5 px-3">+ سنة</button>
              {cfs.length > 2 && (
                <button onClick={() => setCfs(cfs.slice(0, -1))}
                  className="text-xs border border-navy/15 text-charcoal/60 hover:text-navy py-1.5 px-3 rounded-lg transition-colors">حذف سنة</button>
              )}
              <button onClick={() => { setInv(DEFAULT.initialInvestment); setRate(DEFAULT.discountRate); setCfs(DEFAULT.cashFlows); }}
                className="text-xs text-charcoal/50 hover:text-navy flex items-center gap-1 mr-auto transition-colors">
                <RefreshCw size={12}/>إعادة ضبط
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
