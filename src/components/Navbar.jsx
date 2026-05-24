import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, LogOut, PlusCircle, HardHat, Crown, Scale,
  Search, LayoutDashboard, User, Shield, Zap, ZapOff
} from 'lucide-react';
import { useAuth, ROLES } from '../context/AuthContext';
import { useGlobalData } from '../context/GlobalContext';
import toast from 'react-hot-toast';
import NotificationsPanel from './NotificationsPanel';

// ── Brand logo mark ───────────────────────────────────────────────────────────
function LogoMark({ size = 32 }) {
  const h = Math.round(size * (185 / 300));
  return (
    <svg width={size} height={h} viewBox="0 0 300 185" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path fill="#5979bb" d="M167.13,106.06l-7.07,9.63-5.41-10.48-.03-.06-4.62-8.94-4.62,8.94-.03.06-5.41,10.48-7.07-9.63c.14-.28.27-.56.39-.84.11-.24.22-.48.32-.72,3.12-7.19,4.85-15.12,4.85-23.45,0-2.52-.16-5.01-.47-7.44,4.38-1.83,8.43-4.29,12.03-7.29,3.61,2.99,7.66,5.46,12.03,7.29-.31,2.43-.47,4.92-.47,7.44,0,8.33,1.73,16.27,4.85,23.45.1.24.21.49.32.72.12.29.26.56.39.84ZM157.38,119.35l-7.38,10.06-7.38-10.06,7.31-14.14h.13l7.31,14.14ZM300,27.89c-6.94,9.73-14.81,18.77-23.48,26.96l-35.24-19.04c.7-1.36,1.31-2.77,1.83-4.23.15-.43.3-.88.44-1.32.24-.78.46-1.57.65-2.38h56.8ZM273.77,57.41c-.65.59-1.3,1.18-1.96,1.75-6.75,5.96-13.95,11.43-21.52,16.37l-29.64-20.48c.46-.71.88-1.43,1.29-2.16,6.88-2.5,12.76-7.09,16.88-12.99.23-.33.45-.66.67-1l34.28,18.51ZM247.01,77.61c-5.26,3.27-10.7,6.28-16.3,9.01l-19.97-20.31c2.95-2.44,5.6-5.24,7.89-8.31l28.38,19.62ZM216.08,54.47c-7.86,11.27-20.92,18.64-35.7,18.64-5.13,0-10.04-.88-14.6-2.51.61-3.25,1.51-6.41,2.67-9.43,2.55.59,5.21.9,7.94.9,8.83,0,16.91-3.25,23.09-8.61,3.28,1.02,6.78,1.56,10.4,1.56,2.12,0,4.19-.18,6.21-.55ZM173.29,150.15l-23.29,31.56-23.29-31.56,4.35-8.42,18.94,25.83,18.94-25.83,4.35,8.42ZM167.04,138.06l-17.04,23.23-17.04-23.23,7.44-14.38,9.6,13.1,9.6-13.1,7.44,14.38ZM172.03,47.5c-1.48,2.13-2.83,4.37-4.01,6.7-3.58-1.28-6.87-3.17-9.74-5.54-3.4-2.8-6.23-6.27-8.28-10.21-2.05,3.94-4.88,7.41-8.28,10.21-2.87,2.36-6.16,4.25-9.74,5.54-1.19-2.33-2.53-4.57-4.01-6.7.21-.11.43-.23.64-.35,6.82-3.94,11.62-11.01,12.4-19.25.36-3.67-.56-6.35-1.13-7.67-.37-.86-3.46-7.79-9.32-8.13-1.97-.12-3.59.55-4.53,1.05.17-1.63.69-3.99,2.44-5.84,5.1-3.56,14.55-2.64,21.07-2.33,8.47.69,12.24,1.7,16.81-.66,2.46-1.27,4.13-2.99,5.19-4.3-.07,1.41-.44,4.82-2.87,8.14-3.2,4.38-7.76,5.54-8.99,5.81-.42,1.8-.8,3.88-1,6.19-.27,2.93-.03,5.55.16,7.75h0c.78,8.24,5.75,15.32,12.57,19.25.21.12.42.24.64.35ZM0,27.89c6.94,9.73,14.81,18.77,23.48,26.96l35.24-19.04c-.7-1.36-1.31-2.77-1.83-4.23-.15-.43-.3-.88-.44-1.32-.24-.78-.46-1.57-.65-2.38H0ZM26.23,57.41c.65.59,1.3,1.18,1.96,1.75,6.75,5.96,13.95,11.43,21.52,16.37l29.64-20.48c-.46-.71-.88-1.43-1.29-2.16-6.88-2.5-12.76-7.09-16.88-12.99-.23-.33-.45-.66-.67-1L26.23,57.41ZM52.99,77.61c5.26,3.27,10.7,6.28,16.3,9.01l19.97-20.31c-2.95-2.44-5.6-5.24-7.89-8.31L52.99,77.61ZM83.92,54.47c7.86,11.27,20.92,18.64,35.7,18.64,5.13,0,10.04-.88,14.6-2.51-.61-3.25-1.51-6.41-2.67-9.43-2.55.59-5.21.9-7.94.9-8.83,0-16.91-3.25-23.09-8.61-3.28,1.02-6.78,1.56-10.4,1.56-2.12,0-4.19-.18-6.21-.55Z"/>
    </svg>
  );
}

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
];

const SESSION_FILTERS_KEY = 'resurgo-filters-session';

// ── Universal Search ──────────────────────────────────────────────────────────
function UniversalSearch() {
  const [query, setQuery] = useState('');
  const [open, setOpen]   = useState(false);
  const navigate          = useNavigate();
  const { properties }    = useGlobalData();
  const inputRef          = useRef(null);
  const wrapRef           = useRef(null);

  const propResults = query.length > 1
    ? properties.filter(p =>
        p.title.includes(query) || p.city.includes(query) || p.district?.includes(query)
      ).slice(0, 4)
    : [];

  useEffect(() => {
    const h = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // `/` keyboard shortcut — focus search
  useEffect(() => {
    const handler = (e) => {
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (e.key === 'Escape') { setOpen(false); inputRef.current?.blur(); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const go = (to) => { navigate(to); setQuery(''); setOpen(false); };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && query.trim()) {
      const filters = { city: 'all', type: 'all', status: 'all', minPrice: '', maxPrice: '', search: query.trim() };
      try { sessionStorage.setItem(SESSION_FILTERS_KEY, JSON.stringify(filters)); } catch {}
      go('/properties');
    }
  };

  return (
    <div ref={wrapRef} className="relative hidden lg:block shrink-0">
      <div className={`flex items-center gap-2 bg-cream border rounded-xl px-3 py-2 transition-all duration-200 ${open ? 'border-brand w-48' : 'border-navy/15 w-36'}`}>
        <Search size={13} className="text-charcoal/40 shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="ابحث في المنصة..."
          className="bg-transparent text-navy text-xs placeholder-charcoal/40 focus:outline-none w-full"
        />
        {query ? (
          <button onClick={() => { setQuery(''); inputRef.current?.focus(); }} className="text-charcoal/30 hover:text-navy shrink-0 transition-colors">
            <X size={11} />
          </button>
        ) : (
          <kbd className="hidden sm:flex items-center text-[9px] text-charcoal/30 font-mono bg-navy/5 border border-navy/10 rounded px-1 py-0.5 shrink-0">/</kbd>
        )}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.14 }}
            className="absolute top-full mt-2 right-0 min-w-[280px] bg-white py-2 z-50 shadow-xl rounded-lg"
            dir="rtl"
          >
            {propResults.length > 0 ? (
              <>
                <p className="text-charcoal/50 text-[10px] px-3 py-1.5 font-semibold uppercase tracking-wider">عقارات</p>
                {propResults.map(p => (
                  <button key={p.id} onClick={() => go(`/properties/${p.id}`)}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-cream transition-colors text-right">
                    <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0">
                      <img src={p.images?.[0] ?? p.image} alt="" className="w-full h-full object-cover" loading="lazy" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-navy text-xs font-medium truncate">{p.title}</p>
                      <p className="text-charcoal/50 text-[10px]">{p.city} · {p.priceDisplay}</p>
                    </div>
                  </button>
                ))}
                <div className="border-t border-navy/8 mt-1 pt-1">
                  <button onClick={() => { handleKeyDown({ key: 'Enter' }); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-brand text-xs hover:bg-cream transition-colors">
                    <Search size={11} /> عرض كل نتائج "{query}"
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-charcoal/50 text-[10px] px-3 py-1.5 font-semibold uppercase tracking-wider">تصفح المنصة</p>
                {NAV_LINKS.slice(1).map(({ label, to }) => (
                  <button key={to} onClick={() => go(to)}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-cream transition-colors text-right">
                    <span className="text-navy text-xs">{label}</span>
                  </button>
                ))}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

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
  const navigate         = useNavigate();
  const location         = useLocation();
  const [open, setOpen]  = useState(false);

  useEffect(() => {
    if (location.state?.accessDenied) {
      const roleLabel = ROLES[location.state.requiredRole]?.label || 'مخصصة';
      toast.error(`هذه الصفحة مخصصة لحسابات ${roleLabel} فقط`, { duration: 4000 });
    }
  }, [location.state]);

  const handleLogout = () => { logout(); navigate('/'); };
  const isActive = (to) => to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-navy/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[62px] gap-3" dir="rtl">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="transition-transform duration-200 group-hover:scale-[1.04]">
              <LogoMark size={30} />
            </div>
            <span className="font-display text-[21px] tracking-[0.06em] text-navy group-hover:text-brand transition-colors duration-200 leading-none pt-0.5">
              RESURGO
            </span>
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

          {/* Search — xl+ only to give room for nav links on lg */}
          <UniversalSearch />

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
              <div className="flex items-center gap-2">
                <Link to="/auth" className="text-charcoal hover:text-navy text-xs font-medium transition-colors px-2.5 py-1.5">
                  دخول
                </Link>
                <Link to="/auth?tab=register" className="btn-cta text-xs py-1.5 px-3">
                  إنشاء حساب
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
    </nav>
  );
}
