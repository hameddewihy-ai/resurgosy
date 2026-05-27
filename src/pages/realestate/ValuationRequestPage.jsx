import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '../../components/SEO';
import {
  FileSearch, CheckCircle, MapPin, Calculator, ShieldCheck,
  TrendingUp, Building2, Wallet, Scale, Award, Clock,
  ChevronRight, Upload, User, Phone, Mail, MessageCircle,
  Home, Factory, Hotel, Leaf, Star, Shield,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { sendAdminAlert } from '../../utils/emailService';
import SEO from '../../components/SEO';
import EscrowCheckoutModal from '../../components/wallet/EscrowCheckoutModal';
import SyriaLocationSelector from '../../components/ui/SyriaLocationSelector';
import { supabase, isConfigured } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

// ── Data ──────────────────────────────────────────────────────────────────────
const TIERS = [
  {
    id: 'desktop',
    title: 'تقييم مكتبي',
    subtitle: 'Desktop · 24-48h',
    price: 75,
    delivery: '24–48 ساعة',
    icon: FileSearch,
    color: 'brand',
    desc: 'تحليل بيانات السوق وصفقات المقارنة. تقرير PDF موقّع من مقيّم MRICS.',
    features: ['تقرير PDF موقّع', '5+ صفقات مقارنة', 'نطاق سعري دقيق', 'مناسب للتفاوض'],
    recommended: false,
  },
  {
    id: 'field',
    title: 'تقييم ميداني معتمد',
    subtitle: 'IVS 2025 · 3–5 أيام',
    price: 250,
    delivery: '3–5 أيام عمل',
    icon: MapPin,
    color: 'violet',
    desc: 'زيارة ميدانية + فحص شامل + تقرير IVS 2025. يمنح شارة "عقار موثوق" تلقائياً.',
    features: ['زيارة ميدانية', 'تقرير IVS 2025 كامل', 'شارة "عقار موثوق"', 'مقبول للبنوك والتمويل'],
    recommended: true,
  },
  {
    id: 'legal',
    title: 'تقييم قانوني / محكمة',
    subtitle: 'Legal · 5–7 أيام',
    price: 450,
    delivery: '5–7 أيام عمل',
    icon: Scale,
    color: 'amber',
    desc: 'تقرير مختوم رسمياً لأغراض المحاكم والإرث والرهن العقاري الدولي.',
    features: ['ختم رسمي', 'مقبول في المحاكم', 'حلف يمين المقيّم', 'نسخة إنجليزية اختياري +$100'],
    recommended: false,
  },
  {
    id: 'portfolio',
    title: 'تقييم محفظة عقارية',
    subtitle: '3+ عقارات · خصم مجمّع',
    price: 600,
    delivery: '7–10 أيام عمل',
    icon: Award,
    color: 'emerald',
    desc: 'تقييم 3 عقارات أو أكثر بخصم يصل إلى 30% — مثالي للمستثمرين وشركات العقار.',
    features: ['3 عقارات فأكثر', 'خصم تلقائي 25-30%', 'تقرير موحّد للمحفظة', 'مناسب للصناديق الاستثمارية'],
    recommended: false,
  },
];

const PROPERTY_TYPES = [
  { value: 'apartment',    label: 'شقة سكنية',          icon: Home },
  { value: 'villa',        label: 'فيلا / منزل مستقل',  icon: Home },
  { value: 'commercial',   label: 'محل / متجر تجاري',   icon: Building2 },
  { value: 'office',       label: 'مكتب / إداري',        icon: Building2 },
  { value: 'land',         label: 'أرض — بناء / زراعي', icon: Leaf },
  { value: 'industrial',   label: 'صناعي / مستودع',      icon: Factory },
  { value: 'hotel',        label: 'فندقي / ضيافة',       icon: Hotel },
  { value: 'mixed',        label: 'مختلط (سكني+تجاري)', icon: Building2 },
];


const FLOORS = [
  { value: 'ground', label: 'أرضي' },
  { value: 'low',    label: 'منخفض (2–4)' },
  { value: 'mid',    label: 'متوسط (5–9)' },
  { value: 'high',   label: 'مرتفع (10+)' },
  { value: 'top',    label: 'بنتهاوس / أعلى' },
  { value: 'na',     label: 'لا ينطبق (أرض)' },
];

const PURPOSES = [
  { value: 'sale',      label: 'البيع في السوق' },
  { value: 'invest',    label: 'استقطاب مستثمرين' },
  { value: 'crowdfund', label: 'طرح للتمويل الجماعي' },
  { value: 'mortgage',  label: 'رهن عقاري / قرض' },
  { value: 'legal',     label: 'إرث / قضائي / توثيق' },
  { value: 'insurance', label: 'تأمين عقاري' },
  { value: 'internal',  label: 'معرفة شخصية فقط' },
];

const EXPERT = {
  name: 'م. سامر الأسد',
  credential: 'MRICS · IVS 2025',
  projects: 148,
  rating: 4.9,
  avail: true,
};

const MARKET_COMPS = [
  { area: 'المزة فيلات', type: 'شقة 180م²', price: '$345,000', date: 'مارس 2026', badge: 'مُحقَّق' },
  { area: 'كفرسوسة',     type: 'شقة 160م²', price: '$290,000', date: 'فبراير 2026', badge: 'مُحقَّق' },
  { area: 'المهاجرين',   type: 'شقة 200م²', price: '$420,000', date: 'يناير 2026', badge: 'قيد التحقق' },
];

// ── Tier Selector ─────────────────────────────────────────────────────────────
function TierSelector({ value, onChange }) {
  const colorMap = {
    brand:   { ring: 'border-brand bg-brand/5',   icon: 'text-brand', price: 'text-brand' },
    violet:  { ring: 'border-violet-500 bg-violet-50', icon: 'text-violet-500', price: 'text-violet-600' },
    amber:   { ring: 'border-amber-400 bg-amber-50', icon: 'text-amber-600', price: 'text-amber-600' },
    emerald: { ring: 'border-emerald-400 bg-emerald-50', icon: 'text-emerald-600', price: 'text-emerald-600' },
  };
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {TIERS.map(t => {
        const c = colorMap[t.color];
        const active = value === t.id;
        return (
          <button key={t.id} type="button" onClick={() => onChange(t.id)}
            className={`relative text-right p-4 rounded-xl border-2 transition-all duration-200 active:scale-[0.98] flex flex-col ${active ? c.ring + ' shadow-md' : 'border-navy/10 bg-white hover:border-navy/30 hover:-translate-y-0.5'}`}>
            {t.recommended && (
              <span className="absolute -top-2.5 right-4 bg-violet-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">ينصح به</span>
            )}
            <t.icon size={16} className={`mb-2 ${active ? c.icon : 'text-charcoal/30'}`} />
            <p className="text-navy font-bold text-xs leading-tight">{t.title}</p>
            <p className="text-charcoal/40 text-[9px] mb-2">{t.subtitle}</p>
            <p className={`font-black text-lg mt-auto ${active ? c.price : 'text-charcoal/60'}`}>${t.price}</p>
          </button>
        );
      })}
    </div>
  );
}

// ── Property Type Selector ────────────────────────────────────────────────────
function PropertyTypeSelector({ value, onChange }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {PROPERTY_TYPES.map(t => (
        <button key={t.value} type="button" onClick={() => onChange(t.value)}
          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs text-right transition-all ${value === t.value ? 'border-brand bg-brand/5 text-navy font-bold' : 'border-navy/10 bg-white text-charcoal/60 hover:border-brand/30'}`}>
          <t.icon size={13} className={value === t.value ? 'text-brand' : 'text-charcoal/30'} />
          <span className="leading-tight">{t.label}</span>
        </button>
      ))}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ValuationRequestPage() {
  const { user } = useAuth();
  const [step, setStep]       = useState(1);
  const [tier, setTier]       = useState('field');
  const [submitted, setSubmitted] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [showComps, setShowComps] = useState(false);
  const [files, setFiles]     = useState([]);

  const [form, setForm] = useState({
    propType: 'apartment',
    area: '',
    governorate: 'دمشق',
    city: '',
    neighborhood: '',
    address: '',
    floor: 'mid',
    age: '',
    purpose: 'sale',
    notes: '',
    name: '',
    phone: '',
    email: '',
    company: '',
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const activeTier = TIERS.find(t => t.id === tier);

  const canNext1 = form.propType && form.area && form.governorate && form.address;
  const canNext2 = form.purpose;
  const canSubmit = form.name && form.phone;

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files).slice(0, 5);
    setFiles(selected);
    if (selected.length > 0) toast.success(`تم اختيار ${selected.length} ملف`);
  };

  const handleOpenCheckout = (e) => {
    e.preventDefault();
    if (!canSubmit) { toast.error('يرجى إدخال اسمك ورقم هاتفك'); return; }
    setIsCheckoutOpen(true);
  };

  const handlePaymentConfirm = () => {
    toast.success('تم استلام طلبك وحجز المبلغ بنجاح!', { duration: 4000 });
    setIsCheckoutOpen(false);
    setSubmitted(true);

    // Save to Supabase
    if (isConfigured) {
      supabase.from('valuation_requests').insert({
        user_id:       user?.id || null,
        client_name:   form.name,
        client_phone:  form.phone,
        client_email:  form.email || null,
        property_type: form.propType,
        tier,
        province:      form.governorate,
        city:          form.city || null,
        district:      form.neighborhood || null,
        area:          form.area ? parseFloat(form.area) : null,
        floor:         form.floor || null,
        address:       form.address || null,
        purpose:       form.purpose || null,
        notes:         form.notes || null,
        status:        'pending',
      }).catch(() => {});
    }

    sendAdminAlert('hameddewihy@gmail.com', 'طلب تقييم عقاري جديد', {
      CustomerName: form.name,
      CustomerPhone: form.phone,
      Tier: activeTier.title,
      Location: form.governorate + ' - ' + form.city,
    }).catch(() => {});
  };

  // ── Success Page ──
  if (submitted) return (
    <div className="min-h-screen bg-cream pt-[62px] flex items-center justify-center px-4 py-16" dir="rtl">
      <div className="max-w-lg w-full">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={40} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-black text-navy mb-2">تم استلام طلب التقييم!</h2>
          <p className="text-charcoal/60 text-sm leading-relaxed">
            سيتواصل معك المقيّم <strong className="text-navy">{EXPERT.name}</strong> خلال <strong className="text-navy">{activeTier.delivery}</strong>.<br />
            المبلغ محجوز بنظام Escrow ولن يُحرَّر إلا بعد تسليم التقرير.
          </p>
        </motion.div>

        {/* Request summary */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white p-5 mb-6 shadow-[0_2px_8px_rgba(31,42,56,0.06)]"
          style={{ borderRadius: '8px' }}>
          <p className="text-navy font-bold text-xs mb-3">ملخص الطلب</p>
          <div className="space-y-2 text-xs text-charcoal/60">
            {[
              ['الباقة', activeTier.title + ' — $' + activeTier.price],
              ['العقار', PROPERTY_TYPES.find(t => t.value === form.propType)?.label],
              ['الموقع', [form.governorate, form.city, form.neighborhood].filter(Boolean).join(' — ')],
              ['المساحة', form.area + ' م²'],
              ['الغرض', PURPOSES.find(p => p.value === form.purpose)?.label],
              ['التسليم', activeTier.delivery],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="text-charcoal/40">{k}</span>
                <span className="text-navy font-bold">{v}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
          className="space-y-3">
          <p className="text-xs text-charcoal/40 font-bold uppercase tracking-widest text-center">ماذا تريد أن تفعل بعد ذلك؟</p>
          {[
            { to: '/invest',            icon: TrendingUp, color: 'brand',  title: 'استكشف فرص الاستثمار',    desc: 'العقار المُقيَّم = فرصة استثمارية موثوقة' },
            { to: '/crowdfund',         icon: Building2,  color: 'cta',   title: 'اطرح عقارك للتمويل الجماعي', desc: 'تقرير التقييم يرفع ثقة المستثمرين' },
            { to: '/clearing',          icon: Scale,      color: 'purple', title: 'أنجز تخليص قانوني',         desc: 'وكالة أو وثيقة ملكية — نحن هنا' },
            { to: '/wallet',            icon: Wallet,     color: 'navy',   title: 'اذهب للمحفظة',              desc: 'تابع حالة الدفع والمعاملات المالية' },
          ].map(({ to, icon: Icon, color, title, desc }) => (
            <Link key={to} to={to}
              className={`flex items-center gap-4 p-4 bg-white border border-navy/10 rounded-2xl hover:border-${color}/30 hover:shadow-sm transition-all group`}>
              <div className={`w-11 h-11 rounded-xl bg-${color}/10 flex items-center justify-center shrink-0`}>
                <Icon size={20} className={`text-${color}`} />
              </div>
              <div className="flex-1">
                <p className="text-navy font-bold text-sm">{title}</p>
                <p className="text-charcoal/50 text-xs mt-0.5">{desc}</p>
              </div>
              <ChevronRight size={15} className="text-charcoal/30 group-hover:text-navy transition-colors shrink-0" />
            </Link>
          ))}
        </motion.div>
      </div>
    </div>
  );

  // ── Form Page ──
  return (
    <div className="min-h-screen bg-engineering-grid pt-[62px]" dir="rtl">
      <SEO title="طلب تقييم عقاري معتمد | RESURGO" description="اطلب تقييماً عقارياً من خبراء MRICS معتمدين وفق IVS 2025." />

      {/* Hero */}
      <div className="bg-navy py-10 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand rounded-full mix-blend-screen filter blur-[80px]" />
        </div>
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Link to="/valuation" className="text-white/40 text-xs hover:text-white/70 transition-colors">التقييم العقاري</Link>
            <ChevronRight size={12} className="text-white/30 rotate-180" />
            <span className="text-white/70 text-xs">طلب تقييم</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white mb-2">طلب تقييم عقاري معتمد</h1>
          <p className="text-white/55 text-sm">أكمل النموذج وسيتواصل معك المقيّم خلال ساعات — المبلغ محمي بنظام Escrow</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-[1fr_300px] gap-6 items-start">

          {/* ── Main Form Column ── */}
          <div className="space-y-6">

            {/* Step indicator */}
            <div className="bg-white overflow-hidden shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
              <div className="flex border-b border-navy/10">
                {[['01','اختر الباقة'],['02','بيانات العقار'],['03','الغرض والملفات'],['04','بياناتك']].map(([n, label], idx) => {
                  const num = idx + 1; const done = step > num; const active = step === num;
                  return (
                    <div key={n} className={`flex-1 py-2.5 px-2 text-[10px] font-bold text-center border-l border-navy/5 last:border-0 transition-all ${active ? 'bg-brand/5 text-brand' : done ? 'bg-green-50 text-green-700' : 'text-charcoal/30'}`}>
                      <span className={`block font-display text-xs mb-0.5 ${active ? 'text-brand' : done ? 'text-green-500' : 'text-charcoal/20'}`}>{done ? '✓' : n}</span>
                      <span className="hidden sm:block">{label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <form id="val-form" onSubmit={handleOpenCheckout}>
              <AnimatePresence mode="wait">

                {/* Step 1 — Tier */}
                {step === 1 && (
                  <motion.div key="s1" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} className="space-y-4">
                    <div className="bg-white p-5 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
                      <h2 className="text-navy font-black text-sm mb-4 flex items-center gap-2">
                        <Award size={15} className="text-brand" /> اختر باقة التقييم
                      </h2>
                      <TierSelector value={tier} onChange={setTier} />
                    </div>
                    {/* Active tier details */}
                    <div className="bg-[#f7f1eb] p-4 shadow-[0_2px_8px_rgba(31,42,56,0.04)] rounded-lg">
                      <p className="text-navy font-bold text-xs mb-2">ما يشمله {activeTier.title}:</p>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {activeTier.features.map(f => (
                          <div key={f} className="flex items-center gap-2 text-xs text-charcoal/70">
                            <CheckCircle size={11} className="text-green-500 shrink-0" /> {f}
                          </div>
                        ))}
                      </div>
                    </div>
                    <button type="button" onClick={() => setStep(2)}
                      className="w-full btn-cta flex items-center justify-center gap-2">
                      التالي — بيانات العقار <ChevronRight size={15} />
                    </button>
                  </motion.div>
                )}

                {/* Step 2 — Property */}
                {step === 2 && (
                  <motion.div key="s2" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} className="space-y-5">
                    <div className="bg-white p-5 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
                      <h2 className="text-navy font-black text-sm mb-4 flex items-center gap-2">
                        <MapPin size={15} className="text-brand" /> بيانات العقار
                      </h2>
                      <div className="space-y-4">
                        <div>
                          <label className="text-charcoal/60 text-xs mb-2 block font-medium">نوع العقار *</label>
                          <PropertyTypeSelector value={form.propType} onChange={v => set('propType', v)} />
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-charcoal/60 text-xs mb-1 block">المساحة (م²) *</label>
                            <div className="relative">
                              <input value={form.area} onChange={e => set('area', e.target.value)}
                                type="number" min="10" placeholder="مثال: 180"
                                className="input-field text-sm w-full pl-10" required />
                              <Calculator size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
                            </div>
                          </div>
                          <div>
                            <label className="text-charcoal/60 text-xs mb-1 block">عمر البناء (سنة)</label>
                            <input value={form.age} onChange={e => set('age', e.target.value)}
                              type="number" min="0" placeholder="مثال: 15"
                              className="input-field text-sm w-full" />
                          </div>
                          <div className="sm:col-span-2">
                            <SyriaLocationSelector
                              required
                              value={{ governorate: form.governorate, city: form.city, neighborhood: form.neighborhood }}
                              onChange={loc => setForm(p => ({ ...p, governorate: loc.governorate, city: loc.city, neighborhood: loc.neighborhood }))}
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="text-charcoal/60 text-xs mb-1 block">العنوان التفصيلي *</label>
                            <input value={form.address} onChange={e => set('address', e.target.value)}
                              placeholder="شارع، رقم المبنى، علامة مميزة..." className="input-field text-sm w-full" required />
                          </div>
                          <div>
                            <label className="text-charcoal/60 text-xs mb-1 block">موقع الطابق</label>
                            <select value={form.floor} onChange={e => set('floor', e.target.value)} className="input-field text-sm w-full">
                              {FLOORS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="text-charcoal/60 text-xs mb-1 block">ملاحظات للمقيّم (اختياري)</label>
                          <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
                            rows={2} placeholder="الإكساء، الحالة القانونية، الديون، أي تفاصيل مهمة..."
                            className="input-field text-sm w-full resize-none" />
                        </div>
                      </div>
                    </div>

                    {/* Market Comps toggle */}
                    {form.governorate === 'دمشق' && (
                      <div className="bg-white p-4 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
                        <button type="button" onClick={() => setShowComps(o => !o)}
                          className="flex items-center justify-between w-full text-xs font-bold text-navy">
                          <span className="flex items-center gap-2"><TrendingUp size={13} className="text-brand" /> صفقات مقارنة في دمشق — Q1 2026</span>
                          <ChevronRight size={13} className={`transition-transform ${showComps ? 'rotate-90' : ''}`} />
                        </button>
                        <AnimatePresence>
                          {showComps && (
                            <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }} className="overflow-hidden">
                              <div className="pt-3 space-y-2">
                                {MARKET_COMPS.map(c => (
                                  <div key={c.area} className="flex items-center justify-between text-xs border-b border-navy/5 pb-2">
                                    <div>
                                      <p className="text-navy font-bold">{c.area}</p>
                                      <p className="text-charcoal/50">{c.type} · {c.date}</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-brand font-black">{c.price}</p>
                                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${c.badge === 'مُحقَّق' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>{c.badge}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button type="button" onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl border border-navy/15 text-charcoal/60 text-sm hover:border-brand/30 hover:text-navy transition-all">رجوع</button>
                      <button type="button" disabled={!canNext1} onClick={() => setStep(3)}
                        className="flex-1 btn-cta flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                        التالي <ChevronRight size={15} />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Step 3 — Purpose + Files */}
                {step === 3 && (
                  <motion.div key="s3" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} className="space-y-5">
                    <div className="bg-white p-5 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
                      <h2 className="text-navy font-black text-sm mb-4">الغرض من التقييم</h2>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {PURPOSES.map(p => (
                          <button key={p.value} type="button" onClick={() => set('purpose', p.value)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs text-right transition-all ${form.purpose === p.value ? 'border-brand bg-brand/5 text-navy font-bold' : 'border-navy/10 bg-white text-charcoal/60 hover:border-brand/30'}`}>
                            <div className={`w-2 h-2 rounded-full shrink-0 ${form.purpose === p.value ? 'bg-brand' : 'bg-charcoal/20'}`} />
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* File upload */}
                    <div className="bg-white p-5 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
                      <h2 className="text-navy font-black text-sm mb-1 flex items-center gap-2">
                        <Upload size={14} className="text-brand" /> رفع ملفات داعمة (اختياري)
                      </h2>
                      <p className="text-charcoal/50 text-xs mb-3">صور العقار، سند الملكية، تقرير هندسي سابق — يساعد المقيّم على الدقة</p>
                      <label className="flex flex-col items-center justify-center border-2 border-dashed border-navy/15 rounded-xl p-6 cursor-pointer hover:border-brand/40 hover:bg-brand/3 transition-all">
                        <Upload size={24} className="text-charcoal/30 mb-2" />
                        <p className="text-charcoal/50 text-xs font-medium">اسحب الملفات هنا أو انقر للاختيار</p>
                        <p className="text-charcoal/30 text-[10px] mt-1">PNG, JPG, PDF — حتى 5 ملفات · 10MB كحد أقصى</p>
                        <input type="file" multiple accept=".png,.jpg,.jpeg,.pdf" onChange={handleFileChange} className="hidden" />
                      </label>
                      {files.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {files.map(f => (
                            <span key={f.name} className="text-[10px] bg-brand/8 border border-brand/20 text-navy px-2 py-1 rounded-lg flex items-center gap-1">
                              <CheckCircle size={10} className="text-green-500" /> {f.name.slice(0, 20)}{f.name.length > 20 ? '…' : ''}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <button type="button" onClick={() => setStep(2)} className="flex-1 py-3 rounded-xl border border-navy/15 text-charcoal/60 text-sm hover:border-brand/30 hover:text-navy transition-all">رجوع</button>
                      <button type="button" disabled={!canNext2} onClick={() => setStep(4)}
                        className="flex-1 btn-cta flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                        التالي <ChevronRight size={15} />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Step 4 — Contact */}
                {step === 4 && (
                  <motion.div key="s4" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} className="space-y-5">
                    <div className="bg-white p-5 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
                      <h2 className="text-navy font-black text-sm mb-4 flex items-center gap-2">
                        <User size={14} className="text-brand" /> بياناتك للتواصل
                      </h2>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-charcoal/60 text-xs mb-1 block">الاسم الكامل *</label>
                          <div className="relative">
                            <User size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
                            <input value={form.name} onChange={e => set('name', e.target.value)}
                              placeholder="اسمك الكامل" className="input-field text-sm w-full pr-8" required />
                          </div>
                        </div>
                        <div>
                          <label className="text-charcoal/60 text-xs mb-1 block">رقم الهاتف *</label>
                          <div className="relative">
                            <Phone size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
                            <input value={form.phone} onChange={e => set('phone', e.target.value)}
                              placeholder="+963 ..." className="input-field text-sm w-full pr-8 font-mono" required />
                          </div>
                        </div>
                        <div>
                          <label className="text-charcoal/60 text-xs mb-1 block">البريد الإلكتروني</label>
                          <div className="relative">
                            <Mail size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
                            <input value={form.email} onChange={e => set('email', e.target.value)}
                              type="email" placeholder="اختياري" className="input-field text-sm w-full pr-8" />
                          </div>
                        </div>
                        <div>
                          <label className="text-charcoal/60 text-xs mb-1 block">الشركة / الجهة</label>
                          <div className="relative">
                            <Building2 size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
                            <input value={form.company} onChange={e => set('company', e.target.value)}
                              placeholder="اختياري" className="input-field text-sm w-full pr-8" />
                          </div>
                        </div>
                      </div>

                      {form.phone && (
                        <a href={`https://wa.me/${form.phone.replace(/\D/g,'')}?text=${encodeURIComponent(`طلب تقييم عقاري: ${activeTier.title} — ${form.governorate}`)}`}
                          target="_blank" rel="noreferrer"
                          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-green-400/50 bg-green-50 text-green-700 text-sm font-medium hover:bg-green-100 transition-colors mt-4">
                          <MessageCircle size={13} /> أو أرسل الطلب مباشرةً عبر واتساب
                        </a>
                      )}
                    </div>

                    {/* Summary */}
                    <div className="bg-[#f7f1eb] p-4 shadow-[0_2px_8px_rgba(31,42,56,0.04)] rounded-lg">
                      <p className="text-navy font-bold text-xs mb-2">ملخص الطلب</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {[
                          ['الباقة', activeTier.title],
                          ['نوع العقار', PROPERTY_TYPES.find(t => t.value === form.propType)?.label],
                          ['المحافظة', form.governorate],
                          ['المساحة', form.area ? form.area + ' م²' : '—'],
                          ['الغرض', PURPOSES.find(p => p.value === form.purpose)?.label],
                          ['التسليم', activeTier.delivery],
                        ].map(([k, v]) => (
                          <div key={k}>
                            <p className="text-charcoal/40">{k}</p>
                            <p className="text-navy font-bold">{v || '—'}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button type="button" onClick={() => setStep(3)} className="flex-1 py-3 rounded-xl border border-navy/15 text-charcoal/60 text-sm hover:border-brand/30 hover:text-navy transition-all">رجوع</button>
                      <button type="submit" form="val-form" disabled={!canSubmit}
                        className="flex-1 btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-brand/20">
                        تأكيد الدفع وحجز المقيّم <ChevronRight size={15} />
                      </button>
                    </div>
                    <p className="text-charcoal/40 text-[10px] text-center flex items-center justify-center gap-1">
                      <Shield size={10} /> بياناتك محمية — الدفع محجوز بنظام Escrow حتى التسليم
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-4 sticky top-[80px]">
            {/* Order summary */}
            <div className="bg-white p-5 border-b-4 border-b-brand shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
              <p className="text-navy font-black text-sm mb-4">ملخص الطلب</p>
              <div className="space-y-2.5 mb-5 border-b border-navy/8 pb-5">
                {[
                  ['الباقة', activeTier.title],
                  ['التسليم', activeTier.delivery],
                  ['الرسوم', '$' + activeTier.price],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between items-center text-xs">
                    <span className="text-charcoal/50">{k}</span>
                    <span className="text-navy font-bold">{v}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-end mb-5">
                <span className="text-navy font-black text-xs">الإجمالي</span>
                <span className="text-3xl font-black text-brand">${activeTier.price}</span>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 flex items-start gap-2">
                <ShieldCheck size={14} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-amber-700 leading-relaxed">المبلغ يُحجز في الضمان (Escrow) ولن يُسلَّم للمقيّم إلا بعد تسليم التقرير واعتمادك له.</p>
              </div>
              <button type="submit" form="val-form"
                className="w-full btn-primary py-3 flex items-center justify-center gap-2 shadow-lg shadow-brand/20 text-sm">
                تأكيد وحجز المقيّم <ChevronRight size={15} />
              </button>
            </div>

            {/* Assigned expert */}
            <div className="bg-white p-4 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
              <p className="text-charcoal/50 text-[10px] font-bold uppercase tracking-wider mb-3">المقيّم المُعيَّن</p>
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-navy flex items-center justify-center text-white font-black shrink-0">
                  {EXPERT.name.split(' ')[1][0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-navy font-bold text-xs">{EXPERT.name}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {EXPERT.credential.split(' · ').map(c => (
                      <span key={c} className="text-[8px] font-bold bg-violet-50 border border-violet-200 text-violet-700 px-1.5 py-0.5">{c}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-navy/8 text-xs text-charcoal/50">
                <span className="flex items-center gap-1"><Award size={11} className="text-brand" /> {EXPERT.projects} تقييم</span>
                <span className="flex items-center gap-1"><Star size={10} className="text-yellow-400 fill-yellow-400" /> {EXPERT.rating}</span>
                <span className="text-green-600 font-bold text-[10px]">● متاح الآن</span>
              </div>
            </div>

            {/* Trust */}
            <div className="bg-white p-4 space-y-2 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
              {[
                [ShieldCheck, 'دفع Escrow مضمون', 'text-green-600'],
                [Award, 'معتمد IVS 2025', 'text-violet-600'],
                [Clock, 'استرداد كامل إذا تأخر التقرير', 'text-brand'],
              ].map(([Icon, text, cls]) => (
                <div key={text} className="flex items-center gap-2 text-xs text-charcoal/60">
                  <Icon size={13} className={cls} /> {text}
                </div>
              ))}
            </div>

            {/* Back to public page */}
            <Link to="/valuation" className="flex items-center gap-2 text-xs text-charcoal/40 hover:text-brand transition-colors">
              <ChevronRight size={12} className="rotate-180" /> عودة لصفحة التقييم
            </Link>
          </div>

        </div>
      </div>

      <EscrowCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        title="تأكيد طلب التقييم العقاري"
        item={{ name: `طلب ${activeTier.title}`, owner: EXPERT.name }}
        totalPrice={activeTier.price}
        isBrokerFeePayer={false}
        onConfirm={handlePaymentConfirm}
      />
    </div>
  );
}
