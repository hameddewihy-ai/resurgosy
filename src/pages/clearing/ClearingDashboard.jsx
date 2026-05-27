
import SEO from '../../components/SEO';

  Scale, Archive, LayoutGrid, Sparkles, Shield, Film,
  CheckCircle, ClipboardList, Clock, Calculator, Globe,
  Plus, FileText, User,
} from 'lucide-react';








// ── Tabs ──────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'pipeline',  label: 'خط المعاملات',    icon: LayoutGrid  },
  { id: 'process',   label: 'معاملة جديدة',     icon: Plus        },
  { id: 'tools',     label: 'الأدوات المالية',  icon: Calculator  },
  { id: 'archive',   label: 'الأرشيف السيادي',  icon: Archive     },
];

const TOOL_TABS = [
  { id: 'tax',      label: 'حاسبة الضريبة 2025',  icon: Calculator },
  { id: 'embassy',  label: 'رسوم السفارات',         icon: Globe      },
  { id: 'strength', label: 'قوة سند الملكية',       icon: Shield     },
  { id: 'validity', label: 'متتبع الوثائق',          icon: Clock      },
];

function ArchiveTable({ newEntry }) {
  const rows = newEntry
    ? [{ ref: newEntry.refNo, type: '—', date: new Date(newEntry.archiveDate).toLocaleDateString('ar-SY'), clerk: 'الجلسة الحالية', status: 'مؤرشَف' }]
    : [];

  return (
    <div className="bg-white overflow-hidden shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
      <SEO title="لوحة التخليص" noindex />
      <div className="px-5 py-3 border-b border-navy/10 flex items-center justify-between">
        <p className="text-navy font-bold text-sm flex items-center gap-2">
          <Archive size={15} className="text-brand" />
          سجل الأرشيف السيادي
        </p>
        <span className="text-charcoal/50 text-xs">{rows.length} وثيقة</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs" dir="rtl">
          <thead>
            <tr className="border-b border-navy/10 bg-cream">
              {['رقم الأرشيف', 'النوع', 'التاريخ', 'الكاتب', 'الحالة'].map(h => (
                <th key={h} className="text-right text-charcoal/60 font-semibold py-3 px-4">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-navy/[0.06] hover:bg-cream/60 transition-colors">
                <td className="py-3 px-4 font-mono text-brand">{r.ref}</td>
                <td className="py-3 px-4 text-navy">{r.type}</td>
                <td className="py-3 px-4 text-charcoal/60">{r.date}</td>
                <td className="py-3 px-4 text-charcoal/60 flex items-center gap-1">
                  <User size={11} />{r.clerk}
                </td>
                <td className="py-3 px-4">
                  <span className="bg-green-50 text-green-600 border border-green-200 px-2 py-0.5 rounded-full flex items-center gap-1 w-fit text-[10px]">
                    <CheckCircle size={10} />{r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── KPI data ──────────────────────────────────────────────────────────────
const KPI_DATA = [
  [ClipboardList, '24',    'معاملة نشطة',      'text-brand'      ],
  [Clock,         '3',     'بانتظار الموافقة', 'text-amber-600'  ],
  [CheckCircle,   '142',   'مكتملة هذا الشهر', 'text-green-600'  ],
  [Archive,       '1,245', 'وثيقة مؤرشَفة',    'text-navy'       ],
];

// ── Main dashboard ────────────────────────────────────────────────────────
export default function ClearingDashboard() {
  const { user }            = useAuth();
  const [tab, setTab]       = useState('pipeline');
  const [toolTab, setToolTab] = useState('tax');
  const [docType, setDocType] = useState('tabu');
  const [archiveResult, setArchiveResult] = useState(null);
  const [selectedClaim, setSelectedClaim] = useState(null);

  const handleWorkflowComplete = (result) => {
    setArchiveResult(result);
    setTab('archive');
  };

  return (
    <div className="min-h-screen bg-cream pt-16" dir="rtl">
      <SEO title="لوحة التخليص" noindex />

      {/* ── Top header ── */}
      <div className="border-b border-navy/10 bg-white px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center">
              <Scale size={20} className="text-brand" />
            </div>
            <div>
              <p className="text-navy font-black text-sm">قسم التخليص الداخلي — Back-Office</p>
              <p className="text-charcoal/60 text-xs">محرك المعاملات القانونية المتقدم · القانون السوري 2025/2026</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-charcoal/60">
            <span className="flex items-center gap-1"><Sparkles size={12} className="text-brand" />Clearing v3.0</span>
            <span className="flex items-center gap-1"><Shield size={12} className="text-brand/60" />AES-256-GCM</span>
            <span className="flex items-center gap-1"><Film size={12} className="text-brand/60" />ANSI/AIIM MS23</span>
            {user && <span className="text-brand font-medium">{user.email}</span>}
          </div>
        </div>
      </div>

      {/* ── KPI bar ── */}
      <div className="border-b border-navy/8 bg-white px-4 py-3">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3">
          {KPI_DATA.map(([Icon, val, label, color]) => (
            <div key={label} className="flex items-center gap-3 bg-cream rounded-xl px-3 py-2.5">
              <Icon size={16} className={color} />
              <div>
                <p className={`font-black text-base ${color}`}>{val}</p>
                <p className="text-charcoal/50 text-[10px]">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* Main tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${tab === id ? 'bg-brand border-brand text-white shadow-sm' : 'border-navy/12 text-charcoal/60 hover:text-navy hover:border-brand/30 bg-white'}`}>
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        {/* ══ Pipeline tab ══ */}
        {tab === 'pipeline' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-navy font-bold">خط المعاملات — Kanban</h2>
              <button onClick={() => { setTab('process'); }}
                className="btn-cta text-sm flex items-center gap-2 py-2 px-4">
                <Plus size={15} />
                معاملة جديدة
              </button>
            </div>
            <ClaimsPipeline onSelectClaim={setSelectedClaim} />
            {selectedClaim && (
              <div className="bg-white p-4 flex items-center justify-between gap-3 flex-wrap shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
                <div>
                  <p className="text-navy font-bold text-sm">{selectedClaim.owner} — {selectedClaim.ref}</p>
                  <p className="text-charcoal/60 text-xs mt-0.5">{selectedClaim.city} · {selectedClaim.date}</p>
                </div>
                <button onClick={() => { setTab('process'); setSelectedClaim(null); }}
                  className="btn-primary text-xs flex items-center gap-1 py-2 px-4">
                  <FileText size={13} />
                  فتح للمعالجة
                </button>
              </div>
            )}
          </div>
        )}

        {/* ══ Process tab ══ */}
        {tab === 'process' && (
          <div className="space-y-4">
            <h2 className="text-navy font-bold">معاملة جديدة</h2>
            <TransactionWorkflow onComplete={handleWorkflowComplete} />
          </div>
        )}

        {/* ══ Tools tab ══ */}
        {tab === 'tools' && (
          <div className="space-y-5">
            <h2 className="text-navy font-bold">الأدوات المالية والقانونية</h2>

            {/* Tool sub-tabs */}
            <div className="flex gap-2 flex-wrap">
              {TOOL_TABS.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setToolTab(id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${toolTab === id ? 'bg-navy text-white border-navy shadow-sm' : 'border-navy/12 text-charcoal/60 hover:text-navy hover:border-navy/30 bg-white'}`}>
                  <Icon size={14} />
                  {label}
                </button>
              ))}
            </div>

            {/* Tool panels */}
            <div className="bg-white p-5 max-w-2xl shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
              {toolTab === 'tax'      && <TaxCalculator />}
              {toolTab === 'embassy'  && <EmbassyFees />}
              {toolTab === 'strength' && <DocStrengthMeter selected={docType} onSelect={setDocType} />}
              {toolTab === 'validity' && <ValidityTracker />}
            </div>

            {/* Quick reference card */}
            {toolTab === 'tax' && (
              <div className="bg-white p-4 max-w-2xl shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
                <p className="text-navy font-bold text-xs mb-3 flex items-center gap-1.5">
                  <FileText size={13} className="text-brand" />
                  جدول الأسعار المرجعي — ضريبة البيوع 2025
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs" dir="rtl">
                    <thead>
                      <tr className="border-b border-navy/10 bg-cream">
                        {['نوع العقار', 'النظام القديم (القيمة الرائجة)', 'النظام الجديد 2025 (القيمة العقدية)'].map(h => (
                          <th key={h} className="text-right py-2.5 px-3 text-charcoal/60 font-semibold">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-navy/[0.06]">
                      {[
                        ['سكني',               '1٪', '1.5٪'],
                        ['تجاري',              '3٪', '4٪'],
                        ['أرض داخل المخطط',    '2٪', '3٪'],
                        ['أرض خارج المخطط',    '1٪', '2٪'],
                        ['هبة / إعارة عائلية', '15٪ من معدل البيع', 'معفى 100٪'],
                        ['نكول عن البيع',      'ضريبة بيع كاملة',   'معفى 100٪'],
                        ['إيجار سكني (سوري)',   '5٪ سنوياً',         'معفى 100٪'],
                        ['إيجار تجاري',         '10٪ سنوياً',        '2.5٪ سنوياً'],
                      ].map(([type, old, now]) => (
                        <tr key={type} className="hover:bg-cream/50 transition-colors">
                          <td className="py-2.5 px-3 text-navy font-medium">{type}</td>
                          <td className="py-2.5 px-3 text-charcoal/60 line-through">{old}</td>
                          <td className="py-2.5 px-3 text-brand font-bold">{now}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-[10px] text-charcoal/35 mt-3 text-center">
                  إصلاحات وزارة المالية — تموز/آب 2025 · القيمة العقدية الرضائية تُلغي نظام القيمة الرائجة
                </p>
              </div>
            )}

            {toolTab === 'strength' && (
              <div className="bg-white p-4 max-w-2xl shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
                <p className="text-navy font-bold text-xs mb-3 flex items-center gap-1.5">
                  <Shield size={13} className="text-brand" />
                  هرمية القوة الثبوتية لمستندات الملكية
                </p>
                <div className="space-y-2 text-xs">
                  {[
                    ['🟢', 'طابو أخضر',               '5/5', 'أقوى — لا يُطعن فيه إلا بالتزوير الجنائي'],
                    ['🟢', 'حكم محكمة مبرم',           '4/5', 'قوي — يحتاج تنفيذاً لنقل الصحيفة العقارية'],
                    ['🟡', 'وكالة غير قابلة للعزل',    '3/5', 'بيع منجز — يحتاج تسجيلاً وتحققاً من التقادم'],
                    ['🟡', 'أسهم على الشيوع',          '2/5', 'حصة غير مفرزة — يحتاج فرزاً رضائياً أو قضائياً'],
                    ['🔴', 'عقد عرفي / ساعة كهرباء',  '1/5', 'ضعيف جداً — لا يُحمي من منازعة الدولة'],
                  ].map(([dot, label, lvl, note]) => (
                    <div key={label} className="flex items-start gap-3 py-2 border-b border-navy/[0.06]">
                      <span className="text-base shrink-0">{dot}</span>
                      <div className="flex-1">
                        <p className="text-navy font-bold">{label} <span className="text-brand font-black">({lvl})</span></p>
                        <p className="text-charcoal/55 mt-0.5">{note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ Archive tab ══ */}
        {tab === 'archive' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-navy font-bold">الأرشيف السيادي الوطني</h2>
                <p className="text-charcoal/60 text-xs mt-1">
                  جميع الوثائق مشفّرة بـ AES-256-GCM · مرتبطة ببيانات الميكروفيلم ANSI/AIIM MS23
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-charcoal/50">
                <Film size={13} />
                <span>ANSI/AIIM MS23-2024</span>
              </div>
            </div>
            <ArchiveTable newEntry={archiveResult} />
          </div>
        )}
      </div>
    </div>
  );
}
