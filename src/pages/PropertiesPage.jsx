import { useState, useMemo, useEffect, useRef, memo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Search, Grid3X3, BadgeCheck,
  SlidersHorizontal, X, ChevronDown, Home, ArrowUpDown, Map,
  Heart, MessageCircle, Bookmark, BookmarkCheck, Trash2, Check,
  Bell, BellOff, ChevronLeft, ChevronRight as ChevronRightIcon,
  Sparkles as SparklesIcon, FileSearch, GitCompare,
} from 'lucide-react';
import MapContainer from '../components/ui/MapContainer';
import { CITIES, TYPES, SUBTYPES } from '../data/properties';
import { useGlobalData } from '../context/GlobalContext';
import { useAuth } from '../context/AuthContext';
import { supabase, isConfigured } from '../lib/supabase';
import { isSavedProp, toggleSavedProp } from '../utils/savedProps';
import toast from 'react-hot-toast';
import PageHero from '../components/PageHero';
import SEO from '../components/SEO';
import CompareDrawer from '../components/ui/CompareDrawer';
import EmptyState from '../components/ui/EmptyState';
import LazyImage from '../components/ui/LazyImage';
import SponsorCard from '../components/ui/SponsorCard';

const SESSION_FILTERS_KEY = 'resurgo-filters-session';

// ── Saved search helpers ──────────────────────────────────────────────────────
const LS_KEY       = 'resurgo-saved-searches';
const LS_ALERTS    = 'resurgo-search-alerts';

function useSavedSearches() {
  const { user } = useAuth();
  const useDb = isConfigured && !!user;

  const [saves,  setSaves]  = useState([]);
  const [alerts, setAlerts] = useState({});

  // Load on mount and whenever login state changes
  useEffect(() => {
    if (useDb) {
      supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'saved_search')
        .eq('active', true)
        .order('created_at', { ascending: false })
        .then(({ data }) => {
          if (!data) return;
          setSaves(data.map(r => ({ id: r.id, name: r.name, filters: r.payload?.filters ?? {} })));
          const alertMap = {};
          data.forEach(r => { if (r.payload?.alertEnabled) alertMap[r.id] = true; });
          setAlerts(alertMap);
        });
    } else {
      try { setSaves(JSON.parse(localStorage.getItem(LS_KEY)   || '[]')); } catch { setSaves([]); }
      try { setAlerts(JSON.parse(localStorage.getItem(LS_ALERTS) || '{}')); } catch { setAlerts({}); }
    }
  }, [useDb, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = async (filters, name) => {
    if (saves.length >= 5) {
      toast('وصلت للحد الأقصى (5 بحوثات). سيُحذف الأقدم تلقائياً.', { icon: '⚠️', duration: 3500 });
    }
    if (useDb) {
      if (saves.length >= 5) {
        const oldest = saves[saves.length - 1];
        await supabase.from('user_preferences').delete().eq('id', oldest.id);
        setSaves(prev => prev.slice(0, prev.length - 1));
      }
      const { data } = await supabase.from('user_preferences').insert({
        user_id: user.id, type: 'saved_search', name,
        payload: { filters, alertEnabled: false }, active: true,
      }).select().single();
      if (data) setSaves(prev => [{ id: data.id, name: data.name, filters }, ...prev].slice(0, 5));
    } else {
      const next = [{ id: Date.now(), name, filters }, ...saves].slice(0, 5);
      setSaves(next);
      localStorage.setItem(LS_KEY, JSON.stringify(next));
    }
  };

  const remove = async (id) => {
    setSaves(prev => prev.filter(s => s.id !== id));
    setAlerts(prev => { const n = { ...prev }; delete n[id]; return n; });
    if (useDb) {
      await supabase.from('user_preferences').delete().eq('id', id).eq('user_id', user.id);
    } else {
      const next = saves.filter(s => s.id !== id);
      localStorage.setItem(LS_KEY, JSON.stringify(next));
      const nextAlerts = { ...alerts }; delete nextAlerts[id];
      localStorage.setItem(LS_ALERTS, JSON.stringify(nextAlerts));
    }
  };

  const toggleAlert = async (id) => {
    const newVal = !alerts[id];
    setAlerts(prev => ({ ...prev, [id]: newVal }));
    if (useDb) {
      const pref = saves.find(s => s.id === id);
      if (pref) {
        await supabase.from('user_preferences').update({
          payload: { filters: pref.filters, alertEnabled: newVal },
        }).eq('id', id);
      }
    } else {
      localStorage.setItem(LS_ALERTS, JSON.stringify({ ...alerts, [id]: newVal }));
    }
    return newVal;
  };

  return { saves, save, remove, alerts, toggleAlert };
}

function describeFilters(f) {
  const parts = [];
  if (f.cities?.length)   parts.push(f.cities.join('، '));
  if (f.type    !== 'all') parts.push(f.type);
  if (f.subtype !== 'all') parts.push(f.subtype);
  if (f.status  !== 'all') parts.push(f.status);
  if (f.furnished === true)  parts.push('مفروش');
  if (f.furnished === false && f.furnished !== null) parts.push('غير مفروش');
  if (f.minBaths > 0) parts.push(`${f.minBaths}+ حمامات`);
  if (f.minPrice) parts.push(`من ${Number(f.minPrice).toLocaleString()} $`);
  if (f.maxPrice) parts.push(`إلى ${Number(f.maxPrice).toLocaleString()} $`);
  if (f.minArea)  parts.push(`مساحة من ${f.minArea} م²`);
  if (f.maxArea)  parts.push(`مساحة إلى ${f.maxArea} م²`);
  if (f.search)   parts.push(`"${f.search}"`);
  return parts.length ? parts.join(' · ') : 'جميع العقارات';
}

// ── Skeleton card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white overflow-hidden animate-pulse" style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(31,42,56,0.06)' }}>
      <div className="h-60 bg-navy/6" />
      <div className="p-4 space-y-2.5">
        <div className="h-3 bg-navy/8 rounded-full w-3/4" />
        <div className="h-2.5 bg-navy/5 rounded-full w-1/2" />
      </div>
    </div>
  );
}

// ── Filter Sidebar ────────────────────────────────────────────────────────────
function FilterSidebar({ filters, setFilter, onReset, applyFilters, savedSearches, onSaveSearch, onDeleteSavedSearch, alerts, onToggleAlert }) {
  const [savingMode, setSavingMode] = useState(false);
  const [saveName,   setSaveName]   = useState('');
  const [showSaved,  setShowSaved]  = useState(true);
  const { sponsorships = [], incrementSponsorshipClicks } = useGlobalData();
  const activeSponsor = sponsorships.find(s => s.type === 'properties' && s.active);

  const handleSave = () => {
    const name = saveName.trim() || describeFilters(filters);
    onSaveSearch(filters, name);
    setSavingMode(false);
    setSaveName('');
    toast.success('تم حفظ البحث الحالي');
  };

  return (
    <aside className="w-72 shrink-0 space-y-5">
      <div className="bg-white border border-navy/[0.08] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-navy font-bold text-sm">تصفية النتائج</p>
          <button onClick={onReset} className="text-xs text-brand hover:text-navy transition-colors flex items-center gap-1">
            <X size={12} /> إعادة تعيين
          </button>
        </div>

        {/* Status */}
        <div className="mb-5">
          <p className="text-charcoal/50 text-xs font-semibold mb-2 uppercase tracking-wider">الحالة</p>
          <div className="grid grid-cols-3 gap-1.5">
            {[['all', 'الكل'], ['للبيع', 'للبيع'], ['للإيجار', 'للإيجار']].map(([v, l]) => (
              <button key={v} onClick={() => setFilter('status', v)}
                className={`py-1.5 text-xs rounded-lg border font-medium transition-all ${filters.status === v ? 'bg-brand border-brand text-white' : 'border-navy/15 text-charcoal/60 hover:border-brand/40 hover:text-brand'}`}>
                {l}
              </button>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setFilter('showAVM', !filters.showAVM)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border transition-all text-xs font-bold ${filters.showAVM ? 'border-brand bg-brand/5 text-navy' : 'border-navy/15 bg-white text-charcoal/60'}`}
            >
              <SparklesIcon size={13} className={filters.showAVM ? 'text-brand' : ''} />
              تقييم آلي
            </button>
            <button
              onClick={() => setFilter('verifiedOnly', !filters.verifiedOnly)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border transition-all text-xs font-bold ${filters.verifiedOnly ? 'border-green-500 bg-green-50 text-green-700' : 'border-navy/15 bg-white text-charcoal/60'}`}
            >
              <BadgeCheck size={13} className={filters.verifiedOnly ? 'text-green-500' : ''} />
              موثّق فقط
            </button>
          </div>
        </div>

        {/* Cities multiselect */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-charcoal/50 text-xs font-semibold uppercase tracking-wider">المحافظة</p>
            {filters.cities.length > 0 && (
              <button onClick={() => setFilter('cities', [])} className="text-[10px] text-brand hover:underline">
                مسح ({filters.cities.length})
              </button>
            )}
          </div>
          <div className="max-h-40 overflow-y-auto space-y-1 pl-0.5">
            {CITIES.map(c => {
              const checked = filters.cities.includes(c);
              return (
                <label key={c} className="flex items-center gap-2 cursor-pointer group py-0.5">
                  <input type="checkbox" checked={checked} readOnly
                    onClick={() => setFilter('cities', checked ? filters.cities.filter(x => x !== c) : [...filters.cities, c])}
                    className="w-3.5 h-3.5 accent-brand cursor-pointer" />
                  <span className={`text-xs transition-colors ${checked ? 'text-navy font-semibold' : 'text-charcoal/60 group-hover:text-navy'}`}>{c}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Type */}
        <div className="mb-5">
          <p className="text-charcoal/50 text-xs font-semibold mb-2 uppercase tracking-wider">نوع العقار</p>
          <div className="grid grid-cols-2 gap-1.5">
            {[['all', 'الكل'], ...TYPES.map(t => [t, t])].map(([v, l]) => (
              <button key={v} onClick={() => setFilter('type', v)}
                className={`py-1.5 text-xs rounded-lg border font-medium transition-all ${filters.type === v ? 'bg-brand border-brand text-white' : 'border-navy/15 text-charcoal/60 hover:border-brand/40 hover:text-brand'}`}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Subtype */}
        <div className="mb-5">
          <p className="text-charcoal/50 text-xs font-semibold mb-2 uppercase tracking-wider">النوع الفرعي</p>
          <div className="grid grid-cols-2 gap-1.5">
            {[['all', 'الكل'], ...SUBTYPES.map(s => [s, s])].map(([v, l]) => (
              <button key={v} onClick={() => setFilter('subtype', v)}
                className={`py-1.5 text-xs rounded-lg border font-medium transition-all truncate ${filters.subtype === v ? 'bg-brand border-brand text-white' : 'border-navy/15 text-charcoal/60 hover:border-brand/40 hover:text-brand'}`}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Furnished */}
        <div className="mb-5">
          <p className="text-charcoal/50 text-xs font-semibold mb-2 uppercase tracking-wider">التأثيث</p>
          <div className="grid grid-cols-3 gap-1.5">
            {[[null, 'الكل'], [true, 'مفروش'], [false, 'غير مفروش']].map(([v, l]) => (
              <button key={String(v)} onClick={() => setFilter('furnished', v)}
                className={`py-1.5 text-xs rounded-lg border font-medium transition-all ${filters.furnished === v ? 'bg-brand border-brand text-white' : 'border-navy/15 text-charcoal/60 hover:border-brand/40 hover:text-brand'}`}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Rooms */}
        <div className="mb-5">
          <p className="text-charcoal/50 text-xs font-semibold mb-2 uppercase tracking-wider">غرف النوم (الحد الأدنى)</p>
          <div className="grid grid-cols-5 gap-1">
            {[[0, 'الكل'], [1, '1+'], [2, '2+'], [3, '3+'], [4, '4+']].map(([v, l]) => (
              <button key={v} onClick={() => setFilter('minRooms', v)}
                className={`py-1.5 text-xs rounded-lg border font-medium transition-all ${filters.minRooms === v ? 'bg-brand border-brand text-white' : 'border-navy/15 text-charcoal/60 hover:border-brand/40 hover:text-brand'}`}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Bathrooms */}
        <div className="mb-5">
          <p className="text-charcoal/50 text-xs font-semibold mb-2 uppercase tracking-wider">الحمامات (الحد الأدنى)</p>
          <div className="grid grid-cols-4 gap-1">
            {[[0, 'الكل'], [1, '1+'], [2, '2+'], [3, '3+']].map(([v, l]) => (
              <button key={v} onClick={() => setFilter('minBaths', v)}
                className={`py-1.5 text-xs rounded-lg border font-medium transition-all ${filters.minBaths === v ? 'bg-brand border-brand text-white' : 'border-navy/15 text-charcoal/60 hover:border-brand/40 hover:text-brand'}`}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Price range */}
        <div className="mb-4">
          <p className="text-charcoal/50 text-xs font-semibold mb-2 uppercase tracking-wider">نطاق السعر ($)</p>
          <div className="grid grid-cols-2 gap-1 mb-2">
            {[['< 50K', '', '50000'], ['50–100K', '50000', '100000'], ['100–200K', '100000', '200000'], ['200K+', '200000', '']].map(([l, mn, mx]) => {
              const active = filters.minPrice === mn && filters.maxPrice === mx;
              return (
                <button key={l} onClick={() => { setFilter('minPrice', mn); setTimeout(() => setFilter('maxPrice', mx), 0); }}
                  className={`py-1 text-[10px] rounded-lg border font-medium transition-all ${active ? 'bg-brand border-brand text-white' : 'border-navy/15 text-charcoal/60 hover:border-brand/40 hover:text-brand'}`}>
                  {l}
                </button>
              );
            })}
          </div>
          <div className="flex gap-2">
            <input type="number" placeholder="من" value={filters.minPrice}
              onChange={e => setFilter('minPrice', e.target.value)}
              className="w-1/2 input-field text-xs py-2" />
            <input type="number" placeholder="إلى" value={filters.maxPrice}
              onChange={e => setFilter('maxPrice', e.target.value)}
              className="w-1/2 input-field text-xs py-2" />
          </div>
        </div>

        {/* Area range */}
        <div className="mb-4">
          <p className="text-charcoal/50 text-xs font-semibold mb-2 uppercase tracking-wider">المساحة (م²)</p>
          <div className="flex gap-2">
            <input type="number" placeholder="من" value={filters.minArea}
              onChange={e => setFilter('minArea', e.target.value)}
              className="w-1/2 input-field text-xs py-2" />
            <input type="number" placeholder="إلى" value={filters.maxArea}
              onChange={e => setFilter('maxArea', e.target.value)}
              className="w-1/2 input-field text-xs py-2" />
          </div>
        </div>

        {/* Save search */}
        <div className="pt-4 border-t border-navy/[0.07]">
          {savingMode ? (
            <div className="space-y-2">
              <input
                value={saveName}
                onChange={e => setSaveName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSave()}
                placeholder={describeFilters(filters)}
                className="w-full input-field text-xs py-2"
                dir="rtl"
                autoFocus
              />
              <div className="flex gap-2">
                <button onClick={handleSave}
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs bg-brand text-white py-2 rounded-xl hover:bg-brand/90 transition-colors font-medium">
                  <Check size={12} /> حفظ
                </button>
                <button onClick={() => { setSavingMode(false); setSaveName(''); }}
                  className="px-3 text-xs border border-navy/15 text-charcoal/60 rounded-xl hover:text-navy transition-colors">
                  إلغاء
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setSavingMode(true)}
              className="w-full flex items-center justify-center gap-1.5 text-xs border border-navy/15 text-charcoal/60 hover:text-brand hover:border-brand/30 py-2 rounded-xl transition-colors">
              <Bookmark size={12} /> حفظ البحث الحالي
            </button>
          )}
        </div>
      </div>

      {/* Saved searches */}
      {savedSearches.length > 0 && (
        <div className="bg-white border border-navy/[0.08] rounded-xl p-4">
          <button onClick={() => setShowSaved(s => !s)}
            className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookmarkCheck size={14} className="text-brand" />
              <p className="text-charcoal/50 text-xs font-semibold uppercase tracking-wider">
                البحث المحفوظ ({savedSearches.length})
              </p>
            </div>
            <ChevronDown size={14} className={`text-charcoal/40 transition-transform duration-200 ${showSaved ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence initial={false}>
            {showSaved && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden">
                <div className="mt-3 space-y-1">
                  {savedSearches.map(s => (
                    <div key={s.id}
                      className="flex items-center gap-2 py-2 border-b border-navy/[0.06] last:border-0">
                      <div className="flex-1 min-w-0">
                        <p className="text-navy text-xs font-semibold truncate">{s.name}</p>
                        <p className="text-charcoal/40 text-[10px] truncate mt-0.5">{describeFilters(s.filters)}</p>
                      </div>
                      <button onClick={() => applyFilters(s.filters)}
                        className="text-[10px] text-brand hover:text-navy border border-brand/30 hover:border-navy/20 px-2 py-1 rounded-lg transition-colors shrink-0 font-medium">
                        تطبيق
                      </button>
                      <button
                        onClick={() => {
                          const on = onToggleAlert(s.id);
                          toast(on ? '✉️ سيتم إشعارك بالعقارات الجديدة' : 'تم إلغاء إشعار البريد');
                        }}
                        title={alerts?.[s.id] ? 'إلغاء إشعار البريد' : 'تفعيل إشعار البريد'}
                        aria-label={alerts?.[s.id] ? 'إلغاء إشعار البريد الإلكتروني' : 'تفعيل إشعار البريد الإلكتروني'}
                        aria-pressed={!!alerts?.[s.id]}
                        className={`transition-colors shrink-0 ${alerts?.[s.id] ? 'text-brand' : 'text-charcoal/25 hover:text-brand'}`}>
                        {alerts?.[s.id] ? <Bell size={11} /> : <BellOff size={11} />}
                      </button>
                      <button onClick={() => onDeleteSavedSearch(s.id)}
                        className="text-charcoal/30 hover:text-red-500 transition-colors shrink-0">
                        <Trash2 size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Quick links */}
      <div className="bg-white border border-navy/[0.08] rounded-xl p-4">
        <p className="text-charcoal/50 text-xs font-semibold mb-3 uppercase tracking-wider">بحث سريع</p>
        <div className="space-y-1">
          {[
            ['شقق دمشق للبيع', { cities: ['دمشق'], type: 'سكني', status: 'للبيع' }],
            ['عقارات موثّقة فقط', { verifiedOnly: true }],
            ['تجاري للإيجار', { type: 'تجاري', status: 'للإيجار' }],
            ['أراضي سكنية', { type: 'أرض', status: 'all' }],
            ['شقق حلب', { cities: ['حلب'], type: 'سكني' }],
            ['مع تقييم آلي', { showAVM: true }],
          ].map(([label, preset]) => (
            <button key={label}
              onClick={() => applyFilters({ ...filters, ...preset })}
              className="w-full text-right text-xs text-charcoal/60 hover:text-brand py-1.5 transition-colors flex items-center gap-2">
              <span className="w-1 h-1 bg-brand rounded-full shrink-0" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <SponsorCard
        sponsor={activeSponsor}
        onClick={() => incrementSponsorshipClicks?.(activeSponsor.id)}
      />
    </aside>
  );
}

// ── Property type accent colors ───────────────────────────────────────────────
const TYPE_COLORS = {
  'سكني':   '#5979bb',
  'تجاري':  '#f37124',
  'أرض':    '#10b981',
  'صناعي':  '#f59e0b',
  'زراعي':  '#059669',
  'مستودع': '#64748b',
  'فندقي':  '#7c3aed',
};

// ── Property Card (Grid) ───────────────────────────────────────────────────────
const PropertyCard = memo(function PropertyCard({ property, index, onHover, onCompare, inCompare, featured = false }) {
  const [saved, setSaved] = useState(() => isSavedProp(property.id));
  const [isHovered, setIsHovered] = useState(false);

  const toggleSave = (e) => {
    e.preventDefault();
    const { added } = toggleSavedProp(property.id);
    setSaved(added);
    toast(added ? 'تم الحفظ في المفضّلة ❤️' : 'تم الإزالة من المحفوظات');
  };

  const openWhatsApp = (e) => {
    e.preventDefault();
    toast.success('جارٍ فتح واتساب...');
    const phone = property.ownerPhone?.replace(/\D/g, '') || '';
    const text  = encodeURIComponent(`أودّ الاستفسار عن العقار: ${property.title} — ${property.priceDisplay}`);
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        className="bg-white group overflow-hidden relative"
        style={{
          borderRadius: '8px',
          boxShadow: isHovered ? '0 16px 48px rgba(31,42,56,0.14)' : '0 2px 8px rgba(31,42,56,0.06)',
          transition: 'box-shadow 0.35s ease',
        }}
        onMouseEnter={() => { onHover?.(property.id); setIsHovered(true); }}
        onMouseLeave={() => { onHover?.(null); setIsHovered(false); }}
      >
        {/* Top type color bar — 3px horizontal */}
        <div className="absolute top-0 inset-x-0 h-[3px] z-10"
          style={{ background: TYPE_COLORS[property.type] ?? '#5979bb' }} />

        {/* Image */}
        <Link to={`/properties/${property.id}`} className={`block relative overflow-hidden ${featured ? 'h-72 sm:h-80' : 'h-60'}`}>
          <LazyImage src={property.images[0]} alt={property.title}
            className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1f2a38]/80 via-[#1f2a38]/10 to-transparent" />

          {/* Status badge — sharp corners */}
          <span
            className={`absolute top-4 right-4 text-[11px] px-2.5 py-1 font-bold tracking-wide ${property.status === 'للبيع' ? 'bg-[#1f2a38] text-white' : 'bg-white text-[#1f2a38]'}`}
            style={{ borderRadius: '3px' }}
          >{property.status}</span>

          {/* Verified badge */}
          {property.verified && (
            <span className="absolute top-4 left-4 flex items-center gap-1 text-[10px] bg-white/90 text-green-700 px-2 py-0.5 font-bold"
              style={{ borderRadius: '3px' }}>
              <BadgeCheck size={10} /> موثّق
            </span>
          )}

          {/* Price overlaid at bottom */}
          <div className="absolute bottom-0 inset-x-0 px-4 pb-4 z-10">
            <p className="text-white font-black text-2xl drop-shadow-lg">{property.priceDisplay}</p>
          </div>

          {/* Hover action overlay */}
          <motion.div
            initial={false}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 8 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-14 left-4 flex gap-1.5 z-20"
          >
            <button onClick={openWhatsApp}
              aria-label={`تواصل مع مالك ${property.title} عبر واتساب`}
              className="flex items-center gap-1 text-[11px] bg-[#25D366] hover:bg-[#20bb5a] text-white px-2.5 py-1.5 font-bold transition-colors"
              style={{ borderRadius: '4px' }}>
              <MessageCircle size={11} /> واتساب
            </button>
            <button onClick={(e) => { e.preventDefault(); onCompare?.(property); }}
              aria-label={inCompare ? 'إزالة من المقارنة' : 'أضف للمقارنة'}
              aria-pressed={inCompare}
              className={`w-8 h-8 flex items-center justify-center transition-colors ${inCompare ? 'bg-brand text-white' : 'bg-white/90 text-navy hover:bg-white'}`}
              style={{ borderRadius: '4px' }}>
              <GitCompare size={13} />
            </button>
            <button onClick={toggleSave}
              aria-label={saved ? 'إزالة من المفضلة' : 'أضف إلى المفضلة'}
              aria-pressed={saved}
              className={`w-8 h-8 flex items-center justify-center transition-colors ${saved ? 'bg-red-500 text-white' : 'bg-white/90 text-navy hover:bg-white'}`}
              style={{ borderRadius: '4px' }}>
              <Heart size={13} className={saved ? 'fill-white' : ''} />
            </button>
          </motion.div>
        </Link>

        {/* Minimal info */}
        <Link to={`/properties/${property.id}`} className="block px-4 pt-3 pb-4">
          <h3 className="text-navy font-bold text-sm leading-snug truncate group-hover:text-brand transition-colors duration-200 mb-1">{property.title}</h3>
          <p className="text-navy/40 text-xs flex items-center gap-1 truncate">
            <MapPin size={9} className="shrink-0" />
            {property.city}{property.district && ` · ${property.district}`}
            {(property.rooms > 0 || property.baths > 0) && (
              <span className="mr-auto shrink-0">
                {property.rooms > 0 && `${property.rooms} غرف`}
                {property.rooms > 0 && property.baths > 0 && ' · '}
                {property.baths > 0 && `${property.baths} حمام`}
              </span>
            )}
          </p>
        </Link>
      </div>
    </motion.div>
  );
});

// ── Pagination component ──────────────────────────────────────────────────────
function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visible = pages.filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1);

  return (
    <div className="flex items-center justify-center gap-1.5 mt-8 flex-wrap" dir="ltr">
      <button onClick={() => onChange(page - 1)} disabled={page === 1}
        className="w-9 h-9 flex items-center justify-center rounded-xl border border-navy/15 text-charcoal/50 hover:border-brand/40 hover:text-brand transition-all disabled:opacity-30 disabled:cursor-not-allowed">
        <ChevronLeft size={15} />
      </button>

      {visible.flatMap((p, i) => {
        const items = [];
        if (i > 0 && visible[i - 1] !== p - 1) {
          items.push(<span key={`ellipsis-${p}`} className="text-charcoal/30 text-sm px-1">…</span>);
        }
        items.push(
          <button key={p} onClick={() => onChange(p)}
            className={`w-9 h-9 flex items-center justify-center rounded-xl border text-sm font-bold transition-all ${p === page ? 'bg-brand border-brand text-white' : 'border-navy/15 text-charcoal/60 hover:border-brand/40 hover:text-brand'}`}>
            {p}
          </button>
        );
        return items;
      })}

      <button onClick={() => onChange(page + 1)} disabled={page === totalPages}
        className="w-9 h-9 flex items-center justify-center rounded-xl border border-navy/15 text-charcoal/50 hover:border-brand/40 hover:text-brand transition-all disabled:opacity-30 disabled:cursor-not-allowed">
        <ChevronRightIcon size={15} />
      </button>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
const INIT_FILTERS = { cities: [], type: 'all', subtype: 'all', status: 'all', furnished: null, minPrice: '', maxPrice: '', minArea: '', maxArea: '', search: '', minRooms: 0, minBaths: 0, verifiedOnly: false, showAVM: false, mapBounds: null };
const PAGE_SIZE = 12;

function loadSessionFilters() {
  try {
    const stored = JSON.parse(sessionStorage.getItem(SESSION_FILTERS_KEY) || 'null');
    return stored ? { ...INIT_FILTERS, ...stored } : INIT_FILTERS;
  } catch { return INIT_FILTERS; }
}

export default function PropertiesPage() {
  const { properties, propertiesLoading } = useGlobalData();
  const [filters, setFilters] = useState(loadSessionFilters);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'map'
  const [sort, setSort] = useState('newest');
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [activePropertyId, setActivePropertyId] = useState(null);
  const [infiniteScroll, setInfiniteScroll] = useState(false);
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);
  const [pendingMapBounds, setPendingMapBounds] = useState(null);
  const sentinelRef = useRef(null);
  const { saves, save, remove, alerts, toggleAlert } = useSavedSearches();

  // ── Compare state ──────────────────────────────────────────────────────────
  const [compareList, setCompareList] = useState([]); // array of property objects, max 2
  const [compareOpen, setCompareOpen] = useState(false);

  const toggleCompare = (property) => {
    setCompareList(prev => {
      if (prev.find(p => p.id === property.id)) return prev.filter(p => p.id !== property.id);
      if (prev.length >= 2) { toast('يمكن مقارنة عقارَين فقط في آنٍ واحد'); return prev; }
      return [...prev, property];
    });
  };
  const removeFromCompare = (id) => setCompareList(prev => prev.filter(p => p.id !== id));

  const setFilter = (key, val) => {
    setLoading(true);
    setPage(1);
    setFilters(prev => {
      const next = { ...prev, [key]: val };
      try { sessionStorage.setItem(SESSION_FILTERS_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
    setTimeout(() => setLoading(false), 400);
  };

  const applyFilters = (newFilters) => {
    setLoading(true);
    setPage(1);
    setFilters(prev => {
      const next = { ...prev, ...newFilters };
      try { sessionStorage.setItem(SESSION_FILTERS_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
    setTimeout(() => setLoading(false), 400);
  };

  const resetFilters = () => {
    setFilters(INIT_FILTERS);
    setLoading(false);
    setPage(1);
    setPendingMapBounds(null);
    try { sessionStorage.removeItem(SESSION_FILTERS_KEY); } catch {}
  };

  const filtered = useMemo(() => {
    let r = properties;
    if (filters.search) {
      const q = filters.search.trim();
      r = r.filter(p =>
        p.title.includes(q) || p.city.includes(q) || p.district.includes(q) ||
        p.desc?.includes(q) || p.tags?.some(t => t.includes(q))
      );
    }
    if (filters.cities.length > 0)     r = r.filter(p => filters.cities.includes(p.city));
    if (filters.type !== 'all')        r = r.filter(p => p.type === filters.type);
    if (filters.subtype !== 'all')     r = r.filter(p => p.subtype === filters.subtype);
    if (filters.furnished !== null)    r = r.filter(p => p.furnished === filters.furnished);
    if (filters.status !== 'all')      r = r.filter(p => p.status === filters.status);
    if (filters.minPrice)              r = r.filter(p => p.price >= Number(filters.minPrice));
    if (filters.maxPrice)              r = r.filter(p => p.price <= Number(filters.maxPrice));
    if (filters.minArea)               r = r.filter(p => p.area >= Number(filters.minArea));
    if (filters.maxArea)               r = r.filter(p => p.area <= Number(filters.maxArea));
    if (filters.minRooms > 0)          r = r.filter(p => (p.rooms ?? 0) >= filters.minRooms);
    if (filters.minBaths > 0)          r = r.filter(p => (p.baths ?? 0) >= filters.minBaths);
    if (filters.verifiedOnly)          r = r.filter(p => p.verified);
    if (filters.showAVM)               r = r.filter(p => p.avm != null);
    if (filters.mapBounds) {
      const { north, south, east, west } = filters.mapBounds;
      r = r.filter(p => p.location?.lat >= south && p.location?.lat <= north && p.location?.lng >= west && p.location?.lng <= east);
    }
    if (sort === 'price-asc')  return [...r].sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') return [...r].sort((a, b) => b.price - a.price);
    if (sort === 'area')       return [...r].sort((a, b) => b.area - a.area);
    if (sort === 'rating')     return [...r].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    return r;
  }, [filters, sort, properties]);

  useEffect(() => { setDisplayCount(PAGE_SIZE); }, [filtered, sort]);

  useEffect(() => {
    if (!infiniteScroll || !sentinelRef.current) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && displayCount < filtered.length) {
        setDisplayCount(c => c + PAGE_SIZE);
      }
    }, { threshold: 0.1 });
    obs.observe(sentinelRef.current);
    return () => obs.disconnect();
  }, [infiniteScroll, displayCount, filtered.length]);

  const activeCount = Object.entries(filters).filter(([k, v]) =>
    k !== 'search' &&
    k !== 'cities' &&
    v !== 'all' && v !== '' && v !== false && v !== 0 && v !== null
  ).length + (filters.cities.length > 0 ? 1 : 0);
  const totalPages  = Math.ceil(filtered.length / PAGE_SIZE);
  const paged       = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="min-h-screen bg-[#f2f1ee]" dir="rtl">
      <SEO
        title="العقارات"
        description="تصفح آلاف العقارات للبيع والإيجار في جميع محافظات سوريا"
        path="/properties"
      />

      <PageHero
        num="01"
        eyebrow="سوق العقارات السوري"
        title={<h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-[1.4]">{propertiesLoading ? '...' : properties.length}+ عقار<br /><span className="text-brand">موثّق ومحقّق.</span></h1>}
        subtitle="آلاف العقارات في كل المحافظات السورية — موثّقة ومفحوصة وأسعارها شفافة"
        bgImage="/syria-hero.jpg"
        breadcrumb={[{ label: 'الرئيسية', to: '/' }, { label: 'العقارات' }]}
        stats={[
          { value: propertiesLoading ? '...' : `${properties.length}+`, label: 'عقار مسجّل' },
          { value: '14', label: 'محافظة سورية', color: 'text-brand' },
          { value: '98%', label: 'دقة التقييم', color: 'text-emerald-400' },
          { value: 'IVS 2025', label: 'معيار التقييم', color: 'text-amber-400' },
        ]}
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50" />
            <input
              placeholder="ابحث بالاسم أو المنطقة أو المدينة..."
              value={filters.search}
              onChange={e => setFilter('search', e.target.value)}
              className="w-full bg-white/10 border border-white/15 rounded-xl pr-9 pl-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-brand/60"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {[['all', 'الكل'], ['سكني', 'سكني'], ['تجاري', 'تجاري'], ['أرض', 'أرض']].map(([v, l]) => (
              <button key={v} onClick={() => setFilter('type', v)}
                className={`px-3 py-2 rounded-xl border text-xs font-medium transition-all ${filters.type === v ? 'bg-brand border-brand text-white' : 'border-white/15 text-white/70 hover:border-white/40 hover:text-white'}`}>
                {l}
              </button>
            ))}
            {[['للبيع', 'للبيع'], ['للإيجار', 'للإيجار']].map(([v, l]) => (
              <button key={v} onClick={() => setFilter('status', filters.status === v ? 'all' : v)}
                className={`px-3 py-2 rounded-xl border text-xs font-medium transition-all ${filters.status === v ? 'bg-cta border-cta text-white' : 'border-white/15 text-white/70 hover:border-white/40 hover:text-white'}`}>
                {l}
              </button>
            ))}
          </div>
        </div>
      </PageHero>

      {/* Transition strip */}
      <div className="bg-[#161f2b]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between" dir="rtl">
          <p className="text-white/25 text-[10px] font-black tracking-[0.35em] uppercase">نتائج البحث</p>
          <p className="text-white/40 text-[11px] tabular-nums">
            <span className="text-white font-bold">{filtered.length}</span> عقار متاح
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">

          {/* Sidebar — desktop */}
          <div className="hidden lg:block">
            <FilterSidebar
              filters={filters} setFilter={setFilter} onReset={resetFilters} applyFilters={applyFilters}
              savedSearches={saves} onSaveSearch={save} onDeleteSavedSearch={remove}
              alerts={alerts} onToggleAlert={toggleAlert}
            />
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-display text-3xl font-black text-navy tabular-nums leading-none">{filtered.length}</span>
                  <span className="text-charcoal/50 text-sm">نتيجة</span>
                  {activeCount > 0 && <span className="text-charcoal/40 text-xs">({activeCount} فلتر)</span>}
                </div>
                {activeCount > 0 && (
                  <button onClick={resetFilters}
                    className="flex items-center gap-1 text-[11px] text-red-500 hover:text-red-700 border border-red-200 hover:border-red-300 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg transition-all font-semibold">
                    <X size={11} /> مسح الفلاتر
                  </button>
                )}
                <button onClick={() => setMobileSidebar(true)}
                  className="lg:hidden flex items-center gap-1.5 text-xs border border-navy/15 text-charcoal/60 hover:text-navy px-3 py-1.5 rounded-lg transition-colors">
                  <SlidersHorizontal size={13} />
                  فلترة {activeCount > 0 && <span className="bg-brand text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">{activeCount}</span>}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <select value={sort} onChange={e => setSort(e.target.value)}
                    className="bg-white border border-navy/15 rounded-xl pr-3 pl-8 py-2 text-xs text-navy appearance-none focus:outline-none focus:border-brand cursor-pointer">
                    <option value="newest">الأحدث</option>
                    <option value="price-asc">السعر: تصاعدي</option>
                    <option value="price-desc">السعر: تنازلي</option>
                    <option value="area">المساحة</option>
                    <option value="rating">الأعلى تقييماً</option>
                  </select>
                  <ArrowUpDown size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-charcoal/40 pointer-events-none" />
                </div>
                <button
                  onClick={() => setInfiniteScroll(s => !s)}
                  title={infiniteScroll ? 'التبديل إلى ترقيم الصفحات' : 'التبديل إلى التحميل التلقائي'}
                  className={`px-3 py-2 rounded-xl border text-xs font-medium transition-all ${infiniteScroll ? 'bg-brand/10 border-brand/30 text-brand' : 'border-navy/15 text-charcoal/50 hover:text-navy'}`}>
                  {infiniteScroll ? '∞ تلقائي' : '📄 صفحات'}
                </button>
                <div className="flex border border-navy/15 rounded-xl overflow-hidden bg-white">
                  {[['grid', Grid3X3, 'البطاقات'], ['map', Map, 'الخريطة']].map(([mode, Icon, title]) => (
                    <button key={mode} onClick={() => setViewMode(mode)} title={title}
                      className={`px-3 py-2 transition-colors ${viewMode === mode ? 'bg-brand text-white' : 'text-charcoal/50 hover:text-navy'}`}>
                      <Icon size={15} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results count label */}
            {viewMode === 'grid' && !loading && filtered.length > 0 && (
              <p className="text-charcoal/45 text-xs mb-3">
                {infiniteScroll ? (
                  <>عرض <span className="font-bold text-navy">{Math.min(displayCount, filtered.length)}</span> من <span className="font-bold text-navy">{filtered.length}</span> نتيجة</>
                ) : totalPages > 1 ? (
                  <>عرض <span className="font-bold text-navy">{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)}</span> من <span className="font-bold text-navy">{filtered.length}</span> نتيجة</>
                ) : null}
              </p>
            )}

            {/* View container */}
            <div className={`mt-5 ${viewMode === 'map' ? 'flex flex-col lg:flex-row gap-5' : ''}`}>
              {/* Properties List */}
              <div className={viewMode === 'map' ? 'lg:w-1/2 xl:w-[60%] order-2 lg:order-1' : 'w-full'}>
                <AnimatePresence mode="popLayout">
                  {loading || propertiesLoading ? (
                    <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className={`grid gap-5 ${viewMode === 'map' ? 'sm:grid-cols-2' : 'sm:grid-cols-2 xl:grid-cols-3'}`}>
                      {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
                    </motion.div>
                  ) : filtered.length === 0 ? (
                    <EmptyState
                      key="empty"
                      icon={Home}
                      title="لا توجد عقارات مطابقة"
                      desc="لم نعثر على عقارات تطابق معايير البحث الحالية. جرّب تعديل الفلاتر أو توسيع نطاق البحث."
                      actionLabel="إعادة تعيين الفلاتر"
                      onAction={resetFilters}
                    />
                  ) : (
                    <motion.div key="grid" className={`grid gap-5 ${viewMode === 'map' ? 'sm:grid-cols-2' : 'sm:grid-cols-2 xl:grid-cols-3'}`}>
                      {(infiniteScroll ? filtered.slice(0, displayCount) : paged).map((p, i) => {
                        const isFeatured = viewMode !== 'map' && i === 0;
                        return (
                          <div key={p.id} className={isFeatured ? 'sm:col-span-2 xl:col-span-2' : ''}>
                            <PropertyCard property={p} index={i} featured={isFeatured}
                              onHover={setActivePropertyId}
                              onCompare={toggleCompare} inCompare={!!compareList.find(c => c.id === p.id)} />
                          </div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Infinite scroll sentinel */}
                {infiniteScroll && !loading && displayCount < filtered.length && (
                  <div ref={sentinelRef} className="flex justify-center py-8">
                    <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                {infiniteScroll && !loading && displayCount >= filtered.length && filtered.length > PAGE_SIZE && (
                  <p className="text-center text-charcoal/40 text-xs py-6">تم عرض جميع النتائج ({filtered.length})</p>
                )}

                {/* Pagination */}
                {!infiniteScroll && !loading && (
                  <Pagination page={page} totalPages={totalPages} onChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
                )}
              </div>

              {/* Map view */}
              {viewMode === 'map' && (
                <div className="lg:w-1/2 xl:w-[40%] order-1 lg:order-2">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[400px] lg:h-[calc(100vh-200px)] lg:sticky lg:top-24 w-full rounded-2xl overflow-hidden border border-navy/10 relative">
                    <MapContainer
                      properties={filtered}
                      activePropertyId={activePropertyId}
                      onBoundsChange={setPendingMapBounds}
                    />
                    {/* Search in this area overlay */}
                    {pendingMapBounds && (
                      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] flex gap-2">
                        <button
                          onClick={() => { setFilter('mapBounds', pendingMapBounds); setPendingMapBounds(null); }}
                          className="flex items-center gap-1.5 bg-white shadow-lg border border-navy/15 text-navy text-xs font-bold px-4 py-2 rounded-full hover:bg-brand hover:text-white hover:border-brand transition-all">
                          🔍 ابحث في هذه المنطقة
                        </button>
                        {filters.mapBounds && (
                          <button
                            onClick={() => { setFilter('mapBounds', null); setPendingMapBounds(null); }}
                            className="flex items-center gap-1 bg-white shadow-lg border border-red-200 text-red-500 text-xs font-medium px-3 py-2 rounded-full hover:bg-red-50 transition-all">
                            <X size={12} /> إلغاء فلتر الخريطة
                          </button>
                        )}
                      </div>
                    )}
                    {!pendingMapBounds && filters.mapBounds && (
                      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000]">
                        <button
                          onClick={() => setFilter('mapBounds', null)}
                          className="flex items-center gap-1 bg-white shadow-lg border border-red-200 text-red-500 text-xs font-medium px-3 py-2 rounded-full hover:bg-red-50 transition-all">
                          <X size={12} /> إلغاء فلتر الخريطة
                        </button>
                      </div>
                    )}
                  </motion.div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Valuation cross-link — dark section */}
      <div className="bg-[#1f2a38] mt-8" dir="rtl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Link to="/valuation" className="flex items-center gap-5 group">
            <div className="w-14 h-14 bg-brand/20 flex items-center justify-center shrink-0 group-hover:bg-brand/30 transition-colors"
              style={{ borderRadius: '6px' }}>
              <FileSearch size={24} className="text-brand" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-base flex items-center gap-2 mb-1">
                هل تمتلك عقاراً؟ احصل على تقييم رسمي معتمد
                <span className="text-[10px] bg-green-500/20 border border-green-500/30 text-green-400 font-bold px-2 py-0.5 hidden sm:inline"
                  style={{ borderRadius: '3px' }}>مجاني</span>
              </p>
              <p className="text-white/40 text-sm">شارة "عقار موثوق" ترفع مبيعاتك 3× — خبراء MRICS، دفع Escrow مضمون</p>
            </div>
            <div className="shrink-0 w-10 h-10 border border-white/15 flex items-center justify-center group-hover:border-brand group-hover:bg-brand/10 transition-all"
              style={{ borderRadius: '6px' }}>
              <ChevronRightIcon size={18} className="text-white/40 group-hover:text-brand transition-colors" />
            </div>
          </Link>
        </div>
      </div>

      {/* ── Compare floating bar ── */}
      <AnimatePresence>
        {compareList.length > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 bg-navy text-white px-5 py-3 rounded-2xl shadow-2xl border border-white/10"
            dir="rtl"
          >
            <div className="flex items-center gap-2">
              {compareList.map(p => (
                <div key={p.id} className="flex items-center gap-1.5 bg-white/10 rounded-xl px-2.5 py-1.5">
                  <span className="text-xs font-medium max-w-[100px] truncate">{p.title}</span>
                  <button onClick={() => removeFromCompare(p.id)} className="text-white/50 hover:text-white">
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => setCompareOpen(true)}
              disabled={compareList.length < 2}
              className="flex items-center gap-1.5 bg-brand hover:bg-brand/90 disabled:opacity-40 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors">
              <GitCompare size={13} /> قارن الآن
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Compare Drawer ── */}
      <CompareDrawer
        properties={compareList}
        open={compareOpen}
        onClose={() => setCompareOpen(false)}
        onRemove={removeFromCompare}
        onClear={() => { setCompareList([]); setCompareOpen(false); }}
      />

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileSidebar && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-navy/40 z-40 lg:hidden backdrop-blur-sm"
              onClick={() => setMobileSidebar(false)} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed top-0 right-0 bottom-0 w-full sm:w-80 bg-white z-50 overflow-y-auto p-5 border-l border-navy/10 lg:hidden" dir="rtl">
              <div className="flex items-center justify-between mb-5">
                <p className="text-navy font-bold">الفلتر</p>
                <button onClick={() => setMobileSidebar(false)} aria-label="إغلاق الفلتر"
                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-navy/5 hover:bg-navy/10 text-charcoal/60 hover:text-navy transition-colors">
                  <X size={18} />
                </button>
              </div>
              <FilterSidebar
                filters={filters} setFilter={setFilter} onReset={resetFilters} applyFilters={applyFilters}
                savedSearches={saves} onSaveSearch={save} onDeleteSavedSearch={remove}
                alerts={alerts} onToggleAlert={toggleAlert}
              />
              <button onClick={() => setMobileSidebar(false)}
                className="w-full btn-cta mt-5 flex items-center justify-center gap-2">
                عرض {filtered.length} نتيجة
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
