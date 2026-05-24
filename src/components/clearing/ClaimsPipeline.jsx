import { useState } from 'react';
import { CheckCircle, Loader2, ChevronLeft, Clock } from 'lucide-react';

const STAGES = [
  { id: 'review',     label: 'قيد المراجعة',     color: 'text-charcoal/60', bg: 'bg-cream',      border: 'border-navy/15',   dot: 'bg-charcoal/30' },
  { id: 'processing', label: 'جارٍ المعالجة',     color: 'text-brand',       bg: 'bg-brand/5',    border: 'border-brand/20',  dot: 'bg-brand'       },
  { id: 'pending',    label: 'بانتظار الموافقة',  color: 'text-amber-600',   bg: 'bg-amber-50',   border: 'border-amber-200', dot: 'bg-amber-400'   },
  { id: 'done',       label: 'مكتملة',            color: 'text-green-600',   bg: 'bg-green-50',   border: 'border-green-200', dot: 'bg-green-500'   },
  { id: 'rejected',   label: 'مرفوضة',            color: 'text-red-500',     bg: 'bg-red-50',     border: 'border-red-200',   dot: 'bg-red-400'     },
];

const TYPE_META = {
  sale:             { icon: '🏠', label: 'بيع قطعي' },
  inheritance:      { icon: '⚖️', label: 'إرث' },
  attorney_special: { icon: '📜', label: 'وكالة خاصة' },
  attorney_irrev:   { icon: '🔒', label: 'وكالة غير قابلة للعزل' },
  court_exec:       { icon: '🏛', label: 'تنفيذ أحكام' },
  diaspora:         { icon: '✈️', label: 'مغتربين' },
  auction:          { icon: '🔨', label: 'مزاد علني' },
  recovery:         { icon: '🏛️', label: 'استرداد ملكية' },
};

// keep legacy ids working
const LEGACY_MAP = { attorney: 'attorney_special', transfer: 'sale' };

const PRIORITY_META = {
  high:   { label: 'عاجل',  cls: 'text-red-500'     },
  medium: { label: 'متوسط', cls: 'text-amber-600'   },
  low:    { label: 'عادي',  cls: 'text-charcoal/50' },
};

const INITIAL_CLAIMS = [
  { id: 'c001', type: 'inheritance',      owner: 'محمد الصالح',   city: 'دمشق',     stage: 'review',     priority: 'high',   date: '2025-05-10', ref: 'SY-CLR-2025-11241' },
  { id: 'c002', type: 'attorney_special', owner: 'رنا الحسيني',   city: 'دمشق',     stage: 'processing', priority: 'medium', date: '2025-05-09', ref: 'SY-CLR-2025-22891' },
  { id: 'c003', type: 'recovery',         owner: 'خالد العمر',    city: 'حلب',      stage: 'pending',    priority: 'high',   date: '2025-05-08', ref: 'SY-CLR-2025-33401' },
  { id: 'c004', type: 'inheritance',      owner: 'سارة الكردي',   city: 'حمص',      stage: 'done',       priority: 'low',    date: '2025-05-07', ref: 'SY-CLR-2025-41120' },
  { id: 'c005', type: 'sale',             owner: 'أحمد الخطيب',   city: 'حماة',     stage: 'review',     priority: 'medium', date: '2025-05-11', ref: 'SY-CLR-2025-51902' },
  { id: 'c006', type: 'attorney_irrev',   owner: 'ليلى إبراهيم',  city: 'اللاذقية', stage: 'processing', priority: 'high',   date: '2025-05-10', ref: 'SY-CLR-2025-62341' },
  { id: 'c007', type: 'court_exec',       owner: 'طارق السيد',    city: 'حلب',      stage: 'rejected',   priority: 'low',    date: '2025-05-06', ref: 'SY-CLR-2025-71881' },
  { id: 'c008', type: 'diaspora',         owner: 'مي الزهراوي',   city: 'دمشق',     stage: 'pending',    priority: 'medium', date: '2025-05-11', ref: 'SY-CLR-2025-82211' },
  { id: 'c009', type: 'auction',          owner: 'نادية الكردي',  city: 'طرطوس',    stage: 'review',     priority: 'low',    date: '2025-05-12', ref: 'SY-CLR-2025-92831' },
];

function ageDays(dateStr) {
  const d   = new Date(dateStr);
  const now = new Date();
  return Math.floor((now - d) / (1000 * 60 * 60 * 24));
}

function AgeChip({ dateStr, stage }) {
  if (stage === 'done' || stage === 'rejected') return null;
  const days = ageDays(dateStr);
  if (days <= 3)  return null;
  if (days <= 7)  return <span className="text-[9px] text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">{days}ي</span>;
  return <span className="text-[9px] text-red-500 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-full">{days}ي</span>;
}

function ClaimCard({ claim, stagesMeta, onMove, onClick }) {
  const [moving, setMoving] = useState(false);
  const pm         = PRIORITY_META[claim.priority];
  const typeId     = LEGACY_MAP[claim.type] || claim.type;
  const tm         = TYPE_META[typeId] || { icon: '📄', label: claim.type };
  const currentIdx = STAGES.findIndex(s => s.id === claim.stage);
  const nextStage  = STAGES[currentIdx + 1];

  const move = async () => {
    if (!nextStage) return;
    setMoving(true);
    await new Promise(r => setTimeout(r, 400));
    onMove(claim.id, nextStage.id);
    setMoving(false);
  };

  return (
    <div onClick={() => onClick?.(claim)}
      className={`rounded-xl border p-3 transition-all hover:shadow-sm bg-white cursor-pointer ${stagesMeta.border}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2" dir="rtl">
        <div className="flex-1 min-w-0">
          <p className="text-navy text-xs font-bold truncate">{claim.owner}</p>
          <p className="text-charcoal/60 text-[10px] mt-0.5">{claim.city} · {tm.icon} {tm.label}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <AgeChip dateStr={claim.date} stage={claim.stage} />
          <span className={`text-[10px] font-bold ${pm.cls}`}>{pm.label}</span>
        </div>
      </div>

      <p className="text-charcoal/40 font-mono text-[10px] mb-3 truncate">{claim.ref}</p>

      <div className="flex items-center justify-between gap-2">
        <span className="text-charcoal/40 text-[10px] flex items-center gap-0.5">
          <Clock size={9} />{claim.date}
        </span>
        {nextStage && (
          <button onClick={e => { e.stopPropagation(); move(); }} disabled={moving}
            className="flex items-center gap-1 text-[10px] bg-cream hover:bg-navy/8 border border-navy/12 text-charcoal/60 hover:text-navy px-2 py-1 rounded-lg transition-colors disabled:opacity-50">
            {moving ? <Loader2 size={10} className="animate-spin" /> : <ChevronLeft size={10} />}
            {nextStage.label}
          </button>
        )}
        {!nextStage && claim.stage !== 'rejected' && (
          <span className="text-[10px] text-green-600 flex items-center gap-0.5">
            <CheckCircle size={10} />مكتملة
          </span>
        )}
      </div>
    </div>
  );
}

const TYPE_FILTERS = [
  ['all',             'الكل'],
  ['sale',            '🏠 بيع'],
  ['inheritance',     '⚖️ إرث'],
  ['attorney_special','📜 وكالة خاصة'],
  ['attorney_irrev',  '🔒 غير قابلة للعزل'],
  ['court_exec',      '🏛 أحكام'],
  ['diaspora',        '✈️ مغتربين'],
  ['auction',         '🔨 مزاد'],
  ['recovery',        '🏛️ استرداد'],
];

export default function ClaimsPipeline({ onSelectClaim, extraClaims = [] }) {
  const [claims, setClaims] = useState([...INITIAL_CLAIMS, ...extraClaims]);
  const [filter, setFilter] = useState('all');

  const moveClaim = (id, newStage) =>
    setClaims(prev => prev.map(c => c.id === id ? { ...c, stage: newStage } : c));

  const normalize = (type) => LEGACY_MAP[type] || type;
  const filtered  = filter === 'all'
    ? claims
    : claims.filter(c => normalize(c.type) === filter);

  return (
    <div className="space-y-4" dir="rtl">
      {/* Stage summary */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {STAGES.map(s => {
          const count = claims.filter(c => c.stage === s.id).length;
          return (
            <div key={s.id} className={`bg-white p-3 text-center border shrink-0 flex-1 min-w-[90px] shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg ${s.border} ${s.bg}`}>
              <p className={`text-xl font-black ${s.color}`}>{count}</p>
              <p className="text-charcoal/50 text-[10px] mt-0.5 whitespace-nowrap">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Type filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        {TYPE_FILTERS.map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)}
            className={`px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap ${filter === v ? 'bg-brand text-white border-brand' : 'border-navy/12 text-charcoal/60 hover:text-navy hover:border-brand/30'}`}>
            {l}
          </button>
        ))}
      </div>

      {/* Kanban board */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
        {STAGES.map(stage => {
          const stageClaims = filtered.filter(c => c.stage === stage.id);
          return (
            <div key={stage.id} className="shrink-0 w-52">
              <div className={`flex items-center gap-2 px-2 py-2 rounded-lg mb-2 ${stage.bg} border ${stage.border}`}>
                <span className={`w-2 h-2 rounded-full ${stage.dot}`} />
                <span className={`text-xs font-bold ${stage.color}`}>{stage.label}</span>
                <span className="text-charcoal/40 text-[10px] mr-auto">{stageClaims.length}</span>
              </div>
              <div className="space-y-2">
                {stageClaims.map(claim => (
                  <ClaimCard
                    key={claim.id}
                    claim={claim}
                    stagesMeta={stage}
                    onMove={moveClaim}
                    onClick={onSelectClaim}
                  />
                ))}
                {stageClaims.length === 0 && (
                  <div className="border border-dashed border-navy/15 rounded-xl p-4 text-center text-charcoal/40 text-xs">
                    لا توجد معاملات
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
