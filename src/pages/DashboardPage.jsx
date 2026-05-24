import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Building2, Heart, Scale, Briefcase,
  TrendingUp, Bell, Settings, ChevronRight, MapPin,
  BadgeCheck, Clock, Star, LogOut, MessageCircle,
  User, Phone, Mail, Edit3, CheckCircle, Package,
  FolderKanban, ArrowLeft, HardHat, FileText, X,
  Inbox, Globe, Shield, Wrench, Trash2, Save,
} from 'lucide-react';
import { useAuth, ROLES } from '../context/AuthContext';
import { useGlobalData } from '../context/GlobalContext';
import { getSavedIds } from '../utils/savedProps';
import { getRecentlyViewed } from '../utils/recentlyViewed';
import toast from 'react-hot-toast';
import ContractModal from '../components/contracts/ContractModal';
import HandoverProtocolModal from '../components/contracts/HandoverProtocolModal';
import StudyWorkspaceModal from '../components/studies/StudyWorkspaceModal';
import InvestorPortfolio from '../components/invest/InvestorPortfolio';

const INQ_KEY       = 'resurgo-inquiries';
const OWNER_INQ_KEY = 'resurgo-received-inquiries';
const APPS_KEY      = 'resurgo-job-apps';
const LIST_KEY      = 'resurgo-my-listings';

const lsLoad = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; }
  catch { return fallback; }
};

const MOCK_RECEIVED = [
  {
    id: 'ri-1', senderName: 'محمد الأحمد', senderPhone: '+963 933 111 222',
    propertyTitle: 'شقة فاخرة في المزة — 3 غرف', propertyId: 1,
    message: 'أودّ الاستفسار عن هذا العقار وتفاصيل الدفع، هل ما زال متاحاً؟',
    date: '2026-05-14', status: 'جديد',
  },
  {
    id: 'ri-2', senderName: 'سارة حداد', senderPhone: '+963 944 333 444',
    propertyTitle: 'فيلا مع حديقة — ريف دمشق', propertyId: 3,
    message: 'هل العقار متاح للمعاينة هذا الأسبوع؟ لدينا عائلة مهتمة.',
    date: '2026-05-12', status: 'تمت الإجابة',
  },
];

const TABS = [
  { id: 'overview',  label: 'نظرة عامة',          icon: LayoutDashboard },
  { id: 'portfolio', label: 'المحفظة الاستثمارية', icon: TrendingUp },
  { id: 'saved',     label: 'المحفوظات',           icon: Heart },
  { id: 'messages',  label: 'رسائلي',              icon: MessageCircle },
  { id: 'inbox',     label: 'الواردة',             icon: Inbox },
  { id: 'myprops',   label: 'عقاراتي',             icon: Building2 },
  { id: 'clearing',  label: 'معاملاتي',            icon: Scale },
  { id: 'jobs',      label: 'طلباتي',              icon: Briefcase },
  { id: 'profile',   label: 'الملف الشخصي',        icon: User },
];

const MOCK_TRANSACTIONS = [
  { ref: 'SY-CLR-2025-11241', type: 'حصر إرث',      status: 'قيد المراجعة',      date: '2025-05-10', color: 'text-charcoal/60' },
  { ref: 'SY-CLR-2025-22891', type: 'وكالة قانونية', status: 'مؤرشَف',            date: '2025-05-09', color: 'text-green-600' },
  { ref: 'SY-CLR-2025-33401', type: 'استرداد ملكية', status: 'بانتظار الموافقة', date: '2025-05-08', color: 'text-amber-600' },
];

const MOCK_APPLICATIONS = [
  { id: 'j001', title: 'مهندس إنشائي أول', company: 'شركة الإعمار السورية', status: 'تحت المراجعة', date: '2025-05-10' },
  { id: 'j003', title: 'مهندس كهرباء — أنظمة ذكية', company: 'مجموعة التقنيات المتقدمة', status: 'مقبول للمقابلة', date: '2025-05-08' },
];

function StatCard({ icon: Icon, value, label, color }) {
  return (
    <div className="bg-white p-5 flex items-center gap-4 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
      <div className={`w-11 h-11 rounded-2xl ${color} flex items-center justify-center shrink-0`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="text-navy font-black text-2xl leading-none">{value}</p>
        <p className="text-charcoal/60 text-xs mt-0.5">{label}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab]   = useState('overview');
  const [showNotifications, setShowNotifications] = useState(false);

  // Profile edit state (dashboard inline)
  const [editMode,   setEditMode]   = useState(false);
  const [draftName,  setDraftName]  = useState('');
  const [draftPhone, setDraftPhone] = useState('');
  const [profSaving, setProfSaving] = useState(false);

  // Contract Modal state
  const [isContractOpen, setIsContractOpen] = useState(false);
  const [isHandoverOpen, setIsHandoverOpen] = useState(false);
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);

  // Data
  const [inquiries]     = useState(() => lsLoad(INQ_KEY, []));
  const [receivedInqs]  = useState(() => lsLoad(OWNER_INQ_KEY, MOCK_RECEIVED));
  const [jobApps]       = useState(() => lsLoad(APPS_KEY, MOCK_APPLICATIONS));
  const [myInvests]     = useState([]);
  const [myListings, setMyListings]           = useState(() => lsLoad(LIST_KEY, []));
  const [editingListingId, setEditingListingId] = useState(null);
  const [draftListingPrice, setDraftListingPrice] = useState('');
  const [draftListingStatus, setDraftListingStatus] = useState('');
  const { properties }  = useGlobalData();

  if (!user) return <Navigate to="/auth" replace />;

  const role           = ROLES[user.role];
  const savedIds       = getSavedIds();
  const savedProps     = properties.filter(p => savedIds.includes(p.id));
  const recentlyViewed = getRecentlyViewed();

  const displayName  = user.full_name || '—';
  const displayPhone = user.phone     || '—';

  // Merge localStorage listings + GlobalContext properties owned by this user
  const ownedMockProps = properties
    .filter(p => p.ownerName && user.full_name && p.ownerName === user.full_name)
    .map(p => ({ ...p, isMock: true }));
  const localIds = new Set(myListings.map(l => String(l.id)));
  const combinedListings = [
    ...myListings,
    ...ownedMockProps.filter(p => !localIds.has(String(p.id))),
  ];

  const handleDeleteListing = (id) => {
    toast((t) => (
      <div dir="rtl" className="flex flex-col gap-3 min-w-[220px]">
        <p className="text-sm font-bold">هل تريد حذف هذا العقار؟</p>
        <p className="text-xs text-white/60">لا يمكن التراجع عن هذا الإجراء</p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              const updated = myListings.filter(l => String(l.id) !== String(id));
              setMyListings(updated);
              localStorage.setItem(LIST_KEY, JSON.stringify(updated));
              toast.dismiss(t.id);
              toast('تم حذف العقار من قائمتك');
            }}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-1.5 rounded-lg transition-colors">
            نعم، احذف
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="flex-1 bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-1.5 rounded-lg transition-colors">
            إلغاء
          </button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  const startEditListing = (p) => {
    setEditingListingId(String(p.id));
    setDraftListingPrice(p.priceDisplay || '');
    setDraftListingStatus(p.status || 'للبيع');
  };

  const handleSaveListing = (id) => {
    const updated = myListings.map(l =>
      String(l.id) === String(id)
        ? { ...l, priceDisplay: draftListingPrice, status: draftListingStatus }
        : l
    );
    setMyListings(updated);
    localStorage.setItem(LIST_KEY, JSON.stringify(updated));
    setEditingListingId(null);
    toast.success('تم تحديث بيانات العقار');
  };

  const startEdit = () => {
    setDraftName(user.full_name || '');
    setDraftPhone(user.phone || '');
    setEditMode(true);
  };
  const saveEdit = async () => {
    setProfSaving(true);
    try {
      await updateProfile({ full_name: draftName.trim(), phone: draftPhone.trim() });
      setEditMode(false);
    } finally {
      setProfSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream pt-16" dir="rtl">

      {/* Profile header */}
      <div className="border-b border-navy/10 bg-white px-4 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center text-2xl font-black text-brand shrink-0">
              {user.full_name?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-navy font-black text-lg">{displayName}</p>
                <BadgeCheck size={16} className="text-brand" />
              </div>
              <div className="flex items-center gap-2 text-xs text-charcoal/60">
                <span>{role?.icon} {role?.label}</span>
                <span className="text-navy/20">·</span>
                <span>{user.email}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setTab('profile')}
              className="w-9 h-9 bg-white shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg flex items-center justify-center text-charcoal/50 hover:text-navy transition-colors"
              title="إعدادات الحساب">
              <Settings size={16} />
            </button>
            <div className="relative">
              <button
                onClick={() => setShowNotifications(v => !v)}
                className={`w-9 h-9 bg-white shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg flex items-center justify-center transition-colors relative ${showNotifications ? 'text-brand' : 'text-charcoal/50 hover:text-navy'}`}
                title="الإشعارات">
                <Bell size={16} />
                {(inquiries.length > 0 || jobApps.length > 0) && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-cta rounded-full" />
                )}
              </button>
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 top-full mt-2 w-80 bg-white py-2 z-50 shadow-xl rounded-lg"
                    dir="rtl">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-navy/[0.07]">
                      <p className="text-navy font-bold text-sm">الإشعارات</p>
                      <button onClick={() => setShowNotifications(false)} className="text-charcoal/40 hover:text-navy">
                        <X size={14} />
                      </button>
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {inquiries.length === 0 && jobApps.length === 0 ? (
                        <p className="text-charcoal/50 text-xs text-center py-6">لا توجد إشعارات جديدة</p>
                      ) : (
                        <>
                          {inquiries.slice(0, 3).map((inq) => (
                            <button key={inq.id} onClick={() => { setTab('messages'); setShowNotifications(false); }}
                              className="w-full flex items-start gap-3 px-4 py-3 hover:bg-cream transition-colors text-right">
                              <MessageCircle size={14} className="text-brand shrink-0 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <p className="text-navy text-xs font-semibold truncate">استفسار: {inq.propertyTitle}</p>
                                <p className="text-charcoal/50 text-[11px] mt-0.5">{inq.date}</p>
                              </div>
                            </button>
                          ))}
                          {jobApps.slice(0, 2).map((app) => (
                            <button key={app.id} onClick={() => { setTab('jobs'); setShowNotifications(false); }}
                              className="w-full flex items-start gap-3 px-4 py-3 hover:bg-cream transition-colors text-right">
                              <Briefcase size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <p className="text-navy text-xs font-semibold truncate">{app.title}</p>
                                <p className="text-charcoal/50 text-[11px] mt-0.5">{app.status}</p>
                              </div>
                            </button>
                          ))}
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button onClick={logout}
              className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 border border-red-200 hover:border-red-300 px-3 py-2 rounded-xl transition-all">
              <LogOut size={14} /> خروج
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-7 overflow-x-auto scrollbar-none pb-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all shrink-0 ${tab === id ? 'bg-brand border-brand text-white' : 'border-navy/15 text-charcoal/60 hover:border-brand/40 hover:text-navy bg-white'}`}>
              <Icon size={15} />{label}
            </button>
          ))}
        </div>

        {/* ── Overview / Project Hub ── */}
        {tab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            
            {/* Project Hub Section */}
            <div className="bg-white p-6 border-t-4 border-t-brand shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-black text-navy flex items-center gap-2">
                    <FolderKanban className="text-brand" /> مركز إدارة المشاريع
                  </h2>
                  <p className="text-xs text-charcoal/60 mt-1">
                    أدر دورة حياة مشروعك بالكامل من التمويل وحتى البيع عبر نظام Resurgo الموحد.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button onClick={() => setIsWorkspaceOpen(true)} className="bg-violet-500/10 text-violet-700 hover:bg-violet-500/20 font-bold py-2 px-4 text-xs rounded-xl transition-colors border border-violet-500/20 flex items-center gap-1.5">
                    <FolderKanban size={14} /> مساحة العمل (الدراسات)
                  </button>
                  <button onClick={() => setIsHandoverOpen(true)} className="bg-green-500/10 text-green-700 hover:bg-green-500/20 font-bold py-2 px-4 text-xs rounded-xl transition-colors border border-green-500/20 flex items-center gap-1.5">
                    <CheckCircle size={14} /> استلام وتسليم (Escrow)
                  </button>
                  <button onClick={() => setIsContractOpen(true)} className="bg-navy/5 text-navy hover:bg-navy/10 font-bold py-2 px-4 text-xs rounded-xl transition-colors border border-navy/10 flex items-center gap-1.5">
                    <FileText size={14} /> إبرام عقد رقمي
                  </button>
                  <button className="btn-primary py-2 px-4 text-xs">+ مشروع جديد</button>
                </div>
              </div>

              {/* Active Project Lifecycle */}
              <div className="bg-navy/5 rounded-2xl p-5 border border-navy/10 relative">
                <div className="absolute top-4 left-4 bg-brand/10 text-brand text-[10px] font-bold px-2 py-1 rounded-full border border-brand/20">
                  مشروع نشط
                </div>
                <h3 className="text-navy font-black text-lg mb-4">برج ياسمين الشام</h3>
                
                {/* Timeline / Kanban Steps — horizontal scroll on mobile */}
                <div className="flex gap-4 overflow-x-auto scrollbar-none pb-1 relative">
                  {/* Progress Line */}
                  <div className="hidden sm:block absolute top-1/2 left-0 right-0 h-1 bg-navy/10 -translate-y-1/2 z-0" />
                  
                  {/* Step 1: Financing */}
                  <div className="bg-white p-4 rounded-xl border-2 border-brand relative z-10 shadow-md shrink-0 min-w-[180px] flex-1">
                    <div className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center mb-3">
                      <TrendingUp size={14} />
                    </div>
                    <h4 className="text-navy font-bold text-sm mb-1">1. التمويل</h4>
                    <p className="text-[10px] text-charcoal/50 mb-3">تم جمع 500,000$ بنجاح من المستثمرين.</p>
                    <Link to="/wallet" className="text-[10px] text-brand font-bold flex items-center gap-1 hover:underline">
                      عرض ميزانية المشروع <ArrowLeft size={10} />
                    </Link>
                  </div>

                  {/* Step 2: Engineering */}
                  <div className="bg-white p-4 rounded-xl border border-navy/10 relative z-10 hover:border-brand/30 transition-colors shrink-0 min-w-[180px] flex-1">
                    <div className="w-8 h-8 rounded-full bg-navy/5 text-charcoal/40 flex items-center justify-center mb-3">
                      <Briefcase size={14} />
                    </div>
                    <h4 className="text-navy font-bold text-sm mb-1">2. الدراسات</h4>
                    <p className="text-[10px] text-charcoal/50 mb-3">تحتاج لمهندس معماري لبدء المخططات.</p>
                    <Link to="/studies" className="text-[10px] text-brand font-bold flex items-center gap-1 hover:underline">
                      توظيف مهندس <ArrowLeft size={10} />
                    </Link>
                  </div>

                  {/* Step 3: Construction */}
                  <div className="bg-white p-4 rounded-xl border border-navy/10 relative z-10 hover:border-brand/30 transition-colors shrink-0 min-w-[180px] flex-1">
                    <div className="w-8 h-8 rounded-full bg-navy/5 text-charcoal/40 flex items-center justify-center mb-3">
                      <HardHat size={14} />
                    </div>
                    <h4 className="text-navy font-bold text-sm mb-1">3. التنفيذ</h4>
                    <p className="text-[10px] text-charcoal/50 mb-3">استأجر المعدات والمقاولين بضمان المنصة.</p>
                    <Link to="/equipment" className="text-[10px] text-brand font-bold flex items-center gap-1 hover:underline">
                      استئجار معدات <ArrowLeft size={10} />
                    </Link>
                  </div>

                  {/* Step 4: Sales */}
                  <div className="bg-white p-4 rounded-xl border border-navy/10 relative z-10 hover:border-brand/30 transition-colors shrink-0 min-w-[180px] flex-1">
                    <div className="w-8 h-8 rounded-full bg-navy/5 text-charcoal/40 flex items-center justify-center mb-3">
                      <Building2 size={14} />
                    </div>
                    <h4 className="text-navy font-bold text-sm mb-1">4. المبيعات</h4>
                    <p className="text-[10px] text-charcoal/50 mb-3">اعرض الوحدات الجاهزة للبيع في السوق.</p>
                    <Link to="/owner/add-property" className="text-[10px] text-brand font-bold flex items-center gap-1 hover:underline">
                      إدراج عقار <ArrowLeft size={10} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={Heart}     value={savedIds.length}          label="عقار محفوظ"   color="bg-red-500" />
              <StatCard icon={Scale}     value={MOCK_TRANSACTIONS.length} label="معاملة نشطة" color="bg-brand" />
              <StatCard icon={Briefcase} value={jobApps.length}           label="طلب توظيف"   color="bg-emerald-500" />
              <StatCard icon={TrendingUp}value={myInvests.length}         label="استثمار نشط"  color="bg-amber-500" />
            </div>

          </motion.div>
        )}

        {/* ── Saved properties ── */}
        {tab === 'saved' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-charcoal/60 text-xs mb-5"><span className="text-navy font-bold">{savedProps.length}</span> عقار محفوظ</p>
            {/* Recently viewed strip */}
            {recentlyViewed.length > 0 && (
              <div className="mb-7">
                <p className="text-charcoal/50 text-[11px] font-bold uppercase tracking-widest mb-3">شاهدتها مؤخراً</p>
                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                  {recentlyViewed.map(p => (
                    <Link key={p.id} to={`/properties/${p.id}`}
                      className="bg-white shrink-0 w-44 overflow-hidden shadow-[0_2px_8px_rgba(31,42,56,0.06)] hover:shadow-[0_8px_24px_rgba(31,42,56,0.10)] hover:-translate-y-0.5 transition-all rounded-lg">
                      <div className="h-24 overflow-hidden relative">
                        <img src={p.image} alt={p.title} className="w-full h-full object-cover" loading="lazy" />
                        <div className="absolute inset-0 bg-gradient-to-t from-navy/50 to-transparent" />
                        <span className={`absolute top-2 right-2 text-[9px] px-1.5 py-0.5 rounded-full font-bold ${p.status === 'للبيع' ? 'bg-cta text-white' : 'bg-brand text-white'}`}>{p.status}</span>
                      </div>
                      <div className="p-2.5">
                        <p className="text-navy text-[11px] font-bold truncate">{p.title}</p>
                        <p className="text-charcoal/50 text-[10px]">{p.city}</p>
                        <p className="text-navy font-black text-xs mt-1">{p.priceDisplay}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {savedProps.length === 0 ? (
              <div className="bg-white p-12 text-center shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
                <Heart size={40} className="mx-auto text-navy/15 mb-4" />
                <p className="text-navy font-bold text-base mb-1">لم تحفظ أي عقار بعد</p>
                <p className="text-charcoal/45 text-sm mb-5">اضغط على ❤️ على أي عقار لحفظه هنا</p>
                <Link to="/properties" className="btn-cta text-sm px-6 py-2.5 inline-flex items-center gap-2">
                  <Building2 size={15} /> تصفّح العقارات
                </Link>
              </div>
            ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {savedProps.map((p, i) => (
                <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                  <Link to={`/properties/${p.id}`} className="block group">
                    <div className="bg-white overflow-hidden shadow-[0_2px_8px_rgba(31,42,56,0.06)] hover:shadow-[0_16px_48px_rgba(31,42,56,0.13)] transition-all hover:-translate-y-1 rounded-lg">
                      <div className="relative h-44 overflow-hidden">
                        <img src={p.images[0]} alt={p.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-navy/60 to-transparent" />
                        <span className={`absolute top-3 right-3 text-xs px-2.5 py-1 rounded-full font-bold ${p.status === 'للبيع' ? 'bg-cta text-white' : 'bg-brand text-white'}`}>{p.status}</span>
                      </div>
                      <div className="p-4">
                        <p className="text-navy font-bold text-sm mb-1 truncate">{p.title}</p>
                        <p className="text-charcoal/60 text-xs flex items-center gap-1 mb-2"><MapPin size={11} />{p.city} · {p.district}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-navy font-black">{p.priceDisplay}</p>
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => <Star key={i} size={11} className={i < p.rating ? 'text-yellow-400 fill-yellow-400' : 'text-navy/20'} />)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
            )}
          </motion.div>
        )}

        {/* ── Transactions ── */}
        {tab === 'clearing' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-charcoal/60 text-xs"><span className="text-navy font-bold">{MOCK_TRANSACTIONS.length}</span> معاملة</p>
              <Link to="/clearing/dashboard" className="text-xs text-brand hover:underline flex items-center gap-1">
                إدارة المعاملات <ChevronRight size={12} />
              </Link>
            </div>
            {MOCK_TRANSACTIONS.map((t, i) => (
              <motion.div key={t.ref} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                className="bg-white p-4 flex items-center gap-4 shadow-[0_2px_8px_rgba(31,42,56,0.06)] hover:shadow-[0_8px_24px_rgba(31,42,56,0.10)] transition-all"
                style={{ borderRadius: '8px' }}>
                <Scale size={16} className="text-brand shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-navy font-bold text-sm">{t.type}</p>
                  <p className="text-charcoal/50 font-mono text-xs">{t.ref}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-xs font-bold ${t.color}`}>{t.status}</p>
                  <p className="text-charcoal/40 text-[10px] mt-0.5">{t.date}</p>
                </div>
              </motion.div>
            ))}
            <Link to="/clearing/dashboard" className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-navy/20 text-charcoal/50 hover:border-brand/40 hover:text-brand rounded-xl text-sm transition-all">
              + معاملة جديدة
            </Link>
          </motion.div>
        )}

        {/* ── My listings ── */}
        {tab === 'myprops' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-charcoal/60 text-xs">
                <span className="text-navy font-bold">{combinedListings.length}</span> عقار
                {ownedMockProps.length > 0 && (
                  <span className="text-charcoal/40 mr-1">({ownedMockProps.length} من المنصة)</span>
                )}
              </p>
              <Link to="/owner/add-property" className="btn-cta text-xs px-4 py-2">+ إضافة عقار</Link>
            </div>

            {combinedListings.length === 0 ? (
              <div className="bg-white p-10 text-center shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
                <Building2 size={36} className="mx-auto text-navy/20 mb-3" />
                <p className="text-charcoal/50 text-sm">لم تُضف أي عقار بعد</p>
                <Link to="/owner/add-property" className="text-brand text-xs hover:underline mt-2 inline-block">
                  أضف عقارك الأول الآن
                </Link>
              </div>
            ) : (
              combinedListings.map((p, i) => {
                const isEditing = editingListingId === String(p.id);
                return (
                  <motion.div key={p.id || i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }} className="bg-white overflow-hidden shadow-[0_2px_8px_rgba(31,42,56,0.06)] hover:shadow-[0_8px_24px_rgba(31,42,56,0.10)] transition-all"
                    style={{ borderRadius: '8px' }}>

                    {/* Main row */}
                    <div className="p-4 flex items-center gap-4">
                      {(p.images?.[0] || p.image) && (
                        <img src={p.images?.[0] ?? p.image} alt=""
                          className="w-16 h-14 rounded-xl object-cover shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-navy font-bold text-sm truncate">{p.title}</p>
                          {p.isMock && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-navy/8 text-charcoal/50 shrink-0">
                              من المنصة
                            </span>
                          )}
                        </div>
                        <p className="text-charcoal/60 text-xs flex items-center gap-1">
                          <MapPin size={11} />{p.city}{p.district ? ` · ${p.district}` : ''}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${p.status === 'للبيع' ? 'bg-cta/10 text-cta border-cta/20' : 'bg-brand/10 text-brand border-brand/20'}`}>
                          {p.status}
                        </span>
                        <p className="text-navy font-black text-sm mt-1">{p.priceDisplay}</p>
                      </div>
                      {/* Actions — only for localStorage listings */}
                      {!p.isMock && (
                        <div className="flex gap-1.5 shrink-0">
                          <button onClick={() => isEditing ? setEditingListingId(null) : startEditListing(p)}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isEditing ? 'bg-brand/10 text-brand' : 'bg-cream text-charcoal/40 hover:text-brand hover:bg-brand/8'}`}
                            title="تعديل">
                            <Edit3 size={13} />
                          </button>
                          <button onClick={() => handleDeleteListing(p.id)}
                            className="w-8 h-8 rounded-lg bg-cream flex items-center justify-center text-charcoal/40 hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="حذف">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* KPI stats row — shown for platform listings that carry analytics */}
                    {p.isMock && (p.views || p.inquiries || p.savedCount) ? (
                      <div className="px-4 pb-3 flex items-center gap-5 border-t border-navy/[0.05] pt-2.5">
                        <span className="flex items-center gap-1.5 text-[11px] text-charcoal/50">
                          <span className="text-navy/40">👁</span>
                          <span className="font-semibold text-charcoal/70">{p.views?.toLocaleString()}</span> مشاهدة
                        </span>
                        <span className="flex items-center gap-1.5 text-[11px] text-charcoal/50">
                          <span className="text-navy/40">📩</span>
                          <span className="font-semibold text-charcoal/70">{p.inquiries}</span> استفسار
                        </span>
                        <span className="flex items-center gap-1.5 text-[11px] text-charcoal/50">
                          <span className="text-navy/40">❤️</span>
                          <span className="font-semibold text-charcoal/70">{p.savedCount}</span> حفظ
                        </span>
                      </div>
                    ) : null}

                    {/* Inline edit panel */}
                    <AnimatePresence>
                      {isEditing && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }} className="overflow-hidden border-t border-navy/8">
                          <div className="p-4 bg-cream/50 flex flex-wrap gap-3 items-end">
                            <div className="flex-1 min-w-[140px]">
                              <label className="text-charcoal/50 text-[10px] font-semibold uppercase tracking-wider mb-1 block">السعر / السعر المعروض</label>
                              <input value={draftListingPrice} onChange={e => setDraftListingPrice(e.target.value)}
                                className="input-field text-sm py-2 w-full" placeholder="مثال: 85,000$" />
                            </div>
                            <div className="min-w-[120px]">
                              <label className="text-charcoal/50 text-[10px] font-semibold uppercase tracking-wider mb-1 block">الحالة</label>
                              <select value={draftListingStatus} onChange={e => setDraftListingStatus(e.target.value)}
                                className="input-field text-sm py-2 w-full">
                                <option value="للبيع">للبيع</option>
                                <option value="للإيجار">للإيجار</option>
                                <option value="بيع وإيجار">بيع وإيجار</option>
                                <option value="محجوز">محجوز</option>
                              </select>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => handleSaveListing(p.id)}
                                className="flex items-center gap-1.5 text-xs font-bold bg-brand text-white px-4 py-2 rounded-xl hover:bg-navy transition-colors">
                                <Save size={13} /> حفظ
                              </button>
                              <button onClick={() => setEditingListingId(null)}
                                className="text-xs text-charcoal/50 hover:text-navy px-3 py-2 rounded-xl border border-navy/15 transition-colors">
                                إلغاء
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        )}

        {/* ── Job applications ── */}
        {tab === 'jobs' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <p className="text-charcoal/60 text-xs mb-2"><span className="text-navy font-bold">{jobApps.length}</span> طلب توظيف</p>
            {jobApps.length === 0 ? (
              <div className="bg-white p-12 text-center shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
                <Briefcase size={40} className="mx-auto text-navy/15 mb-4" />
                <p className="text-navy font-bold text-base mb-1">لم تتقدم لأي وظيفة بعد</p>
                <p className="text-charcoal/45 text-sm mb-5">تصفّح الوظائف المتاحة وتقدّم بنقرة واحدة</p>
                <Link to="/jobs" className="btn-cta text-sm px-6 py-2.5 inline-flex items-center gap-2">
                  <Briefcase size={15} /> تصفّح الوظائف
                </Link>
              </div>
            ) : jobApps.map((a, i) => (
              <motion.div key={a.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                className="bg-white p-4 flex items-center gap-4 shadow-[0_2px_8px_rgba(31,42,56,0.06)] hover:shadow-[0_8px_24px_rgba(31,42,56,0.10)] transition-all"
                style={{ borderRadius: '8px' }}>
                <Briefcase size={16} className="text-emerald-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-navy font-bold text-sm">{a.title}</p>
                  <p className="text-charcoal/60 text-xs">{a.company}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${a.status === 'مقبول للمقابلة' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                    {a.status}
                  </span>
                  <p className="text-charcoal/40 text-[10px] mt-1">{a.date}</p>
                </div>
              </motion.div>
            ))}
            <Link to="/jobs" className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-navy/20 text-charcoal/50 hover:border-emerald-400/40 hover:text-emerald-600 rounded-xl text-sm transition-all">
              + تصفّح المزيد من الوظائف
            </Link>
          </motion.div>
        )}

        {/* ── Portfolio (Crowdfunding) ── */}
        {tab === 'portfolio' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <InvestorPortfolio />
          </motion.div>
        )}

        {/* ── Messages ── */}
        {tab === 'messages' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <p className="text-charcoal/60 text-xs mb-2">
              <span className="text-navy font-bold">{inquiries.length}</span> استفسار مُرسَل
            </p>
            {inquiries.length === 0 ? (
              <div className="bg-white p-10 text-center shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
                <MessageCircle size={36} className="mx-auto text-navy/20 mb-3" />
                <p className="text-charcoal/50 text-sm">لم ترسل أي استفسار بعد</p>
                <Link to="/properties" className="text-brand text-xs hover:underline mt-2 inline-block">
                  تصفّح العقارات وتواصل مع الملاك
                </Link>
              </div>
            ) : (
              inquiries.map((inq, i) => (
                <motion.div key={inq.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                  className="bg-white p-4 flex gap-4 shadow-[0_2px_8px_rgba(31,42,56,0.06)] hover:shadow-[0_8px_24px_rgba(31,42,56,0.10)] transition-all"
                  style={{ borderRadius: '8px' }}>
                  {inq.propertyImg && (
                    <img src={inq.propertyImg} alt="" className="w-16 h-14 rounded-xl object-cover shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-navy font-bold text-sm truncate">{inq.propertyTitle}</p>
                    <p className="text-charcoal/55 text-xs mt-0.5 truncate">إلى: {inq.ownerName}</p>
                    <p className="text-charcoal/60 text-xs mt-1.5 line-clamp-2 leading-relaxed">{inq.message}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand/10 text-brand border border-brand/20">
                      {inq.status}
                    </span>
                    <p className="text-charcoal/35 text-[10px] mt-1.5">{inq.date}</p>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}

        {/* ── Owner Inbox (Received Inquiries) ── */}
        {tab === 'inbox' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-charcoal/60 text-xs">
                <span className="text-navy font-bold">{receivedInqs.length}</span> استفسار وارد
              </p>
              {receivedInqs.filter(r => r.status === 'جديد').length > 0 && (
                <span className="text-[11px] font-bold bg-cta/10 text-cta border border-cta/20 px-2.5 py-1 rounded-full">
                  {receivedInqs.filter(r => r.status === 'جديد').length} جديد
                </span>
              )}
            </div>
            {receivedInqs.length === 0 ? (
              <div className="bg-white p-10 text-center shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
                <Inbox size={36} className="mx-auto text-navy/20 mb-3" />
                <p className="text-charcoal/50 text-sm">لا توجد استفسارات واردة بعد</p>
                <p className="text-charcoal/40 text-xs mt-1">ستظهر هنا استفسارات المهتمين بعقاراتك</p>
              </div>
            ) : (
              receivedInqs.map((inq, i) => (
                <motion.div key={inq.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-white p-4 flex gap-4 shadow-[0_2px_8px_rgba(31,42,56,0.06)] hover:shadow-[0_8px_24px_rgba(31,42,56,0.10)] transition-all"
                  style={{ borderRadius: '8px' }}>
                  <div className="w-10 h-10 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center shrink-0 text-brand font-black text-base">
                    {inq.senderName?.[0] || '؟'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-navy font-bold text-sm truncate">{inq.senderName}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${inq.status === 'جديد' ? 'bg-cta/10 text-cta border-cta/20' : 'bg-green-50 text-green-600 border-green-200'}`}>
                        {inq.status}
                      </span>
                    </div>
                    <p className="text-charcoal/55 text-xs flex items-center gap-1 mb-2">
                      <Building2 size={11} className="shrink-0" />
                      <span className="truncate">{inq.propertyTitle}</span>
                    </p>
                    <p className="text-charcoal/65 text-xs leading-relaxed line-clamp-2">{inq.message}</p>
                  </div>
                  <div className="shrink-0 flex flex-col items-end justify-between gap-3">
                    <p className="text-charcoal/35 text-[10px]">{inq.date}</p>
                    <a href={`https://wa.me/${inq.senderPhone?.replace(/[\s+\-()]/g, '')}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-[11px] font-bold text-green-600 hover:text-green-700 border border-green-200 hover:border-green-300 bg-green-50 hover:bg-green-100 px-2.5 py-1.5 rounded-xl transition-all">
                      <MessageCircle size={12} /> رد واتساب
                    </a>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}

        {/* ── Profile ── */}
        {tab === 'profile' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-xl space-y-5">

            {/* Avatar + name */}
            <div className="bg-white p-6 flex items-center gap-5 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
              <div className="w-16 h-16 rounded-2xl bg-brand/10 border-2 border-brand/20 flex items-center justify-center text-2xl font-black text-brand shrink-0">
                {displayName[0]?.toUpperCase() || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-navy font-black text-lg truncate">{displayName}</p>
                <p className="text-charcoal/55 text-xs flex items-center gap-1.5 mt-0.5">
                  {role?.icon} <span>{role?.label}</span>
                  <BadgeCheck size={13} className="text-brand mr-1" />
                </p>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                {!editMode && (
                  <button onClick={startEdit}
                    className="flex items-center gap-1.5 text-xs border border-navy/15 hover:border-brand/40 text-charcoal/60 hover:text-brand px-3 py-2 rounded-xl transition-all">
                    <Edit3 size={13} /> تعديل سريع
                  </button>
                )}
                <button onClick={() => navigate('/profile')}
                  className="flex items-center gap-1.5 text-xs border border-brand/25 text-brand hover:bg-brand/5 px-3 py-2 rounded-xl transition-all">
                  <User size={13} /> الملف الكامل
                </button>
              </div>
            </div>

            {/* Edit form */}
            <AnimatePresence>
              {editMode && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="bg-white p-5 space-y-4 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
                    <p className="text-navy font-bold text-sm">تعديل البيانات الشخصية</p>
                    <div>
                      <label className="text-charcoal/50 text-xs font-semibold mb-1.5 block uppercase tracking-wider">الاسم الكامل</label>
                      <input value={draftName} onChange={e => setDraftName(e.target.value)}
                        className="w-full input-field text-sm py-2.5" dir="rtl" placeholder="أدخل اسمك الكامل" />
                    </div>
                    <div>
                      <label className="text-charcoal/50 text-xs font-semibold mb-1.5 block uppercase tracking-wider">رقم الهاتف</label>
                      <input value={draftPhone} onChange={e => setDraftPhone(e.target.value)}
                        className="w-full input-field text-sm py-2.5" dir="ltr" placeholder="+963 XX XXX XXXX" />
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button onClick={saveEdit} disabled={profSaving}
                        className="btn-cta flex-1 flex items-center justify-center gap-2 text-sm disabled:opacity-60">
                        {profSaving
                          ? <Clock size={15} className="animate-spin" />
                          : <CheckCircle size={15} />}
                        {profSaving ? 'جارٍ الحفظ…' : 'حفظ التغييرات'}
                      </button>
                      <button onClick={() => setEditMode(false)}
                        className="px-4 border border-navy/15 text-charcoal/60 rounded-xl hover:text-navy transition-colors text-sm">
                        إلغاء
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Info cards */}
            <div className="bg-white divide-y divide-navy/[0.07] shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
              {[
                { icon: User,    label: 'الاسم الكامل',       value: displayName },
                { icon: Mail,    label: 'البريد الإلكتروني',  value: user.email },
                { icon: Phone,   label: 'رقم الهاتف',         value: displayPhone },
                { icon: Package, label: 'نوع الحساب',         value: role?.label || '—' },
                { icon: Globe,   label: 'المحافظة',           value: user.province || '—' },
                user.national_id    ? { icon: Shield, label: 'رقم الهوية الوطنية', value: user.national_id }    : null,
                user.specialization ? { icon: Wrench, label: 'التخصص / المهنة',   value: user.specialization } : null,
                user.company_name   ? { icon: Briefcase, label: 'اسم الشركة',      value: user.company_name }   : null,
                { icon: Clock,   label: 'تاريخ التسجيل',     value: user.created_at?.slice(0, 10) || '—' },
              ].filter(Boolean).map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-4 px-5 py-3.5">
                  <div className="w-8 h-8 rounded-xl bg-brand/8 flex items-center justify-center shrink-0">
                    <Icon size={14} className="text-brand" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-charcoal/45 text-[11px] uppercase tracking-wider">{label}</p>
                    <p className="text-navy font-semibold text-sm truncate mt-0.5">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Danger zone */}
            <div className="bg-white p-5 border border-red-200/50 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
              <p className="text-charcoal/50 text-xs font-semibold uppercase tracking-wider mb-3">منطقة الخطر</p>
              <button onClick={() => { logout(); toast('تم تسجيل الخروج'); }}
                className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 border border-red-200 hover:border-red-300 px-4 py-2.5 rounded-xl transition-all">
                <LogOut size={14} /> تسجيل الخروج من جميع الأجهزة
              </button>
            </div>
          </motion.div>
        )}

      </div>
      
      <ContractModal 
        isOpen={isContractOpen} 
        onClose={() => setIsContractOpen(false)} 
        defaultParty1={displayName}
      />

      <HandoverProtocolModal 
        isOpen={isHandoverOpen} 
        onClose={() => setIsHandoverOpen(false)} 
        projectName="برج ياسمين الشام"
      />

      <StudyWorkspaceModal
        isOpen={isWorkspaceOpen}
        onClose={() => setIsWorkspaceOpen(false)}
        projectName="برج ياسمين الشام"
        onHandover={() => {
          setIsWorkspaceOpen(false);
          setIsHandoverOpen(true);
        }}
      />
    </div>
  );
}
