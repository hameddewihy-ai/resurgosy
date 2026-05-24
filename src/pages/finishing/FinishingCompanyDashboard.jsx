import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Hammer, Building2, FileText, Star, Clock, CheckCircle,
  ChevronLeft, MapPin, Settings,
  TrendingUp, Eye, MessageSquare, BadgeCheck, Zap, X, Camera, Send, Plus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useGlobalData } from '../../context/GlobalContext';
import SEO from '../../components/SEO';
import toast from 'react-hot-toast';

const STATUS_CFG = {
  'جديد':          { cls: 'bg-teal-50 text-teal-700 border-teal-200',   dot: 'bg-teal-500' },
  'قيد المراجعة': { cls: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  'تم الرد':      { cls: 'bg-navy/5 text-navy/50 border-navy/10',       dot: 'bg-navy/30'  },
};

function RFQCard({ rfq, onViewDetails }) {
  const cfg = STATUS_CFG[rfq.status] || STATUS_CFG['تم الرد'];
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="cream-card p-4 flex flex-col gap-3 gpu-transition"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-bold text-navy text-sm">{rfq.client}</p>
            {rfq.urgent && (
              <span className="flex items-center gap-0.5 text-[10px] font-bold text-cta bg-cta/8 border border-cta/20 rounded-full px-1.5 py-0.5">
                <Zap size={9} /> عاجل
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5 text-navy/50 text-xs">
            <MapPin size={10} />
            <span>{rfq.city}</span>
            <span className="opacity-40">·</span>
            <span>{rfq.area} م²</span>
          </div>
        </div>
        <span className={`text-[10px] font-bold border rounded-full px-2 py-0.5 ${cfg.cls}`}>
          <span className={`inline-block w-1.5 h-1.5 rounded-full ${cfg.dot} ml-1`} />
          {rfq.status}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {rfq.services.map(s => (
          <span key={s} className="text-[10px] bg-brand/8 text-brand font-semibold px-2 py-0.5 rounded-full">{s}</span>
        ))}
        <span className="text-[10px] bg-navy/6 text-navy/60 font-semibold px-2 py-0.5 rounded-full">{rfq.budget}</span>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-navy/6">
        <span className="text-[10px] text-navy/35 flex items-center gap-1"><Clock size={9} />{rfq.date}</span>
        <button 
          onClick={() => onViewDetails(rfq)}
          className="text-[11px] font-bold text-brand hover:text-navy transition-colors flex items-center gap-1"
        >
          عرض التفاصيل <ChevronLeft size={11} />
        </button>
      </div>
    </motion.div>
  );
}

// ── Profile completion ─────────────────────────────────────────────────────────
const PROFILE_STEPS = [
  { label: 'تسجيل الحساب',           done: true  },
  { label: 'رفع شهادة السجل التجاري', done: false },
  { label: 'إضافة صور مشاريع سابقة', done: false },
  { label: 'تفعيل شارة "موثَّقة"',   done: false },
];

export default function FinishingCompanyDashboard() {
  const { user } = useAuth();
  const {
    finishingRFQs = [],
    finishingBids = [],
    addFinishingBid,
    finishingProjects = [],
    updateFinishingProjectMilestone,
    addFinishingProjectMedia,
    addFinishingProjectMessage,
    sypExchangeRate = 13000,
    setSypExchangeRate
  } = useGlobalData();

  const [activeTab, setActiveTab] = useState('rfqs');
  const [selectedRFQ, setSelectedRFQ] = useState(null);
  const [bidPrice, setBidPrice] = useState('');
  const [bidDuration, setBidDuration] = useState('');
  const [bidNotes, setBidNotes] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [newMessageText, setNewMessageText] = useState('');
  const [customRate, setCustomRate] = useState(sypExchangeRate);

  const companyName = user?.user_metadata?.company_name || 'شركة دوزان للإكساء والديكور';
  const myProjects = finishingProjects.filter(p => p.contractor === companyName);
  
  // Set default selected project if none
  if (selectedProjectId === null && myProjects.length > 0) {
    setSelectedProjectId(myProjects[0].id);
  }
  const selectedProject = myProjects.find(p => p.id === selectedProjectId);

  const newCount = finishingRFQs.filter(r => r.status === 'جديد').length;
  const myBidsCount = finishingBids.filter(b => b.companyName === companyName).length;
  const completedSteps = PROFILE_STEPS.filter(s => s.done).length;
  const profilePct = Math.round((completedSteps / PROFILE_STEPS.length) * 100);

  const handleOpenBid = (rfq) => {
    setSelectedRFQ(rfq);
    const suggestedPrice = rfq.area * (rfq.budget === 'فاخر / ديلوكس' ? 32 : rfq.budget === 'متوسط' ? 18 : 10);
    setBidPrice(suggestedPrice);
    setBidDuration('12');
    setBidNotes('يسعدنا تقديم هذا العرض لإكساء عقاركم بأعلى جودة وإشراف هندسي مستمر.');
  };

  const handleSubmitBid = (e) => {
    e.preventDefault();
    if (!bidPrice || !bidDuration) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    addFinishingBid({
      rfqId: selectedRFQ.id,
      companyId: user?.id || 1,
      companyName: companyName,
      price: Number(bidPrice),
      durationWeeks: Number(bidDuration),
      notes: bidNotes,
    });
    toast.success('تم إرسال عرض السعر بنجاح إلى العميل!');
    setSelectedRFQ(null);
  };

  const handleMilestoneUpdate = (milestoneId, updates) => {
    updateFinishingProjectMilestone(selectedProject.id, milestoneId, updates);
  };

  const handleUploadPhoto = () => {
    const dummyImages = [
      { emoji: '🏗️', caption: 'صب خرسانة الأعمدة وتجهيز البنية التحتية' },
      { emoji: '🧱', caption: 'أعمال بناء وتوزيع الجدران والتقسيمات الداخلية' },
      { emoji: '🎨', caption: 'أعمال دهان وتأسيس طلاء الصالون الرئيسي' },
      { emoji: '📐', caption: 'تركيب البلاط والرخام الفاخر للأرضيات' },
      { emoji: '💡', caption: 'تمديد أسلاك الكهرباء وأنظمة الإضاءة المخفية' }
    ];
    const randomImg = dummyImages[Math.floor(Math.random() * dummyImages.length)];
    addFinishingProjectMedia(selectedProject.id, {
      type: 'photo',
      caption: randomImg.caption,
      emoji: randomImg.emoji
    });
    toast.success('تم محاكاة رفع صورة تحديث العمل بنجاح!');
  };

  const handleSendMessage = () => {
    if (!newMessageText.trim()) return;
    addFinishingProjectMessage(selectedProject.id, {
      from: 'contractor',
      name: 'المقاول',
      text: newMessageText.trim()
    });
    setNewMessageText('');
    toast.success('تم إرسال الرسالة للعميل');
  };

  const handleUpdateExchangeRate = () => {
    setSypExchangeRate(Number(customRate));
    toast.success(`تم تحديث سعر الصرف الافتراضي إلى 1$ ≈ ${Number(customRate).toLocaleString()} ل.س`);
  };

  return (
    <div className="min-h-screen bg-cream" dir="rtl">
      <SEO title="لوحة تحكم شركة الإكساء — RESURGO" />

      {/* Header */}
      <div className="bg-navy pt-[62px]">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center shrink-0">
              <Hammer size={24} className="text-teal-400" />
            </div>
            <div>
              <p className="text-white/45 text-xs font-semibold uppercase tracking-widest mb-0.5">لوحة التحكم</p>
              <h1 className="text-white font-black text-xl leading-tight">
                {companyName}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-white/40 text-xs">
                  {user?.user_metadata?.finishing_specialty || 'إكساء شامل للمغتربين'}
                </span>
                <span className="text-white/20">·</span>
                <span className="text-white/40 text-xs flex items-center gap-1">
                  <MapPin size={10} />{user?.user_metadata?.work_areas || 'دمشق'}
                </span>
              </div>
            </div>
            <div className="mr-auto">
              <Link to="/finishing/companies"
                className="flex items-center gap-1.5 text-xs font-bold text-teal-400 hover:text-white transition-colors">
                <Eye size={13} /> عرض ملفك في الدليل
              </Link>
            </div>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-4 gap-3 mt-6">
            {[
              { icon: FileText,  val: newCount,  label: 'طلب جديد',      cls: 'text-teal-400'  },
              { icon: Star,      val: '4.8',      label: 'تقييمك',         cls: 'text-amber-400' },
              { icon: Eye,       val: '243',      label: 'مشاهدات الملف',  cls: 'text-brand'     },
              { icon: TrendingUp,val: myBidsCount,label: 'عروض أُرسلت',   cls: 'text-green-400' },
            ].map(({ icon: Icon, val, label, cls }) => (
              <div key={label} className="bg-white/5 rounded-xl p-3 text-center">
                <Icon size={16} className={`${cls} mx-auto mb-1`} />
                <p className={`font-display text-2xl leading-none ${cls}`}>{val}</p>
                <p className="text-white/35 text-[10px] mt-1">{label}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-6 border-b border-white/10">
            {[
              { key: 'rfqs',     label: 'طلبات العروض', badge: newCount },
              { key: 'projects', label: 'المشاريع النشطة', badge: myProjects.length },
              { key: 'profile',  label: 'إكمال الملف'                   },
              { key: 'links',    label: 'روابط سريعة'                   },
            ].map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                className={`relative flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold transition-colors ${
                  activeTab === t.key ? 'text-teal-400' : 'text-white/40 hover:text-white/70'
                }`}>
                {t.label}
                {t.badge > 0 && (
                  <span className="w-4 h-4 rounded-full bg-cta text-white text-[9px] flex items-center justify-center font-black">{t.badge}</span>
                )}
                {activeTab === t.key && (
                  <span className="absolute bottom-0 inset-x-4 h-[2px] bg-teal-400 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-5xl mx-auto px-4 py-8 grid lg:grid-cols-[1fr_300px] gap-8 items-start">
        
        {/* Left column: active tab content */}
        <div className="space-y-8 flex-1 min-w-0">
          
          {/* ── RFQs tab ── */}
          {activeTab === 'rfqs' && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-navy font-black text-lg">طلبات عروض الأسعار</h2>
                  <p className="text-navy/45 text-xs mt-0.5">الطلبات الواردة من ملاك ومطورين</p>
                </div>
                <span className="text-xs text-navy/40">{finishingRFQs.length} طلب</span>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-4">
                {finishingRFQs.map(rfq => (
                  <RFQCard key={rfq.id} rfq={rfq} onViewDetails={handleOpenBid} />
                ))}
              </div>
              
              <p className="text-center text-navy/30 text-xs mt-8">
                الطلبات الحقيقية ستظهر هنا بعد التحقق من الملف التجاري
              </p>
            </div>
          )}

          {/* ── Projects tab ── */}
          {activeTab === 'projects' && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-navy font-black text-lg">المشاريع النشطة قيد التنفيذ</h2>
                  <p className="text-navy/45 text-xs mt-0.5">متابعة مراحل الإنجاز ورفع التقارير للمغتربين</p>
                </div>
              </div>

              {myProjects.length === 0 ? (
                <div className="cream-card p-8 text-center text-navy/40">
                  لا يوجد مشاريع نشطة حالياً. عندما يقبل مغترب عرض سعر من عروضك، سيظهر المشروع هنا.
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Selector if multiple */}
                  {myProjects.length > 1 && (
                    <div className="flex items-center gap-2 mb-4 bg-white/40 p-2.5 rounded-xl border border-navy/5">
                      <span className="text-xs font-bold text-navy shrink-0">اختر المشروع للمتابعة:</span>
                      <select 
                        value={selectedProjectId || ''} 
                        onChange={e => setSelectedProjectId(Number(e.target.value))}
                        className="bg-transparent text-sm font-bold text-brand outline-none border-none cursor-pointer"
                      >
                        {myProjects.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {selectedProject && (
                    <div className="space-y-6">
                      {/* Project Overview Header */}
                      <div className="cream-card p-5 gpu-transition">
                        <div className="flex items-start justify-between flex-wrap gap-4">
                          <div>
                            <h3 className="text-navy font-black text-lg">{selectedProject.name}</h3>
                            <p className="text-navy/55 text-xs mt-1 flex items-center gap-1">
                              <MapPin size={11} /> {selectedProject.address}
                            </p>
                          </div>
                          <div className="text-left">
                            <span className="text-2xl font-black text-brand">{selectedProject.progress}%</span>
                            <p className="text-[10px] text-navy/40">نسبة الإنجاز الإجمالية</p>
                          </div>
                        </div>
                      </div>

                      {/* Milestones Management */}
                      <div className="cream-card p-5 gpu-transition">
                        <h4 className="text-navy font-black text-sm mb-4 flex items-center gap-1.5">
                          <CheckCircle size={15} className="text-teal-600" /> إدارة مراحل التنفيذ
                        </h4>
                        <div className="space-y-4">
                          {selectedProject.milestones.map(m => (
                            <div key={m.id} className="border-b border-navy/6 pb-4 last:border-none last:pb-0">
                              <div className="flex items-start justify-between gap-4 flex-wrap">
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-sm text-navy">{m.name}</p>
                                  <p className="text-xs text-navy/40 mt-0.5">{m.notes || 'لا يوجد ملاحظات حالياً'}</p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <select 
                                    value={m.status} 
                                    onChange={e => handleMilestoneUpdate(m.id, { status: e.target.value })}
                                    className="bg-navy/5 border border-navy/12 text-xs font-semibold px-2 py-1 rounded-lg outline-none"
                                  >
                                    <option value="pending">لم يبدأ</option>
                                    <option value="in_progress">قيد التنفيذ</option>
                                    <option value="done">مكتمل</option>
                                  </select>
                                  {m.status === 'in_progress' && (
                                    <input 
                                      type="number"
                                      min="0" max="100"
                                      placeholder="%"
                                      value={m.progress}
                                      onChange={e => handleMilestoneUpdate(m.id, { progress: Number(e.target.value) })}
                                      className="w-12 bg-navy/5 border border-navy/12 text-center text-xs font-bold py-1 rounded-lg"
                                    />
                                  )}
                                  {m.status === 'done' && (
                                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-lg font-bold flex items-center gap-0.5">
                                      ✓ مكتمل
                                    </span>
                                  )}
                                </div>
                              </div>
                              <input 
                                type="text"
                                placeholder="أضف تحديثاً هندسياً لهذه المرحلة..."
                                defaultValue={m.notes}
                                onBlur={e => handleMilestoneUpdate(m.id, { notes: e.target.value })}
                                className="w-full mt-2 bg-white border border-navy/8 rounded-lg px-2.5 py-1 text-xs outline-none focus:border-brand/40"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Photo updates & chat */}
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Media gallery management */}
                        <div className="cream-card p-5 gpu-transition">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-navy font-black text-sm flex items-center gap-1.5">
                              <Camera size={15} className="text-cta" /> التحديثات الميدانية
                            </h4>
                            <button 
                              onClick={handleUploadPhoto}
                              className="text-[10px] bg-cta hover:bg-cta/90 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm transition-all"
                            >
                              <Plus size={12} /> رفع تحديث مصور
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-2">
                            {selectedProject.media && selectedProject.media.map(med => (
                              <div key={med.id} className="relative aspect-square bg-navy/5 rounded-xl border border-navy/8 flex flex-col items-center justify-center p-1.5 text-center overflow-hidden">
                                <span className="text-2xl">{med.emoji}</span>
                                <span className="text-[9px] text-navy/55 absolute bottom-1 inset-x-1 truncate">{med.caption}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Communication Log */}
                        <div className="cream-card p-5 flex flex-col h-80 gpu-transition">
                          <h4 className="text-navy font-black text-sm mb-3 flex items-center gap-1.5">
                            <MessageSquare size={15} className="text-brand" /> تواصل مباشر مع المغترب
                          </h4>
                          <div className="flex-1 overflow-y-auto space-y-3 pl-1 mb-3 flex flex-col justify-end">
                            {selectedProject.messages && [...selectedProject.messages].map(msg => (
                              <div key={msg.id} className={`flex ${msg.from === 'contractor' ? 'justify-start' : 'justify-end'}`}>
                                <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs ${
                                  msg.from === 'contractor'
                                    ? 'bg-brand/10 border border-brand/20 rounded-tr-sm text-navy'
                                    : 'bg-navy/6 border border-navy/12 rounded-tl-sm text-navy'
                                }`}>
                                  <p className="leading-relaxed">{msg.text}</p>
                                  <p className="text-[8px] text-navy/35 mt-1">{msg.time} · {msg.date}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="flex items-center gap-1.5 border border-navy/12 rounded-xl bg-white overflow-hidden p-1">
                            <input 
                              type="text"
                              placeholder="رسالتك للمغترب..."
                              value={newMessageText}
                              onChange={e => setNewMessageText(e.target.value)}
                              onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                              className="flex-1 bg-transparent px-3 py-2 text-xs outline-none text-navy"
                            />
                            <button 
                              onClick={handleSendMessage}
                              disabled={!newMessageText.trim()}
                              className="w-8 h-8 rounded-lg bg-brand text-white flex items-center justify-center shrink-0 disabled:opacity-40"
                            >
                              <Send size={11} />
                            </button>
                          </div>
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Profile tab ── */}
          {activeTab === 'profile' && (
            <div className="max-w-lg mx-auto">
              <div className="cream-card p-6 mb-5 gpu-transition">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-navy font-black text-base">اكتمال الملف</h2>
                  <span className="font-display text-2xl text-teal-600">{profilePct}%</span>
                </div>
                <div className="h-2 bg-navy/8 rounded-full overflow-hidden mb-6">
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: `${profilePct}%` }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full bg-teal-500 rounded-full"
                  />
                </div>
                <div className="space-y-3">
                  {PROFILE_STEPS.map((s, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                        s.done ? 'bg-teal-500' : 'bg-navy/8 border-2 border-navy/15'
                      }`}>
                        {s.done
                          ? <CheckCircle size={12} className="text-white" />
                          : <span className="text-[10px] font-bold text-navy/30">{i + 1}</span>
                        }
                      </div>
                      <p className={`text-sm font-semibold ${s.done ? 'text-navy/50 line-through' : 'text-navy'}`}>{s.label}</p>
                      {!s.done && (
                        <button className="mr-auto text-[10px] font-bold text-brand hover:text-navy transition-colors">
                          إكمال
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="cream-card p-5 border-l-4 border-teal-500 gpu-transition">
                <div className="flex items-start gap-3">
                  <BadgeCheck size={18} className="text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-navy font-bold text-sm mb-1">احصل على شارة "موثَّقة"</p>
                    <p className="text-navy/55 text-xs leading-relaxed">
                      أكمل الملف التجاري ليتحقق فريق RESURGO من شركتك ويمنحها شارة الثقة — تزيد نسبة الردود بنسبة 3 أضعاف.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Quick links tab ── */}
          {activeTab === 'links' && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { icon: Building2,    label: 'ملفك في الدليل',    desc: 'كيف يراك العملاء',    to: '/finishing/companies',  cls: 'text-brand'     },
                { icon: FileText,     label: 'اطلب عرض سعر',     desc: 'اختبر تجربة العميل',   to: '/finishing/rfq',        cls: 'text-cta'       },
                { icon: Eye,          label: 'معرض المشاريع',     desc: 'إلهام لمشاريعك',       to: '/finishing/gallery',    cls: 'text-purple-600'},
                { icon: TrendingUp,   label: 'دليل الأسعار',      desc: 'قارن أسعار السوق',     to: '/finishing/prices',     cls: 'text-green-600' },
                { icon: MessageSquare,label: 'تواصل مع الدعم',    desc: 'نساعدك في الإعداد',    to: '/finishing',            cls: 'text-navy'      },
                { icon: Settings,     label: 'إعدادات الحساب',    desc: 'بيانات شركتك',         to: '/profile',              cls: 'text-navy/60'   },
              ].map(({ icon: Icon, label, desc, to, cls }) => (
                <Link key={to + label} to={to}
                  className="cream-card p-5 flex items-center gap-4 hover:shadow-md transition-shadow group gpu-transition">
                  <div className="w-10 h-10 rounded-xl bg-navy/5 flex items-center justify-center shrink-0 group-hover:bg-brand/10 transition-colors">
                    <Icon size={18} className={cls} />
                  </div>
                  <div>
                    <p className="font-bold text-navy text-sm">{label}</p>
                    <p className="text-navy/40 text-xs mt-0.5">{desc}</p>
                  </div>
                  <ChevronLeft size={14} className="text-navy/20 mr-auto group-hover:text-brand transition-colors" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right column: sidebar widgets */}
        <div className="space-y-6 shrink-0 w-full lg:w-[300px]">
          {/* Exchange rate widget */}
          <div className="cream-card p-5 border-t-4 border-brand gpu-transition">
            <h3 className="text-navy font-black text-sm mb-3 flex items-center gap-1.5">
              <TrendingUp size={15} className="text-brand" /> محاكي سعر الصرف
            </h3>
            <p className="text-xs text-navy/55 leading-relaxed mb-4">
              يمكنك تحديث سعر الصرف الافتراضي لليرة السورية لتعديل وحساب براءات الذمة والضرائب وحسابات التكاليف تلقائياً في كافة صفحات المنصة.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-navy shrink-0">1$ =</span>
                <input 
                  type="number" 
                  value={customRate}
                  onChange={e => setCustomRate(e.target.value)}
                  className="w-full bg-white border border-navy/12 rounded-lg px-2.5 py-1.5 text-sm font-bold text-navy outline-none focus:border-brand"
                />
                <span className="text-xs font-bold text-navy/45 shrink-0">ل.س</span>
              </div>
              <button 
                onClick={handleUpdateExchangeRate}
                className="w-full bg-brand hover:bg-brand/90 text-white font-bold py-2 rounded-xl text-xs shadow-md shadow-brand/10 transition-all"
              >
                تحديث سعر الصرف
              </button>
              <p className="text-[10px] text-navy/40 text-center mt-1">
                سعر الصرف الحالي النشط: {sypExchangeRate.toLocaleString()} ل.س
              </p>
            </div>
          </div>

          {/* Statistics summary */}
          <div className="cream-card p-5 gpu-transition">
            <h3 className="text-navy font-black text-sm mb-3">ملخص الأداء</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-navy/50">طلبات عروض حية:</span>
                <span className="font-bold text-navy">{finishingRFQs.length} طلب</span>
              </div>
              <div className="flex justify-between">
                <span className="text-navy/50">عروض أسعار أرسلتها:</span>
                <span className="font-bold text-navy">{myBidsCount} عرض</span>
              </div>
              <div className="flex justify-between">
                <span className="text-navy/50">مشاريعك النشطة:</span>
                <span className="font-bold text-brand">{myProjects.length} مشروع</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── Bidding Modal ── */}
      <AnimatePresence>
        {selectedRFQ && (
          <div className="fixed inset-0 bg-navy/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" dir="rtl">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="cream-card w-full max-w-lg overflow-hidden shadow-2xl relative gpu-transition"
            >
              <button 
                onClick={() => setSelectedRFQ(null)}
                className="absolute top-4 left-4 w-7 h-7 bg-navy/5 rounded-full flex items-center justify-center hover:bg-navy/10 transition-colors"
              >
                <X size={14} className="text-navy/70" />
              </button>
              
              <div className="p-6 border-b border-navy/6 bg-navy/3">
                <h3 className="text-navy font-black text-base">تفاصيل طلب عرض السعر</h3>
                <p className="text-xs text-navy/40 mt-0.5">طلب من العميل: {selectedRFQ.client}</p>
              </div>

              <form onSubmit={handleSubmitBid} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3 text-xs bg-navy/3 p-3.5 rounded-xl border border-navy/6">
                  <div>
                    <span className="text-navy/40">الموقع:</span>
                    <p className="font-bold text-navy mt-0.5">{selectedRFQ.city} {selectedRFQ.district && `(${selectedRFQ.district})`}</p>
                  </div>
                  <div>
                    <span className="text-navy/40">المساحة:</span>
                    <p className="font-bold text-navy mt-0.5">{selectedRFQ.area} م²</p>
                  </div>
                  <div>
                    <span className="text-navy/40">الميزانية المطلوبة:</span>
                    <p className="font-bold text-navy mt-0.5">{selectedRFQ.budget}</p>
                  </div>
                  <div>
                    <span className="text-navy/40">حالة العقار:</span>
                    <p className="font-bold text-navy mt-0.5">
                      {selectedRFQ.state === 'shell' ? 'عظم' : selectedRFQ.state === 'restore' ? 'يحتاج ترميم' : selectedRFQ.state === 'ready' ? 'جاهز للإكساء' : 'نيئ'}
                    </p>
                  </div>
                </div>

                {selectedRFQ.description && (
                  <div>
                    <span className="text-xs font-bold text-navy">ملاحظات إضافية من العميل:</span>
                    <p className="text-xs bg-white border border-navy/8 p-3 rounded-lg text-navy/70 mt-1 leading-relaxed">
                      {selectedRFQ.description}
                    </p>
                  </div>
                )}

                <div className="border-t border-navy/6 pt-4 space-y-3">
                  <h4 className="text-xs font-black text-navy uppercase tracking-wider">تقديم عرض سعر للمطابقة</h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-navy/55 block mb-1">السعر المقترح بالدولار ($) *</label>
                      <input 
                        type="number" 
                        required
                        value={bidPrice}
                        onChange={e => setBidPrice(e.target.value)}
                        className="w-full bg-white border border-navy/12 rounded-lg px-2.5 py-1.5 text-sm font-bold outline-none focus:border-brand"
                      />
                      <p className="text-[9px] text-navy/35 mt-0.5">يعادل ≈ {Number(bidPrice * sypExchangeRate).toLocaleString()} ل.س</p>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-navy/55 block mb-1">مدة التنفيذ بالأسابيع *</label>
                      <input 
                        type="number" 
                        required
                        value={bidDuration}
                        onChange={e => setBidDuration(e.target.value)}
                        className="w-full bg-white border border-navy/12 rounded-lg px-2.5 py-1.5 text-sm font-bold outline-none focus:border-brand"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-navy/55 block mb-1">ملاحظات وتفاصيل العرض</label>
                    <textarea 
                      rows="3"
                      value={bidNotes}
                      onChange={e => setBidNotes(e.target.value)}
                      className="w-full bg-white border border-navy/12 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-brand resize-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button 
                    type="submit"
                    className="flex-1 bg-brand hover:bg-brand/90 text-white font-bold py-2.5 rounded-xl text-sm transition-all"
                  >
                    إرسال العرض المالي والفني
                  </button>
                  <button 
                    type="button"
                    onClick={() => setSelectedRFQ(null)}
                    className="flex-1 bg-navy/5 hover:bg-navy/10 text-navy font-bold py-2.5 rounded-xl text-sm transition-all"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
