import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User, Mail, Phone, Lock, Eye, EyeOff, CheckCircle,
  AlertCircle, LogOut, Save, Edit2, Shield, Globe,
  Building2, MapPin, Briefcase, ChevronLeft, ArrowLeft, Camera, Loader2,
} from 'lucide-react';
import { useAuth, ROLES } from '../context/AuthContext';
import { supabase, isConfigured } from '../lib/supabase';
import SEO from '../components/SEO';
import toast from 'react-hot-toast';

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
const ENGINEER_SPECS   = ['مدني وإنشائي', 'معماري', 'كهربائي', 'ميكانيكي', 'جيوتقني', 'تقدير كميات'];
const SYNDICATE_CITIES = ['دمشق', 'حلب', 'حمص', 'حماة', 'اللاذقية', 'طرطوس'];
const CONTRACTOR_SPECS = ['حفر وهدم', 'بناء وإنشاء', 'كهرباء وسباكة', 'تشطيب ودهان', 'معدات ثقيلة', 'نقل ولوجستيك'];

function pwStrength(pw) {
  let s = 0;
  if (pw.length >= 8)           s++;
  if (/[A-Z]/.test(pw))        s++;
  if (/[0-9]/.test(pw))        s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}
const PW_COLORS = ['', 'bg-red-400', 'bg-amber-400', 'bg-blue-400', 'bg-green-500'];
const PW_LABELS = ['', 'ضعيفة', 'مقبولة', 'جيدة', 'قوية'];

// ── Small field components ────────────────────────────────────────────────────
function Field({ label, icon: Icon, name, value, onChange, type = 'text', placeholder, readOnly, dir }) {
  return (
    <div>
      <label className="text-xs text-charcoal/55 font-semibold block mb-1.5">{label}</label>
      <div className="relative">
        {Icon && <Icon size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/30" />}
        <input
          name={name} type={type} value={value} onChange={onChange}
          placeholder={placeholder} readOnly={readOnly} dir={dir}
          className={`input-field text-sm ${Icon ? 'pr-8' : ''} ${readOnly ? 'bg-navy/3 text-charcoal/50 cursor-not-allowed' : ''}`}
        />
      </div>
    </div>
  );
}

function SelectField({ label, name, value, onChange, options, placeholder = 'اختر...' }) {
  return (
    <div>
      <label className="text-xs text-charcoal/55 font-semibold block mb-1.5">{label}</label>
      <select name={name} value={value} onChange={onChange}
        className="input-field text-sm appearance-none">
        <option value="">{placeholder}</option>
        {options.map(o => (
          <option key={typeof o === 'string' ? o : o.value} value={typeof o === 'string' ? o : o.value}>
            {typeof o === 'string' ? o : o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// ── Role-specific fields by role ──────────────────────────────────────────────
function RoleFields({ role, form, onChange }) {
  switch (role) {
    case 'owner':
      return (
        <>
          <Field label="الرقم الوطني السوري" icon={Shield} name="syrian_id_number"
            value={form.syrian_id_number} onChange={onChange} placeholder="0000000000000" />
          <SelectField label="المحافظة" name="province" value={form.province}
            onChange={onChange} options={SYRIAN_PROVINCES} placeholder="اختر محافظتك" />
        </>
      );
    case 'investor':
      return (
        <>
          <Field label="بلد الإقامة" icon={Globe} name="country_of_residence"
            value={form.country_of_residence} onChange={onChange} placeholder="الإمارات، تركيا..." />
          <SelectField label="نطاق الميزانية الاستثمارية" name="investment_range"
            value={form.investment_range} onChange={onChange} options={INVESTMENT_RANGES} />
        </>
      );
    case 'engineer':
      return (
        <>
          <Field label="رقم الترخيص المهني" icon={Shield} name="professional_license_no"
            value={form.professional_license_no} onChange={onChange} placeholder="ENG-2024-XXXXX" />
          <SelectField label="التخصص الهندسي" name="specialty" value={form.specialty}
            onChange={onChange} options={ENGINEER_SPECS} />
          <SelectField label="نقابة المهندسين" name="syndicate_city" value={form.syndicate_city}
            onChange={onChange} options={SYNDICATE_CITIES} />
        </>
      );
    case 'developer':
      return (
        <>
          <Field label="اسم شركة التطوير" icon={Building2} name="company_name"
            value={form.company_name} onChange={onChange} placeholder="شركة ..." />
          <Field label="رقم السجل التجاري" name="commercial_register_no"
            value={form.commercial_register_no} onChange={onChange} placeholder="CR-XXXXX" />
          <SelectField label="مدينة الشركة" name="company_city" value={form.company_city}
            onChange={onChange} options={SYRIAN_PROVINCES} />
        </>
      );
    case 'contractor':
      return (
        <>
          <Field label="اسم الشركة / المؤسسة" icon={Building2} name="company_name"
            value={form.company_name} onChange={onChange} placeholder="شركة ..." />
          <Field label="رقم السجل التجاري" name="commercial_register_no"
            value={form.commercial_register_no} onChange={onChange} placeholder="CR-XXXXX" />
          <SelectField label="تخصص الشركة" name="contractor_specialty" value={form.contractor_specialty}
            onChange={onChange} options={CONTRACTOR_SPECS} />
        </>
      );
    case 'internal_clerk':
      return (
        <>
          <Field label="القسم / الإدارة" icon={Briefcase} name="department"
            value={form.department} onChange={onChange} placeholder="العمليات، المالية..." />
          <Field label="الرقم الوظيفي" icon={Shield} name="employee_id"
            value={form.employee_id} onChange={onChange} placeholder="EMP-XXXXX" />
        </>
      );
    case 'admin':
      return (
        <Field label="مستوى الصلاحية" icon={Shield} name="admin_level"
          value={form.admin_level || 'مدير النظام'} onChange={onChange} readOnly />
      );
    default:
      return null;
  }
}

// ── Role badge ────────────────────────────────────────────────────────────────
const ROLE_COLORS = {
  seeker:        'bg-brand/10 text-brand border-brand/20',
  owner:         'bg-orange-50 text-orange-600 border-orange-200',
  investor:      'bg-green-50 text-green-700 border-green-200',
  engineer:      'bg-amber-50 text-amber-700 border-amber-200',
  developer:     'bg-purple-50 text-purple-700 border-purple-200',
  contractor:    'bg-rose-50 text-rose-700 border-rose-200',
  internal_clerk:'bg-slate-50 text-slate-700 border-slate-200',
  admin:         'bg-navy/8 text-navy border-navy/20',
};

// ── Quick links by role ───────────────────────────────────────────────────────
const ROLE_LINKS = {
  seeker:     [{ label: 'تصفّح العقارات', to: '/properties' }, { label: 'اقرأ الأخبار', to: '/news' }],
  owner:      [{ label: 'إضافة عقار', to: '/owner/add-property' }, { label: 'طلب تقييم', to: '/valuation-request' }],
  investor:   [{ label: 'فرص الاستثمار', to: '/invest' }, { label: 'التمويل الجماعي', to: '/crowdfund' }, { label: 'محفظتي', to: '/wallet' }],
  engineer:   [{ label: 'لوحة المهندس', to: '/engineer/dashboard' }],
  developer:  [{ label: 'لوحة المطوّر', to: '/developer/dashboard' }, { label: 'صفحة المطورين', to: '/developers' }],
  contractor: [{ label: 'لوحة المقاول', to: '/contractor/dashboard' }, { label: 'معداتي', to: '/my-equipment' }],
  internal_clerk: [{ label: 'التخليص القانوني', to: '/clearing/dashboard' }],
  admin:      [{ label: 'إدارة الأخبار', to: '/admin/news' }],
};

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user, updateProfile, updatePassword, logout } = useAuth();
  const navigate = useNavigate();

  const [editMode,  setEditMode]  = useState(false);
  const [pwMode,    setPwMode]    = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [pwSaving,  setPwSaving]  = useState(false);
  const [showPw,    setShowPw]    = useState(false);
  const [error,     setError]     = useState('');
  const [pwError,   setPwError]   = useState('');

  const [form, setForm] = useState({
    full_name:               user?.full_name               || '',
    phone:                   user?.phone                   || '',
    province:                user?.province                || '',
    syrian_id_number:        user?.syrian_id_number        || '',
    country_of_residence:    user?.country_of_residence    || '',
    investment_range:        user?.investment_range        || '',
    professional_license_no: user?.professional_license_no || '',
    specialty:               user?.specialty               || '',
    syndicate_city:          user?.syndicate_city          || '',
    company_name:            user?.company_name            || '',
    commercial_register_no:  user?.commercial_register_no  || '',
    company_city:            user?.company_city            || '',
    contractor_specialty:    user?.contractor_specialty    || '',
    department:              user?.department              || '',
    employee_id:             user?.employee_id             || '',
  });

  const [pwForm, setPwForm] = useState({ password: '', confirm: '' });
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [uploading, setUploading] = useState(false);
  const avatarInputRef = useRef(null);

  const onChange    = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const onPwChange  = (e) => setPwForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('حجم الصورة يجب أن يكون أقل من 2 ميغابايت'); return; }
    if (!file.type.startsWith('image/')) { toast.error('يرجى اختيار ملف صورة'); return; }
    setUploading(true);
    try {
      if (isConfigured) {
        const ext  = file.name.split('.').pop();
        const path = `${user.id}/avatar.${ext}`;
        const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
        if (upErr) throw upErr;
        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
        const urlWithBust = `${publicUrl}?t=${Date.now()}`;
        setAvatarUrl(urlWithBust);
        await updateProfile({ avatar_url: publicUrl });
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result;
          setAvatarUrl(dataUrl);
          updateProfile({ avatar_url: dataUrl });
        };
        reader.readAsDataURL(file);
      }
    } catch {
      toast.error('تعذّر رفع الصورة — تأكد من إنشاء bucket "avatars" في Supabase Storage');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSave = async () => {
    if (!form.full_name.trim()) { setError('الاسم الكامل مطلوب'); return; }
    setError(''); setSaving(true);
    try {
      const ROLE_FIELDS = {
        owner:          ['syrian_id_number', 'province'],
        investor:       ['country_of_residence', 'investment_range'],
        engineer:       ['professional_license_no', 'specialty', 'syndicate_city'],
        developer:      ['company_name', 'commercial_register_no', 'company_city'],
        contractor:     ['company_name', 'commercial_register_no', 'contractor_specialty'],
        internal_clerk: ['department', 'employee_id'],
        admin:          [],
      };
      const roleFields = ROLE_FIELDS[role] || [];
      const payload = {
        full_name: form.full_name,
        phone:     form.phone,
        ...Object.fromEntries(roleFields.map(k => [k, form[k]])),
      };
      await updateProfile(payload);
      setEditMode(false);
    } catch (err) {
      setError(err.message || 'حدث خطأ');
    } finally { setSaving(false); }
  };

  const handlePwSave = async (e) => {
    e.preventDefault();
    setPwError('');
    if (pwForm.password.length < 8) { setPwError('كلمة المرور يجب أن تكون 8 أحرف على الأقل'); return; }
    if (pwForm.password !== pwForm.confirm) { setPwError('كلمتا المرور غير متطابقتين'); return; }
    setPwSaving(true);
    try {
      await updatePassword(pwForm.password);
      setPwMode(false);
      setPwForm({ password: '', confirm: '' });
    } catch (err) {
      setPwError(err.message || 'حدث خطأ');
    } finally { setPwSaving(false); }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const role     = user?.role || 'seeker';
  const roleInfo = ROLES[role] || ROLES.seeker;
  const initials = (user?.full_name || user?.email || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const pwStr    = pwStrength(pwForm.password);
  const quickLinks = ROLE_LINKS[role] || [];

  return (
    <div className="min-h-screen bg-cream pt-[62px]" dir="rtl">
      <SEO title="الملف الشخصي" path="/profile" noindex={true} />

      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8"
        >
          <Link to="/" className="w-8 h-8 flex items-center justify-center rounded-xl border border-navy/15 text-charcoal/50 hover:text-navy transition-colors">
            <ArrowLeft size={15} />
          </Link>
          <h1 className="text-navy font-black text-xl">ملفي الشخصي</h1>
        </motion.div>

        {/* ── Avatar + role card ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="bg-white p-6 mb-5 flex items-center gap-5 shadow-[0_2px_8px_rgba(31,42,56,0.06)]"
          style={{ borderRadius: '8px' }}>
          <div className="relative shrink-0 group cursor-pointer" onClick={() => !uploading && avatarInputRef.current?.click()}>
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-brand flex items-center justify-center text-white font-black text-xl">
              {avatarUrl
                ? <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                : initials}
            </div>
            <div className="absolute inset-0 rounded-2xl bg-navy/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              {uploading
                ? <Loader2 size={18} className="text-white animate-spin" />
                : <Camera size={16} className="text-white" />}
            </div>
            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-navy font-black text-lg leading-snug truncate">{user?.full_name || '—'}</p>
            <p className="text-charcoal/50 text-xs mt-0.5 truncate">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border ${ROLE_COLORS[role]}`}>
                <span>{roleInfo.icon}</span> {roleInfo.label}
              </span>
              {user?.email_confirmed && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                  <CheckCircle size={9} /> بريد مؤكَّد
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── Quick links ── */}
        {quickLinks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
            className="bg-white p-4 mb-5 shadow-[0_2px_8px_rgba(31,42,56,0.06)]"
            style={{ borderRadius: '8px' }}>
            <p className="text-xs text-charcoal/40 font-bold uppercase tracking-wider mb-3">وصول سريع</p>
            <div className="flex flex-wrap gap-2">
              {quickLinks.map(({ label, to }) => (
                <Link key={to} to={to}
                  className="flex items-center gap-1.5 text-xs font-semibold text-brand border border-brand/20 bg-brand/5 hover:bg-brand/10 px-3 py-1.5 rounded-xl transition-colors">
                  {label} <ChevronLeft size={11} />
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Profile form ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.11 }}
          className="bg-white p-6 mb-5 shadow-[0_2px_8px_rgba(31,42,56,0.06)]"
          style={{ borderRadius: '8px' }}>
          <div className="flex items-center justify-between mb-5">
            <p className="text-navy font-black text-base">البيانات الشخصية</p>
            {!editMode ? (
              <button onClick={() => setEditMode(true)}
                className="flex items-center gap-1.5 text-xs font-bold text-brand hover:text-navy transition-colors">
                <Edit2 size={12} /> تعديل
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={() => { setEditMode(false); setError(''); }}
                  className="text-xs text-charcoal/50 hover:text-navy transition-colors px-2">
                  إلغاء
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="flex items-center gap-1.5 text-xs font-bold bg-brand text-white px-3 py-1.5 rounded-xl hover:bg-brand/90 transition-colors disabled:opacity-60">
                  {saving
                    ? <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    : <><Save size={11} /> حفظ</>}
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {/* Name */}
            <Field label="الاسم الكامل" icon={User} name="full_name"
              value={form.full_name} onChange={onChange}
              placeholder="الاسم الكامل" readOnly={!editMode} />

            {/* Email — always read-only (managed by Supabase auth) */}
            <Field label="البريد الإلكتروني" icon={Mail} name="email"
              value={user?.email || ''} onChange={() => {}}
              placeholder="—" readOnly />

            {/* Phone */}
            <Field label="رقم الهاتف" icon={Phone} name="phone"
              value={form.phone} onChange={onChange}
              placeholder="+963 9XX XXX XXX" readOnly={!editMode} dir="ltr" />

            {/* Role-specific fields */}
            {editMode ? (
              <RoleFields role={role} form={form} onChange={onChange} />
            ) : (
              /* Read-only role summary */
              <RoleFieldsReadOnly role={role} user={user} />
            )}
          </div>

          {error && (
            <div className="flex items-start gap-2 text-red-600 text-xs bg-red-50 border border-red-200 rounded-xl px-3 py-2 mt-4">
              <AlertCircle size={13} className="mt-0.5 shrink-0" /> {error}
            </div>
          )}
        </motion.div>

        {/* ── Change password ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
          className="bg-white p-6 mb-5 shadow-[0_2px_8px_rgba(31,42,56,0.06)]"
          style={{ borderRadius: '8px' }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-navy font-black text-base">الأمان وكلمة المرور</p>
            {!pwMode && (
              <button onClick={() => setPwMode(true)}
                className="flex items-center gap-1.5 text-xs font-bold text-brand hover:text-navy transition-colors">
                <Lock size={12} /> تغيير كلمة المرور
              </button>
            )}
          </div>

          {!pwMode ? (
            <div className="flex items-center gap-3 text-charcoal/50 text-xs">
              <div className="w-8 h-8 rounded-lg bg-navy/5 flex items-center justify-center">
                <Lock size={14} className="text-charcoal/40" />
              </div>
              كلمة المرور محمية — اضغط "تغيير" لتعديلها
            </div>
          ) : (
            <form onSubmit={handlePwSave} className="space-y-4">
              <div>
                <label className="text-xs text-charcoal/55 font-semibold block mb-1.5">
                  كلمة المرور الجديدة <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Lock size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/30" />
                  <input name="password" type={showPw ? 'text' : 'password'} value={pwForm.password}
                    onChange={onPwChange} placeholder="8 أحرف على الأقل" required
                    className="input-field pr-8 pl-10 text-sm" />
                  <button type="button" onClick={() => setShowPw(s => !s)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/35 hover:text-navy transition-colors">
                    {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {pwForm.password && (
                  <div className="mt-2">
                    <div className="flex gap-1">
                      {[1,2,3,4].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-all ${pwStr >= i ? PW_COLORS[pwStr] : 'bg-navy/10'}`} />
                      ))}
                    </div>
                    <p className={`text-[10px] mt-1 ${pwStr <= 1 ? 'text-red-500' : pwStr <= 2 ? 'text-amber-500' : 'text-green-600'}`}>
                      {PW_LABELS[pwStr]}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs text-charcoal/55 font-semibold block mb-1.5">
                  تأكيد كلمة المرور <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Lock size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/30" />
                  <input name="confirm" type={showPw ? 'text' : 'password'} value={pwForm.confirm}
                    onChange={onPwChange} placeholder="أعد كتابة كلمة المرور" required
                    className={`input-field pr-8 text-sm ${pwForm.confirm && pwForm.confirm !== pwForm.password ? 'border-red-300' : ''}`} />
                </div>
                {pwForm.confirm && pwForm.confirm !== pwForm.password && (
                  <p className="text-red-500 text-[10px] mt-1">كلمتا المرور غير متطابقتين</p>
                )}
              </div>

              {pwError && (
                <div className="flex items-start gap-2 text-red-600 text-xs bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                  <AlertCircle size={13} className="mt-0.5 shrink-0" /> {pwError}
                </div>
              )}

              <div className="flex gap-2">
                <button type="button" onClick={() => { setPwMode(false); setPwError(''); setPwForm({ password: '', confirm: '' }); }}
                  className="flex-1 py-2.5 border border-navy/15 text-charcoal/60 rounded-xl text-xs font-semibold hover:text-navy transition-colors">
                  إلغاء
                </button>
                <button type="submit" disabled={pwSaving}
                  className="flex-1 btn-cta flex items-center justify-center gap-2 py-2.5 text-xs font-bold disabled:opacity-60">
                  {pwSaving
                    ? <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    : <><CheckCircle size={12} /> حفظ كلمة المرور</>}
                </button>
              </div>
            </form>
          )}
        </motion.div>

        {/* ── Logout ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.17 }}
        >
          <button onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-red-200 text-red-600 hover:bg-red-50 text-sm font-bold transition-colors">
            <LogOut size={15} /> تسجيل الخروج
          </button>
        </motion.div>
      </div>
    </div>
  );
}

// ── Read-only role summary ────────────────────────────────────────────────────
function RoleFieldsReadOnly({ role, user }) {
  const fields = [];

  if (role === 'owner') {
    if (user?.province)         fields.push({ icon: MapPin,    label: 'المحافظة',      val: user.province });
    if (user?.syrian_id_number) fields.push({ icon: Shield,    label: 'الرقم الوطني',  val: user.syrian_id_number });
  }
  if (role === 'investor') {
    if (user?.country_of_residence) fields.push({ icon: Globe,     label: 'بلد الإقامة',   val: user.country_of_residence });
    if (user?.investment_range)     fields.push({ icon: Briefcase, label: 'نطاق الميزانية', val: user.investment_range });
  }
  if (role === 'engineer') {
    if (user?.specialty)               fields.push({ icon: Briefcase, label: 'التخصص',         val: user.specialty });
    if (user?.professional_license_no) fields.push({ icon: Shield,    label: 'رقم الترخيص',    val: user.professional_license_no });
    if (user?.syndicate_city)          fields.push({ icon: MapPin,    label: 'النقابة',         val: user.syndicate_city });
  }
  if (role === 'developer' || role === 'contractor') {
    if (user?.company_name)           fields.push({ icon: Building2, label: 'اسم الشركة',       val: user.company_name });
    if (user?.commercial_register_no) fields.push({ icon: Shield,    label: 'السجل التجاري',    val: user.commercial_register_no });
    if (role === 'developer' && user?.company_city)      fields.push({ icon: MapPin, label: 'مدينة الشركة', val: user.company_city });
    if (role === 'contractor' && user?.contractor_specialty) fields.push({ icon: Briefcase, label: 'التخصص', val: user.contractor_specialty });
  }
  if (role === 'internal_clerk') {
    if (user?.department)  fields.push({ icon: Briefcase, label: 'القسم / الإدارة', val: user.department });
    if (user?.employee_id) fields.push({ icon: Shield,    label: 'الرقم الوظيفي',   val: user.employee_id });
  }
  if (role === 'admin') {
    fields.push({ icon: Shield, label: 'مستوى الصلاحية', val: 'مدير النظام' });
  }

  if (!fields.length) return null;

  return (
    <div className="pt-3 border-t border-navy/8 space-y-3">
      {fields.map(({ icon: Icon, label, val }) => (
        <div key={label} className="flex items-center justify-between">
          <span className="text-charcoal/45 text-xs flex items-center gap-1.5">
            <Icon size={11} /> {label}
          </span>
          <span className="text-navy text-xs font-medium">{val}</span>
        </div>
      ))}
    </div>
  );
}
