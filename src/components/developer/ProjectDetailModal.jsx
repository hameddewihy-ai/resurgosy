import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  X, ChevronLeft, ChevronRight, MapPin, Calendar, Building2,
  Home, CheckCircle, TrendingUp, Phone, Briefcase, ExternalLink,
  Send, Layers, Star, BadgeCheck, ArrowUpRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { addNotification } from '../NotificationsPanel';

const BACKDROP = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
const PANEL    = { hidden: { opacity: 0, y: 50, scale: 0.96 }, visible: { opacity: 1, y: 0, scale: 1 } };

const STATUS_STYLE = {
  'قيد الإنشاء': 'bg-blue-50 text-blue-700 border-blue-200',
  'مكتمل':        'bg-green-50 text-green-700 border-green-200',
  'مخطط':         'bg-amber-50 text-amber-700 border-amber-200',
};

export default function ProjectDetailModal({ isOpen, onClose, project, onInvest, allProjects = [] }) {
  const [imgIdx,      setImgIdx]      = useState(0);
  const [activeTab,   setActiveTab]   = useState('plans');
  const [formName,    setFormName]    = useState('');
  const [formPhone,   setFormPhone]   = useState('');
  const [formUnit,    setFormUnit]    = useState('');
  const [formMsg,     setFormMsg]     = useState('');
  const [submitting,  setSubmitting]  = useState(false);

  if (!project) return null;

  const images = project.images?.length ? project.images : [project.image];
  const prevImg = () => setImgIdx(i => (i - 1 + images.length) % images.length);
  const nextImg = () => setImgIdx(i => (i + 1) % images.length);

  const similar = allProjects
    .filter(p => p.id !== project.id && p.developerId === project.developerId)
    .slice(0, 2);

  const handleSubmitLead = (e) => {
    e.preventDefault();
    if (!formName || !formPhone) {
      toast.error('يرجى تعبئة الاسم ورقم الهاتف');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success('تم إرسال طلبك بنجاح — سيتواصل معك المطور قريباً');
      addNotification({
        id: 'proj-lead-' + Date.now(),
        type: 'property',
        read: false,
        title: 'طلب اهتمام مُرسَل',
        body: `تم إرسال اهتمامك بـ "${project.name}" — سيتواصل معكم المطور`,
        date: new Date().toISOString(),
        link: '/developers',
      });
      setFormName(''); setFormPhone(''); setFormUnit(''); setFormMsg('');
    }, 900);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="proj-modal-backdrop"
          variants={BACKDROP}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="fixed inset-0 z-[80] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(15,23,42,0.78)', backdropFilter: 'blur(6px)' }}
          onClick={onClose}
        >
          <motion.div
            key="proj-modal-panel"
            variants={PANEL}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative w-full max-w-3xl max-h-[94vh] overflow-y-auto rounded-3xl bg-white shadow-2xl"
            dir="rtl"
            onClick={e => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-4 left-4 z-10 w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/40 transition-colors shadow-lg"
            >
              <X size={16} />
            </button>

            {/* ── Image Slideshow ── */}
            <div className="relative h-64 sm:h-80 overflow-hidden rounded-t-3xl bg-navy">
              <AnimatePresence mode="wait">
                <motion.img
                  key={imgIdx}
                  src={images[imgIdx]}
                  alt={project.name}
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                />
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-navy/70 via-transparent to-transparent" />

              {/* Nav arrows */}
              {images.length > 1 && (
                <>
                  <button onClick={prevImg} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-colors">
                    <ChevronRight size={18} />
                  </button>
                  <button onClick={nextImg} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-colors">
                    <ChevronLeft size={18} />
                  </button>
                  {/* Counter */}
                  <div className="absolute bottom-14 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full font-bold">
                    {imgIdx + 1} / {images.length}
                  </div>
                </>
              )}

              {/* Thumbnail strip */}
              {images.length > 1 && (
                <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setImgIdx(i)}
                      className={`w-10 h-7 rounded-md overflow-hidden border-2 transition-all ${i === imgIdx ? 'border-brand scale-110' : 'border-white/40 opacity-60 hover:opacity-90'}`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Status badge */}
              <span className={`absolute top-4 right-4 text-[11px] px-3 py-1 rounded-full font-bold border ${STATUS_STYLE[project.status] || 'bg-navy/50 text-white border-white/20'}`}>
                {project.status}
              </span>
            </div>

            {/* ── Content ── */}
            <div className="px-6 py-5">

              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <h2 className="text-navy font-black text-xl leading-snug">{project.name}</h2>
                  <p className="text-charcoal/50 text-sm mt-0.5">{project.developerName}</p>
                </div>
                <div className="text-left shrink-0">
                  <p className="text-charcoal/40 text-xs">يبدأ من</p>
                  <p className="text-navy font-black text-lg">{project.priceFrom?.toLocaleString()} $</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-charcoal/50">نسبة الإنجاز</span>
                  <span className="font-bold text-navy">{project.progress}%</span>
                </div>
                <div className="h-2 bg-navy/8 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${project.progress}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={`h-full rounded-full ${
                      project.status === 'مكتمل' ? 'bg-green-500' :
                      project.status === 'مخطط'  ? 'bg-amber-400' : 'bg-brand'
                    }`}
                  />
                </div>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                {[
                  { icon: MapPin,    label: 'الموقع',     value: `${project.city} · ${project.district}` },
                  { icon: Calendar,  label: 'موعد التسليم', value: project.delivery },
                  { icon: Building2, label: 'النوع',       value: project.type },
                  { icon: Home,      label: 'الوحدات المتاحة', value: `${project.availableUnits} / ${project.totalUnits}` },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="bg-cream rounded-xl p-3">
                    <Icon size={13} className="text-brand mb-1" />
                    <p className="text-charcoal/40 text-[10px] font-bold uppercase tracking-wider">{label}</p>
                    <p className="text-navy font-bold text-xs mt-0.5 leading-snug">{value}</p>
                  </div>
                ))}
              </div>

              {/* Description */}
              {project.description && (
                <p className="text-charcoal/70 text-sm leading-relaxed mb-5">{project.description}</p>
              )}

              {/* Tabs: Floor Plans / Payment Plan */}
              <div className="flex gap-1 mb-4 p-1 bg-cream rounded-xl">
                {[
                  { id: 'plans',   label: 'المخططات والأسعار', icon: Layers },
                  { id: 'payment', label: 'خطة الدفع',         icon: TrendingUp },
                  { id: 'features', label: 'المميزات',           icon: Star },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                      activeTab === id ? 'bg-white text-navy shadow-sm' : 'text-charcoal/50 hover:text-navy'
                    }`}
                  >
                    <Icon size={12} />
                    {label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <AnimatePresence mode="wait">
                {activeTab === 'plans' && (
                  <motion.div key="plans" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-5">
                    {project.floorPlans?.length > 0 ? (
                      <div className="grid sm:grid-cols-2 gap-2">
                        {project.floorPlans.map((plan, i) => (
                          <div key={i} className="flex items-center justify-between p-3 border border-navy/8 rounded-xl hover:border-brand/25 transition-colors">
                            <div>
                              <p className="text-navy font-bold text-sm">{plan.type}</p>
                              <p className="text-charcoal/50 text-xs mt-0.5">{plan.area} م² · {plan.count} وحدة</p>
                            </div>
                            <div className="text-left">
                              <p className="text-charcoal/40 text-[10px]">يبدأ من</p>
                              <p className="text-brand font-black text-sm">{plan.priceFrom?.toLocaleString()} $</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-charcoal/40 text-sm text-center py-4">لا تتوفر مخططات تفصيلية حالياً</p>
                    )}
                  </motion.div>
                )}

                {activeTab === 'payment' && (
                  <motion.div key="payment" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-5">
                    {project.paymentPlan?.length > 0 ? (
                      <div className="flex flex-col gap-3">
                        {project.paymentPlan.map((step, i) => (
                          <div key={i} className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full bg-brand/10 text-brand flex items-center justify-center text-xs font-black shrink-0">
                              {i + 1}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-navy font-semibold text-sm">{step.label}</span>
                                <span className="text-brand font-black text-base">{step.pct}%</span>
                              </div>
                              <div className="h-2 bg-navy/8 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${step.pct}%` }}
                                  transition={{ duration: 0.6, delay: i * 0.15 }}
                                  className="h-full bg-brand/70 rounded-full"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                        <p className="text-charcoal/40 text-xs mt-1">* الأرقام تقريبية وقد تختلف حسب العقد</p>
                      </div>
                    ) : (
                      <p className="text-charcoal/40 text-sm text-center py-4">خطة الدفع غير محددة بعد</p>
                    )}
                  </motion.div>
                )}

                {activeTab === 'features' && (
                  <motion.div key="features" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-5">
                    {project.features?.length > 0 ? (
                      <div className="grid sm:grid-cols-2 gap-2">
                        {project.features.map(f => (
                          <div key={f} className="flex items-center gap-2.5 p-2.5 rounded-xl border border-navy/8">
                            <CheckCircle size={14} className="text-brand shrink-0" />
                            <span className="text-navy text-sm">{f}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-charcoal/40 text-sm text-center py-4">لا توجد تفاصيل إضافية</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Lead / Interest Form ── */}
              <div className="bg-cream rounded-2xl p-5 mb-5">
                <h3 className="text-navy font-bold text-sm mb-3 flex items-center gap-2">
                  <Send size={14} className="text-brand" />
                  أبدِ اهتمامك — احجز استشارة مجانية
                </h3>
                <form onSubmit={handleSubmitLead} className="grid sm:grid-cols-2 gap-3">
                  <input
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    placeholder="الاسم الكامل *"
                    className="bg-white border border-navy/12 rounded-xl px-4 py-2.5 text-sm text-navy placeholder-charcoal/30 focus:outline-none focus:border-brand transition-colors"
                  />
                  <input
                    value={formPhone}
                    onChange={e => setFormPhone(e.target.value)}
                    placeholder="رقم الهاتف *"
                    className="bg-white border border-navy/12 rounded-xl px-4 py-2.5 text-sm text-navy placeholder-charcoal/30 focus:outline-none focus:border-brand transition-colors"
                  />
                  {project.floorPlans?.length > 0 && (
                    <select
                      value={formUnit}
                      onChange={e => setFormUnit(e.target.value)}
                      className="bg-white border border-navy/12 rounded-xl px-4 py-2.5 text-sm text-navy focus:outline-none focus:border-brand transition-colors sm:col-span-2"
                    >
                      <option value="">نوع الوحدة المطلوبة (اختياري)</option>
                      {project.floorPlans.map(p => (
                        <option key={p.type} value={p.type}>{p.type} — {p.area} م² — {p.priceFrom?.toLocaleString()} $+</option>
                      ))}
                    </select>
                  )}
                  <textarea
                    value={formMsg}
                    onChange={e => setFormMsg(e.target.value)}
                    placeholder="رسالتك (اختياري)"
                    rows={2}
                    className="bg-white border border-navy/12 rounded-xl px-4 py-2.5 text-sm text-navy placeholder-charcoal/30 focus:outline-none focus:border-brand transition-colors sm:col-span-2 resize-none"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="sm:col-span-2 bg-brand hover:bg-navy text-white font-bold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {submitting ? (
                      <span className="animate-pulse">جارٍ الإرسال...</span>
                    ) : (
                      <><Send size={14} /> إرسال الطلب</>
                    )}
                  </button>
                </form>
              </div>

              {/* ── Cross-links ── */}
              <div className="flex flex-wrap gap-2 mb-5">
                {project.investProjectId ? (
                  <Link
                    to="/invest"
                    className="flex items-center gap-2 bg-brand text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-navy transition-colors"
                  >
                    <TrendingUp size={14} />
                    استثمر في هذا المشروع
                    <ArrowUpRight size={13} />
                  </Link>
                ) : (
                  <button
                    onClick={() => toast('تواصل مع المطور للاستفسار عن فرص الاستثمار', { icon: '💡' })}
                    className="flex items-center gap-2 border border-brand/25 text-brand text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-brand/5 transition-colors"
                  >
                    <TrendingUp size={14} />
                    استثمر في هذا المشروع
                  </button>
                )}
                <Link
                  to="/jobs"
                  className="flex items-center gap-2 border border-navy/15 text-navy text-sm font-semibold px-4 py-2.5 rounded-xl hover:border-brand/30 hover:text-brand transition-colors"
                >
                  <Briefcase size={14} />
                  وظائف المشروع
                </Link>
                <a
                  href={`https://wa.me/963000000000?text=أودّ الاستفسار عن مشروع ${project.name}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors"
                >
                  <Phone size={14} />
                  تواصل عبر WhatsApp
                </a>
              </div>

              {/* ── Similar projects ── */}
              {similar.length > 0 && (
                <div>
                  <h3 className="text-navy font-bold text-sm mb-3 flex items-center gap-2">
                    <BadgeCheck size={14} className="text-brand" />
                    مشاريع مشابهة لنفس المطور
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {similar.map(sp => (
                      <button
                        key={sp.id}
                        onClick={() => {
                          onClose();
                          setTimeout(() => {
                            if (onInvest) onInvest(sp);
                          }, 150);
                        }}
                        className="flex items-center gap-3 p-3 border border-navy/8 rounded-xl hover:border-brand/25 text-right transition-all group w-full"
                      >
                        <div className="w-14 h-12 rounded-xl overflow-hidden shrink-0">
                          <img src={sp.image} alt={sp.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-navy font-bold text-xs truncate">{sp.name}</p>
                          <p className="text-charcoal/50 text-[11px]">{sp.city} · {sp.priceFrom?.toLocaleString()} $+</p>
                        </div>
                        <ExternalLink size={12} className="text-charcoal/30 group-hover:text-brand shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
