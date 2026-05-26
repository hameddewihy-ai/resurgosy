import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, LogOut, PlusCircle, HardHat, Crown, Scale,
  Search, LayoutDashboard, User, Shield, Zap, ZapOff,
  LogIn, UserPlus
} from 'lucide-react';
import { useAuth, ROLES } from '../context/AuthContext';
import { useGlobalData } from '../context/GlobalContext';
import toast from 'react-hot-toast';
import NotificationsPanel from './NotificationsPanel';
import GlobalSearchModal from './GlobalSearchModal';


// ── Navigation links — all sections, no dropdown ──────────────────────────────
const NAV_LINKS = [
  { to: '/',                  label: 'الرئيسية'    },
  { to: '/properties',        label: 'العقارات'    },
  { to: '/invest',            label: 'الاستثمار'   },
  { to: '/jobs',              label: 'التوظيف'     },
  { to: '/developers',        label: 'المطورون'    },
  { to: '/crowdfund',         label: 'تمويل جماعي' },
  { to: '/equipment',         label: 'المعدات'     },
  { to: '/finishing',         label: 'الإكساء'     },
  { to: '/studies',           label: 'الدراسات'    },
  { to: '/clearing',          label: 'التخليص'     },
  { to: '/valuation-request', label: 'التقييم'     },
  { to: '/news',              label: 'التنبيهات'   },
  { to: '/market-reports',   label: 'تقارير السوق' },
];

const SESSION_FILTERS_KEY = 'resurgo-filters-session';

// ── Mobile search with live results ──────────────────────────────────────────
function MobileSearchBar({ onClose }) {
  const [query, setQuery] = useState('');
  const navigate          = useNavigate();
  const { properties }    = useGlobalData();
  const inputRef          = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const results = query.length > 1
    ? properties.filter(p =>
        p.title.includes(query) || p.city.includes(query) || p.district?.includes(query)
      ).slice(0, 5)
    : [];

  const go = (to) => { navigate(to); setQuery(''); onClose(); };

  const handleKey = (e) => {
    if (e.key === 'Enter' && query.trim()) {
      try { sessionStorage.setItem(SESSION_FILTERS_KEY, JSON.stringify({ search: query.trim() })); } catch {}
      go('/properties');
    }
  };

  return (
    <div className="mb-3">
      <div className="flex items-center gap-2 bg-cream border border-navy/12 rounded-xl px-3 py-2.5">
        <Search size={13} className="text-charcoal/40 shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKey}
          placeholder="ابحث عن عقار أو مدينة..."
          className="bg-transparent text-navy text-sm placeholder-charcoal/40 focus:outline-none flex-1"
        />
        {query && (
          <button onClick={() => setQuery('')} className="text-charcoal/30 hover:text-navy">
            <X size={13} />
          </button>
        )}
      </div>
      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="mt-1 bg-white border border-navy/10 rounded-xl overflow-hidden shadow-lg"
          >
            {results.map(p => (
              <button key={p.id} onClick={() => go(`/properties/${p.id}`)}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-cream transition-colors text-right border-b border-navy/5 last:border-0">
                <img src={p.images?.[0] ?? p.image} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0" loading="lazy" />
                <div className="flex-1 min-w-0">
                  <p className="text-navy text-xs font-semibold truncate">{p.title}</p>
                  <p className="text-charcoal/45 text-[11px]">{p.city} · {p.priceDisplay}</p>
                </div>
              </button>
            ))}
            <button onClick={() => { try { sessionStorage.setItem(SESSION_FILTERS_KEY, JSON.stringify({ search: query })); } catch {} go('/properties'); }}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-brand text-xs hover:bg-cream transition-colors font-semibold">
              <Search size={11} /> عرض كل نتائج "{query}"
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Navbar ───────────────────────────────────────────────────────────────
export default function Navbar() {
  const { user, logout } = useAuth();
  const { lowBandwidthMode, setLowBandwidthMode } = useGlobalData();
  const navigate              = useNavigate();
  const location              = useLocation();
  const [open, setOpen]       = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    if (location.state?.accessDenied) {
      const roleLabel = ROLES[location.state.requiredRole]?.label || 'مخصصة';
      toast.error(`هذه الصفحة مخصصة لحسابات ${roleLabel} فقط`, { duration: 4000 });
    }
  }, [location.state]);

  // Ctrl+K / Cmd+K to open global search
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };
  const isActive = (to) => to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-navy/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[62px] gap-3" dir="rtl">

          {/* Logo */}
          <Link to="/" className="shrink-0 group transition-transform duration-200 group-hover:scale-[1.04]">
            <img src="/logo.svg" alt="RESURGO" height="36" className="h-9 w-auto" />
          </Link>

          {/* Desktop nav — all links visible, scrolls if needed */}
          <div className="hidden lg:block relative flex-1 min-w-0 mx-1">
            <div className="flex items-center gap-0 overflow-x-auto scrollbar-none">
              {NAV_LINKS.map(({ to, label }) => (
                <Link key={to} to={to}
                  className={`relative px-2 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap shrink-0 transition-colors duration-150 ${
                    isActive(to) ? 'text-navy bg-cream' : 'text-charcoal hover:text-navy hover:bg-cream'
                  }`}
                >
                  {label}
                  {isActive(to) && (
                    <motion.span
                      initial={{ opacity: 0, scaleX: 0.4 }}
                      animate={{ opacity: 1, scaleX: 1 }}
                      transition={{ duration: 0.2 }}
                      className="absolute inset-x-2 -bottom-px h-[2px] bg-brand rounded-full origin-center"
                    />
                  )}
                </Link>
              ))}
            </div>
            {/* Edge fade for overflow hint */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white/95 to-transparent" />
          </div>

          {/* Desktop search button */}
          <button
            onClick={() => setSearchOpen(true)}
            className="hidden lg:flex items-center gap-2 bg-cream hover:bg-navy/5 border border-navy/12 rounded-xl px-3 py-1.5 text-charcoal/50 hover:text-navy transition-colors shrink-0"
            title="بحث عالمي (Ctrl+K)"
          >
            <Search size={13} />
            <span className="text-xs">بحث...</span>
            <kbd className="text-[10px] border border-navy/12 rounded px-1 py-px font-sans leading-none text-charcoal/30">⌃K</kbd>
          </button>

          {/* Auth area */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            {/* Low-Bandwidth Toggle */}
            <button
              onClick={() => {
                setLowBandwidthMode(!lowBandwidthMode);
                toast.success(
                  !lowBandwidthMode
                    ? 'تم تفعيل نمط توفير البيانات (تسريع التصفح)'
                    : 'تم إيقاف نمط توفير البيانات'
                );
              }}
              className={`w-8 h-8 flex items-center justify-center rounded-xl border transition-all ${
                lowBandwidthMode
                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                  : 'bg-cream hover:bg-navy/5 border-navy/10 text-charcoal/40'
              }`}
              title={lowBandwidthMode ? 'إيقاف نمط توفير البيانات' : 'تفعيل نمط توفير البيانات (الإنترنت البطيء)'}
            >
              {lowBandwidthMode ? <Zap size={14} /> : <ZapOff size={14} />}
            </button>

            {user && <NotificationsPanel />}
            {user ? (
              <div className="flex items-center gap-2">
                {user.role === 'owner' && (
                  <Link to="/owner/add-property" className="flex items-center gap-1.5 text-xs btn-primary py-1.5 px-3">
                    <PlusCircle size={13} /> إضافة عقار
                  </Link>
                )}
                {user.role === 'engineer' && (
                  <Link to="/engineer/dashboard" className="flex items-center gap-1.5 text-xs btn-primary py-1.5 px-3">
                    <HardHat size={13} /> لوحة المهندس
                  </Link>
                )}
                {user.role === 'investor' && (
                  <Link to="/investor/vip"
                    className="flex items-center gap-1.5 text-xs py-1.5 px-3 rounded-xl font-semibold bg-yellow-50 border border-yellow-200 text-yellow-700 hover:border-yellow-300 transition-colors">
                    <Crown size={13} /> VIP
                  </Link>
                )}
                {(user.role === 'internal_clerk' || user.role === 'admin') && (
                  <Link to="/clearing/dashboard" className="flex items-center gap-1.5 text-xs btn-primary py-1.5 px-3">
                    <Scale size={13} /> التخليص
                  </Link>
                )}
                {(user.role === 'appraiser' || user.role === 'admin') && (
                  <Link to="/valuation/appraiser-dashboard" className="flex items-center gap-1.5 text-xs btn-primary py-1.5 px-3">
                    <Crown size={13} /> التقييم
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link to="/admin/dashboard" className="flex items-center gap-1.5 text-xs bg-red-600/10 text-red-500 border border-red-500/20 py-1.5 px-3 rounded-xl hover:bg-red-600/20 transition-all font-bold">
                    <Shield size={13} /> لوحة الإدارة
                  </Link>
                )}
                <Link to="/profile"
                  className="flex items-center gap-2 bg-cream hover:bg-navy/5 border border-navy/10 rounded-xl px-3 py-1.5 transition-colors">
                  <div className="w-5 h-5 rounded-full bg-brand flex items-center justify-center shrink-0">
                    <User size={11} className="text-white" />
                  </div>
                  <div className="text-xs leading-tight">
                    <p className="text-navy font-semibold">{user.full_name}</p>
                    <p className="text-charcoal/50">{ROLES[user.role]?.label}</p>
                  </div>
                </Link>
                <Link to="/dashboard"
                  className="w-8 h-8 flex items-center justify-center text-charcoal/40 hover:text-brand hover:bg-brand/8 rounded-lg transition-colors"
                  title="لوحة التحكم">
                  <LayoutDashboard size={15} />
                </Link>
                <button onClick={handleLogout}
                  className="w-8 h-8 flex items-center justify-center text-charcoal/40 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="تسجيل الخروج">
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Link to="/auth"
                  className="relative group w-8 h-8 flex items-center justify-center rounded-xl border border-navy/12 text-charcoal/60 hover:text-navy hover:border-navy/25 hover:bg-cream transition-all"
                  title="دخول">
                  <LogIn size={15} />
                  <span className="pointer-events-none absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-navy text-white text-[10px] px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                    دخول
                    <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-navy" />
                  </span>
                </Link>
                <Link to="/auth?tab=register"
                  className="relative group w-8 h-8 flex items-center justify-center rounded-xl bg-cta text-white hover:bg-cta/90 transition-all shadow-sm shadow-cta/25"
                  title="إنشاء حساب">
                  <UserPlus size={15} />
                  <span className="pointer-events-none absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-navy text-white text-[10px] px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                    إنشاء حساب
                    <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-navy" />
                  </span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="lg:hidden text-charcoal hover:text-navy shrink-0 p-1.5 rounded-lg hover:bg-cream transition-colors"
            onClick={() => setOpen(!open)}
            aria-label={open ? 'إغلاق القائمة' : 'فتح القائمة'}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            className="lg:hidden bg-white border-t border-navy/8 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-0.5" dir="rtl">
              {/* Mobile global search button */}
              <button
                onClick={() => { setOpen(false); setSearchOpen(true); }}
                className="flex items-center gap-2 w-full bg-cream border border-navy/12 rounded-xl px-3 py-2.5 text-charcoal/50 hover:text-navy transition-colors mb-1"
              >
                <Search size={13} />
                <span className="text-sm">بحث في الموقع...</span>
              </button>
              {/* Mobile search — live results */}
              <MobileSearchBar onClose={() => setOpen(false)} />

              {/* Low-Bandwidth Toggle */}
              <button
                onClick={() => {
                  setLowBandwidthMode(!lowBandwidthMode);
                  toast.success(
                    !lowBandwidthMode
                      ? 'تم تفعيل نمط توفير البيانات (تسريع التصفح)'
                      : 'تم إيقاف نمط توفير البيانات'
                  );
                  setOpen(false);
                }}
                className={`flex items-center gap-2.5 py-2.5 px-3 rounded-xl text-sm font-medium w-full text-right transition-colors ${
                  lowBandwidthMode ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' : 'text-charcoal hover:text-navy hover:bg-cream'
                }`}
              >
                {lowBandwidthMode ? <Zap size={14} className="text-amber-500" /> : <ZapOff size={14} />}
                <span>نمط توفير البيانات (للإنترنت الضعيف)</span>
                <span className="mr-auto text-[10px] font-bold bg-navy/5 px-2 py-0.5 rounded-full">
                  {lowBandwidthMode ? 'نشط' : 'معطل'}
                </span>
              </button>

              {/* All nav links */}
              {NAV_LINKS.map(({ to, label }) => (
                <Link key={to} to={to} onClick={() => setOpen(false)}
                  className={`flex items-center gap-2.5 py-2.5 px-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive(to) ? 'text-navy bg-cream border border-navy/10' : 'text-charcoal hover:text-navy hover:bg-cream'
                  }`}>
                  <span className={`w-1 h-1 rounded-full shrink-0 transition-all ${isActive(to) ? 'bg-brand scale-125' : 'bg-transparent'}`} />
                  {label}
                </Link>
              ))}

              <div className="pt-3 border-t border-navy/8 flex flex-col gap-2 mt-2">
                {user ? (
                  <>
                    <Link to="/profile" onClick={() => setOpen(false)}
                      className="flex items-center gap-2 text-sm text-navy bg-cream border border-navy/10 py-2.5 px-3 rounded-xl">
                      <User size={14} className="text-brand" /> {user.full_name} — {ROLES[user.role]?.label}
                    </Link>
                    <Link to="/dashboard" onClick={() => setOpen(false)}
                      className="flex items-center gap-2 text-sm text-charcoal/70 hover:text-navy py-2.5 px-3 rounded-xl hover:bg-cream transition-colors">
                      <LayoutDashboard size={14} className="text-charcoal/50" /> لوحة التحكم
                    </Link>
                    <button onClick={() => { handleLogout(); setOpen(false); }}
                      className="text-right text-red-500 text-sm py-2 px-3">
                      تسجيل الخروج
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/auth" onClick={() => setOpen(false)} className="btn-primary text-center text-sm py-2.5 block">تسجيل الدخول</Link>
                    <Link to="/auth?tab=register" onClick={() => setOpen(false)} className="btn-cta text-center text-sm py-2.5 block">إنشاء حساب</Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <GlobalSearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </nav>
  );
}
