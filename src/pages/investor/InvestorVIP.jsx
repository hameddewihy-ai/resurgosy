import { useState } from 'react';
import {
  Crown, Box, BarChart3, Flame, Users,
  TrendingUp, MapPin, Building2, Star, Lock, Sparkles,
  Download, FileCheck, Wallet, Scale, ShieldCheck, Landmark, ArrowUpRight,
} from 'lucide-react';
import BIMViewer from '../../components/investor/BIMViewer';
import NPVDashboard from '../../components/investor/NPVDashboard';
import DemandHeatMap from '../../components/investor/DemandHeatMap';
import TeamBuilder from '../../components/investor/TeamBuilder';
import { useGlobalData } from '../../context/GlobalContext';
import InvestmentModal from '../../components/invest/InvestmentModal';
import InvestorPortfolio from '../../components/invest/InvestorPortfolio';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'overview',   label: 'نظرة عامة',             icon: Sparkles  },
  { id: 'bim',        label: 'النموذج ثلاثي الأبعاد',  icon: Box       },
  { id: 'financial',  label: 'التحليل المالي NPV',     icon: BarChart3 },
  { id: 'heatmap',    label: 'خريطة الطلب الحراري',    icon: Flame     },
  { id: 'team',       label: 'تكوين فريق عمل',         icon: Users     },
  { id: 'portfolio',  label: 'محفظتي الاستثمارية',     icon: Wallet    },
];

const TIER_STYLE = {
  Platinum: {
    bg: 'from-slate-50 to-white',
    border: 'border-slate-300',
    badge: 'bg-slate-100 text-slate-600 border border-slate-200',
    selectedBorder: 'border-slate-400',
  },
  Gold: {
    bg: 'from-amber-50 to-white',
    border: 'border-amber-100',
    badge: 'bg-amber-50 text-amber-700 border border-amber-200',
    selectedBorder: 'border-amber-400',
  },
};

// ── Project selector card ─────────────────────────────────────────────
function ProjectCard({ project, selected, onSelect }) {
  const t = TIER_STYLE[project.tier] || TIER_STYLE.Gold;
  const displayName = project.title || project.name || 'مشروع VIP';
  const irrDisplay = project.irr != null ? `${project.irr}%` : '—';
  const roiDisplay = project.roi != null ? `${project.roi}%` : '—';
  return (
    <button onClick={() => onSelect(project)}
      className={`w-full text-right rounded-2xl border-2 p-4 transition-all bg-gradient-to-br ${t.bg} ${selected ? t.selectedBorder + ' shadow-md' : t.border + ' hover:border-brand/30'}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-navy font-bold text-sm leading-snug">{displayName}</p>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${t.badge}`}>{project.tier || 'Gold'}</span>
      </div>
      <div className="flex items-center gap-1 text-charcoal/60 text-xs mb-3">
        <MapPin size={10} />{project.city} · {project.type}
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-cream rounded-lg p-2 text-center">
          <p className="text-charcoal/50 mb-0.5">IRR</p>
          <p className="text-green-600 font-bold">{irrDisplay}</p>
        </div>
        <div className="bg-cream rounded-lg p-2 text-center">
          <p className="text-charcoal/50 mb-0.5">عائد</p>
          <p className="text-brand font-bold">{roiDisplay}</p>
        </div>
      </div>
    </button>
  );
}

// ── Overview tab ─────────────────────────────────────────────────────
function Overview({ project }) {
  if (!project || Object.keys(project).length === 0) return null;
  const displayName = project.title || project.name || 'مشروع VIP';
  const irrVal = project.irr != null ? `${project.irr}%` : '—';
  const roiVal = project.roi != null ? `${project.roi}%` : '—';
  const sizeVal = project.tags?.[0] || project.size || '—';
  const metrics = [
    { label: 'التفاصيل',                value: sizeVal,              icon: Building2 },
    { label: 'العائد الداخلي المتوقع',  value: irrVal,               icon: TrendingUp },
    { label: 'عائد إجمالي / NPV',       value: roiVal,               icon: BarChart3  },
    { label: 'حالة المشروع',            value: project.status || '—', icon: Star       },
  ];

  return (
    <div className="space-y-6" dir="rtl">
      {/* Hero banner */}
      <div className="rounded-2xl overflow-hidden border border-brand/20 bg-gradient-to-br from-brand/8 via-cream to-cream p-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Crown size={18} className="text-amber-500" />
              <span className="text-amber-600 text-sm font-bold">فرصة استثمارية VIP</span>
            </div>
            <h2 className="text-navy text-2xl font-black mb-2">{displayName}</h2>
            <p className="text-charcoal/60 text-sm flex items-center gap-1">
              <MapPin size={14} />{project.city} · {project.type}
            </p>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <span className="bg-green-50 border border-green-200 text-green-600 px-3 py-1 rounded-full font-semibold text-xs">
              ✓ {project.status}
            </span>
            <span className="text-charcoal/40 text-xs">توثيق بلوكتشين · IVS 2025</span>
          </div>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white p-4 text-center shadow-[0_2px_8px_rgba(31,42,56,0.06)] hover:shadow-[0_8px_24px_rgba(31,42,56,0.10)] rounded-lg transition-all">
            <Icon size={20} className="text-brand mx-auto mb-2" />
            <p className="text-navy font-black text-xl">{value}</p>
            <p className="text-charcoal/60 text-xs mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Why VIP */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { icon: '🔒', title: 'ملكية محمية', desc: 'سجل ملكية غير قابل للتزوير مسجّل على البلوكتشين' },
          { icon: '🏗️', title: 'مُفحوص هندسياً', desc: 'تقرير IVS 2025 موقّع رقمياً من مهندس معتمد' },
          { icon: '📊', title: 'تحليل مالي كامل', desc: 'NPV، IRR، وتحليل حساسية معدل الخصم' },
        ].map((f) => (
          <div key={f.title} className="bg-white p-5 shadow-[0_2px_8px_rgba(31,42,56,0.06)] hover:shadow-[0_8px_24px_rgba(31,42,56,0.10)] rounded-lg transition-all">
            <span className="text-3xl block mb-3">{f.icon}</span>
            <p className="text-navy font-bold text-sm mb-1">{f.title}</p>
            <p className="text-charcoal/60 text-xs leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Documents */}
      <div className="bg-white p-5 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
        <p className="text-navy font-bold text-sm mb-4 flex items-center gap-2">
          <FileCheck size={16} className="text-brand" /> الوثائق الرسمية للمشروع
        </p>
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { label: 'تقرير التقييم IVS 2025',      icon: '📄', tag: 'PDF · 2.3 MB' },
            { label: 'شهادة البلوكتشين',             icon: '🔗', tag: 'NFT · موثّق' },
            { label: 'النموذج المالي DCF',           icon: '📊', tag: 'XLSX · 1.1 MB' },
          ].map(doc => (
            <button key={doc.label}
              onClick={() => toast.success(`جارٍ تحميل: ${doc.label}`)}
              className="flex items-center gap-3 p-3.5 bg-cream rounded-xl border border-navy/8 hover:border-brand/30 hover:bg-brand/5 transition-all text-right group">
              <span className="text-2xl shrink-0">{doc.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-navy font-bold text-xs truncate">{doc.label}</p>
                <p className="text-charcoal/45 text-[10px] mt-0.5">{doc.tag}</p>
              </div>
              <Download size={13} className="text-charcoal/30 group-hover:text-brand transition-colors shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* SPV / Ownership Structure */}
      <div className="bg-white p-5 border border-brand/20 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
        <p className="text-navy font-bold text-sm mb-1 flex items-center gap-2">
          <Scale size={16} className="text-brand" /> هيكل الملكية القانونية (SPV)
        </p>
        <p className="text-charcoal/50 text-xs mb-5">
          كل مشروع مُدرج على RESURGO يُؤطَّر عبر شركة غرض خاص (SPV) مستقلة تُصدر وحدات ملكية مُوثَّقة لحاملها.
        </p>

        {/* Flow diagram */}
        <div className="flex items-center gap-2 flex-wrap justify-center mb-5">
          {[
            { icon: Landmark, label: 'RESURGO\nالمشغّل', color: 'bg-brand/10 border-brand/30 text-brand' },
            { arrow: true },
            { icon: ShieldCheck, label: 'SPV\n(شركة غرض خاص)', color: 'bg-navy/8 border-navy/20 text-navy' },
            { arrow: true },
            { icon: ArrowUpRight, label: 'المستثمر\n(حامل الوحدات)', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
          ].map((item, i) =>
            item.arrow ? (
              <div key={i} className="text-navy/30 font-bold text-lg">←</div>
            ) : (
              <div key={i} className={`flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl border text-center min-w-[90px] ${item.color}`}>
                <item.icon size={18} />
                <p className="text-[10px] font-bold leading-tight whitespace-pre-line">{item.label}</p>
              </div>
            )
          )}
        </div>

        {/* Rights table */}
        <div className="bg-cream rounded-xl border border-navy/8 divide-y divide-navy/6">
          {[
            ['حقوق التصويت', 'وفق نسبة الوحدات المملوكة'],
            ['توزيعات الأرباح', 'ربع سنوية — 40% من التدفق النقدي'],
            ['الخروج', 'بيع في السوق الثانوي أو عند استرداد المشروع'],
            ['التوثيق', 'بلوكتشين + سجل تجاري سوري موثّق'],
            ['المسؤولية', 'محدودة بقيمة الوحدات — لا التزام شخصي'],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between px-4 py-2.5 text-xs gap-4">
              <span className="text-charcoal/50 shrink-0">{k}</span>
              <span className="text-navy font-bold text-right">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Portfolio Allocation Calculator ──────────────────────────────────
const ALLOC_COLORS = ['bg-brand', 'bg-cta', 'bg-emerald-500', 'bg-amber-500', 'bg-violet-500'];

function AllocationCalculator({ projects }) {
  const [allocations, setAllocations] = useState(() =>
    Object.fromEntries(projects.map(p => [p.id, 0]))
  );

  const total       = Object.values(allocations).reduce((s, v) => s + v, 0);
  const activeCount = projects.filter(p => (allocations[p.id] || 0) > 0).length;
  const weightedIRR = total > 0
    ? projects.reduce((s, p) => s + (allocations[p.id] / total) * (p.irr || 0), 0)
    : 0;

  const setAlloc = (id, val) => setAllocations(prev => ({ ...prev, [id]: val }));
  const reset    = () => setAllocations(Object.fromEntries(projects.map(p => [p.id, 0])));

  return (
    <div className="bg-white p-5 space-y-5 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
      <div className="flex items-center justify-between">
        <p className="text-navy font-black text-sm">حاسبة توزيع المحفظة</p>
        {total > 0 && (
          <button onClick={reset} className="text-xs text-charcoal/40 hover:text-red-500 transition-colors">
            مسح الكل
          </button>
        )}
      </div>

      {/* Sliders per project */}
      <div className="space-y-5">
        {projects.map((p, i) => {
          const alloc = allocations[p.id] || 0;
          const pct   = total > 0 ? Math.round((alloc / total) * 100) : 0;
          return (
            <div key={p.id}>
              <div className="flex items-center justify-between mb-1.5 gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${ALLOC_COLORS[i % ALLOC_COLORS.length]}`} />
                  <p className="text-navy font-semibold text-xs truncate">{p.title || p.name}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {pct > 0 && <span className="text-charcoal/45 text-[10px]">{pct}%</span>}
                  <span className="text-navy font-black text-xs w-20 text-left">${alloc.toLocaleString()}</span>
                </div>
              </div>
              <input type="range" min={0} max={100000} step={5000} value={alloc}
                onChange={e => setAlloc(p.id, +e.target.value)}
                className="w-full accent-brand h-1.5 cursor-pointer" />
              <div className="flex justify-between text-[9px] text-charcoal/30 mt-0.5">
                <span>$0</span>
                <span className="text-brand/60 font-semibold">IRR {p.irr ?? '—'}%</span>
                <span>$100,000</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Distribution bar */}
      {total > 0 && (
        <div>
          <p className="text-charcoal/45 text-[10px] font-semibold uppercase tracking-wider mb-2">توزيع المحفظة</p>
          <div className="flex h-3 rounded-full overflow-hidden gap-px bg-navy/5">
            {projects.map((p, i) => {
              const pct = (allocations[p.id] / total) * 100;
              if (!pct) return null;
              return (
                <div key={p.id}
                  className={`${ALLOC_COLORS[i % ALLOC_COLORS.length]} transition-all duration-300`}
                  style={{ width: `${pct}%` }}
                  title={`${p.title}: ${Math.round(pct)}%`} />
              );
            })}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2">
            {projects.map((p, i) => (allocations[p.id] || 0) > 0 && (
              <div key={p.id} className="flex items-center gap-1 text-[10px] text-charcoal/60">
                <div className={`w-2 h-2 rounded-full ${ALLOC_COLORS[i % ALLOC_COLORS.length]}`} />
                {(p.title || p.name)?.slice(0, 18)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI summary */}
      <div className="bg-cream rounded-2xl p-4 grid grid-cols-3 gap-3 text-center border border-navy/8">
        <div>
          <p className="text-charcoal/45 text-[10px] mb-1">إجمالي المخصص</p>
          <p className="text-navy font-black text-lg">${total.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-charcoal/45 text-[10px] mb-1">متوسط IRR مرجّح</p>
          <p className={`font-black text-lg ${weightedIRR > 0 ? 'text-green-600' : 'text-charcoal/30'}`}>
            {weightedIRR > 0 ? `${weightedIRR.toFixed(1)}%` : '—'}
          </p>
        </div>
        <div>
          <p className="text-charcoal/45 text-[10px] mb-1">تنويع المحفظة</p>
          <p className="text-brand font-black text-lg">{activeCount} مشاريع</p>
        </div>
      </div>

      {total > 0 && (
        <button
          onClick={() => toast.success('تم حفظ توزيع المحفظة — سيراجعه فريق VIP خلال 24 ساعة')}
          className="w-full py-2.5 bg-gradient-to-l from-brand to-navy text-white font-black text-sm rounded-xl hover:-translate-y-0.5 transition-all shadow-md shadow-brand/20">
          تأكيد توزيع المحفظة
        </button>
      )}
    </div>
  );
}

// ── Main VIP page ─────────────────────────────────────────────────────
export default function InvestorVIP() {
  const { investmentProjects } = useGlobalData();
  const vipProjects = investmentProjects.filter(p => p.vip);
  const [activeProject, setActiveProject] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [investModalOpen, setInvestModalOpen] = useState(false);

  // Use first VIP project as default
  const currentProject = activeProject || vipProjects[0] || null;

  return (
    <div className="min-h-screen bg-cream pt-16 pb-20 lg:pb-0" dir="rtl">
      {/* VIP Header bar — stays navy for premium branding */}
      <div className="bg-navy border-b border-yellow-400/15 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-400 to-cta flex items-center justify-center shadow-lg shadow-cta/30">
              <Crown size={18} className="text-white" />
            </div>
            <div>
              <p className="text-white font-black text-sm tracking-wide">RESURGO VIP — بوابة المستثمرين</p>
              <p className="text-white/40 text-xs">وصول حصري · بيانات في الوقت الحقيقي · تحليل متقدم</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Lock size={13} className="text-yellow-400" />
            <span className="text-yellow-400 text-xs font-semibold">Platinum Access</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr] gap-6">

          {/* ── Sidebar: project list ── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-charcoal/50 text-xs font-medium uppercase tracking-wide">الفرص المتاحة</p>
              <span className="text-xs bg-cta/10 text-cta border border-cta/20 px-2 py-0.5 rounded-full">{vipProjects.length} مشاريع</span>
            </div>
            {vipProjects.length === 0 ? (
              <div className="bg-white/60 border border-navy/10 rounded-2xl p-6 text-center">
                <Crown size={28} className="mx-auto text-navy/20 mb-3" />
                <p className="text-navy font-bold text-xs mb-1">لا توجد فرص VIP متاحة حالياً</p>
                <p className="text-charcoal/45 text-[10px] leading-relaxed">ستُضاف مشاريع استثمارية حصرية قريباً — سيتم إعلامك فور توفّرها.</p>
              </div>
            ) : (
              <>
                {vipProjects.map((p) => (
                  <ProjectCard key={p.id} project={p}
                    selected={currentProject?.id === p.id}
                    onSelect={(proj) => { setActiveProject(proj); setActiveTab('overview'); }} />
                ))}
                {currentProject && (
                  <button onClick={() => setInvestModalOpen(true)}
                    className="w-full mt-2 py-3 rounded-2xl bg-gradient-to-l from-brand to-navy text-white font-black text-sm flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all shadow-lg shadow-brand/20">
                    <Crown size={15} />استثمر في هذا المشروع
                  </button>
                )}
              </>
            )}
          </div>

          {/* ── Main content ── */}
          <div className="space-y-5 min-w-0">
            {/* Tabs — scrollable on mobile */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-1.5 text-xs px-4 py-2.5 rounded-xl border transition-all font-medium shrink-0 ${activeTab === id ? 'bg-brand border-brand text-white shadow-sm' : 'border-navy/12 text-charcoal/60 hover:text-navy hover:border-brand/30 bg-white'}`}>
                  <Icon size={13} />
                  {label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="min-h-[500px]">
              {activeTab === 'overview' && <Overview project={currentProject || {}} />}

              {activeTab === 'bim' && currentProject && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-navy font-bold text-sm">نموذج BIM ثلاثي الأبعاد</h3>
                    <span className="text-xs text-charcoal/50">Autodesk APS · IFC-2X3</span>
                  </div>
                  <div style={{ height: 520 }}>
                    <BIMViewer projectName={currentProject.title} />
                  </div>
                </div>
              )}

              {activeTab === 'financial' && currentProject && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-navy font-bold text-sm">لوحة التحليل المالي — {currentProject.title}</h3>
                    <span className="text-xs text-charcoal/50">IVS 103.2 · DCF Model</span>
                  </div>
                  <NPVDashboard project={currentProject} />
                </div>
              )}

              {activeTab === 'heatmap' && (
                <div className="space-y-3">
                  <DemandHeatMap />
                </div>
              )}

              {activeTab === 'team' && currentProject && (
                <div className="space-y-3">
                  <TeamBuilder projectName={currentProject.title} />
                </div>
              )}

              {activeTab === 'portfolio' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-navy font-bold text-sm flex items-center gap-2">
                      <Wallet size={16} className="text-brand" /> محفظتي الاستثمارية
                    </h3>
                    <span className="text-xs text-charcoal/50 bg-cream px-3 py-1 rounded-full border border-navy/10">
                      VIP — وصول كامل
                    </span>
                  </div>
                  <InvestorPortfolio />
                  <AllocationCalculator projects={vipProjects} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky invest CTA — hidden on xl where sidebar button is visible */}
      {currentProject && (
        <div className="fixed bottom-0 left-0 right-0 xl:hidden z-40 bg-white/95 backdrop-blur-md border-t border-navy/10 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-4 py-3 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-navy font-black text-sm truncate">{currentProject.title || currentProject.name}</p>
            <p className="text-charcoal/50 text-xs">IRR {currentProject.irr}% · {currentProject.city}</p>
          </div>
          <button onClick={() => setInvestModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-l from-brand to-navy text-white font-black px-5 py-2.5 rounded-xl text-sm shrink-0 shadow-lg shadow-brand/20">
            <Crown size={15} /> استثمر الآن
          </button>
        </div>
      )}

      {/* Investment Modal */}
      <InvestmentModal
        isOpen={investModalOpen}
        onClose={() => setInvestModalOpen(false)}
        project={currentProject}
      />
    </div>
  );
}
