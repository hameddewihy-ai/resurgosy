import { useState, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, MapPin, Clock, Users, Shield, CheckCircle,
  AlertTriangle, FileText, ChevronDown, ChevronLeft, DollarSign,
  TrendingUp, Calendar, Lock, MessageCircle, Globe, HardHat,
  Heart, Share2, BarChart3, ExternalLink, BadgeCheck, Star, Copy,
} from 'lucide-react';
import toast from 'react-hot-toast';
import SEO from '../components/SEO';
import {
  CROWD_PROJECTS, RISK_COLORS, RISK_LABELS, STATUS_CONFIG, RETURN_TYPE_LABELS,
  daysLeft, fundingPct, calcIRR,
} from '../data/crowdfundData';
import { useAuth } from '../context/AuthContext';
import { addNotification } from '../components/NotificationsPanel';
import { useGlobalData } from '../context/GlobalContext';
import EscrowCheckoutModal from '../components/wallet/EscrowCheckoutModal';
import DeveloperProfileModal from '../components/developer/DeveloperProfileModal';
import KYCGateModal, { isKYCVerified } from '../components/crowdfund/KYCGateModal';
import KYCGate from '../components/invest/KYCGate';
import ProjectCompareDrawer from '../components/crowdfund/ProjectCompareDrawer';
import InvestorQnA from '../components/crowdfund/InvestorQnA';
import FeeTransparencyCard from '../components/crowdfund/FeeTransparencyCard';

// ── Watchlist helpers ─────────────────────────────────────────────────────────
const WATCHLIST_KEY = 'resurgo-crowdfund-watchlist';
function getWatchlist() { try { return JSON.parse(localStorage.getItem(WATCHLIST_KEY) || '[]'); } catch { return []; } }
function saveWatchlist(ids) { try { localStorage.setItem(WATCHLIST_KEY, JSON.stringify(ids)); } catch {} }

// ── Similar project mini-card ─────────────────────────────────────────────────
function SimilarCard({ p }) {
  const pct = fundingPct(p.raisedAmount, p.targetAmount);
  const status = STATUS_CONFIG[p.status];
  return (
    <Link to={`/crowdfund/${p.id}`}
      className="bg-white p-4 flex gap-3 items-center shadow-[0_2px_8px_rgba(31,42,56,0.06)] hover:shadow-[0_8px_24px_rgba(31,42,56,0.10)] rounded-lg transition-all hover:-translate-y-0.5 group">
      <img src={p.image} alt="" className="w-16 h-14 rounded-xl object-cover shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-navy font-bold text-xs truncate group-hover:text-brand transition-colors">{p.title}</p>
        <p className="text-charcoal/45 text-[10px] mb-2">{p.city} · {p.type}</p>
        <div className="flex items-center gap-2">
          <span className="text-cta font-black text-xs">{p.expectedAnnualReturn}%</span>
          <div className="flex-1 h-1.5 bg-navy/8 rounded-full overflow-hidden">
            <div className="h-full bg-brand rounded-full" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-[9px] text-charcoal/40">{pct}%</span>
        </div>
      </div>
      <div className={`shrink-0 flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full border ${status.color}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
        {status.label}
      </div>
    </Link>
  );
}

// ── Investment calculator ─────────────────────────────────────────────────────
function InvestCalc({ project }) {
  const { user } = useAuth();
  const { pushCrossHint } = useGlobalData();
  const [amount,    setAmount]    = useState(project.minInvestment);
  const [step,      setStep]      = useState('form');
  const [inputVal,  setInputVal]  = useState(String(project.minInvestment));
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [kycOpen,   setKycOpen]   = useState(false);
  const [kycDone,   setKycDone]   = useState(isKYCVerified);

  const remaining  = project.targetAmount - project.raisedAmount;
  const maxAllowed = Math.min(project.maxInvestment, remaining > 0 ? remaining : project.maxInvestment);

  const ownershipPct    = ((amount / project.targetAmount) * 100).toFixed(4);
  const annualIncome    = (amount * project.expectedAnnualReturn / 100).toFixed(0);
  const monthlyIncome   = (annualIncome / 12).toFixed(0);
  const totalAtMaturity = (amount * Math.pow(1 + project.expectedAnnualReturn / 100, project.holdPeriod / 12)).toFixed(0);
  const totalReturn     = (totalAtMaturity - amount).toFixed(0);
  const irr             = calcIRR(amount, project.expectedAnnualReturn, project.holdPeriod);
  const rentalIncome    = project.returnBreakdown ? (amount * project.returnBreakdown.rental / 100).toFixed(0) : null;
  const capitalIncome   = project.returnBreakdown ? (amount * project.returnBreakdown.capitalGain / 100).toFixed(0) : null;

  const handleSlider = (v) => { setAmount(v); setInputVal(String(v)); };
  const handleInput  = (v) => {
    setInputVal(v);
    const n = Number(v);
    if (!isNaN(n) && n >= project.minInvestment && n <= maxAllowed) setAmount(n);
  };

  const handleInvest = () => {
    if (!user)    { toast.error('يرجى تسجيل الدخول أولاً'); return; }
    if (!kycDone) { setKycOpen(true); return; }
    setStep('confirm');
  };

  const handleConfirm = () => {
    const INV_KEY = 'resurgo-investments';
    try {
      const existing = JSON.parse(localStorage.getItem(INV_KEY) || '[]');
      const record = {
        id: Date.now(),
        projectTitle: project.title,
        amount,
        date: new Date().toLocaleDateString('ar-SY', { year: 'numeric', month: 'long', day: 'numeric' }),
      };
      localStorage.setItem(INV_KEY, JSON.stringify([record, ...existing]));
    } catch {}
    setStep('done');
    toast.success(`تم تقديم طلب استثمارك بمبلغ $${Number(amount).toLocaleString()} ✅`);
    pushCrossHint({ emoji: '📈', text: 'استكشف فرص استثمارية أخرى بعوائد مدروسة', label: 'فرص الاستثمار', to: '/invest' });
  };

  if (project.status !== 'active') {
    return (
      <div className="bg-white p-6 text-center shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
        <Lock size={28} className="mx-auto mb-3 text-charcoal/30" />
        <p className="text-navy font-bold text-sm mb-1">
          {project.status === 'funded' ? 'اكتمل التمويل' : 'المشروع مغلق'}
        </p>
        <p className="text-charcoal/50 text-xs">لا يمكن الاستثمار في هذا المشروع حالياً</p>
        {project.status === 'returning' && (
          <p className="text-green-600 font-semibold text-xs mt-3">يوزع العوائد الآن على المستثمرين 🎉</p>
        )}
      </div>
    );
  }

  if (step === 'done') {
    return (
      <div className="bg-white p-6 text-center shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
        <div className="w-14 h-14 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={26} className="text-green-500" />
        </div>
        <p className="text-navy font-black text-base mb-2">طلبك قيد المعالجة!</p>
        <p className="text-charcoal/60 text-xs leading-relaxed mb-4">
          استثمارك بمبلغ <strong>${Number(amount).toLocaleString()}</strong> في {project.title} قيد المراجعة.
          ستتلقى تأكيداً على بريدك الإلكتروني خلال 24 ساعة مع تعليمات التحويل.
        </p>
        <div className="flex flex-col gap-2 items-center">
          <button onClick={() => setStep('form')} className="text-brand text-xs hover:underline">
            استثمار مبلغ آخر
          </button>
          <Link to="/invest" className="flex items-center gap-1.5 text-xs text-charcoal/50 hover:text-brand transition-colors">
            <BarChart3 size={11} /> عرض محفظتك الاستثمارية
          </Link>
        </div>
      </div>
    );
  }

  if (step === 'confirm') {
    return (
      <div className="bg-white p-6 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg" dir="rtl">
        <p className="text-navy font-black text-sm mb-4">تأكيد الاستثمار</p>
        <div className="space-y-2 mb-5">
          {[
            ['المشروع',       project.title],
            ['المبلغ',        `$${Number(amount).toLocaleString()}`],
            ['حصتك',          `${ownershipPct}%`],
            ['العائد السنوي', `$${Number(annualIncome).toLocaleString()} (${project.expectedAnnualReturn}%)`],
            ['فترة الاحتجاز', `${project.holdPeriod} شهر`],
            ['هيكل SPV',      project.spvName],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between py-1 border-b border-navy/[0.06] last:border-0 text-xs">
              <span className="text-charcoal/50">{k}</span>
              <span className="text-navy font-semibold">{v}</span>
            </div>
          ))}
        </div>
        <div className="text-[10px] text-charcoal/50 leading-relaxed bg-cream rounded-xl p-3 mb-4">
          بالنقر على "تأكيد" فإنك توافق على شروط الاستثمار ونشرة الإصدار، وتُقرّ بفهم طبيعة المخاطر المرتبطة.
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsCheckoutOpen(true)}
            className="flex-1 bg-brand text-white text-sm font-bold py-3 rounded-xl hover:bg-navy transition-colors">
            تأكيد الاستثمار
          </button>
          <button onClick={() => setStep('form')}
            className="px-4 border border-navy/15 text-charcoal/60 rounded-xl hover:text-navy text-sm transition-colors">
            تعديل
          </button>
        </div>
        <EscrowCheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          details={{ title: `استثمار في مشروع: ${project.title}`, amount, type: 'invest' }}
          onConfirm={handleConfirm}
        />
      </div>
    );
  }

  return (
    <div className="bg-white p-5 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg" dir="rtl">
      <p className="text-charcoal/50 text-xs font-semibold uppercase tracking-wider mb-4">حاسبة الاستثمار</p>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-navy font-bold text-sm">مبلغ الاستثمار</label>
          <div className="flex items-center gap-1 border border-navy/15 rounded-xl overflow-hidden">
            <span className="bg-cream px-2 py-1 text-charcoal/50 text-xs border-l border-navy/10">$</span>
            <input type="number" value={inputVal} onChange={e => handleInput(e.target.value)}
              min={project.minInvestment} max={maxAllowed}
              className="w-24 px-2 py-1 text-navy text-sm font-bold focus:outline-none bg-white" />
          </div>
        </div>
        <input type="range" min={project.minInvestment} max={maxAllowed} step={500}
          value={amount} onChange={e => handleSlider(Number(e.target.value))}
          className="w-full accent-brand cursor-pointer" />
        <div className="flex justify-between text-[10px] text-charcoal/40 mt-1">
          <span>الحد الأدنى ${project.minInvestment.toLocaleString()}</span>
          <span>الحد الأقصى ${maxAllowed.toLocaleString()}</span>
        </div>
      </div>

      <div className="bg-gradient-to-br from-brand/5 to-navy/5 rounded-2xl p-4 mb-4 space-y-2.5">
        {[
          { label: 'حصتك في المشروع',           value: `${ownershipPct}%`,                                color: 'text-brand' },
          ...(rentalIncome && project.returnBreakdown.rental > 0 ? [
            { label: `عائد إيجاري (${project.returnBreakdown.rental}%)`, value: `$${Number(rentalIncome).toLocaleString()}/سنة`, color: 'text-green-600' },
          ] : [
            { label: 'دخل إيجاري سنوي',         value: `$${Number(annualIncome).toLocaleString()}`,        color: 'text-green-600' },
          ]),
          ...(capitalIncome && project.returnBreakdown.capitalGain > 0 ? [
            { label: `مكاسب رأسمالية (${project.returnBreakdown.capitalGain}%)`, value: `$${Number(capitalIncome).toLocaleString()}/سنة`, color: 'text-violet-600' },
          ] : []),
          { label: 'دخل شهري متوقع',             value: `$${Number(monthlyIncome).toLocaleString()}`,       color: 'text-green-600' },
          { label: `إجمالي بعد ${project.holdPeriod} شهر`, value: `$${Number(totalAtMaturity).toLocaleString()}`, color: 'text-navy font-black' },
          { label: 'مكاسبك الإجمالية',           value: `+$${Number(totalReturn).toLocaleString()}`,        color: 'text-cta font-bold' },
          { label: 'معدل العائد الداخلي (IRR)',   value: `${irr}%`,                                          color: 'text-charcoal/70' },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex items-center justify-between border-b border-navy/[0.05] pb-2 last:border-0 last:pb-0">
            <span className="text-charcoal/60 text-[11px]">{label}</span>
            <span className={`text-sm ${color}`}>{value}</span>
          </div>
        ))}
      </div>

      <p className="text-charcoal/40 text-[10px] mb-4">
        * هذه أرقام تقديرية غير مضمونة. تُشير إلى توقعات بناءً على أداء السوق والبيانات التاريخية.
      </p>

      <button onClick={handleInvest}
        className="w-full bg-cta hover:bg-cta/90 text-white font-black py-3.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-cta/20">
        <DollarSign size={16} />
        استثمر ${Number(amount).toLocaleString()} الآن
      </button>

      <a href={`https://wa.me/963000000000?text=${encodeURIComponent(`أودّ الاستفسار عن الاستثمار في مشروع: ${project.title}`)}`}
        target="_blank" rel="noreferrer"
        className="w-full mt-2 flex items-center justify-center gap-2 text-xs text-[#22c55e] bg-[#25D366]/8 border border-[#25D366]/20 py-2.5 rounded-xl hover:bg-[#25D366]/12 transition-colors font-medium">
        <MessageCircle size={13} /> استشارة مجانية عبر واتساب
      </a>

      <KYCGate
        isOpen={kycOpen}
        onClose={() => setKycOpen(false)}
        onComplete={() => { setKycDone(true); setKycOpen(false); setStep('confirm'); }}
      />
    </div>
  );
}

// ── Main detail page ──────────────────────────────────────────────────────────
export default function CrowdfundDetailPage() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const { developers, projects: devProjects, jobs } = useGlobalData();

  const [activeImg,     setActiveImg]     = useState(0);
  const [faqOpen,       setFaqOpen]       = useState(null);
  const [devModalOpen,  setDevModalOpen]  = useState(false);
  const [compareOpen,   setCompareOpen]   = useState(false);
  const [docKycOpen,    setDocKycOpen]    = useState(false);
  const [pendingDoc,    setPendingDoc]    = useState(null);

  const project = useMemo(() => CROWD_PROJECTS.find(p => String(p.id) === id), [id]);

  const [saved, setSaved] = useState(() => project ? getWatchlist().includes(project.id) : false);

  const similar = useMemo(() => {
    if (!project) return [];
    return CROWD_PROJECTS
      .filter(p => p.id !== project.id && (p.city === project.city || p.developerId === project.developerId))
      .slice(0, 3);
  }, [project]);

  const developer = useMemo(
    () => project?.developerId ? developers.find(d => d.id === project.developerId) : null,
    [project, developers]
  );

  if (!project) {
    return (
      <div className="min-h-screen bg-[#f2f1ee] flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <TrendingUp size={48} className="mx-auto mb-4 text-charcoal/30" />
          <p className="text-navy font-bold text-lg mb-4">المشروع غير موجود</p>
          <Link to="/crowdfund" className="btn-primary px-6 py-2.5 text-sm inline-flex items-center gap-2">
            <ArrowRight size={14} /> العودة للمشاريع
          </Link>
        </div>
      </div>
    );
  }

  const pct    = fundingPct(project.raisedAmount, project.targetAmount);
  const days   = daysLeft(project.deadline);
  const status = STATUS_CONFIG[project.status];
  const remaining = project.targetAmount - project.raisedAmount;

  const maxBenchmark = Math.max(project.expectedAnnualReturn + 3, 22);
  const BENCHMARKS = [
    { label: 'هذا المشروع', pct: project.expectedAnnualReturn, color: 'bg-cta',     textColor: 'text-cta'     },
    { label: 'S&P 500',      pct: 10.5,                          color: 'bg-blue-400', textColor: 'text-blue-600' },
    { label: 'ذهب',          pct: 8.2,                           color: 'bg-amber-400',textColor: 'text-amber-600'},
    { label: 'وديعة بنكية', pct: 3.5,                           color: 'bg-navy/25',  textColor: 'text-navy/50'  },
  ];

  const toggleSave = () => {
    const list = getWatchlist();
    const next = saved ? list.filter(i => i !== project.id) : [...list, project.id];
    saveWatchlist(next);
    setSaved(!saved);
    if (!saved) {
      toast.success('أُضيف إلى قائمة المتابعة');
      addNotification({
        type: 'invest',
        title: 'مشروع في قائمة متابعتك',
        body: `${project.title} — ستصلك تحديثات عند تغيير حالة التمويل`,
        link: `/crowdfund/${project.id}`,
      });
    } else {
      toast('أُزيل من المتابعة', { icon: '🗑️' });
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('تم نسخ رابط المشروع');
    } catch {
      toast(`${url}`, { icon: '🔗', duration: 4000 });
    }
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`فرصة استثمارية: ${project.title} — عائد ${project.expectedAnnualReturn}% سنوياً\n${window.location.href}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const processDocRequest = (doc) => {
    toast.success('سيتم إرسال الوثيقة إلى بريدك الإلكتروني');
    addNotification({ type: 'system', title: 'طلب وثيقة', body: `تم طلب "${doc.name}" — ستصلك نسخة خلال دقائق`, link: '/dashboard' });
  };

  const handleDocRequest = (doc) => {
    if (isKYCVerified()) { processDocRequest(doc); return; }
    setPendingDoc(doc);
    setDocKycOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f2f1ee] pt-[62px]" dir="rtl">
      <SEO
        title={project.title}
        description={project.description}
        image={project.images[0]}
        path={`/crowdfund/${project.id}`}
      />

      {/* ── Back bar + actions ───────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-charcoal/60 hover:text-navy text-sm transition-colors">
          <ArrowRight size={16} /> التمويل الجماعي
        </button>
        <div className="flex items-center gap-2">
          <button onClick={() => setCompareOpen(true)}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-charcoal/55 hover:text-brand border border-navy/12 hover:border-brand/30 bg-white px-3 py-1.5 rounded-xl transition-all">
            <BarChart3 size={12} /> قارن
          </button>
          <button onClick={handleShare}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-charcoal/55 hover:text-brand border border-navy/12 hover:border-brand/30 bg-white px-3 py-1.5 rounded-xl transition-all">
            <Copy size={12} /> نسخ الرابط
          </button>
          <button onClick={handleWhatsAppShare}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-[#22c55e] border border-[#25D366]/25 bg-white px-3 py-1.5 rounded-xl hover:bg-[#25D366]/5 transition-all">
            <Share2 size={12} /> مشاركة
          </button>
          <button onClick={toggleSave}
            className={`flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-xl border transition-all ${
              saved ? 'bg-cta/10 border-cta/25 text-cta' : 'bg-white border-navy/12 text-charcoal/55 hover:border-cta/30 hover:text-cta'
            }`}>
            <Heart size={12} fill={saved ? 'currentColor' : 'none'} />
            {saved ? 'محفوظ' : 'متابعة'}
          </button>
        </div>
      </div>

      {/* ── Urgency bar ──────────────────────────────────── */}
      <AnimatePresence>
        {project.status === 'active' && days > 0 && days <= 90 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="max-w-7xl mx-auto px-4 mb-4">
            <div className={`rounded-2xl px-5 py-3 flex items-center justify-between flex-wrap gap-3 border ${
              days <= 14 ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
            }`}>
              <div className="flex items-center gap-2.5">
                <span className={`w-2 h-2 rounded-full animate-pulse ${days <= 14 ? 'bg-red-500' : 'bg-amber-500'}`} />
                <span className={`font-bold text-sm ${days <= 14 ? 'text-red-800' : 'text-amber-800'}`}>
                  {days <= 7 ? `⚡ ${days} أيام فقط — الفرصة تُغلق قريباً!` : `ينتهي التمويل خلال ${days} يوم`}
                </span>
              </div>
              <div className={`flex items-center gap-5 text-xs ${days <= 14 ? 'text-red-700' : 'text-amber-700'}`}>
                <span>المتبقي للهدف: <strong>${remaining.toLocaleString()}</strong></span>
                <span>اكتمل: <strong>{pct}%</strong></span>
                <span>{project.investorsCount} مستثمر سبقك</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Main content ─────────────────────────────── */}
          <div className="flex-1 min-w-0">

            {/* Gallery */}
            <div className="rounded-3xl overflow-hidden mb-5 bg-navy/5">
              <div className="relative h-72 sm:h-96">
                <img src={project.images[activeImg]} alt={project.title}
                  className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/60 to-transparent" />

                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  <div className={`flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full font-bold border backdrop-blur-sm ${status.color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                    {status.label}
                  </div>
                  <span className={`text-[10px] px-2.5 py-1 rounded-full border font-semibold backdrop-blur-sm ${RISK_COLORS[project.riskLevel]}`}>
                    {RISK_LABELS[project.riskLevel]}
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 bg-cta text-white px-4 py-2 rounded-xl font-black text-sm shadow-xl">
                  {project.expectedAnnualReturn}% / سنة
                </div>
              </div>

              {project.images.length > 1 && (
                <div className="flex gap-2 p-3 bg-white/50">
                  {project.images.map((img, i) => (
                    <button key={i} onClick={() => setActiveImg(i)}
                      className={`w-16 h-12 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${activeImg === i ? 'border-brand' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title + meta */}
            <h1 className="text-navy font-black text-2xl mb-2">{project.title}</h1>
            <div className="flex flex-wrap items-center gap-3 text-charcoal/55 text-xs mb-4">
              <span className="flex items-center gap-1"><MapPin size={11} className="text-brand" /> {project.city} · {project.district}</span>
              <span className="flex items-center gap-1"><Users size={11} className="text-brand" /> {project.investorsCount} مستثمر</span>
              {project.countryCount && (
                <span className="flex items-center gap-1"><Globe size={11} className="text-brand" /> من {project.countryCount} دولة</span>
              )}
              <span className="flex items-center gap-1"><Calendar size={11} className="text-brand" /> احتجاز {project.holdPeriod} شهر</span>
              <span className="flex items-center gap-1"><Shield size={11} className="text-brand" /> {project.spvName}</span>
            </div>

            {/* Return type badges */}
            {project.returnType && (
              <div className="flex flex-wrap gap-2 mb-5">
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-brand/10 text-brand border border-brand/20">
                  نوع العائد: {RETURN_TYPE_LABELS[project.returnType]}
                </span>
                {project.returnBreakdown?.rental > 0 && (
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
                    إيجاري {project.returnBreakdown.rental}%
                  </span>
                )}
                {project.returnBreakdown?.capitalGain > 0 && (
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-200">
                    رأسمالي {project.returnBreakdown.capitalGain}%
                  </span>
                )}
              </div>
            )}

            {/* Description + construction progress */}
            <div className="bg-white p-6 mb-5 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
              <p className="text-charcoal/50 text-xs font-semibold uppercase tracking-wider mb-3">نبذة عن المشروع</p>
              <p className="text-charcoal/75 text-sm leading-loose mb-4">{project.description}</p>
              {project.constructionProgress !== undefined && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-navy">
                      <HardHat size={13} className="text-brand" /> نسبة الإنجاز
                    </span>
                    <span className={`text-xs font-black ${project.constructionProgress >= 100 ? 'text-green-600' : 'text-brand'}`}>
                      {project.constructionProgress}%
                    </span>
                  </div>
                  <div className="h-2.5 bg-navy/8 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${project.constructionProgress}%` }}
                      transition={{ duration: 1.2, ease: 'easeOut' }}
                      className={`h-full rounded-full ${project.constructionProgress >= 100 ? 'bg-green-500' : project.constructionProgress >= 60 ? 'bg-brand' : 'bg-amber-500'}`}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Developer card */}
            {developer && (
              <div className="bg-white p-5 mb-5 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
                <p className="text-charcoal/50 text-xs font-semibold uppercase tracking-wider mb-4">المطوّر</p>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-base shrink-0"
                    style={{ backgroundColor: developer.color || '#5979bb' }}>
                    {developer.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <p className="text-navy font-bold text-sm truncate">{developer.name}</p>
                      {developer.verified && <BadgeCheck size={13} className="text-brand shrink-0" />}
                    </div>
                    <p className="text-charcoal/50 text-[10px]">
                      {developer.city} · تأسست {developer.founded} · {developer.projectsCount} مشاريع منجزة
                    </p>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-50 border border-amber-100 rounded-lg px-2.5 py-1 shrink-0">
                    <Star size={11} className="text-amber-500 fill-amber-500" />
                    <span className="text-amber-700 text-xs font-black">{developer.rating}</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                  {[
                    { label: 'مشروع منجز',   value: developer.completedCount },
                    { label: 'وحدة سكنية',   value: developer.totalUnits?.toLocaleString() || '—' },
                    { label: 'موظف',          value: developer.employees || '—' },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-cream/70 rounded-xl py-2">
                      <p className="text-navy font-black text-sm">{value}</p>
                      <p className="text-charcoal/40 text-[9px] mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>
                <button onClick={() => setDevModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 border border-brand/25 text-brand hover:bg-brand/5 py-2.5 rounded-xl text-xs font-bold transition-colors">
                  <ExternalLink size={12} /> عرض ملف المطوّر الكامل
                </button>
                <Link to="/developers"
                  className="w-full flex items-center justify-center gap-2 border border-navy/15 text-navy/60 hover:border-brand/30 hover:text-brand py-2 rounded-xl text-xs font-medium transition-colors">
                  <Users size={12} /> جميع المطوّرين
                </Link>
              </div>
            )}

            {/* Highlights */}
            <div className="bg-white p-6 mb-5 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
              <p className="text-charcoal/50 text-xs font-semibold uppercase tracking-wider mb-4">أبرز المميزات</p>
              <ul className="space-y-2.5">
                {project.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-charcoal/75">
                    <CheckCircle size={15} className="text-brand shrink-0 mt-0.5" />
                    {h}
                  </li>
                ))}
              </ul>
            </div>

            {/* Milestones */}
            <div className="bg-white p-6 mb-5 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
              <p className="text-charcoal/50 text-xs font-semibold uppercase tracking-wider mb-5">خط زمني للمشروع</p>
              <div className="relative">
                <div className="absolute right-[7px] top-2 bottom-2 w-px bg-navy/10" />
                <div className="space-y-5">
                  {project.milestones.map((m, i) => (
                    <div key={i} className="flex items-start gap-4 pr-6 relative">
                      <div className={`absolute right-0 top-1 w-3.5 h-3.5 rounded-full border-2 shrink-0 ${m.done ? 'bg-brand border-brand' : 'bg-white border-navy/25'}`} />
                      <div className="flex-1">
                        <p className={`text-xs font-semibold ${m.done ? 'text-navy' : 'text-charcoal/50'}`}>{m.label}</p>
                        <p className="text-[10px] text-charcoal/35 mt-0.5">{m.date}</p>
                      </div>
                      {m.done && <CheckCircle size={13} className="text-brand shrink-0 mt-0.5" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Map */}
            {project.lat && project.lng && (
              <div className="bg-white p-5 mb-5 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
                <p className="text-charcoal/50 text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
                  <MapPin size={12} className="text-brand" /> موقع المشروع
                </p>
                <div className="rounded-2xl overflow-hidden border border-navy/8">
                  <iframe
                    title="موقع المشروع"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${project.lng - 0.025},${project.lat - 0.025},${project.lng + 0.025},${project.lat + 0.025}&layer=mapnik&marker=${project.lat},${project.lng}`}
                    className="w-full h-52 border-0"
                    loading="lazy"
                  />
                </div>
                <p className="text-[10px] text-charcoal/35 mt-2 flex items-center gap-1">
                  <MapPin size={9} /> {project.district}، {project.city}، {project.province}
                </p>
              </div>
            )}

            {/* Documents */}
            {project.documents.length > 0 && (
              <div className="bg-white p-6 mb-5 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
                <p className="text-charcoal/50 text-xs font-semibold uppercase tracking-wider mb-4">مستندات العناية الواجبة</p>
                <div className="space-y-2">
                  {project.documents.map((doc, i) => (
                    <button key={i}
                      onClick={() => handleDocRequest(doc)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl border border-navy/8 hover:border-brand/30 hover:bg-cream transition-all text-right group">
                      <FileText size={14} className="text-brand shrink-0" />
                      <span className="text-navy text-xs font-medium flex-1">{doc.name}</span>
                      <ChevronLeft size={13} className="text-charcoal/30 group-hover:text-brand transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* FAQ */}
            {project.faqs.length > 0 && (
              <div className="bg-white p-6 mb-5 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
                <p className="text-charcoal/50 text-xs font-semibold uppercase tracking-wider mb-4">أسئلة شائعة</p>
                <div className="space-y-2">
                  {project.faqs.map((faq, i) => (
                    <div key={i} className="border border-navy/8 rounded-xl overflow-hidden">
                      <button onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                        className="w-full flex items-center justify-between p-4 text-right hover:bg-cream transition-colors">
                        <span className="text-navy font-semibold text-xs">{faq.q}</span>
                        <ChevronDown size={14} className={`text-charcoal/40 transition-transform shrink-0 mr-2 ${faqOpen === i ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {faqOpen === i && (
                          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                            transition={{ duration: 0.2 }} className="overflow-hidden">
                            <p className="px-4 pb-4 text-charcoal/65 text-xs leading-relaxed">{faq.a}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Investor Q&A */}
            <InvestorQnA project={project} />

            {/* Similar projects */}
            {similar.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-charcoal/50 text-xs font-semibold uppercase tracking-wider">مشاريع مشابهة</p>
                  <Link to="/crowdfund" className="text-xs text-brand hover:text-navy transition-colors font-medium">
                    عرض الكل
                  </Link>
                </div>
                <div className="space-y-3">
                  {similar.map(p => <SimilarCard key={p.id} p={p} />)}
                </div>
              </div>
            )}

            {/* PropertiesPage cross-link */}
            <Link to={`/properties?city=${encodeURIComponent(project.city)}`}
              className="flex items-center gap-4 p-4 bg-navy/3 border border-navy/10 rounded-2xl hover:border-brand/25 hover:bg-brand/5 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
                <MapPin size={18} className="text-brand" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-navy font-bold text-sm group-hover:text-brand transition-colors">
                  عقارات مشابهة في {project.city}
                </p>
                <p className="text-charcoal/45 text-xs mt-0.5">استعرض قوائم البيع والإيجار في نفس المنطقة</p>
              </div>
              <ChevronLeft size={15} className="text-charcoal/30 group-hover:text-brand transition-colors shrink-0" />
            </Link>

            {/* Equipment cross-link — based on project type */}
            {(() => {
              const TYPE_EQ_MAP = {
                'سكني':  { icon: '🏗️', label: 'رافعات ومعدات حفر',  cats: 'crane, excavator', hint: 'رافعات برجية، حفارات، معدات صبّ خرسانة' },
                'تجاري': { icon: '⚙️', label: 'حفارات ومعدات ثقيلة', cats: 'excavator, demolition', hint: 'حفارات أساسات، معدات هدم وتجهيز الموقع' },
                'سياحي': { icon: '🏖️', label: 'معدات بنية تحتية',    cats: 'light, generator', hint: 'رافعات شوكية، مولدات كهرباء، جرافات خفيفة' },
                'صناعي': { icon: '🏭', label: 'معدات هدم وتجهيز',    cats: 'demolition, crane', hint: 'معدات هدم، رافعات مناولة، مولدات طاقة' },
              };
              const map = TYPE_EQ_MAP[project.type];
              if (!map) return null;
              return (
                <Link to="/equipment"
                  className="flex items-center gap-4 p-4 bg-cta/3 border border-cta/15 rounded-2xl hover:border-cta/30 hover:bg-cta/6 transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-cta/10 flex items-center justify-center shrink-0 text-xl">
                    {map.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-navy font-bold text-sm group-hover:text-cta transition-colors">
                      المعدات المطلوبة لهذا المشروع ({project.type})
                    </p>
                    <p className="text-charcoal/45 text-xs mt-0.5">{map.hint}</p>
                  </div>
                  <ChevronLeft size={15} className="text-charcoal/30 group-hover:text-cta transition-colors shrink-0" />
                </Link>
              );
            })()}
          </div>

          {/* ── Sticky sidebar ───────────────────────────── */}
          <div className="lg:w-80 shrink-0">
            <div className="lg:sticky lg:top-[82px] space-y-4">

              {/* Funding stats */}
              <div className="bg-white p-5 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-charcoal/50 text-xs">جُمع حتى الآن</span>
                  <span className="text-navy font-black text-lg">{pct}%</span>
                </div>
                <div className="h-3 bg-navy/8 rounded-full overflow-hidden mb-2">
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    className={`h-full rounded-full ${pct >= 100 ? 'bg-green-500' : 'bg-brand'}`}
                  />
                </div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-brand font-bold">${project.raisedAmount.toLocaleString()}</span>
                  <span className="text-charcoal/40">من ${project.targetAmount.toLocaleString()}</span>
                </div>
                {project.status === 'active' && remaining > 0 && (
                  <p className="text-[10px] text-charcoal/40 text-left mb-4">
                    المتبقي: <span className="font-bold text-navy/60">${remaining.toLocaleString()}</span>
                  </p>
                )}

                <div className="grid grid-cols-2 gap-3 text-center">
                  {[
                    { label: 'مستثمر',       value: project.investorsCount.toLocaleString(),                                             icon: Users    },
                    { label: 'أيام متبقية',   value: project.status === 'active' ? (days > 0 ? days : 'انتهى') : '—',                   icon: Clock    },
                    { label: 'الحد الأدنى',   value: `$${project.minInvestment.toLocaleString()}`,                                       icon: DollarSign },
                    { label: 'العائد السنوي', value: `${project.expectedAnnualReturn}%`,                                                  icon: TrendingUp },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="bg-cream/70 rounded-xl p-3">
                      <Icon size={13} className="text-brand mx-auto mb-1" />
                      <p className="text-navy font-black text-sm">{value}</p>
                      <p className="text-charcoal/40 text-[10px]">{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Investment form */}
              <InvestCalc project={project} />

              {/* SPV badge */}
              <div className="bg-white p-4 flex gap-3 items-start shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
                <Shield size={16} className="text-brand shrink-0 mt-0.5" />
                <div>
                  <p className="text-navy font-bold text-xs mb-0.5">حماية قانونية عبر SPV</p>
                  <p className="text-charcoal/55 text-[10px] leading-relaxed">
                    {project.spvName} — مُسجَّلة في {project.spvCountry}
                  </p>
                </div>
              </div>

              {/* Fees */}
              <FeeTransparencyCard project={project} />

              {/* Benchmark comparison */}
              <div className="bg-white p-4 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
                <p className="flex items-center gap-1.5 text-xs font-bold text-navy mb-4">
                  <BarChart3 size={13} className="text-brand" /> مقارنة العائد بالمعايير
                </p>
                <div className="space-y-3">
                  {BENCHMARKS.map(({ label, pct: bPct, color, textColor }) => (
                    <div key={label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-charcoal/60">{label}</span>
                        <span className={`text-[10px] font-black ${textColor}`}>{bPct}%</span>
                      </div>
                      <div className="h-2 bg-navy/6 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(bPct / maxBenchmark) * 100}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className={`h-full rounded-full ${color}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[9px] text-charcoal/30 mt-3">* أرقام تقديرية للمقارنة — ليست ضماناً للعائد</p>
              </div>

              {/* Risk disclosure */}
              <div className="flex gap-3 p-4 bg-amber-50/70 border border-amber-200 rounded-2xl">
                <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[10px] text-amber-800 leading-relaxed">
                  الاستثمار ينطوي على مخاطر. العوائد المذكورة تقديرية وغير مضمونة. اقرأ نشرة الإصدار كاملةً قبل الاستثمار.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Developer profile modal */}
      {developer && (
        <DeveloperProfileModal
          isOpen={devModalOpen}
          onClose={() => setDevModalOpen(false)}
          developer={developer}
          projects={devProjects}
          jobs={jobs}
        />
      )}

      {/* Compare drawer */}
      <ProjectCompareDrawer
        isOpen={compareOpen}
        onClose={() => setCompareOpen(false)}
        project={project}
      />

      {/* Doc KYC gate */}
      <KYCGateModal
        isOpen={docKycOpen}
        onClose={() => { setDocKycOpen(false); setPendingDoc(null); }}
        onComplete={() => {
          setDocKycOpen(false);
          if (pendingDoc) processDocRequest(pendingDoc);
          setPendingDoc(null);
        }}
      />
    </div>
  );
}
