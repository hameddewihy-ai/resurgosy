
import SEO from '../../components/SEO';







function pwStrength(pw) {
  let s = 0;
  if (pw.length >= 8)           s++;
  if (/[A-Z]/.test(pw))        s++;
  if (/[0-9]/.test(pw))        s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}
const PW_LABELS = ['', 'ضعيفة', 'مقبولة', 'جيدة', 'قوية'];
const PW_COLORS = ['', 'bg-red-400', 'bg-amber-400', 'bg-blue-400', 'bg-green-500'];

export default function ResetPasswordPage() {
  const { updatePassword, resetPassword } = useAuth();

  const [password,   setPassword]   = useState('');
  const [confirm,    setConfirm]    = useState('');
  const [showPw,     setShowPw]     = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [done,       setDone]       = useState(false);
  const [error,      setError]      = useState('');
  const [reEmail,    setReEmail]    = useState('');
  const [reLoading,  setReLoading]  = useState(false);
  const [reSent,     setReSent]     = useState(false);
  // Whether we have a valid recovery session from the email link
  const [hasSession, setHasSession] = useState(!isConfigured);
  // Brief wait before showing "invalid link" — PASSWORD_RECOVERY fires async
  const [waiting, setWaiting] = useState(isConfigured);

  useEffect(() => {
    if (!isConfigured) return;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setHasSession(true);
        setWaiting(false);
      }
    });
    // If PASSWORD_RECOVERY doesn't fire within 4s, show the resend form
    const t = setTimeout(() => setWaiting(false), 4000);
    return () => { subscription.unsubscribe(); clearTimeout(t); };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) { setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل'); return; }
    if (password !== confirm) { setError('كلمتا المرور غير متطابقتين'); return; }

    setLoading(true);
    try {
      await updatePassword(password);
      setDone(true);
    } catch (err) {
      setError(err.message || 'حدث خطأ، يرجى المحاولة مجدداً');
    } finally { setLoading(false); }
  };

  const handleResend = async (e) => {
    e.preventDefault();
    if (!reEmail.trim()) return;
    setReLoading(true);
    try {
      await resetPassword(reEmail.trim());
      setReSent(true);
      toast.success('تم إرسال رابط جديد — تحقق من بريدك');
    } catch (err) {
      toast.error(err.message || 'تعذّر إرسال الرابط');
    } finally { setReLoading(false); }
  };

  const str = pwStrength(password);

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-16 pt-[78px]" dir="rtl">
      <SEO title="إعادة كلمة المرور" noindex />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-brand flex items-center justify-center">
              <span className="text-white font-black text-base">R</span>
            </div>
            <span className="text-xl font-black text-navy">RESURGO</span>
          </Link>
        </div>

        <div className="bg-white p-7 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
          {waiting ? (
            /* ── Waiting for PASSWORD_RECOVERY event ── */
            <div className="py-10 flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-brand/20 border-t-brand rounded-full animate-spin" />
              <p className="text-charcoal/55 text-sm">جاري التحقق من الرابط...</p>
            </div>
          ) : done ? (
            /* ── Success state ── */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <div className="w-16 h-16 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-500" />
              </div>
              <p className="text-navy font-black text-lg mb-2">تم تغيير كلمة المرور!</p>
              <p className="text-charcoal/55 text-sm mb-5">يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.</p>
              <Link to="/auth" className="btn-cta inline-flex items-center gap-2 text-sm px-6 py-2.5">
                تسجيل الدخول <ArrowLeft size={14} />
              </Link>
            </motion.div>
          ) : !hasSession ? (
            /* ── No valid recovery session — resend form ── */
            <div className="py-2">
              <div className="text-center mb-5">
                <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-3">
                  <AlertCircle size={26} className="text-amber-500" />
                </div>
                <p className="text-navy font-bold text-base mb-1">الرابط غير صالح أو منتهي الصلاحية</p>
                <p className="text-charcoal/50 text-xs leading-relaxed">
                  أدخل بريدك الإلكتروني لإرسال رابط جديد.
                </p>
              </div>
              {reSent ? (
                <div className="text-center">
                  <p className="text-green-600 text-sm font-semibold mb-4">✓ تم إرسال الرابط — تحقق من بريدك</p>
                  <Link to="/auth" className="text-brand text-xs font-bold hover:underline">
                    العودة لتسجيل الدخول
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleResend} className="space-y-3">
                  <div>
                    <label className="text-xs text-charcoal/60 font-semibold block mb-1.5">البريد الإلكتروني</label>
                    <input
                      type="email" value={reEmail} onChange={e => setReEmail(e.target.value)}
                      placeholder="ahmed@example.com" required
                      className="input-field text-sm"
                    />
                  </div>
                  <button type="submit" disabled={reLoading}
                    className="btn-cta w-full flex items-center justify-center gap-2 py-2.5 text-sm font-bold disabled:opacity-60">
                    {reLoading
                      ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      : 'إرسال رابط جديد'}
                  </button>
                  <Link to="/auth" className="block text-center text-charcoal/45 text-xs hover:text-brand transition-colors">
                    العودة لتسجيل الدخول
                  </Link>
                </form>
              )}
            </div>
          ) : (
            /* ── Reset form ── */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="mb-2">
                <p className="text-navy font-black text-lg mb-1">تعيين كلمة مرور جديدة</p>
                <p className="text-charcoal/55 text-xs">اختر كلمة مرور قوية لحماية حسابك</p>
              </div>

              {/* New password */}
              <div>
                <label className="text-xs text-charcoal/60 font-semibold block mb-1.5">
                  كلمة المرور الجديدة <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Lock size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/35" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="8 أحرف على الأقل"
                    required
                    className="input-field pr-9 pl-10 text-sm"
                  />
                  <button type="button" onClick={() => setShowPw(s => !s)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/35 hover:text-navy transition-colors">
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {password && (
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

              {/* Confirm password */}
              <div>
                <label className="text-xs text-charcoal/60 font-semibold block mb-1.5">
                  تأكيد كلمة المرور <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Lock size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/35" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="أعد كتابة كلمة المرور"
                    required
                    className={`input-field pr-9 text-sm ${confirm && confirm !== password ? 'border-red-300 focus:border-red-400' : ''}`}
                  />
                </div>
                {confirm && confirm !== password && (
                  <p className="text-red-500 text-[10px] mt-1">كلمتا المرور غير متطابقتين</p>
                )}
                {confirm && confirm === password && password.length >= 8 && (
                  <p className="text-green-600 text-[10px] mt-1 flex items-center gap-1">
                    <CheckCircle size={10} /> كلمتا المرور متطابقتان
                  </p>
                )}
              </div>

              {error && (
                <div className="flex items-start gap-2 text-red-600 text-xs bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                  <AlertCircle size={13} className="mt-0.5 shrink-0" /> {error}
                </div>
              )}

              <button type="submit" disabled={loading || (confirm && confirm !== password)}
                className="btn-cta w-full flex items-center justify-center gap-2 py-3 text-sm font-bold mt-2 disabled:opacity-60">
                {loading
                  ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  : <><CheckCircle size={14} /> حفظ كلمة المرور الجديدة</>}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
