import { useState } from 'react';
import { useNavigate, useSearchParams, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, EyeOff, CheckCircle, ArrowLeft, ArrowRight,
  Search, Home, TrendingUp, HardHat, Building2, Wrench, Hammer, Award,
  Phone, Mail, Lock, User, Shield, ChevronDown, Globe, MessageCircle,
  Send, AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

// ── Role configuration ────────────────────────────────────────────────────────
const ROLES = {
  seeker: {
    icon: Search,    emoji: '🔍',
    label: 'باحث عقاري',  sub: 'تصفّح وابحث',
    tagline: 'ابحث في آلاف العقارات السورية',
    desc: 'وصول فوري لآلاف العقارات المُحققة في جميع المحافظات مع تنبيهات ذكية.',
    accent: '#5979bb',
    props: ['تصفّح آلاف العقارات المُحققة', 'تنبيهات فورية للعقارات الجديدة', 'حاسبة تمويل وتقييم تقديري مجاناً'],
    extraFields: [],
    requiredExtras: [],
    redirect: '/properties',
  },
  owner: {
    icon: Home,      emoji: '🏠',
    label: 'مالك عقار',    sub: 'أضف وسوّق',
    tagline: 'سوّق عقارك لملايين المشترين',
    desc: 'أضف عقارك واحصل على تقييم هندسي وتوثيق بالبلوكتشين خلال 24 ساعة.',
    accent: '#f37124',
    props: ['تقييم آلي معتمد مجاناً', 'توثيق الملكية بالبلوكتشين', 'ربط مباشر بمهندسين معتمدين'],
    extraFields: ['syrian_id_number', 'province'],
    requiredExtras: ['province', 'syrian_id_number'],
    redirect: '/owner/add-property',
  },
  investor: {
    icon: TrendingUp, emoji: '💼',
    label: 'مستثمر',        sub: 'استثمر من 500$',
    tagline: 'عوائد تصل لـ18% من العقار السوري',
    desc: 'استثمر في مشاريع عقارية حقيقية بحصة موثَّقة وعوائد توزَّع كل 6 أشهر.',
    accent: '#16a34a',
    props: ['تمويل جماعي بدءاً من 500$', 'عوائد سنوية 11–18% موثَّقة', 'SPV قانوني لحماية استثمارك'],
    extraFields: ['country_of_residence', 'investment_range'],
    requiredExtras: ['investment_range', 'country_of_residence'],
    redirect: '/crowdfund',
  },
  engineer: {
    icon: HardHat,   emoji: '🏗️',
    label: 'مهندس',          sub: 'قدّم خبراتك',
    tagline: 'وقّع تقاريرك رقمياً واكسب أكثر',
    desc: 'أصدر تقارير فنية موقَّعة وتوثَّقة وتلقَّ طلبات من ملاك العقارات مباشرة.',
    accent: '#d97706',
    props: ['طلبات فحص عقار مباشرة', 'شهادة RESURGO المعتمدة', 'توقيع رقمي مقبول رسمياً'],
    extraFields: ['professional_license_no', 'specialty', 'syndicate_city'],
    requiredExtras: ['professional_license_no', 'specialty', 'syndicate_city'],
    redirect: '/engineer/dashboard',
  },
  developer: {
    icon: Building2, emoji: '🏢',
    label: 'مطوّر / شركة',  sub: 'اعرض مشاريعك',
    tagline: 'مشاريعك أمام ملايين المستثمرين',
    desc: 'سجّل شركتك في بوابة المطورين واعرض مشاريعك وافتح جولات تمويل جماعي.',
    accent: '#7c3aed',
    props: ['بوابة مطورين متكاملة', 'طرح مشاريع للتمويل الجماعي', 'شارة "مطور موثَّق" بالبلوكتشين'],
    extraFields: ['company_name', 'commercial_register_no', 'company_city'],
    requiredExtras: ['company_name', 'commercial_register_no', 'company_city'],
    redirect: '/developer/dashboard',
  },
  finishing_co: {
    icon: Hammer,    emoji: '🔨',
    label: 'شركة إكساء',    sub: 'قدّم خدماتك',
    tagline: 'وصل عروضك لآلاف الملاك والمطورين',
    desc: 'سجّل شركتك في دليل الإكساء وتلقَّ طلبات عروض أسعار مباشرة — بدون وسيط ودون عمولة.',
    accent: '#0d9488',
    props: ['ظهور فوري في دليل شركات الإكساء', 'استقبال طلبات RFQ مباشرة', 'شارة "شركة موثَّقة" على ملفك'],
    extraFields: ['company_name', 'commercial_register_no', 'finishing_specialty', 'work_areas'],
    requiredExtras: ['company_name', 'finishing_specialty', 'work_areas'],
    redirect: '/finishing/company-dashboard',
  },
  contractor: {
    icon: Wrench,    emoji: '⚙️',
    label: 'مقاول / معدات', sub: 'وفّر خدماتك',
    tagline: 'اربط خدماتك بمشاريع إعادة الإعمار',
    desc: 'سجّل شركتك ومعداتك وتلقَّ عروض مشاريع مباشرة من المطورين والملاك.',
    accent: '#e11d48',
    props: ['ظهور في بحث مشاريع إعادة الإعمار', 'تقييمات موثَّقة من العملاء', 'عروض أسعار مباشرة بدون وسيط'],
    extraFields: ['company_name', 'commercial_register_no', 'contractor_specialty'],
    requiredExtras: ['company_name', 'contractor_specialty', 'commercial_register_no'],
    redirect: '/contractor/dashboard',
  },
  internal_clerk: {
    icon: Shield,    emoji: '📋',
    label: 'كاتب داخلي',   sub: 'إدارة العمليات',
    tagline: 'إدارة وتنظيم العمليات الداخلية',
    desc: 'صلاحية الوصول للوحة الإدارة الداخلية لمتابعة العمليات والمعاملات والتقارير اليومية.',
    accent: '#0891b2',
    props: ['وصول للوحة الإدارة الداخلية', 'إدارة المعاملات والوثائق', 'تقارير العمليات اليومية'],
    extraFields: ['department', 'employee_id'],
    requiredExtras: ['department'],
    redirect: '/clearing/dashboard',
  },
  appraiser: {
    icon: Award,     emoji: '🏅',
    label: 'خبير تقييم',   sub: 'تقارير رسمية',
    tagline: 'أصدر تقارير تقييم عقاري معتمدة',
    desc: 'لوحة خبير التقييم الداخلية — لاستلام الطلبات وإجراء الدراسة الميدانية وإصدار التقارير المعتمدة.',
    accent: '#7c3aed',
    props: ['استلام طلبات التقييم المعلّقة', 'إصدار تقارير IVS 2025 معتمدة', 'لوحة متابعة الطلبات والتقارير'],
    extraFields: ['professional_license_no', 'specialty', 'syndicate_city'],
    requiredExtras: ['professional_license_no', 'specialty'],
    redirect: '/valuation/appraiser-dashboard',
  },
};

const EXTRA_LABELS = {
  province:                'المحافظة',
  syrian_id_number:        'الرقم الوطني السوري',
  country_of_residence:    'بلد الإقامة',
  investment_range:        'نطاق الميزانية الاستثمارية',
  professional_license_no: 'رقم الترخيص المهني',
  specialty:               'التخصص الهندسي',
  syndicate_city:          'نقابة المهندسين',
  company_name:            'اسم الشركة',
  commercial_register_no:  'رقم السجل التجاري',
  company_city:            'مدينة الشركة',
  contractor_specialty:    'تخصص الشركة الرئيسي',
  finishing_specialty:     'تخصص الإكساء الرئيسي',
  work_areas:              'محافظة العمل الرئيسية',
  department:              'القسم / الإدارة',
  employee_id:             'الرقم الوظيفي',
};

const SYRIAN_PROVINCES = [
  'دمشق', 'ريف دمشق', 'حلب', 'حمص', 'حماة', 'اللاذقية', 'طرطوس',
  'إدلب', 'دير الزور', 'الرقة', 'الحسكة', 'السويداء', 'درعا', 'القنيطرة',
];
const INVESTMENT_RANGES = [
  { value: 'lt10k',    label: 'أقل من 10,000$' },
  { value: '10k-50k',  label: '10,000$ – 50,000$' },
  { value: '50k-200k', label: '50,000$ – 200,000$' },
  { value: 'gt200k',   label: 'أكثر من 200,000$' },
];
const ENGINEER_SPECS    = ['مدني وإنشائي', 'معماري', 'كهربائي', 'ميكانيكي', 'جيوتقني', 'تقدير كميات'];
const SYNDICATE_CITIES  = ['دمشق', 'حلب', 'حمص', 'حماة', 'اللاذقية', 'طرطوس'];
const CONTRACTOR_SPECS  = ['حفر وهدم', 'بناء وإنشاء', 'كهرباء وسباكة', 'تشطيب ودهان', 'معدات ثقيلة', 'نقل ولوجستيك'];
const FINISHING_SPECS   = ['إكساء شامل تسليم مفتاح', 'أرضيات وبلاط', 'ديكور داخلي', 'دهان وطلاء', 'جبسيات وأسقف', 'سباكة وصرف صحي', 'كهرباء وإضاءة', 'نجارة وأبواب', 'طاقة شمسية', 'ترميم وإعادة تأهيل'];

// ── Password strength ─────────────────────────────────────────────────────────
function pwStrength(pw) {
  let s = 0;
  if (pw.length >= 8)        s++;
  if (/[A-Z]/.test(pw))     s++;
  if (/[0-9]/.test(pw))     s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}
const PW_LABELS = ['', 'ضعيفة', 'مقبولة', 'جيدة', 'قوية'];
const PW_COLORS = ['', 'bg-red-400', 'bg-amber-400', 'bg-blue-400', 'bg-green-500'];

// ── Left brand panel ──────────────────────────────────────────────────────────
function BrandPanel({ roleKey, step }) {
  const role = ROLES[roleKey] || ROLES.seeker;
  const Icon = role.icon;
  return (
    <div className="hidden lg:flex flex-col justify-between h-full px-10 py-12 relative overflow-hidden"
      style={{ background: `linear-gradient(145deg, #1f2a38 0%, ${role.accent}22 100%)` }}>

      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-10"
        style={{ background: role.accent, filter: 'blur(60px)' }} />
      <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full opacity-8"
        style={{ background: role.accent, filter: 'blur(40px)' }} />

      <Link to="/" className="flex items-center gap-2.5 relative z-10">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: role.accent }}>
          <span className="text-white font-black text-base">R</span>
        </div>
        <span className="text-white font-black text-xl tracking-wide">RESURGO</span>
      </Link>

      <AnimatePresence mode="wait">
        <motion.div key={roleKey}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="relative z-10">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
            style={{ background: `${role.accent}25`, border: `1px solid ${role.accent}40` }}>
            <Icon size={28} style={{ color: role.accent }} />
          </div>
          <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-2">
            {step === 1 ? 'اختر دورك' : step === 2 ? `حساب ${role.label}` : 'تم التسجيل!'}
          </p>
          <h2 className="text-white font-black text-2xl leading-[1.4] mb-3">{role.tagline}</h2>
          <p className="text-white/60 text-sm leading-relaxed mb-8">{role.desc}</p>
          <div className="space-y-3">
            {role.props.map((p, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: `${role.accent}30` }}>
                  <CheckCircle size={11} style={{ color: role.accent }} />
                </div>
                <span className="text-white/75 text-sm">{p}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 flex items-center gap-3">
        <div className="flex -space-x-2 space-x-reverse">
          {['م', 'أ', 'س', 'ع'].map((l, i) => (
            <div key={i} className="w-7 h-7 rounded-full border-2 border-navy/80 flex items-center justify-center text-[10px] text-white font-bold"
              style={{ background: `${role.accent}${60 + i * 15}` }}>{l}</div>
          ))}
        </div>
        <p className="text-white/50 text-xs">+12,000 مستخدم سوري مسجَّل</p>
      </div>
    </div>
  );
}

// ── Role picker (step 1) ──────────────────────────────────────────────────────
function RolePicker({ selected, onSelect }) {
  return (
    <div>
      <p className="text-navy font-black text-lg mb-1">من أنت؟</p>
      <p className="text-charcoal/55 text-xs mb-5">اختر الدور الذي يصف نشاطك على المنصة</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {Object.entries(ROLES).map(([key, role]) => {
          const isActive = selected === key;
          return (
            <button key={key} onClick={() => onSelect(key)}
              className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 text-center transition-all duration-200 ${isActive
                ? 'border-brand bg-brand/6 shadow-md shadow-brand/10'
                : 'border-navy/10 bg-white hover:border-brand/30 hover:bg-cream/60'}`}>
              <span className="text-2xl">{role.emoji}</span>
              <div>
                <p className={`text-xs font-bold leading-tight ${isActive ? 'text-navy' : 'text-charcoal/70'}`}>{role.label}</p>
                <p className={`text-[10px] mt-0.5 ${isActive ? 'text-brand' : 'text-charcoal/40'}`}>{role.sub}</p>
              </div>
              {isActive && (
                <div className="absolute top-2 left-2 w-4 h-4 rounded-full bg-brand flex items-center justify-center">
                  <CheckCircle size={10} className="text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Select helper ─────────────────────────────────────────────────────────────
function SelectField({ label, name, value, onChange, options, placeholder = 'اختر...', required }) {
  return (
    <div>
      <label className="text-xs text-charcoal/60 font-semibold block mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <div className="relative">
        <select name={name} value={value} onChange={onChange}
          className="input-field appearance-none pr-3 pl-8 text-sm">
          <option value="">{placeholder}</option>
          {options.map(o => (
            <option key={typeof o === 'string' ? o : o.value} value={typeof o === 'string' ? o : o.value}>
              {typeof o === 'string' ? o : o.label}
            </option>
          ))}
        </select>
        <ChevronDown size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40 pointer-events-none" />
      </div>
    </div>
  );
}

// ── Register form (step 2) ────────────────────────────────────────────────────
function RegisterForm({ roleKey, form, onChange, showPw, setShowPw, confirmPwd, setConfirmPwd, showConfirmPwd, setShowConfirmPwd }) {
  const role   = ROLES[roleKey];
  const str    = pwStrength(form.password);
  const extras = role.extraFields;
  const req    = role.requiredExtras;

  return (
    <div className="space-y-4">
      {/* Name */}
      <div>
        <label className="text-xs text-charcoal/60 font-semibold block mb-1.5">
          الاسم الكامل <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <User size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/35" />
          <input name="full_name" value={form.full_name} onChange={onChange}
            placeholder="أحمد محمد السيد" required autoComplete="name"
            className="input-field pr-9 text-sm" />
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="text-xs text-charcoal/60 font-semibold block mb-1.5">
          البريد الإلكتروني <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <Mail size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/35" />
          <input name="email" type="email" value={form.email} onChange={onChange}
            placeholder="ahmed@example.com" required autoComplete="email"
            className="input-field pr-9 text-sm" />
        </div>
      </div>

      {/* Phone */}
      <div>
        <label className="text-xs text-charcoal/60 font-semibold block mb-1.5">رقم الهاتف</label>
        <div className="relative">
          <Phone size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/35" />
          <input name="phone" type="tel" value={form.phone} onChange={onChange}
            placeholder="+963 9XX XXX XXX" dir="ltr" autoComplete="tel"
            className="input-field pr-9 text-sm" />
        </div>
      </div>

      {/* Password */}
      <div>
        <label className="text-xs text-charcoal/60 font-semibold block mb-1.5">
          كلمة المرور <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <Lock size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/35" />
          <input name="password" type={showPw ? 'text' : 'password'} value={form.password} onChange={onChange}
            placeholder="8 أحرف على الأقل" required minLength={8} autoComplete="new-password"
            className="input-field pr-9 pl-10 text-sm" />
          <button type="button" onClick={() => setShowPw(s => !s)}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/35 hover:text-navy transition-colors">
            {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        {form.password && (
          <div className="mt-2">
            <div className="flex gap-1">
              {[1,2,3,4].map(i => (
                <div key={i} className={`h-1 flex-1 rounded-full transition-all ${str >= i ? PW_COLORS[str] : 'bg-navy/10'}`} />
              ))}
            </div>
            <p className={`text-[10px] mt-1 ${str <= 1 ? 'text-red-500' : str <= 2 ? 'text-amber-500' : 'text-green-600'}`}>
              قوة كلمة المرور: {PW_LABELS[str]}
            </p>
          </div>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <label className="text-xs text-charcoal/60 font-semibold block mb-1.5">
          تأكيد كلمة المرور <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <Lock size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/35" />
          <input
            type={showConfirmPwd ? 'text' : 'password'}
            value={confirmPwd}
            onChange={e => setConfirmPwd(e.target.value)}
            placeholder="أعد إدخال كلمة المرور"
            required
            className={`input-field pr-9 pl-10 text-sm ${confirmPwd && confirmPwd !== form.password ? 'border-red-400' : confirmPwd && confirmPwd === form.password ? 'border-green-400' : ''}`}
          />
          <button type="button" onClick={() => setShowConfirmPwd(s => !s)}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/35 hover:text-navy transition-colors">
            {showConfirmPwd ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        {confirmPwd && confirmPwd !== form.password && (
          <p className="text-[10px] text-red-500 mt-1">كلمتا المرور غير متطابقتين</p>
        )}
        {confirmPwd && confirmPwd === form.password && (
          <p className="text-[10px] text-green-600 mt-1">كلمتا المرور متطابقتان ✓</p>
        )}
      </div>

      {/* ── Role-specific fields ── */}
      {extras.includes('syrian_id_number') && (
        <div>
          <label className="text-xs text-charcoal/60 font-semibold block mb-1.5">
            الرقم الوطني السوري{req.includes('syrian_id_number') && <span className="text-red-400 mr-0.5">*</span>}
          </label>
          <div className="relative">
            <Shield size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/35" />
            <input name="syrian_id_number" value={form.syrian_id_number} onChange={onChange}
              placeholder="0000000000000" maxLength={13}
              className="input-field pr-9 text-sm font-mono tracking-wider" />
          </div>
        </div>
      )}
      {extras.includes('province') && (
        <SelectField label="المحافظة" name="province" value={form.province} onChange={onChange}
          options={SYRIAN_PROVINCES} placeholder="اختر محافظتك" required={req.includes('province')} />
      )}
      {extras.includes('country_of_residence') && (
        <div>
          <label className="text-xs text-charcoal/60 font-semibold block mb-1.5">
            بلد الإقامة{req.includes('country_of_residence') && <span className="text-red-400 mr-0.5">*</span>}
          </label>
          <div className="relative">
            <Globe size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/35" />
            <input name="country_of_residence" value={form.country_of_residence} onChange={onChange}
              placeholder="الإمارات، تركيا، ألمانيا..."
              className="input-field pr-9 text-sm" />
          </div>
        </div>
      )}
      {extras.includes('investment_range') && (
        <SelectField label="نطاق ميزانيتك الاستثمارية" name="investment_range" value={form.investment_range}
          onChange={onChange} options={INVESTMENT_RANGES} placeholder="اختر النطاق"
          required={req.includes('investment_range')} />
      )}
      {extras.includes('professional_license_no') && (
        <div>
          <label className="text-xs text-charcoal/60 font-semibold block mb-1.5">
            رقم الترخيص المهني <span className="text-red-400">*</span>
          </label>
          <input name="professional_license_no" value={form.professional_license_no} onChange={onChange}
            placeholder="ENG-2024-XXXXX"
            className="input-field text-sm font-mono" />
        </div>
      )}
      {extras.includes('specialty') && (
        <SelectField label="التخصص الهندسي" name="specialty" value={form.specialty}
          onChange={onChange} options={ENGINEER_SPECS} placeholder="اختر تخصصك"
          required={req.includes('specialty')} />
      )}
      {extras.includes('syndicate_city') && (
        <SelectField label="نقابة المهندسين (المدينة)" name="syndicate_city" value={form.syndicate_city}
          onChange={onChange} options={SYNDICATE_CITIES} placeholder="اختر النقابة" />
      )}
      {extras.includes('company_name') && (
        <div>
          <label className="text-xs text-charcoal/60 font-semibold block mb-1.5">
            {roleKey === 'contractor' ? 'اسم الشركة / المؤسسة' : roleKey === 'finishing_co' ? 'اسم شركة الإكساء' : 'اسم شركة التطوير'}
            <span className="text-red-400 ml-0.5">*</span>
          </label>
          <div className="relative">
            <Building2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/35" />
            <input name="company_name" value={form.company_name} onChange={onChange}
              placeholder="شركة ..."
              className="input-field pr-9 text-sm" />
          </div>
        </div>
      )}
      {extras.includes('commercial_register_no') && (
        <div>
          <label className="text-xs text-charcoal/60 font-semibold block mb-1.5">رقم السجل التجاري</label>
          <input name="commercial_register_no" value={form.commercial_register_no} onChange={onChange}
            placeholder="CR-XXXXX"
            className="input-field text-sm font-mono" />
        </div>
      )}
      {extras.includes('company_city') && (
        <SelectField label="مدينة الشركة" name="company_city" value={form.company_city}
          onChange={onChange} options={SYRIAN_PROVINCES} placeholder="اختر المدينة" />
      )}
      {extras.includes('contractor_specialty') && (
        <SelectField label="تخصص الشركة الرئيسي" name="contractor_specialty" value={form.contractor_specialty}
          onChange={onChange} options={CONTRACTOR_SPECS} placeholder="اختر التخصص"
          required={req.includes('contractor_specialty')} />
      )}
      {extras.includes('finishing_specialty') && (
        <SelectField label="تخصص الإكساء الرئيسي" name="finishing_specialty" value={form.finishing_specialty}
          onChange={onChange} options={FINISHING_SPECS} placeholder="اختر تخصصك"
          required={req.includes('finishing_specialty')} />
      )}
      {extras.includes('work_areas') && (
        <SelectField label="محافظة العمل الرئيسية" name="work_areas" value={form.work_areas}
          onChange={onChange} options={SYRIAN_PROVINCES} placeholder="اختر المحافظة"
          required={req.includes('work_areas')} />
      )}
      {extras.includes('department') && (
        <div>
          <label className="text-xs text-charcoal/60 font-semibold block mb-1.5">
            القسم / الإدارة <span className="text-red-400">*</span>
          </label>
          <input name="department" value={form.department} onChange={onChange}
            placeholder="العمليات، المالية، الإدارة..."
            className="input-field text-sm" />
        </div>
      )}
      {extras.includes('employee_id') && (
        <div>
          <label className="text-xs text-charcoal/60 font-semibold block mb-1.5">الرقم الوظيفي</label>
          <input name="employee_id" value={form.employee_id} onChange={onChange}
            placeholder="EMP-XXXXX"
            className="input-field text-sm font-mono" />
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
const BLANK_FORM = {
  full_name: '', email: '', password: '', phone: '',
  syrian_id_number: '', province: '',
  country_of_residence: '', investment_range: '',
  professional_license_no: '', specialty: '', syndicate_city: '',
  company_name: '', commercial_register_no: '', company_city: '',
  contractor_specialty: '',
  finishing_specialty: '', work_areas: '',
  department: '', employee_id: '',
};

export default function AuthPage() {
  const [params]  = useSearchParams();
  const location  = useLocation();
  const navigate  = useNavigate();
  const { login, register, resetPassword } = useAuth();

  const [tab,       setTab]       = useState(params.get('tab') === 'register' ? 'register' : 'login');
  const [step,      setStep]      = useState(1);   // register: 1=role, 2=form, 3=success
  const [roleKey,   setRoleKey]   = useState('seeker');
  const [form,      setForm]      = useState(BLANK_FORM);
  const [showPw,         setShowPw]         = useState(false);
  const [confirmPwd,     setConfirmPwd]     = useState('');
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState('');
  // Forgot password inline state
  const [forgotMode,    setForgotMode]    = useState(false);
  const [forgotEmail,   setForgotEmail]   = useState('');
  const [forgotSent,    setForgotSent]    = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const onChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const switchTab = (t) => { setTab(t); setStep(1); setError(''); setForgotMode(false); setForgotSent(false); setConfirmPwd(''); };

  const handleRoleNext = () => setStep(2);

  // ── Login ──────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(form.email, form.password, roleKey);
      navigate(location.state?.from || '/');
    } catch (err) {
      setError(err.message || 'بريد إلكتروني أو كلمة مرور غير صحيحة');
    } finally { setLoading(false); }
  };

  // ── Forgot password ────────────────────────────────────────
  const handleForgot = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotLoading(true);
    try {
      await resetPassword(forgotEmail.trim());
      setForgotSent(true);
    } catch (err) {
      toast.error(err.message || 'تعذّر إرسال رابط إعادة التعيين');
    } finally { setForgotLoading(false); }
  };

  // ── Register ───────────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    // Base validation
    if (!form.full_name.trim())              { setError('الاسم الكامل مطلوب'); return; }
    if (!form.email.trim())                  { setError('البريد الإلكتروني مطلوب'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) { setError('صيغة البريد الإلكتروني غير صحيحة'); return; }
    if (form.phone.trim() && !/^\+?[0-9\s-]{7,20}$/.test(form.phone.trim())) {
      setError('رقم الهاتف غير صحيح — أدخل رقماً دولياً صحيحاً'); return;
    }
    if (form.password.length < 8)            { setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل'); return; }
    if (form.password !== confirmPwd)        { setError('كلمتا المرور غير متطابقتين'); return; }
    if (pwStrength(form.password) < 2)       { setError('كلمة المرور ضعيفة جداً — استخدم أرقاماً وأحرفاً كبيرة'); return; }

    // Role-specific required fields validation
    const role = ROLES[roleKey];
    for (const field of role.requiredExtras) {
      if (!form[field]?.trim()) {
        setError(`حقل "${EXTRA_LABELS[field]}" مطلوب`);
        return;
      }
    }

    setLoading(true);
    try {
      await register({ ...form, role: roleKey });
      setStep(3);
      toast.success(`مرحباً ${form.full_name.split(' ')[0]}! 🎉`);
    } catch (err) {
      setError(err.message || 'حدث خطأ. يرجى المحاولة مجدداً.');
    } finally { setLoading(false); }
  };

  // ── Progress steps indicator ───────────────────────────────
  const Steps = () => tab === 'register' ? (
    <div className="flex items-center gap-2 mb-6">
      {[['01', 'نوع الحساب'], ['02', 'معلوماتك'], ['03', 'تأكيد']].map(([n, label], i) => {
        const active = i + 1 === step;
        const done   = i + 1 < step;
        return (
          <div key={n} className="flex items-center gap-2">
            {i > 0 && <div className={`h-px w-6 ${done ? 'bg-brand' : 'bg-navy/15'}`} />}
            <div className="flex items-center gap-1.5">
              <div className={`w-6 h-6 rounded-full text-[10px] font-black flex items-center justify-center transition-colors ${
                done ? 'bg-brand text-white' : active ? 'bg-navy text-white' : 'bg-navy/10 text-charcoal/40'}`}>
                {done ? <CheckCircle size={12} /> : n}
              </div>
              <span className={`text-xs font-medium ${active ? 'block text-navy' : 'hidden sm:block text-charcoal/40'}`}>{label}</span>
            </div>
          </div>
        );
      })}
    </div>
  ) : null;

  return (
    <div className="min-h-screen flex" dir="rtl">

      {/* ── Brand panel ───────────────────────────────────── */}
      <div className="lg:w-[42%] shrink-0">
        <BrandPanel roleKey={roleKey} step={step} />
      </div>

      {/* ── Form panel ────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-5 py-16 bg-cream min-h-screen overflow-y-auto">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex justify-center mb-8 lg:hidden">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-brand flex items-center justify-center">
                <span className="text-white font-black text-base">R</span>
              </div>
              <span className="text-xl font-black text-navy">RESURGO</span>
            </Link>
          </div>

          {/* Tab switch — hide on step 3 */}
          {step !== 3 && (
            <div className="flex bg-white border border-navy/10 rounded-2xl p-1 mb-6 shadow-sm">
              {[['login', 'تسجيل الدخول'], ['register', 'حساب جديد']].map(([val, label]) => (
                <button key={val} onClick={() => switchTab(val)}
                  className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${tab === val ? 'bg-navy text-white shadow-sm' : 'text-charcoal/55 hover:text-navy'}`}>
                  {label}
                </button>
              ))}
            </div>
          )}

          <Steps />

          {/* ══════════════════════════════════════════════════
              LOGIN
          ══════════════════════════════════════════════════ */}
          {tab === 'login' && !forgotMode && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="mb-2">
                <p className="text-navy font-black text-lg">مرحباً بعودتك 👋</p>
                <p className="text-charcoal/55 text-xs mt-1">أدخل بيانات حسابك للمتابعة</p>
              </div>

              <div>
                <label className="text-xs text-charcoal/60 font-semibold block mb-1.5">البريد الإلكتروني</label>
                <div className="relative">
                  <Mail size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/35" />
                  <input name="email" type="email" value={form.email} onChange={onChange}
                    placeholder="ahmed@example.com" required className="input-field pr-9 text-sm" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs text-charcoal/60 font-semibold">كلمة المرور</label>
                  <button type="button" onClick={() => { setForgotEmail(form.email); setForgotMode(true); }}
                    className="text-[10px] text-brand hover:underline">نسيت كلمة المرور؟</button>
                </div>
                <div className="relative">
                  <Lock size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/35" />
                  <input name="password" type={showPw ? 'text' : 'password'} value={form.password} onChange={onChange}
                    placeholder="••••••••" required className="input-field pr-9 pl-10 text-sm" />
                  <button type="button" onClick={() => setShowPw(s => !s)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/35 hover:text-navy transition-colors">
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 text-red-600 text-xs bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                  <AlertCircle size={13} className="mt-0.5 shrink-0" /> {error}
                </div>
              )}

              <button type="submit" disabled={loading}
                className="btn-cta w-full flex items-center justify-center gap-2 py-3 text-sm font-bold disabled:opacity-60">
                {loading
                  ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  : <><span>تسجيل الدخول</span><ArrowLeft size={16} /></>}
              </button>

              <p className="text-center text-charcoal/50 text-xs pt-2">
                ليس لديك حساب؟{' '}
                <button type="button" onClick={() => switchTab('register')} className="text-brand font-bold hover:underline">
                  أنشئ حساباً مجاناً
                </button>
              </p>

              <div className="flex items-center gap-3 mt-5">
                <div className="flex-1 h-px bg-navy/10" />
                <span className="text-charcoal/35 text-xs shrink-0">أو</span>
                <div className="flex-1 h-px bg-navy/10" />
              </div>
              <a href="https://wa.me/963000000000?text=مرحباً%2C%20أريد%20التسجيل%20في%20RESURGO"
                target="_blank" rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full mt-3 py-2.5 rounded-xl border border-green-400/40 bg-green-50 text-green-700 text-sm font-medium hover:bg-green-100 transition-colors">
                <MessageCircle size={14} /> تسجيل بدون إيميل — واتساب
              </a>
            </form>
          )}

          {/* ══════════════════════════════════════════════════
              FORGOT PASSWORD INLINE
          ══════════════════════════════════════════════════ */}
          {tab === 'login' && forgotMode && (
            <AnimatePresence mode="wait">
              <motion.div key="forgot"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>

                {!forgotSent ? (
                  <form onSubmit={handleForgot} className="space-y-4">
                    <button type="button" onClick={() => setForgotMode(false)}
                      className="flex items-center gap-1.5 text-charcoal/50 hover:text-navy text-xs mb-4 transition-colors">
                      <ArrowRight size={13} /> العودة لتسجيل الدخول
                    </button>
                    <div>
                      <p className="text-navy font-black text-lg mb-1">إعادة تعيين كلمة المرور</p>
                      <p className="text-charcoal/55 text-xs">أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين</p>
                    </div>
                    <div>
                      <label className="text-xs text-charcoal/60 font-semibold block mb-1.5">البريد الإلكتروني</label>
                      <div className="relative">
                        <Mail size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/35" />
                        <input type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)}
                          placeholder="ahmed@example.com" required
                          className="input-field pr-9 text-sm" />
                      </div>
                    </div>
                    <button type="submit" disabled={forgotLoading}
                      className="btn-cta w-full flex items-center justify-center gap-2 py-3 text-sm font-bold disabled:opacity-60">
                      {forgotLoading
                        ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        : <><Send size={14} /> إرسال رابط إعادة التعيين</>}
                    </button>
                  </form>
                ) : (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
                    <div className="w-16 h-16 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle size={32} className="text-green-500" />
                    </div>
                    <p className="text-navy font-black text-base mb-2">تم إرسال الرابط!</p>
                    <p className="text-charcoal/55 text-xs leading-relaxed mb-1">
                      تحقق من بريدك الإلكتروني
                    </p>
                    <p className="text-brand font-mono text-sm font-bold mb-6">{forgotEmail}</p>
                    <p className="text-charcoal/40 text-[10px] mb-6">
                      إذا لم يصل الرابط تحقق من مجلد الرسائل غير المرغوب فيها (Spam)
                    </p>
                    <button onClick={() => { setForgotMode(false); setForgotSent(false); }}
                      className="text-brand text-xs font-bold hover:underline">
                      العودة لتسجيل الدخول
                    </button>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          )}

          {/* ══════════════════════════════════════════════════
              REGISTER — STEP 1: Role picker
          ══════════════════════════════════════════════════ */}
          {tab === 'register' && step === 1 && (
            <AnimatePresence mode="wait">
              <motion.div key="step1"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <RolePicker selected={roleKey} onSelect={setRoleKey} />
                <button onClick={handleRoleNext}
                  className="btn-cta w-full flex items-center justify-center gap-2 py-3 text-sm font-bold mt-6">
                  المتابعة <ArrowLeft size={16} />
                </button>
                <p className="text-center text-charcoal/50 text-xs mt-4">
                  لديك حساب؟{' '}
                  <button type="button" onClick={() => switchTab('login')} className="text-brand font-bold hover:underline">تسجيل الدخول</button>
                </p>
              </motion.div>
            </AnimatePresence>
          )}

          {/* ══════════════════════════════════════════════════
              REGISTER — STEP 2: Form
          ══════════════════════════════════════════════════ */}
          {tab === 'register' && step === 2 && (
            <AnimatePresence mode="wait">
              <motion.form key="step2" onSubmit={handleRegister}
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="flex items-center gap-3 mb-5">
                  <button type="button" onClick={() => setStep(1)}
                    className="w-8 h-8 flex items-center justify-center rounded-xl border border-navy/15 text-charcoal/50 hover:text-navy transition-colors">
                    <ArrowRight size={15} />
                  </button>
                  <div>
                    <p className="text-navy font-black text-base leading-none">
                      {ROLES[roleKey].emoji} حساب {ROLES[roleKey].label}
                    </p>
                    <p className="text-charcoal/45 text-[11px] mt-0.5">{ROLES[roleKey].tagline}</p>
                  </div>
                </div>

                <RegisterForm roleKey={roleKey} form={form} onChange={onChange}
                  showPw={showPw} setShowPw={setShowPw}
                  confirmPwd={confirmPwd} setConfirmPwd={setConfirmPwd}
                  showConfirmPwd={showConfirmPwd} setShowConfirmPwd={setShowConfirmPwd} />

                {error && (
                  <div className="flex items-start gap-2 text-red-600 text-xs bg-red-50 border border-red-200 rounded-xl px-3 py-2 mt-4">
                    <AlertCircle size={13} className="mt-0.5 shrink-0" /> {error}
                  </div>
                )}

                <button type="submit" disabled={loading}
                  className="btn-cta w-full flex items-center justify-center gap-2 py-3 text-sm font-bold mt-5 disabled:opacity-60">
                  {loading
                    ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    : <><span>إنشاء الحساب</span><ArrowLeft size={16} /></>}
                </button>

                <p className="text-center text-charcoal/45 text-[10px] mt-4 leading-relaxed">
                  بالتسجيل توافق على{' '}
                  <Link to="/terms" className="text-brand hover:underline">شروط الاستخدام</Link>
                  {' '}و{' '}
                  <Link to="/privacy" className="text-brand hover:underline">سياسة الخصوصية</Link>
                </p>
              </motion.form>
            </AnimatePresence>
          )}

          {/* ══════════════════════════════════════════════════
              REGISTER — STEP 3: Success / Email confirmation
          ══════════════════════════════════════════════════ */}
          {tab === 'register' && step === 3 && (
            <AnimatePresence mode="wait">
              <motion.div key="step3"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="text-center">

                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.1, damping: 14 }}
                  className="w-20 h-20 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center mx-auto mb-5">
                  <CheckCircle size={36} className="text-green-500" />
                </motion.div>

                <h2 className="text-navy font-black text-xl mb-1">تم إنشاء حسابك! 🎉</h2>
                <p className="text-charcoal/50 text-sm mb-5">
                  مرحباً {form.full_name.split(' ')[0]} — إليك خطواتك الأولى كـ{ROLES[roleKey].label}
                </p>

                {/* Role-specific first steps */}
                <div className="bg-white border border-navy/10 rounded-2xl p-4 mb-5 text-right space-y-3">
                  {({
                    seeker:      [{ icon: '🏠', text: 'تصفّح العقارات وفعّل تنبيهات المدينة' }, { icon: '💾', text: 'احفظ العقارات المفضلة لديك' }],
                    owner:       [{ icon: '➕', text: 'أضف عقارك الأول وأرفق صوراً واضحة' }, { icon: '📊', text: 'اطلب تقييماً هندسياً مجانياً' }],
                    investor:    [{ icon: '📈', text: 'تصفّح مشاريع التمويل الجماعي المتاحة' }, { icon: '💼', text: 'ادرس عوائد المشاريع السابقة' }],
                    engineer:    [{ icon: '🔧', text: 'أكمل ملفك المهني برقم ترخيصك' }, { icon: '📋', text: 'انتظر أول طلب فحص عقار' }],
                    developer:   [{ icon: '🏗️', text: 'أضف مشروعك الأول للمنصة' }, { icon: '💰', text: 'افتح جولة تمويل جماعي' }],
                    finishing_co:[{ icon: '✅', text: 'أكمل ملفك لتحصل على شارة "موثَّقة"' }, { icon: '📩', text: 'انتظر أول طلب عرض سعر' }],
                    contractor:  [{ icon: '⚙️', text: 'سجّل معداتك ومجالات عملك' }, { icon: '🔍', text: 'تصفّح مشاريع إعادة الإعمار' }],
                    internal_clerk:[{ icon: '📋', text: 'راجع المعاملات الواردة اليوم' }, { icon: '🔐', text: 'تحقق من صلاحياتك في النظام' }],
                    appraiser:     [{ icon: '📄', text: 'أكمل ملفك برقم ترخيصك المهني' }, { icon: '🏅', text: 'انتظر أول طلب تقييم لمراجعته' }],
                  }[roleKey] || []).map((s, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-lg shrink-0">{s.icon}</span>
                      <p className="text-navy/75 text-sm">{s.text}</p>
                    </div>
                  ))}
                </div>

                {/* Email notice */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5 text-right">
                  <p className="text-amber-700 text-xs leading-relaxed">
                    <span className="font-bold">تحقق من بريدك</span> — أرسلنا رابط التأكيد إلى{' '}
                    <span className="font-mono font-bold">{form.email}</span>
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => navigate(ROLES[roleKey].redirect)}
                    className="btn-cta w-full flex items-center justify-center gap-2 py-3 text-sm font-bold">
                    ابدأ الاستخدام الآن <ArrowLeft size={16} />
                  </button>
                  <a href="https://wa.me/963000000000?text=مرحباً، أحتاج مساعدة في تفعيل حسابي"
                    target="_blank" rel="noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-green-400/40 bg-green-50 text-green-700 text-sm font-medium hover:bg-green-100 transition-colors">
                    <MessageCircle size={14} /> مساعدة عبر واتساب
                  </a>
                </div>
              </motion.div>
            </AnimatePresence>
          )}

        </div>
      </div>
    </div>
  );
}
