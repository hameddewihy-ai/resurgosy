import { useState, useMemo, useRef, useEffect } from 'react';
import SponsorCard from '../../components/ui/SponsorCard';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useInView, animate } from 'framer-motion';
import {
  Sun, Home, Wrench, Layers, Sofa, TreePine, Shield,
  CheckCircle, Camera, Clock, Star, ChevronLeft, ChevronRight,
  Building2, Users, HardHat, PaintBucket, Droplets,
  FileText, Globe, ArrowLeft, Hammer, X,
  ChevronDown, Plus, Minus, Calculator, BadgeCheck, Zap,
  DoorOpen, Cpu, Armchair, Package, Mountain,
} from 'lucide-react';
import PageHero from '../../components/PageHero';
import SEO from '../../components/SEO';
import { useGlobalData } from '../../context/GlobalContext';

// ── Gallery data ───────────────────────────────────────────────────────────────
const GALLERY_PROJECTS = [
  {
    id: 1,
    city: 'دمشق — المزة',
    type: 'إكساء شامل تسليم مفتاح',
    area: 185, duration: '4 أشهر', cost: '$26,000', tier: 'فاخر',
    company: 'شركة دوزان للإكساء والديكور',
    before: { emoji: '🏗️', state: 'هيكل خرساني فارغ — بدون أي تشطيب أو تمديدات', bg: 'from-slate-100 to-slate-200' },
    after:  { emoji: '🏡', state: 'إكساء فاخر — رخام طبيعي، خشب أصيل، ديكور عجمي دمشقي', bg: 'from-amber-50 to-orange-50' },
  },
  {
    id: 2,
    city: 'حلب — الحمدانية',
    type: 'طاقة شمسية + تخزين',
    area: 220, duration: '3 أسابيع', cost: '$8,500', tier: 'متوسط',
    company: 'Solar Energy Syria',
    before: { emoji: '🕯️', state: 'انقطاع كهربائي يومي +16 ساعة — اعتماد كامل على مولد', bg: 'from-gray-100 to-gray-200' },
    after:  { emoji: '☀️', state: '8 كيلوواط شمسي + 30 كيلوواط/ساعة بطاريات — طاقة مستمرة', bg: 'from-yellow-50 to-amber-100' },
  },
  {
    id: 3,
    city: 'حمص — الوعر',
    type: 'ترميم وإعادة تأهيل',
    area: 160, duration: '5 أشهر', cost: '$19,000', tier: 'متوسط',
    company: 'شركة الفارس للإنشاء والترميم',
    before: { emoji: '🏚️', state: 'أضرار إنشائية — شقوق حاملة وانهيار جزئي في أعمدة', bg: 'from-red-50 to-orange-100' },
    after:  { emoji: '🏠', state: 'منزل مرمّم بالكامل — تدعيم إنشائي وإكساء جديد كامل', bg: 'from-green-50 to-emerald-100' },
  },
  {
    id: 4,
    city: 'دمشق — المالكي',
    type: 'ديكور داخلي فاخر',
    area: 95, duration: '10 أسابيع', cost: '$14,000', tier: 'فاخر',
    company: 'مؤسسة الشام للديكور الدمشقي',
    before: { emoji: '🏛️', state: 'بياض عادي أملس — بدون أي ديكور أو معالجات جدارية', bg: 'from-slate-100 to-gray-200' },
    after:  { emoji: '✨', state: 'ديكور عجمي أصيل — نقوش خشبية، زجاج معشق، إضاءة غير مباشرة', bg: 'from-amber-50 to-yellow-50' },
  },
];

// ── Expandable services ────────────────────────────────────────────────────────
const SERVICES_EXPANDED = [
  {
    id: 'floors', icon: Layers, label: 'أرضيات وجدران وأسقف', count: 8,
    color: 'text-brand', accentBg: 'bg-brand/8', borderHover: 'hover:border-brand/40',
    subs: ['تركيب سيراميك وبورسلين', 'تركيب رخام وجرانيت', 'تركيب باركيه وأرضيات خشبية', 'دهانات وأصباغ داخلية وخارجية', 'تركيب ورق جدران', 'أسقف مستعارة (جبس بورد)', 'أسقف فرنسية وديكورية', 'تكسيات جدارية (بديل خشب / بديل رخام)'],
  },
  {
    id: 'doors', icon: DoorOpen, label: 'النوافذ والأبواب والأعمال المعدنية', count: 7,
    color: 'text-slate-600', accentBg: 'bg-slate-100', borderHover: 'hover:border-slate-400',
    subs: ['توريد وتركيب أبواب خشبية', 'أبواب حديد وبوابات خارجية', 'نوافذ وأبواب ألومنيوم', 'نوافذ وأبواب UPVC', 'تركيب درابزين زجاج وحديد', 'أعمال شتر (ستائر معدنية خارجية)', 'أعمال الحدادة العامة (مظلات وسواتر)'],
  },
  {
    id: 'stone', icon: Mountain, label: 'حجر وجي ار سي (GRC)', count: 4,
    color: 'text-stone-600', accentBg: 'bg-stone-100', borderHover: 'hover:border-stone-400',
    subs: ['توريد وتركيب حجر طبيعي', 'توريد وتركيب حجر صناعي', 'أعمال وتصميم واجهات GRC', 'أعمال الفيبر جلاس (GRP)'],
  },
  {
    id: 'decor', icon: PaintBucket, label: 'ديكور وهندسة', count: 6,
    color: 'text-purple-600', accentBg: 'bg-purple-50', borderHover: 'hover:border-purple-300',
    subs: ['تصميم داخلي (3D)', 'تصميم واجهات خارجية', 'تصميم حدائق (لاند سكيب)', 'استشارات هندسية وتخطيط', 'إشراف هندسي على التنفيذ', 'استخراج رخص ومخططات هندسية'],
  },
  {
    id: 'insul', icon: Droplets, label: 'عزل وأنظمة تسخين وتكييف', count: 7,
    color: 'text-blue-500', accentBg: 'bg-blue-50', borderHover: 'hover:border-blue-300',
    subs: ['عزل مائي وحراري للأسطح', 'عزل حمامات ومطابخ', 'تركيب وصيانة تكييف مركزي', 'تركيب وصيانة تكييف سبليت', 'تأسيس تكييف مخفي (Concealed)', 'أنظمة تسخين المياه المركزية', 'تمديدات دكت التكييف (Duct)'],
  },
  {
    id: 'kitch', icon: Sofa, label: 'مطابخ وخزائن', count: 5,
    color: 'text-orange-500', accentBg: 'bg-orange-50', borderHover: 'hover:border-orange-300',
    subs: ['تفصيل مطابخ خشبية', 'تفصيل مطابخ ألومنيوم وخشمونيوم', 'تصميم وتفصيل خزائن حائط (دواليب)', 'تجهيز غرف ملابس (Dressing Rooms)', 'صيانة وتجديد المطابخ القديمة'],
  },
  {
    id: 'secure', icon: Shield, label: 'أنظمة مراقبة وأمان', count: 5,
    color: 'text-green-600', accentBg: 'bg-green-50', borderHover: 'hover:border-green-300',
    subs: ['تركيب كاميرات مراقبة (CCTV)', 'أنظمة إنذار الحريق والسرقة', 'تركيب أقفال أبواب ذكية', 'أنظمة انتركم (صوتي ومرئي)', 'أنظمة التحكم بالدخول (Access Control)'],
  },
  {
    id: 'land', icon: TreePine, label: 'لاند سكيب (Landscaping)', count: 7,
    color: 'text-emerald-600', accentBg: 'bg-emerald-50', borderHover: 'hover:border-emerald-300',
    subs: ['تنسيق وزراعة الحدائق', 'توريد وتركيب عشب صناعي', 'شبكات ري أوتوماتيكية', 'حفر وبناء حمامات سباحة', 'صيانة حمامات سباحة', 'تنفيذ شلالات ونوافير', 'تجهيز جلسات خارجية وبرجولات'],
  },
  {
    id: 'smart', icon: Cpu, label: 'أنظمة تحكم ذكية (Smart Home)', count: 4,
    color: 'text-indigo-600', accentBg: 'bg-indigo-50', borderHover: 'hover:border-indigo-300',
    subs: ['تأسيس وتركيب أنظمة المنزل الذكي', 'التحكم الذكي بالإضاءة والتكييف', 'تركيب ستائر كهربائية وذكية', 'أنظمة صوتيات وسينما منزلية'],
  },
  {
    id: 'mep', icon: Wrench, label: 'كهرباء وصحية وصيانة', count: 8,
    color: 'text-navy', accentBg: 'bg-navy/8', borderHover: 'hover:border-navy/30',
    subs: ['تأسيس وتمديدات كهربائية', 'تأسيس وتمديدات سباكة (صحي)', 'تركيب أطقم حمامات وخلاطات', 'تمديدات شبكات الغاز المركزي', 'صيانة كهربائية شاملة', 'صيانة سباكة وتمديدات شاملة', 'تركيب وصيانة مضخات المياه', 'تنظيف وتعقيم خزانات المياه'],
  },
  {
    id: 'furnit', icon: Armchair, label: 'مفروشات', count: 5,
    color: 'text-rose-500', accentBg: 'bg-rose-50', borderHover: 'hover:border-rose-300',
    subs: ['تفصيل مجالس عربية وكنب', 'تفصيل وتوريد غرف نوم', 'توريد أثاث خارجي (للحدائق والمسابح)', 'تفصيل وتركيب ستائر داخلية', 'تنجيد وتجديد الأثاث والمجالس'],
  },
  {
    id: 'other', icon: Package, label: 'خدمات مساندة', count: 5,
    color: 'text-charcoal/60', accentBg: 'bg-cream', borderHover: 'hover:border-navy/25',
    subs: ['تنظيف المباني الشامل بعد التشطيب', 'جلي وتلميع الرخام والبلاط', 'مكافحة حشرات ورش مبيدات', 'فك ونقل وتركيب العفش', 'خدمات الهدم وإزالة مخلفات البناء'],
  },
];

// ── Calculator data ────────────────────────────────────────────────────────────
const CALC_SERVICES = [
  { id: 'interior', label: 'إكساء داخلي شامل', economy: [8,12],  mid: [15,22], luxury: [28,45] },
  { id: 'solar',    label: 'طاقة شمسية',        economy: [30,50], mid: [50,80], luxury: [80,130] }, // per kW
  { id: 'restore',  label: 'ترميم إنشائي',       economy: [6,10],  mid: [10,16], luxury: [18,28] },
  { id: 'decor',    label: 'ديكور فقط',          economy: [4,7],   mid: [8,14],  luxury: [18,35] },
  { id: 'mep',      label: 'كهرباء وسباكة',      economy: [3,5],   mid: [5,8],   luxury: [8,15]  },
];
// Note: SYP_RATE is retrieved dynamically from useGlobalData inside CostCalculator

// ── Other data ─────────────────────────────────────────────────────────────────
const HERO_CATS = [
  { id: 'expat',   icon: Globe,   label: 'الإكساء الشامل للمغتربين',  sub: 'تسليم مفتاح من الخارج · متابعة مرئية أسبوعية', accent: 'border-cta/40 hover:border-cta/70', iconCls: 'text-cta', badge: 'الأكثر طلباً', badgeCls: 'bg-orange-50 text-cta border-orange-200' },
  { id: 'solar',   icon: Sun,     label: 'الطاقة الشمسية والبطاريات', sub: 'ألواح · إنفرترات · تخزين طاقة احتياطي',         accent: 'border-amber-300 hover:border-amber-400', iconCls: 'text-amber-500', badge: 'ضرورة حتمية', badgeCls: 'bg-amber-50 text-amber-600 border-amber-200' },
  { id: 'restore', icon: Hammer,  label: 'الترميم والتدعيم الإنشائي', sub: 'تقييم هندسي · ترميم أضرار · تقوية أساسات',     accent: 'border-brand/35 hover:border-brand/60', iconCls: 'text-brand', badge: 'أولوية', badgeCls: 'bg-blue-50 text-brand border-blue-200' },
  { id: 'interior',icon: Home,    label: 'الإكساء الداخلي الشامل',    sub: 'دهانات · أرضيات · جبس بورد · مطابخ',           accent: 'border-navy/15 hover:border-navy/30', iconCls: 'text-navy', badge: null, badgeCls: '' },
];

const STEPS = [
  { num: '01', title: 'صف مشروعك في أقل من دقيقة',         body: 'اختر نوع الخدمة والموقع ومواصفات عقارك. النموذج ذكي ومُصمَّم خصيصاً للسوق السوري بخياراته الحقيقية.',                                       icon: FileText },
  { num: '02', title: 'استقبل عروض أسعار من شركات موثقة', body: 'تصلك عروض مفصلة بالدولار والليرة من أفضل 5 شركات مطابقة لموقعك وتخصصك خلال ساعات.',                                                         icon: Users    },
  { num: '03', title: 'تابع مشروعك بثقة كاملة',             body: 'دفعات مرحلية مربوطة بالإنجاز، تقارير مصورة أسبوعية، وتواصل مباشر مع المقاول — حتى من الخارج.',                                            icon: Camera   },
];

const WHY_FEATURES = [
  { icon: Shield,      title: 'شفافية الأسعار',         body: 'عروض موثقة بالدولار مع معادل آني بالليرة. لا تكاليف خفية ولا مفاجآت في نهاية المشروع.',                                                     iconCls: 'text-brand',       bg: 'bg-brand/6'  },
  { icon: Camera,      title: 'متابعة مرئية كاملة',     body: 'المقاول يرفع صوراً وفيديوهات من الموقع لكل مرحلة. أنت تراقب وتوافق من أي مكان في العالم.',                                                   iconCls: 'text-cta',         bg: 'bg-cta/6'    },
  { icon: CheckCircle, title: 'دفعات مربوطة بالإنجاز',  body: 'لا يُفرَج عن دفعة إلا بعد التحقق من إتمام المرحلة. حقوق المالك والمقاول محفوظة بشكل كامل.',                                                  iconCls: 'text-green-600',   bg: 'bg-green-50' },
  { icon: HardHat,     title: 'شركات مدققة ومصنفة',     body: 'كل شركة تخضع لعملية توثيق صارمة وتقييمات حقيقية من عملاء سابقين قبل الظهور في دليل المنصة.',                                                  iconCls: 'text-amber-500',   bg: 'bg-amber-50' },
];

const STATS = [
  { target: 180, prefix: '+', suffix: '', decimals: 0, label: 'شركة موثقة',           icon: Building2,   cls: 'text-cta'       },
  { target: 640, prefix: '+', suffix: '', decimals: 0, label: 'مشروع منجز',           icon: CheckCircle, cls: 'text-green-500' },
  { target: null, display: '< ساعتين',                 label: 'متوسط وقت الرد',      icon: Clock,       cls: 'text-brand'     },
  { target: 4.8,  prefix: '', suffix: '', decimals: 1, label: 'متوسط تقييم الشركات', icon: Star,        cls: 'text-amber-400' },
];

const TESTIMONIALS = [
  { name: 'محمد العمر',   role: 'مغترب — الإمارات', rating: 5, text: 'أكملت إكساء شقتي في دمشق دون أن أضطر للسفر. التقارير المصورة الأسبوعية أعطتني ثقة كاملة بالمقاول.' },
  { name: 'رنا المصري',   role: 'صاحبة عقار — حلب', rating: 5, text: 'حصلت على 4 عروض أسعار خلال 90 دقيقة. الفرق بين السعر الأعلى والأدنى كان 30% — المنصة أنقذتني من دفع الزيادة.' },
  { name: 'خالد الدروبي', role: 'مهندس — حمص',      rating: 5, text: 'استخدمت المنصة لإيجاد شركات ترميم لمبنى متضرر. الخوارزمية أرسلت الطلب فقط لشركات الترميم الإنشائي — وفرت وقتاً كبيراً.' },
];

const FAQS = [
  { q: 'كيف أضمن التزام المقاول بالجودة والموعد؟',        a: 'نظام الدفعات المرحلية المربوطة بالإنجاز يحمي حقك تماماً. لا يُفرَج عن دفعة إلا بعد تحققنا من إتمام المرحلة المقابلة وموافقتك الصريحة. كما تحصل على تقارير مصورة أسبوعية موثقة بالتاريخ والوقت.' },
  { q: 'هل يمكنني متابعة مشروعي وأنا خارج سوريا؟',       a: 'نعم، هذا تحديداً ما صُممت المنصة من أجله. لوحة المتابعة المرئية تتيح لك رؤية صور وفيديوهات من الموقع، مراسلة المقاول، الموافقة على كل مرحلة، وإدارة الدفعات — كل ذلك من هاتفك في أي مكان في العالم.' },
  { q: 'ما الفرق الحقيقي بين المواد الاقتصادية والفاخرة؟', a: 'المواد الاقتصادية ($8-12/م²): سيراميك تجاري، دهان عادي، جبس بورد أساسي — مناسبة للإيجار أو الميزانيات المحدودة. المواد المتوسطة ($15-22/م²): سيراميك جيد، دهان مائي عالي الجودة، ألمنيوم بالمواصفات. المواد الفاخرة ($28-45/م²): رخام طبيعي، باركيه خشب أصيل، ديكور عجمي دمشقي، أنظمة ذكية.' },
  { q: 'كم من الوقت يستغرق الحصول على عروض الأسعار؟',    a: 'تصلك أول العروض خلال 2-4 ساعات من إرسال طلبك. الشركات المطابقة لموقعك وتخصصك تُنبَّه فور استلام الطلب، ومتوسط وقت الرد في المنصة هو ساعتين فقط.' },
  { q: 'كيف يتم توثيق وفحص شركات الإكساء؟',              a: 'كل شركة تمر بعملية توثيق من 3 مراحل: التحقق من السجل التجاري وبيانات المالكين، مراجعة عينة من مشاريعها السابقة مع التواصل بعملاء سابقين، ثم فترة مراقبة 30 يوم قبل منح شارة "موثق ومعتمد".' },
  { q: 'هل هناك حد أدنى لمساحة المشروع؟',                 a: 'لا يوجد حد أدنى. نستقبل طلبات من غرفة واحدة (15م²) حتى مجمعات سكنية كاملة. للمشاريع الكبيرة (+500م²) يتم تعيين مدير مشروع مخصص من المنصة.' },
  { q: 'ما آلية الدفع وهل هي آمنة؟',                      a: 'الدفعات تسير عبر المنصة بشكل مرحلي: 20% للبداية، والباقي مقسم على مراحل الإنجاز. الأموال لا تصل للمقاول إلا بعد موافقتك على كل مرحلة. ندعم الدفع بالدولار الأمريكي والتحويل البنكي.' },
];

// ── Animated number counter ────────────────────────────────────────────────────
function AnimatedNumber({ target, prefix = '', suffix = '', decimals = 0, display }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!inView || target == null) return;
    const ctrl = animate(0, target, {
      duration: 1.6,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: v => setCurrent(decimals > 0 ? parseFloat(v.toFixed(decimals)) : Math.floor(v)),
    });
    return () => ctrl.stop();
  }, [inView, target, decimals]);

  if (display) return <span ref={ref}>{display}</span>;
  return (
    <span ref={ref}>
      {prefix}{decimals > 0 ? current.toFixed(decimals) : current}{suffix}
    </span>
  );
}

// ── Sticky expat banner ────────────────────────────────────────────────────────
function StickyExpatBanner() {
  const [visible,   setVisible]   = useState(false);
  const [dismissed, setDismissed] = useState(
    () => { try { return sessionStorage.getItem('expatBannerDismissed') === '1'; } catch { return false; } }
  );

  useEffect(() => {
    if (dismissed) return;
    const onScroll = () => setVisible(window.scrollY > 480);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [dismissed]);

  const dismiss = () => {
    setDismissed(true);
    try { sessionStorage.setItem('expatBannerDismissed', '1'); } catch {}
  };

  return (
    <AnimatePresence>
      {visible && !dismissed && (
        <motion.div
          initial={{ y: 90, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 90, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-20 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:w-72 z-40"
        >
          <div className="bg-navy border border-purple-500/30 rounded-2xl p-4 shadow-2xl relative overflow-hidden">
            {/* Purple glow */}
            <div
              className="absolute top-0 right-0 w-36 h-20 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at top right, rgba(168,85,247,0.22) 0%, transparent 70%)' }}
            />
            <button
              onClick={dismiss}
              className="absolute top-2.5 left-2.5 w-6 h-6 rounded-full bg-white/8 text-white/40 flex items-center justify-center hover:bg-white/15 hover:text-white/70 transition-colors"
            >
              <X size={11} />
            </button>
            <div className="flex items-start gap-3 mb-3.5">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center shrink-0">
                <Globe size={16} className="text-purple-300" />
              </div>
              <div className="pt-0.5">
                <p className="text-white font-black text-sm leading-tight">مغترب؟ نتابع مشروعك</p>
                <p className="text-white/45 text-[11px] mt-0.5 leading-snug">تسليم مفتاح من الخارج · تقارير أسبوعية</p>
              </div>
            </div>
            <Link
              to="/finishing/expat"
              onClick={dismiss}
              className="flex items-center justify-center gap-1.5 w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 rounded-xl text-xs transition-colors"
            >
              <Globe size={12} /> افتح لوحة متابعة المغتربين <ChevronLeft size={11} />
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Components ────────────────────────────────────────────────────────────────

function StatCard({ target, prefix, suffix, decimals, display, label, icon: Icon, cls, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ duration: 0.4, delay: index * 0.08 }}
      className="cream-card p-5 text-center"
    >
      <Icon size={20} className={`mx-auto mb-2 ${cls}`} />
      <p className={`font-display text-3xl leading-none mb-1 ${cls}`}>
        <AnimatedNumber target={target} prefix={prefix} suffix={suffix} decimals={decimals} display={display} />
      </p>
      <p className="text-charcoal/60 text-xs">{label}</p>
    </motion.div>
  );
}

function HeroCatCard({ cat, index }) {
  const Icon = cat.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ duration: 0.38, delay: index * 0.09 }}
      className={`cream-card p-5 cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md border-2 ${cat.accent}`}
    >
      {cat.badge
        ? <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border mb-3 ${cat.badgeCls}`}>{cat.badge}</span>
        : <div className="mb-3 h-5" />
      }
      <Icon size={28} className={`mb-3 ${cat.iconCls}`} />
      <h3 className="text-navy font-black text-base mb-1.5 leading-snug">{cat.label}</h3>
      <p className="text-charcoal/55 text-xs leading-relaxed">{cat.sub}</p>
      <div className={`mt-4 flex items-center gap-1 text-xs font-bold ${cat.iconCls}`}>
        اطلب عرض سعر <ChevronLeft size={14} />
      </div>
    </motion.div>
  );
}

// ── Before / After Gallery ─────────────────────────────────────────────────────
function BeforeAfterGallery() {
  const [idx, setIdx] = useState(0);
  const p = GALLERY_PROJECTS[idx];
  const prev = () => setIdx(i => (i - 1 + GALLERY_PROJECTS.length) % GALLERY_PROJECTS.length);
  const next = () => setIdx(i => (i + 1) % GALLERY_PROJECTS.length);

  return (
    <div className="bg-white py-16 border-t border-navy/6">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-10">
          <span className="num-badge">02 —</span>
          <h2 className="text-navy text-2xl sm:text-3xl font-black mt-2 mb-2">مشاريع حقيقية — قبل وبعد</h2>
          <p className="text-charcoal/60 text-sm">نتائج موثقة من مشاريع أُنجزت عبر المنصة</p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}
          >
            {/* Before / After split card */}
            <div className="relative mb-5">
              {/* Arrow divider badge */}
              <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white border-2 border-navy/10 shadow-md items-center justify-center pointer-events-none">
                <span className="text-cta font-black text-xs">→</span>
              </div>
              <div className="grid md:grid-cols-2 gap-0 rounded-2xl overflow-hidden border border-navy/10 shadow-sm">
                {/* Before */}
                <div className="p-6 bg-gradient-to-br from-slate-800 to-slate-700 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)', backgroundSize: '24px 24px' }} />
                  <span className="absolute top-3 right-3 text-[10px] font-black bg-red-500/80 text-white px-2.5 py-1 rounded-full tracking-wide backdrop-blur-sm">قبل</span>
                  <div className="flex flex-col items-center justify-center py-6 gap-3 relative">
                    <span className="text-6xl grayscale opacity-80">{p.before.emoji}</span>
                    <p className="text-slate-300 text-xs text-center leading-relaxed max-w-xs">{p.before.state}</p>
                  </div>
                </div>
                {/* After */}
                <div className="p-6 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100 relative overflow-hidden border-t md:border-t-0 md:border-r border-amber-200/60">
                  <span className="absolute top-3 right-3 text-[10px] font-black bg-cta text-white px-2.5 py-1 rounded-full tracking-wide shadow-sm shadow-cta/30">بعد</span>
                  <div className="flex flex-col items-center justify-center py-6 gap-3">
                    <span className="text-6xl">{p.after.emoji}</span>
                    <p className="text-navy font-semibold text-xs text-center leading-relaxed max-w-xs">{p.after.state}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Project meta */}
            <div className="cream-card px-5 py-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-sm">
                {[
                  ['📍', p.city],
                  ['🏗️', p.type],
                  ['📐', `${p.area} م²`],
                  ['⏱️', p.duration],
                  ['💵', p.cost],
                  ['🏅', p.tier],
                ].map(([icon, val]) => (
                  <span key={val} className="flex items-center gap-1.5 text-charcoal/70 text-xs">
                    <span>{icon}</span><span>{val}</span>
                  </span>
                ))}
              </div>
              <span className="text-[10px] text-charcoal/50 flex items-center gap-1">
                <BadgeCheck size={11} className="text-green-500" /> {p.company}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button onClick={prev} className="flex items-center gap-1.5 text-sm text-charcoal/60 hover:text-navy transition-colors">
            <ChevronRight size={18} /> السابق
          </button>
          <div className="flex items-center gap-2">
            {GALLERY_PROJECTS.map((_, i) => (
              <button
                key={i} onClick={() => setIdx(i)}
                className={`rounded-full transition-all ${i === idx ? 'w-6 h-2 bg-cta' : 'w-2 h-2 bg-navy/20 hover:bg-navy/40'}`}
              />
            ))}
          </div>
          <button onClick={next} className="flex items-center gap-1.5 text-sm text-charcoal/60 hover:text-navy transition-colors">
            التالي <ChevronLeft size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Cost Calculator ────────────────────────────────────────────────────────────
function CostCalculator() {
  const { 
    sypExchangeRate = 13000,
    sponsorships = [],
    incrementSponsorshipClicks
  } = useGlobalData() || {};
  const [service, setService] = useState('interior');
  const [area,    setArea]    = useState('');
  const [tier,    setTier]    = useState('mid');

  const activeSponsor = useMemo(() => {
    const targetType = service === 'solar' ? 'solar' : 'interior';
    return sponsorships.find(s => s.type === targetType && s.active);
  }, [service, sponsorships]);

  const svcData = useMemo(() => CALC_SERVICES.find(s => s.id === service), [service]);
  const result  = useMemo(() => {
    const a = parseFloat(area);
    if (!a || a <= 0 || !svcData) return null;
    const [lo, hi] = svcData[tier];
    const minUSD = Math.round(a * lo);
    const maxUSD = Math.round(a * hi);
    return { minUSD, maxUSD, minSYP: (minUSD * sypExchangeRate).toLocaleString(), maxSYP: (maxUSD * sypExchangeRate).toLocaleString() };
  }, [area, tier, svcData, sypExchangeRate]);

  const TIERS = [
    { id: 'economy', label: 'اقتصادي', icon: '🏠' },
    { id: 'mid',     label: 'متوسط',   icon: '⭐', rec: true },
    { id: 'luxury',  label: 'فاخر',    icon: '👑' },
  ];

  return (
    <div className="section-cream py-16 border-t border-navy/6">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-10">
          <span className="num-badge">05 —</span>
          <h2 className="text-navy text-2xl sm:text-3xl font-black mt-2 mb-2">حاسبة تقدير التكلفة</h2>
          <p className="text-charcoal/60 text-sm">تقدير فوري قبل طلب العروض — بالدولار والليرة السورية</p>
        </div>

        <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
          {/* Form */}
          <div className="bg-white rounded-2xl p-6 border border-navy/8 shadow-sm space-y-6">
            {/* Service type */}
            <div>
              <label className="text-xs font-bold text-charcoal/60 block mb-2">نوع الخدمة</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {CALC_SERVICES.map(s => (
                  <button
                    key={s.id} onClick={() => setService(s.id)}
                    className={`text-right px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                      service === s.id ? 'border-brand bg-brand/6 text-navy' : 'border-navy/10 text-charcoal/70 hover:border-brand/30'
                    }`}
                  >
                    {service === s.id && <CheckCircle size={12} className="inline text-brand ml-2" />}
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Area */}
            <div>
              <label className="text-xs font-bold text-charcoal/60 block mb-2">
                {service === 'solar' ? 'القدرة المطلوبة (كيلوواط)' : 'مساحة العقار (م²)'}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number" min={1} max={2000}
                  placeholder={service === 'solar' ? 'مثال: 8' : 'مثال: 150'}
                  value={area} onChange={e => setArea(e.target.value)}
                  className="flex-1 bg-cream border border-navy/10 rounded-xl px-4 py-3 text-navy font-bold text-lg focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 transition-all"
                />
                <span className="text-charcoal/50 text-sm font-semibold shrink-0">
                  {service === 'solar' ? 'kW' : 'م²'}
                </span>
              </div>
            </div>

            {/* Material tier */}
            <div>
              <label className="text-xs font-bold text-charcoal/60 block mb-2">جودة المواد</label>
              <div className="grid grid-cols-3 gap-2">
                {TIERS.map(t => (
                  <button
                    key={t.id} onClick={() => setTier(t.id)}
                    className={`relative py-3 px-2 rounded-xl border-2 text-center transition-all ${
                      tier === t.id ? 'border-cta bg-orange-50 shadow-sm' : 'border-navy/10 hover:border-navy/25'
                    }`}
                  >
                    {t.rec && <span className="absolute -top-2 right-1/2 translate-x-1/2 text-[8px] bg-cta text-white px-1.5 py-0.5 rounded-full whitespace-nowrap">الأشهر</span>}
                    <span className="block text-xl mb-1">{t.icon}</span>
                    <span className={`text-xs font-bold ${tier === t.id ? 'text-navy' : 'text-charcoal/60'}`}>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Result */}
          <div className={`rounded-2xl border-2 transition-all duration-300 ${result ? 'border-cta/30 bg-gradient-to-br from-orange-50 to-amber-50' : 'border-navy/10 bg-cream'} p-6`}>
            {result ? (
              <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
                <div className="flex items-center gap-2 mb-5">
                  <Calculator size={18} className="text-cta" />
                  <span className="text-navy font-bold text-sm">التقدير الأولي</span>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-charcoal/50 mb-1">نطاق التكلفة بالدولار</p>
                  <p className="font-display text-4xl text-navy leading-none">
                    ${result.minUSD.toLocaleString()}
                    <span className="text-2xl text-charcoal/50"> – </span>
                    ${result.maxUSD.toLocaleString()}
                  </p>
                </div>

                <div className="bg-white/80 rounded-xl p-3 mb-5 border border-navy/8">
                  <p className="text-[10px] text-charcoal/50 mb-0.5">ما يعادل بالليرة السورية (تقريبي)</p>
                  <p className="text-navy font-bold text-sm">
                    {result.minSYP} – {result.maxSYP} ل.س
                  </p>
                  <p className="text-[9px] text-charcoal/40 mt-0.5">سعر الصرف: 1$ ≈ {sypExchangeRate.toLocaleString()} ل.س</p>
                </div>

                <div className="text-[10px] text-charcoal/50 mb-5 leading-relaxed bg-amber-50/80 border border-amber-200/60 rounded-xl p-3">
                  ⚠️ هذا تقدير أولي فقط. العروض الفعلية قد تختلف حسب حالة العقار، المواد المحددة، وتكاليف النقل.
                </div>

                <Link
                  to="/finishing/rfq"
                  className="flex items-center justify-center gap-2 bg-cta hover:bg-cta/90 text-white font-bold px-5 py-3 rounded-xl text-sm transition-all hover:-translate-y-0.5 shadow-md shadow-cta/20"
                >
                  احصل على عروض حقيقية <ArrowLeft size={14} />
                </Link>

                <SponsorCard
                  sponsor={activeSponsor}
                  onClick={() => incrementSponsorshipClicks?.(activeSponsor.id)}
                  className="mt-4"
                />

                <div className="mt-4 pt-4 border-t border-navy/10 flex flex-col gap-2">
                  <p className="text-[10px] text-charcoal/40 font-bold uppercase tracking-wider">خدمات ذات صلة بمشروعك:</p>
                  <Link to="/valuation-request" className="text-xs text-brand hover:underline flex items-center gap-1">
                    📊 هل تريد تقييماً هندسياً دقيقاً لعقارك الحالي لتقدير تكاليف الترميم بدقة؟ اطلب تقييماً معتمداً
                  </Link>
                  <Link to="/equipment" className="text-xs text-brand hover:underline flex items-center gap-1">
                    🏗️ تحتاج معدات أو آليات ثقيلة للعمل الإنشائي؟ استأجر الآن
                  </Link>
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Calculator size={36} className="text-navy/20 mb-3" />
                <p className="text-navy font-bold text-sm mb-1">أدخل المساحة لرؤية التقدير</p>
                <p className="text-charcoal/50 text-xs leading-relaxed">
                  اختر نوع الخدمة وأدخل المساحة لتظهر التكلفة التقديرية فوراً
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Expandable Services Grid ───────────────────────────────────────────────────
function ExpandableServicesGrid() {
  const [openId, setOpenId] = useState(null);

  return (
    <div className="bg-white py-16 border-t border-navy/6">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-10">
          <span className="num-badge">06 —</span>
          <h2 className="text-navy text-2xl sm:text-3xl font-black mt-2 mb-2">كل خدمات الإكساء — مكان واحد</h2>
          <p className="text-charcoal/60 text-sm">+70 خدمة فرعية · اضغط على أي فئة لعرض تفاصيلها</p>
        </div>

        <div className="space-y-2">
          {SERVICES_EXPANDED.map((svc, i) => {
            const Icon = svc.icon;
            const isOpen = openId === svc.id;
            return (
              <motion.div
                key={svc.id}
                initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.3, delay: i * 0.04 }}
                className={`rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
                  isOpen ? 'border-navy/20 shadow-md' : `border-navy/8 ${svc.borderHover}`
                }`}
              >
                {/* Header row */}
                <button
                  onClick={() => setOpenId(isOpen ? null : svc.id)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-right hover:bg-navy/2 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${svc.accentBg}`}>
                      <Icon size={16} className={svc.color} />
                    </div>
                    <div className="text-right">
                      <p className="text-navy font-bold text-sm">{svc.label}</p>
                      <p className="text-charcoal/50 text-[10px]">{svc.count} خدمة فرعية</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Link
                      to="/finishing/rfq"
                      onClick={e => e.stopPropagation()}
                      className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-cta bg-cta/8 border border-cta/20 px-2.5 py-1 rounded-lg hover:bg-cta/15 transition-colors"
                    >
                      اطلب عرضاً <ChevronLeft size={10} />
                    </Link>
                    <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                      isOpen ? 'border-navy bg-navy text-white rotate-180' : 'border-navy/20 text-charcoal/50'
                    }`}>
                      <ChevronDown size={14} />
                    </div>
                  </div>
                </button>

                {/* Sub-services */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-4 pt-1 border-t border-navy/6">
                        <div className="flex flex-wrap gap-2 mt-3">
                          {svc.subs.map(sub => (
                            <Link
                              key={sub}
                              to="/finishing/rfq"
                              className={`text-[11px] font-medium px-3 py-1.5 rounded-full border transition-all hover:-translate-y-0.5 ${svc.accentBg} border-navy/10 hover:border-navy/25 text-navy`}
                            >
                              {sub}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── FAQ Section ────────────────────────────────────────────────────────────────
function FAQSection() {
  const [openIdx, setOpenIdx] = useState(null);

  return (
    <div className="bg-white py-16 border-t border-navy/6">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-10">
          <span className="num-badge">09 —</span>
          <h2 className="text-navy text-2xl sm:text-3xl font-black mt-2 mb-2">الأسئلة الشائعة</h2>
          <p className="text-charcoal/60 text-sm">إجابات مباشرة على أكثر ما يسأل عنه عملاؤنا</p>
        </div>

        <div className="space-y-2">
          {FAQS.map((faq, i) => {
            const isOpen = openIdx === i;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.3, delay: i * 0.05 }}
                className={`rounded-2xl border-2 overflow-hidden transition-all duration-300 ${
                  isOpen ? 'border-brand/30 shadow-sm' : 'border-navy/8 hover:border-navy/20'
                }`}
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-right"
                >
                  <span className={`text-sm font-bold leading-snug ${isOpen ? 'text-brand' : 'text-navy'}`}>
                    {faq.q}
                  </span>
                  <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                    isOpen ? 'border-brand bg-brand text-white' : 'border-navy/20 text-charcoal/50'
                  }`}>
                    {isOpen ? <Minus size={13} /> : <Plus size={13} />}
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 border-t border-navy/6">
                        <p className="text-charcoal/70 text-sm leading-relaxed pt-3">{faq.a}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <p className="text-charcoal/50 text-sm mb-3">سؤال آخر؟</p>
          <a
            href="https://wa.me/963000000000"
            target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-2 border-2 border-green-400/50 text-green-700 bg-green-50 hover:bg-green-100 font-bold px-5 py-2.5 rounded-xl text-sm transition-all"
          >
            تواصل معنا عبر واتساب
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function FinishingPage() {
  const [activeStep, setActiveStep] = useState(null);

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <SEO
        title="منصة الإكساء والمقاولات في سوريا"
        description="اطلب عروض أسعار من شركات إكساء موثقة في سوريا خلال دقيقتين. متابعة مرئية للمشاريع ودفعات مرحلية آمنة. خدمة متكاملة للمغتربين."
        path="/finishing"
      />

      {/* ── Hero ── */}
      <PageHero
        num="08" eyebrow="منصة الإكساء والمقاولات"
        title={
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-[1.4]">
            إكساء منزلك في سوريا —<br />
            <span className="text-cta">من أي مكان في العالم.</span>
          </h1>
        }
        subtitle="اطلب عروض أسعار من شركات موثقة خلال دقيقتين · متابعة مرئية أسبوعية · دفعات مرحلية آمنة"
        accent="bg-cta"
        breadcrumb={[{ label: 'الرئيسية', to: '/' }, { label: 'منصة الإكساء' }]}
      >
        <div className="flex flex-wrap gap-3 mt-6">
          <Link to="/finishing/rfq" className="inline-flex items-center gap-2 bg-cta hover:bg-cta/90 text-white font-bold px-6 py-3 rounded-xl text-sm shadow-lg shadow-cta/25 transition-all hover:-translate-y-0.5">
            اطلب عرض سعر الآن <ArrowLeft size={16} />
          </Link>
          <Link to="/finishing/companies" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white border border-white/20 font-semibold px-5 py-3 rounded-xl text-sm backdrop-blur-sm transition-all">
            تصفح الشركات
          </Link>
        </div>

        {/* Live animated stats strip in hero */}
        <div className="flex flex-wrap items-center gap-x-7 gap-y-3 mt-7 pt-6 border-t border-white/10">
          {STATS.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="flex items-center gap-2">
                <Icon size={13} className={s.cls} />
                <span className={`font-display text-[1.6rem] leading-none tabular-nums ${s.cls}`}>
                  <AnimatedNumber target={s.target} prefix={s.prefix} suffix={s.suffix} decimals={s.decimals} display={s.display} />
                </span>
                <span className="text-white/35 text-[10px] leading-tight">{s.label}</span>
              </div>
            );
          })}
        </div>
      </PageHero>

      {/* ── Trust strip ── */}
      <div className="bg-navy py-3 border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
            {[
              { icon: BadgeCheck, label: 'مقاولون موثقون ومُفحوصون' },
              { icon: Shield,     label: 'دفعات محمية بضمان الإنجاز' },
              { icon: Camera,     label: 'متابعة مرئية أسبوعية' },
              { icon: Zap,        label: 'عروض خلال ساعتين' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-white/70 text-xs">
                <Icon size={12} className="text-cta shrink-0" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Stats bar ── */}
      <div className="bg-white border-b border-navy/6 py-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {STATS.map((s, i) => <StatCard key={s.label} {...s} index={i} />)}
          </div>
        </div>
      </div>

      {/* ── Quick-nav strip ── */}
      <div className="bg-white border-b border-navy/6 py-4">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar flex-wrap justify-center" dir="rtl">
            {[
              { to: '/finishing/companies', icon: Building2,  label: 'دليل الشركات',  desc: 'ابحث وقارن' },
              { to: '/finishing/rfq',       icon: FileText,   label: 'اطلب عرض سعر', desc: 'أسرع من دقيقتين' },
              { to: '/finishing/gallery',   icon: Camera,     label: 'معرض المشاريع', desc: 'إلهام واقعي' },
              { to: '/finishing/prices',    icon: Calculator, label: 'دليل الأسعار',  desc: 'تقديرات فورية' },
            ].map(({ to, icon: Icon, label, desc }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-navy/10 hover:border-brand/40 hover:bg-brand/5 transition-all group shrink-0"
              >
                <div className="w-8 h-8 rounded-lg bg-brand/8 flex items-center justify-center group-hover:bg-brand/15 transition-colors">
                  <Icon size={15} className="text-brand" />
                </div>
                <div className="text-right">
                  <div className="text-[12px] font-bold text-navy leading-none">{label}</div>
                  <div className="text-[10px] text-navy/45 mt-0.5">{desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Before / After Gallery (NEW) ── */}
      <BeforeAfterGallery />

      {/* ── Main service categories ── */}
      <div className="section-cream py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-10">
            <span className="num-badge">03 —</span>
            <h2 className="text-navy text-2xl sm:text-3xl font-black mt-2 mb-3">أبرز الخدمات المطلوبة</h2>
            <p className="text-charcoal/60 text-sm max-w-xl">فئات مُصممة خصيصاً لاحتياجات السوق السوري الحالي — من الترميم الإنشائي إلى الإكساء الفاخر.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {HERO_CATS.map((cat, i) => (
              <Link key={cat.id} to="/finishing/rfq">
                <HeroCatCard cat={cat} index={i} />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── How it works ── */}
      <div className="bg-white py-16 border-t border-navy/6">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="num-badge">04 —</span>
            <h2 className="text-navy text-2xl sm:text-3xl font-black mt-2 mb-3">كيف تعمل المنصة؟</h2>
            <p className="text-charcoal/60 text-sm">ثلاث خطوات بسيطة — تعمل من هاتفك أينما كنت</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.12 }}
                  onMouseEnter={() => setActiveStep(step.num)}
                  onMouseLeave={() => setActiveStep(null)}
                  className={`cream-card p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-default ${activeStep === step.num ? 'border-cta/30' : ''}`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="font-display text-4xl text-cta/20 leading-none">{step.num}</span>
                    <div className="w-10 h-10 bg-cta/8 rounded-xl flex items-center justify-center">
                      <Icon size={20} className="text-cta" />
                    </div>
                  </div>
                  <h3 className="text-navy font-black text-base mb-2">{step.title}</h3>
                  <p className="text-charcoal/60 text-sm leading-relaxed">{step.body}</p>
                </motion.div>
              );
            })}
          </div>
          <div className="text-center mt-10">
            <Link to="/finishing/rfq" className="inline-flex items-center gap-2 bg-cta hover:bg-cta/90 text-white font-bold px-7 py-3.5 rounded-xl text-sm shadow-md shadow-cta/20 transition-all hover:-translate-y-0.5">
              ابدأ طلب عرض السعر الآن <ArrowLeft size={16} />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Cost Calculator (NEW) ── */}
      <CostCalculator />

      {/* ── Expandable Services Grid (NEW) ── */}
      <ExpandableServicesGrid />

      {/* ── Why RESURGO ── */}
      <div className="section-cream py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="num-badge">07 —</span>
            <h2 className="text-navy text-2xl sm:text-3xl font-black mt-2 mb-3">لماذا RESURGO للإكساء؟</h2>
            <p className="text-charcoal/60 text-sm max-w-lg mx-auto">الثقة والشفافية هما المنتج الأساسي — ليس مجرد خدمة ربط</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {WHY_FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -16 : 16 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.42, delay: i * 0.1 }}
                  className="cream-card p-6 flex items-start gap-4"
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${f.bg}`}>
                    <Icon size={20} className={f.iconCls} />
                  </div>
                  <div>
                    <h3 className="text-navy font-black text-base mb-1.5">{f.title}</h3>
                    <p className="text-charcoal/60 text-sm leading-relaxed">{f.body}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Testimonials ── */}
      <div className="bg-white py-16 border-t border-navy/6">
        <div className="max-w-5xl mx-auto px-4">
          <div className="mb-10">
            <span className="num-badge">08 —</span>
            <h2 className="text-navy text-2xl sm:text-3xl font-black mt-2 mb-3">تجارب حقيقية</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.38, delay: i * 0.1 }}
                className="cream-card p-5"
              >
                <div className="flex gap-0.5 mb-3">
                  {[...Array(t.rating)].map((_, n) => <Star key={n} size={12} className="text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-charcoal/70 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div className="border-t border-navy/8 pt-3">
                  <p className="text-navy font-bold text-xs">{t.name}</p>
                  <p className="text-charcoal/50 text-[10px] mt-0.5">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FAQ (NEW) ── */}
      <FAQSection />

      {/* ── Dual CTA ── */}
      <StickyExpatBanner />
      <div className="section-cream py-16 border-t border-navy/8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-5">
            <motion.div
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.4 }}
              className="cream-card p-8 text-center border-2 border-cta/20 hover:border-cta/40 transition-colors"
            >
              <Home size={36} className="text-cta mx-auto mb-4" />
              <h3 className="text-navy font-black text-xl mb-2">صاحب عقار؟</h3>
              <p className="text-charcoal/60 text-sm mb-6 leading-relaxed">اطلب عروض أسعار من شركات موثقة وتابع مشروعك لحظة بلحظة من أي مكان في العالم.</p>
              <Link to="/finishing/rfq" className="inline-flex items-center gap-2 bg-cta hover:bg-cta/90 text-white font-bold px-6 py-3 rounded-xl text-sm shadow-md shadow-cta/20 transition-all hover:-translate-y-0.5">
                اطلب عرض سعر مجاناً <ArrowLeft size={15} />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.1 }}
              className="cream-card p-8 text-center border-2 border-brand/20 hover:border-brand/40 transition-colors"
            >
              <HardHat size={36} className="text-brand mx-auto mb-4" />
              <h3 className="text-navy font-black text-xl mb-2">شركة إكساء؟</h3>
              <p className="text-charcoal/60 text-sm mb-6 leading-relaxed">سجّل شركتك ووثّق تخصصاتك لتستقبل طلبات عروض أسعار مطابقة لقدراتك وموقعك الجغرافي.</p>
              <Link to="/auth?tab=register" className="inline-flex items-center gap-2 bg-brand hover:bg-navy text-white font-bold px-6 py-3 rounded-xl text-sm transition-all hover:-translate-y-0.5">
                سجّل شركتك <ArrowLeft size={15} />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
