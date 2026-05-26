import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Search } from 'lucide-react';
import { SYRIA_GOVERNORATES, SYRIA_CITIES } from '../../data/syriaLocations';

// Shared input styling — matches the project's input-field appearance
const INPUT =
  'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm ' +
  'focus:outline-none focus:ring-1 focus:ring-brand/30 focus:border-brand ' +
  'bg-white text-navy placeholder-charcoal/40 transition-colors';

// ─────────────────────────────────────────────────────────────────────────────
// SyriaLocationSelector
//
// Props:
//   value             { governorate, city, neighborhood }
//   onChange(patch)   called with updated value object
//   required          marks governorate as required
//   showNeighborhood  show the third free-text field (default true)
//   compact           reduces vertical spacing for tight layouts
//   className         extra wrapper classes
// ─────────────────────────────────────────────────────────────────────────────
export default function SyriaLocationSelector({
  value = {},
  onChange,
  required = false,
  showNeighborhood = true,
  compact = false,
  className = '',
}) {
  const { governorate = '', city = '', neighborhood = '' } = value;

  const [query, setQuery]         = useState(city);
  const [open, setOpen]           = useState(false);
  const wrapRef                   = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Keep query in sync when city is changed externally (e.g. form reset)
  useEffect(() => { setQuery(city); }, [city]);

  const update = (patch) =>
    onChange?.({ governorate, city, neighborhood, ...patch });

  const handleGovernorate = (gov) => {
    setQuery('');
    onChange?.({ governorate: gov, city: '', neighborhood });
  };

  const handleQuery = (q) => {
    setQuery(q);
    setOpen(true);
    if (!q) update({ city: '' });
  };

  const pickCity = (c) => {
    setQuery(c);
    setOpen(false);
    update({ city: c });
  };

  const clearCity = () => {
    setQuery('');
    update({ city: '' });
    setOpen(false);
  };

  // Cities to show: filter by query within the selected governorate
  const suggestions = governorate && SYRIA_CITIES[governorate]
    ? SYRIA_CITIES[governorate]
        .filter((c) => !query || c.includes(query))
        .slice(0, 12)
    : [];

  const gap = compact ? 'space-y-2' : 'space-y-3';

  return (
    <div className={`${gap} ${className}`} dir="rtl">

      {/* ── Level 1: Governorate ── */}
      <div>
        <label className="text-charcoal/60 text-xs mb-1 block">
          المحافظة {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          <select
            value={governorate}
            onChange={(e) => handleGovernorate(e.target.value)}
            className={`${INPUT} appearance-none cursor-pointer`}
            required={required}
          >
            <option value="">— اختر المحافظة —</option>
            {SYRIA_GOVERNORATES.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40 pointer-events-none"
          />
        </div>
      </div>

      {/* ── Level 2: City / District (autocomplete) ── */}
      <div ref={wrapRef} className="relative">
        <label className="text-charcoal/60 text-xs mb-1 block">
          المدينة / المنطقة
        </label>
        <div className="relative">
          <Search
            size={13}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/30 pointer-events-none"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => handleQuery(e.target.value)}
            onFocus={() => governorate && setOpen(true)}
            placeholder={
              governorate
                ? `ابحث في ${governorate}…`
                : 'اختر المحافظة أولاً'
            }
            disabled={!governorate}
            className={`${INPUT} pr-8 ${
              !governorate ? 'opacity-40 cursor-not-allowed' : ''
            }`}
          />
          {query && (
            <button
              type="button"
              onClick={clearCity}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40 hover:text-charcoal transition-colors"
              tabIndex={-1}
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Suggestions dropdown */}
        {open && suggestions.length > 0 && (
          <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-auto max-h-48 text-sm">
            {suggestions.map((c) => (
              <li
                key={c}
                onMouseDown={() => pickCity(c)}
                className={`px-3 py-2 cursor-pointer hover:bg-brand/5 transition-colors ${
                  c === city
                    ? 'bg-brand/8 text-navy font-semibold'
                    : 'text-charcoal'
                }`}
              >
                {c}
              </li>
            ))}
          </ul>
        )}

        {/* No results hint */}
        {open && governorate && query && suggestions.length === 0 && (
          <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-xs text-charcoal/50">
            لا توجد نتائج — يمكنك كتابة الاسم في حقل الحي أدناه
          </div>
        )}
      </div>

      {/* ── Level 3: Neighborhood / Street (free text) ── */}
      {showNeighborhood && (
        <div>
          <label className="text-charcoal/60 text-xs mb-1 block">
            الحي / الشارع
          </label>
          <input
            type="text"
            value={neighborhood}
            onChange={(e) => update({ neighborhood: e.target.value })}
            placeholder="اسم الحي، الشارع، علامة مميزة…"
            className={INPUT}
          />
        </div>
      )}
    </div>
  );
}
