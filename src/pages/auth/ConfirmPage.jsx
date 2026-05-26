import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ROLE_REDIRECTS = {
  seeker:         '/properties',
  owner:          '/owner/add-property',
  investor:       '/investor/vip',
  engineer:       '/engineer/dashboard',
  developer:      '/developer/dashboard',
  finishing_co:   '/finishing/company-dashboard',
  contractor:     '/contractor/dashboard',
  internal_clerk: '/clearing/dashboard',
  appraiser:      '/valuation/appraiser-dashboard',
  admin:          '/admin/dashboard',
};

export default function ConfirmPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (user) {
      navigate(ROLE_REDIRECTS[user.role] || '/dashboard', { replace: true });
      return;
    }
    if (loading) return;

    // Auth loaded but no user yet — wait for onAuthStateChange SIGNED_IN event
    const t = setTimeout(() => setExpired(true), 6000);
    return () => clearTimeout(t);
  }, [user, loading, navigate]);

  if (expired) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-cream px-6 text-center" dir="rtl">
        <div className="w-16 h-16 rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center mx-auto">
          <span className="text-red-500 text-2xl">✕</span>
        </div>
        <p className="text-navy font-black text-lg">رابط التفعيل غير صالح</p>
        <p className="text-charcoal/55 text-sm max-w-xs leading-relaxed">
          انتهت صلاحية رابط التفعيل أو تم استخدامه مسبقاً. يرجى تسجيل الدخول أو إنشاء حساب جديد.
        </p>
        <button
          onClick={() => navigate('/auth', { replace: true })}
          className="btn-cta px-8 py-2.5 text-sm font-bold mt-2"
        >
          تسجيل الدخول
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-cream" dir="rtl">
      <div className="w-12 h-12 border-4 border-brand/20 border-t-brand rounded-full animate-spin" />
      <p className="text-navy font-black text-lg">جاري تفعيل حسابك...</p>
      <p className="text-charcoal/50 text-sm">لحظة واحدة</p>
    </div>
  );
}
