import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGlobalData } from '../context/GlobalContext';
import SponsorCard from '../components/ui/SponsorCard';
import {
  Truck, Gauge, MapPin, Lock, Unlock, CheckCircle,
  Shield, Receipt, BadgeCheck, Wifi, Timer,
  Camera, X, Download, Building2,
  Droplet, Droplets, ChevronLeft, ChevronRight,
  PlusCircle, FileText, MessageCircle, Star, Search,
  AlertCircle, CalendarClock, Hash, Weight,
  ClipboardList, Send, BarChart3,
} from 'lucide-react';
import toast from 'react-hot-toast';
import PageHero from '../components/PageHero';
import SEO from '../components/SEO';
import EscrowCheckoutModal from '../components/wallet/EscrowCheckoutModal';
import EquipmentBookingModal from '../components/equipment/EquipmentBookingModal';
import EquipmentCompareDrawer from '../components/equipment/EquipmentCompareDrawer';
import {
  PLATFORM_FEE, VAT_RATE, WAIVER_RATE, UNIT_AR,
  CATEGORIES, CITIES_EQ,
  EQUIPMENT_SEED, ESCROW_CONTRACTS, FUND,
  getMarketEquipment,
} from '../data/equipmentData';

const CLAIMS_KEY = 'resurgo-takaful-claims';

// ── State configs ─────────────────────────────────────────────────────────────
const STATE_CFG = {
  running: { label: 'يعمل',   dot: 'bg-green-400 animate-pulse', color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
  idle:    { label: 'خامل',   dot: 'bg-amber-400',               color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  stopped: { label: 'متوقف',  dot: 'bg-navy/20',                 color: 'text-charcoal/50', bg: 'bg-cream border-navy/15' },
};

const MS_CFG = {
  released: { label: 'مُفرَج',     color: 'text-green-600',  border: 'border-green-200', bg: 'bg-green-50',  Icon: CheckCircle },
  verified: { label: 'جاهز للإفراج', color: 'text-brand',      border: 'border-brand/25',  bg: 'bg-brand/8',   Icon: BadgeCheck },
  pending:  { label: 'قيد التنفيذ',color: 'text-amber-600',  border: 'border-amber-200', bg: 'bg-amber-50',  Icon: Lock },
};

// ── Skeleton card ─────────────────────────────────────────────────────────────
function EquipmentSkeletonCard() {
  return (
    <div className="bg-white overflow-hidden animate-pulse" style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(31,42,56,0.06)' }}>
      <div className="bg-navy/6" style={{ height: 168 }} />
      <div className="p-4 space-y-2.5">
        <div className="h-3 bg-navy/8 rounded-full w-3/4" />
        <div className="h-2.5 bg-navy/5 rounded-full w-1/2" />
        <div className="h-2 bg-navy/5 rounded-full w-2/3 mt-1" />
      </div>
    </div>
  );
}

// ── TelematicsPanel ───────────────────────────────────────────────────────────
function TelematicsPanel({ t }) {
  const s = STATE_CFG[t.state];
  return (
    <div className="bg-navy rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Wifi size={11} className="text-white/30" />
          <span className="text-[10px] text-white/40 font-mono tracking-widest">ISO 15143-3</span>
        </div>
        <span className={`flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full border ${s.bg} ${s.color}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />{s.label}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white/8 rounded-xl p-2.5">
          <Timer size={12} className="text-white/40 mb-1" />
          <p className="text-white font-black text-lg leading-none">{t.engineHoursToday}<span className="text-xs font-normal text-white/50">h</span></p>
          <p className="text-white/40 text-[9px] mt-0.5">اليوم / {t.engineHoursTotal.toLocaleString()} إجمالي</p>
        </div>
        <div className="bg-white/8 rounded-xl p-2.5">
          <Gauge size={12} className="text-white/40 mb-1" />
          <p className="text-white font-black text-lg leading-none">{t.engineLoad}<span className="text-xs font-normal text-white/50">%</span></p>
          <p className="text-white/40 text-[9px] mt-0.5">حمل المحرك</p>
        </div>
      </div>

      <div>
        <div className="flex justify-between mb-1">
          <span className="text-white/40 text-[10px] flex items-center gap-1"><Droplets size={10} /> الوقود</span>
          <span className="text-white text-xs font-bold">{t.fuelLevel}%</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${t.fuelLevel > 40 ? 'bg-green-400' : t.fuelLevel > 20 ? 'bg-amber-400' : 'bg-red-400'}`} style={{ width: `${t.fuelLevel}%` }} />
        </div>
      </div>

      <div className="flex items-center gap-1 text-[10px] text-white/35">
        <MapPin size={10} /> {t.gps}
      </div>
    </div>
  );
}

// ── Availability badge helper ─────────────────────────────────────────────────
const MONTHS_AR = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
function availBadge(eq) {
  const nextD = eq.nextAvailableDate ? new Date(eq.nextAvailableDate) : null;
  if (!eq.available)           return { label: 'محجوز',                                          cls: 'bg-red-50 border-red-200 text-red-600' };
  if (nextD && nextD > new Date()) return { label: `متاح ${nextD.getDate()} ${MONTHS_AR[nextD.getMonth()]}`, cls: 'bg-amber-50 border-amber-200 text-amber-700' };
  return                              { label: 'متاح الآن',                                      cls: 'bg-green-50 border-green-200 text-green-700' };
}

// ── Insurance expiry helper ───────────────────────────────────────────────────
function expiryStatus(dateStr) {
  if (!dateStr) return null;
  const diff = (new Date(dateStr) - new Date()) / 86400000;
  if (diff < 0)   return { label: 'منتهي',    cls: 'text-red-600'   };
  if (diff < 60)  return { label: 'ينتهي قريباً', cls: 'text-amber-600' };
  return null;
}

// ── Equipment Card ────────────────────────────────────────────────────────────
function EquipmentCard({ eq, index, onSelect, selected, onBook, onCompare, inCompare }) {
  const [imgIdx, setImgIdx] = useState(0);
  const images = eq.images?.length ? eq.images : [eq.image];
  const multi  = images.length > 1;
  const s      = STATE_CFG[eq.telematics.state];
  const avail  = availBadge(eq);
  const insExp = expiryStatus(eq.insuranceExpiry);

  const prev = (e) => { e.stopPropagation(); setImgIdx(i => (i - 1 + images.length) % images.length); };
  const next = (e) => { e.stopPropagation(); setImgIdx(i => (i + 1) % images.length); };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      onClick={() => onSelect(eq)}
      className={`bg-white overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-0.5 group ${selected?.id === eq.id ? 'shadow-[0_8px_24px_rgba(31,42,56,0.14)] ring-2 ring-cta/40' : 'shadow-[0_2px_8px_rgba(31,42,56,0.06)] hover:shadow-[0_16px_48px_rgba(31,42,56,0.13)]'}`}
      style={{ borderRadius: '8px' }}
    >
      {/* ── Image carousel ── */}
      <div className="relative overflow-hidden" style={{ height: 168 }}>
        <img
          src={images[imgIdx]} alt={eq.name}
          className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/65 via-transparent to-transparent" />

        {/* Availability badge */}
        <span className={`absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded-full font-bold border backdrop-blur-sm ${avail.cls}`}>
          {avail.label}
        </span>

        {/* Telematics state badge */}
        {eq.telematics.engineHoursTotal > 0 && (
          <span className={`absolute top-2 left-2 flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border backdrop-blur-sm ${s.bg} ${s.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />{s.label}
          </span>
        )}

        {/* Carousel controls */}
        {multi && (
          <>
            <button onClick={prev}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 bg-black/45 hover:bg-black/60 rounded-full flex items-center justify-center text-white transition-colors">
              <ChevronRight size={13} />
            </button>
            <button onClick={next}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 bg-black/45 hover:bg-black/60 rounded-full flex items-center justify-center text-white transition-colors">
              <ChevronLeft size={13} />
            </button>
            {/* Dot indicators */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {images.map((_, i) => (
                <div key={i} className={`h-1 rounded-full transition-all ${i === imgIdx ? 'w-3 bg-white' : 'w-1 bg-white/45'}`} />
              ))}
            </div>
          </>
        )}

        {/* Brand/model pill at bottom-right */}
        {eq.brand && eq.brand !== '—' && (
          <span className="absolute bottom-2 right-2 text-[9px] bg-black/50 backdrop-blur-sm text-white/90 px-2 py-0.5 rounded-full font-mono">
            {eq.brand} {eq.model}
          </span>
        )}
      </div>

      {/* ── Body ── */}
      <div className="p-4">
        <h3 className="text-navy font-bold text-sm mb-0.5 leading-snug">{eq.name}</h3>
        <p className="text-charcoal/55 text-xs flex items-center gap-1 mb-1.5">
          <Building2 size={10} className="shrink-0" />{eq.provider}
          <span className="text-charcoal/25">·</span>
          <MapPin size={10} className="shrink-0" />{eq.city}
        </p>

        {/* Star rating + rental count */}
        {eq.rating > 0 ? (
          <div className="flex items-center gap-1.5 mb-2.5">
            <div className="flex items-center gap-0.5">
              {[1,2,3,4,5].map(n => (
                <Star key={n} size={9} className={n <= Math.round(eq.rating) ? 'text-amber-400 fill-amber-400' : 'text-navy/15 fill-navy/10'} />
              ))}
            </div>
            <span className="text-[10px] font-bold text-charcoal/65">{eq.rating}</span>
            <span className="text-[10px] text-charcoal/35">{eq.reviewCount} تقييم · {eq.totalRentals} تأجير</span>
            {insExp && (
              <span className={`mr-auto text-[9px] font-semibold ${insExp.cls}`}>{insExp.label}</span>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1 mb-2.5">
            <span className="text-[9px] bg-cream border border-navy/10 text-charcoal/40 px-2 py-0.5 rounded-full">جديد — لا تقييمات بعد</span>
          </div>
        )}

        {/* Quick spec pills */}
        <div className="flex gap-1 flex-wrap mb-2.5">
          <span className={`text-[9px] px-1.5 py-0.5 rounded-full border flex items-center gap-0.5 ${eq.fuelIncluded ? 'bg-green-50 border-green-200 text-green-700' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
            <Droplet size={7} /> {eq.fuelIncluded ? 'وقود مشمول' : 'وقود منفصل'}
          </span>
          <span className={`text-[9px] px-1.5 py-0.5 rounded-full border flex items-center gap-0.5 ${eq.transport === 'included' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
            <Truck size={7} /> {eq.transport === 'included' ? 'نقل مجاني' : `نقل +${eq.transportCost}$`}
          </span>
          {eq.yearOfManufacture && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full border bg-cream border-navy/10 text-charcoal/50">
              {eq.yearOfManufacture}
            </span>
          )}
        </div>

        {/* Rental type tags */}
        <div className="flex gap-1 flex-wrap border-t border-navy/5 pt-2 mb-3">
          {eq.dryAvailable && <span className="text-[9px] bg-cream border border-navy/10 text-charcoal/55 px-2 py-0.5 rounded-full">جاف (بدون سائق)</span>}
          {eq.wetAvailable  && <span className="text-[9px] bg-brand/8 border border-brand/20 text-brand px-2 py-0.5 rounded-full">رطب (مع مشغّل)</span>}
        </div>

        {/* Price row */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[9px] text-charcoal/40 mb-0.5">تبدأ من</p>
            <p className="text-navy font-black text-xl leading-none">
              {eq.rate || eq.wetRate} <span className="text-sm font-bold text-cta">$</span>
            </p>
            <p className="text-charcoal/45 text-[9px] mt-0.5">/ {UNIT_AR[eq.pricingUnit]}</p>
          </div>
          <div className="flex items-center gap-1.5">
            {eq.attachments.length > 0 && (
              <span className="text-[9px] text-brand font-semibold flex items-center gap-0.5">
                <PlusCircle size={10} />{eq.attachments.length} ملحقات
              </span>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onCompare?.(eq); }}
              title={inCompare ? 'إزالة من المقارنة' : 'إضافة للمقارنة'}
              className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${inCompare ? 'bg-brand text-white border-brand' : 'bg-white text-charcoal/50 border-navy/15 hover:border-brand/40 hover:text-brand'}`}>
              {inCompare ? '✓ قارن' : 'قارن'}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onBook(eq); }}
              className="px-3.5 py-1.5 bg-cta text-white rounded-xl text-[10px] font-bold hover:bg-navy transition-colors shadow-sm shadow-cta/20">
              احجز
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Equipment Detail ──────────────────────────────────────────────────────────
function EquipmentDetail({ eq, onClose, onBook }) {
  const [rentalType, setRentalType] = useState(eq?.dryAvailable ? 'dry' : 'wet');
  const [addWaiver, setAddWaiver]   = useState(false);
  const [duration, setDuration]     = useState(1);
  const [selAtts, setSelAtts]       = useState({});

  if (!eq) return (
    <div className="bg-white p-10 flex flex-col items-center justify-center text-center h-full min-h-72 shadow-[0_2px_8px_rgba(31,42,56,0.06)]" style={{ borderRadius: '8px' }}>
      <Truck size={36} className="text-charcoal/25 mb-3" />
      <p className="text-charcoal/50 text-sm">اختر معدة من القائمة لاستعراض التفاصيل وطلب الحجز</p>
    </div>
  );

  const baseRate     = rentalType === 'wet' ? eq.wetRate : eq.rate;
  const waiver       = addWaiver ? +(baseRate * WAIVER_RATE).toFixed(0) : 0;
  const attsCost     = eq.attachments.filter(a => selAtts[a.id]).reduce((sum, a) => sum + a.price, 0);
  const costPerUnit  = baseRate + attsCost + waiver;
  const totalRental  = costPerUnit * duration;
  const totalTrans   = eq.transportCost || 0;
  
  const totalBase    = totalRental + totalTrans;
  const netTotal     = totalBase;

  const toggleAtt = (id) => setSelAtts(p => ({ ...p, [id]: !p[id] }));

  return (
    <div className="bg-white p-5 relative sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto shadow-[0_2px_8px_rgba(31,42,56,0.06)]" style={{ borderRadius: '8px' }}>
      <button onClick={onClose} className="absolute top-4 left-4 text-charcoal/30 hover:text-navy transition-colors"><X size={18} /></button>
      
      <h2 className="text-navy font-black text-xl mb-0.5 pl-6 leading-tight">{eq.name}</h2>
      {eq.brand && eq.brand !== '—' && (
        <p className="text-charcoal/40 text-[10px] font-mono pl-6 mb-1">{eq.brand} · {eq.model} · {eq.yearOfManufacture}</p>
      )}
      <p className="text-charcoal/50 text-xs mb-4 flex items-center gap-1.5"><MapPin size={12}/> {eq.city} · {eq.provider}</p>

      {/* ── Specs grid ── */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {[
          { icon: Hash,         label: 'الرقم التسلسلي',  val: eq.serialNumber      },
          { icon: Weight,       label: 'الوزن التشغيلي',  val: eq.operatingWeight   },
          { icon: Droplet,      label: 'نوع الوقود',       val: eq.fuelType          },
          { icon: CalendarClock,label: 'موعد الصيانة',    val: eq.nextMaintenanceDue ? new Date(eq.nextMaintenanceDue).toLocaleDateString('ar-SY', { day: 'numeric', month: 'short' }) : '—' },
        ].filter(r => r.val).map(({ icon: Icon, label, val }) => (
          <div key={label} className="bg-cream/70 rounded-xl p-2.5 flex items-start gap-2">
            <Icon size={11} className="text-charcoal/35 mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="text-[9px] text-charcoal/40 leading-none mb-0.5">{label}</p>
              <p className="text-[10px] font-bold text-navy truncate">{val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Compliance badges ── */}
      {(eq.insuranceExpiry || eq.licenseExpiry) && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {[
            { label: 'تأمين حتى', date: eq.insuranceExpiry },
            { label: 'رخصة حتى',  date: eq.licenseExpiry   },
          ].filter(d => d.date).map(({ label, date }) => {
            const exp = expiryStatus(date);
            const d   = new Date(date);
            const txt = `${d.getDate()} ${MONTHS_AR[d.getMonth()]} ${d.getFullYear()}`;
            return (
              <div key={label} className={`flex items-center gap-1.5 text-[9px] px-2.5 py-1 rounded-full border ${exp ? 'bg-red-50 border-red-200 text-red-600' : 'bg-green-50 border-green-200 text-green-700'}`}>
                {exp ? <AlertCircle size={9} /> : <CheckCircle size={9} />}
                {label}: {txt}
              </div>
            );
          })}
        </div>
      )}

      {eq.telematics.engineHoursTotal > 0 && (
        <TelematicsPanel t={eq.telematics} />
      )}

      {/* Rental type */}
      <div className="mb-5">
        <label className="text-charcoal/60 text-xs mb-2 block font-medium">نوع الاستئجار</label>
        <div className="grid grid-cols-2 gap-2">
          {eq.dryAvailable && (
            <button onClick={() => setRentalType('dry')}
              className={`p-3 rounded-xl border-2 text-xs font-bold transition-all text-right ${rentalType === 'dry' ? 'border-cta bg-cta/8 text-navy' : 'border-navy/12 text-charcoal/60 bg-white'}`}>
              <p>تأجير جاف (بدون مشغل)</p>
              <p className="text-cta font-black text-sm mt-0.5">{eq.rate} $ / {UNIT_AR[eq.pricingUnit]}</p>
            </button>
          )}
          {eq.wetAvailable && (
            <button onClick={() => setRentalType('wet')}
              className={`p-3 rounded-xl border-2 text-xs font-bold transition-all text-right ${rentalType === 'wet' ? 'border-brand bg-brand/8 text-navy' : 'border-navy/12 text-charcoal/60 bg-white'}`}>
              <p>تأجير رطب (مع مشغّل)</p>
              <p className="text-brand font-black text-sm mt-0.5">{eq.wetRate} $ / {UNIT_AR[eq.pricingUnit]}</p>
            </button>
          )}
        </div>
      </div>

      {/* Attachments */}
      {eq.attachments.length > 0 && (
        <div className="mb-5">
           <p className="text-charcoal/60 text-xs font-medium mb-2">ملحقات إضافية</p>
           <div className="space-y-1.5">
             {eq.attachments.map(att => (
               <label key={att.id} className={`flex items-center justify-between p-2.5 border rounded-lg cursor-pointer transition-colors ${selAtts[att.id] ? 'bg-brand/5 border-brand/30' : 'bg-white border-navy/10 hover:border-brand/20'}`}>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={!!selAtts[att.id]} onChange={() => toggleAtt(att.id)} className="rounded text-brand focus:ring-brand" />
                    <span className="text-xs font-semibold text-navy">{att.name}</span>
                  </div>
                  <span className="text-xs font-bold text-brand">+{att.price}$ / {UNIT_AR[eq.pricingUnit]}</span>
               </label>
             ))}
           </div>
        </div>
      )}

      {/* Duration */}
      <div className="mb-5">
        <label className="text-charcoal/60 text-xs mb-1 block">المدة المطلوبة ({UNIT_AR[eq.pricingUnit]})</label>
        <input type="number" value={duration} min={1}
          onChange={e => setDuration(Math.max(1, +e.target.value))}
          className="input-field text-sm" />
      </div>

      {/* Damage waiver toggle */}
      {eq.waiverAvailable && (
        <button type="button" onClick={() => setAddWaiver(!addWaiver)}
          className={`w-full rounded-xl border-2 p-3 text-right transition-all mb-5 ${addWaiver ? 'border-amber-400 bg-amber-50' : 'border-navy/12 bg-white'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield size={14} className={addWaiver ? 'text-amber-500' : 'text-charcoal/35'} />
              <div>
                <p className={`text-xs font-bold ${addWaiver ? 'text-amber-700' : 'text-charcoal/60'}`}>تأمين الأضرار العرضية</p>
                <p className="text-[10px] text-charcoal/45">+{(WAIVER_RATE * 100).toFixed(1)}%</p>
              </div>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${addWaiver ? 'border-amber-400 bg-amber-400' : 'border-navy/20 bg-white'}`}>
              {addWaiver && <CheckCircle size={12} className="text-white fill-white" />}
            </div>
          </div>
        </button>
      )}

      {/* Cost breakdown */}
      <div className="bg-cream rounded-xl p-3.5 space-y-1.5 text-xs mb-5">
        <p className="text-navy font-bold mb-2">تفصيل التكلفة النهائية للمستأجر</p>
        <div className="flex justify-between text-charcoal/60">
          <span>{baseRate} $ × {duration} {UNIT_AR[eq.pricingUnit]}</span>
          <span>{(baseRate * duration).toLocaleString()} $</span>
        </div>
        {attsCost > 0 && (
          <div className="flex justify-between text-brand">
            <span>الملحقات الإضافية ({attsCost} $ × {duration})</span>
            <span>+{(attsCost * duration).toLocaleString()} $</span>
          </div>
        )}
        {addWaiver && (
          <div className="flex justify-between text-amber-600">
            <span>تأمين الأضرار ({waiver} $ × {duration})</span>
            <span>+{(waiver * duration).toLocaleString()} $</span>
          </div>
        )}
        <div className="flex justify-between text-charcoal/60">
          <span>أجور النقل والمناولة</span>
          <span>{totalTrans > 0 ? `+${totalTrans} $` : 'مجاني'}</span>
        </div>
        <div className="flex justify-between text-navy font-black text-sm border-t border-navy/10 pt-1.5 mt-2">
          <span>الإجمالي المتوقع</span>
          <span>{netTotal.toLocaleString()} $</span>
        </div>
      </div>

      <button
        onClick={() => onBook(eq)}
        className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${eq.available ? 'bg-cta text-white hover:bg-cta/90' : 'bg-cream text-charcoal/40 cursor-not-allowed border border-navy/10'}`}>
        <FileText size={15} /> {eq.available ? 'تأكيد الحجز وإنشاء محضر استلام' : 'غير متاحة حالياً'}
      </button>

      <p className="text-center text-[10px] text-charcoal/40 mt-2">
        يتم توثيق حالة المعدة بالصور الجغرافية (Geo-tagged) عند التسليم والاستلام لحفظ حقوق الطرفين.
      </p>
    </div>
  );
}

// ── Milestone Tracker ─────────────────────────────────────────────────────────
function MilestoneTracker({ contract }) {
  const released = contract.milestones.filter(m => m.status === 'released').reduce((s, m) => s + m.amount, 0);
  const pct      = Math.round((released / contract.total) * 100);

  return (
    <div className="bg-white p-5 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-navy font-bold text-sm">{contract.project}</h3>
          <p className="text-charcoal/60 text-xs mt-0.5">{contract.contractor} → {contract.client}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-navy font-black text-lg leading-none">{contract.total.toLocaleString()} <span className="text-sm text-cta">$</span></p>
          <p className="text-charcoal/45 text-[10px]">إجمالي العقد</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-5">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-charcoal/60">المُفرَج</span>
          <span className="text-navy font-bold">{released.toLocaleString()} $ ({pct}%)</span>
        </div>
        <div className="h-2.5 bg-navy/8 rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} whileInView={{ width: `${pct}%` }} viewport={{ once: true }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="h-full bg-gradient-to-l from-green-500 to-green-400 rounded-full" />
        </div>
      </div>

      {/* Milestones */}
      <div className="space-y-2.5">
        {contract.milestones.map(m => {
          const c = MS_CFG[m.status];
          return (
            <div key={m.id} className={`rounded-xl border p-3 ${c.bg} ${c.border}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 flex-1">
                  <c.Icon size={14} className={`${c.color} mt-0.5 shrink-0`} />
                  <div>
                    <p className="text-navy font-bold text-xs">{m.desc}</p>
                    <p className={`text-[10px] font-semibold ${c.color}`}>{c.label}</p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-navy font-black text-sm">{m.amount.toLocaleString()} $</p>
                  {m.status !== 'pending' && (
                    <div className="flex items-center gap-1.5 justify-end mt-1">
                      {m.engineerOk && <span className="text-[9px] text-brand flex items-center gap-0.5"><CheckCircle size={9} />مُعتمد</span>}
                      {m.aiOk && <span className="text-[9px] text-violet-600 flex items-center gap-0.5"><Camera size={9} />صور حية</span>}
                    </div>
                  )}
                </div>
              </div>
              {m.status === 'verified' && (
                <button onClick={() => toast.success(`تم إفراج ${m.amount.toLocaleString()} $ للمقاول`)}
                  className="w-full mt-2.5 py-2 rounded-lg bg-brand text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-navy transition-colors">
                  <Unlock size={12} /> إفراج الدفعة — {m.amount.toLocaleString()} $
                </button>
              )}
              {m.status === 'pending' && (
                <div className="mt-2 flex gap-1.5">
                  <button onClick={() => toast('يجب تصوير المعدة في الموقع بالوقت الفعلي', { icon: '📸' })}
                    className="flex-1 py-1.5 rounded-lg border border-violet-300 text-violet-600 text-[10px] font-semibold hover:bg-violet-50 transition-colors flex items-center justify-center gap-1">
                    <Camera size={10} /> رفع محضر مصوّر
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-charcoal/35 text-[10px] mt-3 font-mono">رقم العقد: {contract.id}</p>
    </div>
  );
}

// ── Invoice Calculator ────────────────────────────────────────────────────────
function InvoiceCalculator() {
  const [amount, setAmount] = useState(500);
  const fee    = +(amount * PLATFORM_FEE).toFixed(2);
  const vat    = +(fee * VAT_RATE).toFixed(2);
  const net    = +(amount - fee - vat).toFixed(2);

  const INVOICES = [
    { id: 'INV-2026-0041', desc: 'تأجير رافعة شوكية — 3 أيام', gross: 450, date: '10 مايو 2025' },
    { id: 'INV-2026-0038', desc: 'حفارة مع دقاق — ورديتين', gross: 1200, date: '8 مايو 2025' },
  ];

  return (
    <div className="space-y-5">
      <div className="bg-white p-5 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
        <div className="flex items-center gap-2 mb-4">
          <Receipt size={15} className="text-cta" />
          <p className="text-navy font-bold text-sm">محرك حساب العمولات المبسط</p>
        </div>

        <div className="mb-4">
          <label className="text-charcoal/60 text-xs mb-1 block">قيمة المعاملة الإجمالية ($)</label>
          <input type="number" value={amount} min={0}
            onChange={e => setAmount(Math.max(0, +e.target.value))}
            className="input-field text-sm" />
        </div>

        <div className="bg-cream rounded-xl p-4 space-y-2 text-sm mb-4">
          <div className="flex justify-between"><span className="text-charcoal/60">إجمالي المعاملة</span><span className="text-navy font-bold">{amount.toLocaleString()} $</span></div>
          <div className="flex justify-between"><span className="text-charcoal/60">عمولة المنصة ({(PLATFORM_FEE * 100).toFixed(1)}%)</span><span className="text-cta font-semibold">−{fee} $</span></div>
          <div className="flex justify-between"><span className="text-charcoal/60">ضريبة القيمة المضافة ({(VAT_RATE * 100).toFixed(0)}%) على العمولة</span><span className="text-cta font-semibold">−{vat} $</span></div>
          <div className="flex justify-between border-t border-navy/10 pt-2 font-black text-navy"><span>صافي المزوّد</span><span className="text-green-600">{net.toLocaleString()} $</span></div>
        </div>

        <button onClick={() => toast.success('تم إصدار الفاتورة الضريبية')}
          className="w-full btn-cta flex items-center justify-center gap-2">
          <Receipt size={14} /> إصدار فاتورة ضريبية
        </button>
      </div>

      {/* Recent invoices */}
      <div className="bg-white p-5 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
        <p className="text-navy font-bold text-sm mb-3">الفواتير الأخيرة</p>
        <div className="space-y-2.5">
          {INVOICES.map(inv => (
            <div key={inv.id} className="flex items-center justify-between gap-3 py-2.5 border-b border-navy/8 last:border-0">
              <div>
                <p className="text-navy font-bold text-xs">{inv.desc}</p>
                <p className="text-charcoal/50 text-[10px] font-mono mt-0.5">{inv.id} · {inv.date}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-navy font-black text-sm">{inv.gross.toLocaleString()} $</span>
                <button onClick={() => toast('جارٍ تحميل الفاتورة...', { icon: '📄' })}
                  className="text-charcoal/40 hover:text-brand transition-colors">
                  <Download size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const DAMAGE_TYPES = ['تلف عرضي', 'عطل ميكانيكي مفاجئ', 'حادث تشغيل', 'تلف الهيكل الخارجي', 'سرقة جزئية', 'أضرار جوية'];
const CLAIM_STATUSES = {
  pending:   { label: 'قيد المراجعة', cls: 'bg-amber-50 border-amber-200 text-amber-700'  },
  approved:  { label: 'مقبول',        cls: 'bg-green-50  border-green-200  text-green-700'  },
  rejected:  { label: 'مرفوض',        cls: 'bg-red-50    border-red-200    text-red-600'    },
  paid:      { label: 'تم الصرف',     cls: 'bg-brand/8   border-brand/25   text-brand'      },
};

const MOCK_CLAIMS = [
  { id: 'CLM-001', equipment: 'حفارة مجنزرة CAT 320 GC', type: 'عطل ميكانيكي مفاجئ', amount: 3200, date: '2026-05-10', status: 'approved' },
  { id: 'CLM-002', equipment: 'جرافة انزلاقية Bobcat S450',  type: 'تلف عرضي',          amount: 850,  date: '2026-05-02', status: 'paid'    },
  { id: 'CLM-003', equipment: 'رافعة شوكية Toyota',          type: 'حادث تشغيل',         amount: 1500, date: '2026-04-28', status: 'pending' },
];

// ── Damage Waiver Section ─────────────────────────────────────────────────────
function DamageWaiverSection() {
  const TIERS = [
    { name: 'أساسي',  rate: 1.5, limit: 5000,  covers: ['الحوادث البسيطة العرضية', 'تلف الإطارات والمرايا'], color: 'border-navy/15', badge: 'text-charcoal/60 bg-cream border-navy/15' },
    { name: 'قياسي', rate: 2.5, limit: 15000, covers: ['جميع الحوادث غير المقصودة', 'تلف الهيكل الخارجي', 'عطل المحرك المفاجئ'], color: 'border-brand/30', badge: 'text-brand bg-brand/8 border-brand/25', recommended: true },
    { name: 'شامل',  rate: 4.0, limit: 50000, covers: ['تغطية كاملة بلا استثناء', 'السرقة مع تقرير شرطي', 'توقف العمل (Business Interruption)'], color: 'border-cta/30', badge: 'text-cta bg-cta/8 border-cta/25' },
  ];

  const [claims, setClaims] = useState(() => {
    try { return JSON.parse(localStorage.getItem(CLAIMS_KEY) || 'null') ?? MOCK_CLAIMS; }
    catch { return MOCK_CLAIMS; }
  });
  const [showForm, setShowForm]   = useState(false);
  const [claimEq,  setClaimEq]   = useState('');
  const [claimType, setClaimType] = useState(DAMAGE_TYPES[0]);
  const [claimDesc, setClaimDesc] = useState('');
  const [claimAmt,  setClaimAmt] = useState('');

  const handleSubmitClaim = () => {
    if (!claimEq || !claimDesc || !claimAmt) { toast.error('يرجى تعبئة جميع الحقول المطلوبة'); return; }
    const newClaim = {
      id:        `CLM-${String(Date.now()).slice(-4)}`,
      equipment: claimEq,
      type:      claimType,
      amount:    +claimAmt,
      date:      new Date().toISOString().slice(0, 10),
      status:    'pending',
    };
    const updated = [newClaim, ...claims];
    setClaims(updated);
    try { localStorage.setItem(CLAIMS_KEY, JSON.stringify(updated)); } catch {}
    setClaimEq(''); setClaimDesc(''); setClaimAmt('');
    setShowForm(false);
    toast.success('تم تقديم مطالبتك — ستُراجع خلال 48 ساعة ✅');
  };

  const totalPaid  = claims.filter(c => c.status === 'paid').reduce((s, c) => s + c.amount, 0);
  const totalPend  = claims.filter(c => c.status === 'pending').length;

  return (
    <div className="space-y-5">
      {/* Fund stats */}
      <div className="bg-white p-5 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
        <div className="flex items-center gap-2 mb-4">
          <Shield size={15} className="text-amber-500" />
          <p className="text-navy font-bold text-sm">صندوق التعويضات الداخلي التكافلي</p>
        </div>
        <p className="text-xs text-charcoal/60 mb-4 leading-relaxed">بسبب ظروف التأمين في سوريا، يقدم الموقع صندوقاً تعاونياً يعوض الموردين فوراً عن الأعطال المحددة، مما يشجع المقاولين على تأجير معداتهم بأمان وبدون وسطاء.</p>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            ['رصيد الصندوق',       `${(FUND.balance / 1000).toFixed(0)}K $`, 'text-green-600'],
            ['مطالبات الشهر',       FUND.claimsMonth,                         'text-amber-600'],
            ['متوسط التعويض',       `${FUND.avgClaim.toLocaleString()} $`,    'text-brand'],
            ['سقف التغطية/حادثة',  `${(FUND.coverageMax / 1000).toFixed(0)}K $`, 'text-cta'],
          ].map(([label, val, cls]) => (
            <div key={label} className="bg-cream rounded-xl p-3 text-center">
              <p className={`font-black text-lg ${cls}`}>{val}</p>
              <p className="text-charcoal/45 text-[10px] mt-0.5 leading-tight">{label}</p>
            </div>
          ))}
        </div>
        <div className="h-2 bg-navy/8 rounded-full overflow-hidden mb-1">
          <motion.div initial={{ width: 0 }} whileInView={{ width: `${FUND.health}%` }} viewport={{ once: true }} transition={{ duration: 1 }}
            className="h-full bg-gradient-to-l from-green-500 to-emerald-400 rounded-full" />
        </div>
        <p className="text-charcoal/45 text-[10px] text-center">صحة الصندوق: {FUND.health}% — ممتاز</p>
      </div>

      {/* Coverage tiers */}
      <div className="bg-white p-5 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
        <p className="text-navy font-bold text-sm mb-4">مستويات التغطية المتاحة للاشتراك</p>
        <div className="space-y-3">
          {TIERS.map(tier => (
            <div key={tier.name} className={`rounded-xl border-2 p-4 ${tier.color}`}>
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tier.badge}`}>{tier.name}</span>
                  {tier.recommended && <span className="text-[10px] bg-green-50 border border-green-200 text-green-600 px-1.5 py-0.5 rounded-full font-bold">مُوصَى به</span>}
                </div>
                <div className="text-right">
                  <p className="text-navy font-black text-sm">+{tier.rate}% / للفترة</p>
                  <p className="text-charcoal/45 text-[10px]">حتى {(tier.limit / 1000).toFixed(0)}K $</p>
                </div>
              </div>
              {tier.covers.map(c => (
                <p key={c} className="text-charcoal/60 text-xs flex items-start gap-1.5 mb-1">
                  <CheckCircle size={11} className="text-green-500 mt-0.5 shrink-0" /> {c}
                </p>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Claims section */}
      <div className="bg-white p-5 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ClipboardList size={15} className="text-brand" />
            <p className="text-navy font-bold text-sm">المطالبات والتعويضات</p>
          </div>
          <div className="flex items-center gap-3">
            {totalPend > 0 && (
              <span className="text-[10px] bg-amber-50 border border-amber-200 text-amber-700 px-2 py-0.5 rounded-full font-bold">
                {totalPend} قيد المراجعة
              </span>
            )}
            <button
              onClick={() => setShowForm(v => !v)}
              className="flex items-center gap-1.5 text-xs font-bold bg-cta text-white px-3 py-1.5 rounded-xl hover:bg-cta/90 transition-colors">
              <Send size={11} /> تقديم مطالبة
            </button>
          </div>
        </div>

        {/* New claim form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="bg-cream/60 rounded-2xl p-4 mb-4 space-y-3 overflow-hidden border border-navy/8">
              <p className="text-navy font-bold text-xs">تفاصيل المطالبة الجديدة</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-charcoal/55 text-[10px] font-medium block mb-1">اسم المعدة *</label>
                  <input type="text" value={claimEq} onChange={e => setClaimEq(e.target.value)}
                    placeholder="مثال: حفارة CAT 320..."
                    className="input-field text-xs py-2" />
                </div>
                <div>
                  <label className="text-charcoal/55 text-[10px] font-medium block mb-1">نوع الضرر *</label>
                  <select value={claimType} onChange={e => setClaimType(e.target.value)} className="input-field text-xs py-2">
                    {DAMAGE_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-charcoal/55 text-[10px] font-medium block mb-1">وصف الحادثة *</label>
                <textarea value={claimDesc} onChange={e => setClaimDesc(e.target.value)}
                  placeholder="اذكر تفاصيل الحادثة، متى ومكان وقوعها، وطبيعة الأضرار..."
                  rows={3} className="input-field text-xs py-2 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-charcoal/55 text-[10px] font-medium block mb-1">المبلغ التقديري للضرر ($) *</label>
                  <input type="number" value={claimAmt} onChange={e => setClaimAmt(e.target.value)}
                    placeholder="مثال: 2500"
                    className="input-field text-xs py-2" />
                </div>
                <div>
                  <label className="text-charcoal/55 text-[10px] font-medium block mb-1">صور الضرر</label>
                  <button onClick={() => toast('سيتم رفع الصور عبر تطبيق الجوال', { icon: '📷' })}
                    className="w-full flex items-center justify-center gap-1.5 text-xs border border-dashed border-navy/20 rounded-xl py-2 text-charcoal/50 hover:border-brand/40 hover:text-brand transition-colors">
                    <Camera size={11} /> رفع صور (اختياري)
                  </button>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={handleSubmitClaim}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-brand text-white text-xs font-bold py-2 rounded-xl hover:bg-navy transition-colors">
                  <Send size={11} /> إرسال المطالبة
                </button>
                <button onClick={() => setShowForm(false)}
                  className="px-4 border border-navy/15 text-charcoal/60 rounded-xl text-xs hover:text-navy transition-colors">
                  إلغاء
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Claims stats summary */}
        {totalPaid > 0 && (
          <div className="flex items-center gap-2 mb-4 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
            <BarChart3 size={13} className="text-green-600 shrink-0" />
            <p className="text-green-700 text-xs font-medium">
              إجمالي التعويضات المدفوعة لك: <strong className="text-green-800">{totalPaid.toLocaleString()} $</strong>
            </p>
          </div>
        )}

        {/* Claims list */}
        {claims.length === 0 ? (
          <div className="text-center py-8">
            <Shield size={28} className="mx-auto text-charcoal/20 mb-2" />
            <p className="text-charcoal/50 text-xs">لا توجد مطالبات بعد — تقدّم بأول مطالبة عند الحاجة</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {claims.map(claim => {
              const st = CLAIM_STATUSES[claim.status] || CLAIM_STATUSES.pending;
              return (
                <motion.div key={claim.id} layout
                  className="flex items-center justify-between gap-3 bg-cream/50 rounded-xl p-3 border border-navy/6">
                  <div className="flex-1 min-w-0">
                    <p className="text-navy font-bold text-xs truncate">{claim.equipment}</p>
                    <p className="text-charcoal/50 text-[10px]">{claim.type} · {claim.date}</p>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <span className="text-navy font-black text-sm">{claim.amount.toLocaleString()} $</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${st.cls}`}>{st.label}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        <p className="text-charcoal/35 text-[10px] text-center mt-4 font-mono">
          رقم المطالبة يُولَّد آلياً بعد التقديم — تُراجَع خلال 48 ساعة عمل
        </p>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'equipment', label: 'السوق والمعدات' },
  { id: 'escrow',    label: 'محاضر التسليم والدفع' },
  { id: 'billing',   label: 'الفوترة' },
  { id: 'waiver',    label: 'صندوق التكافل' },
];

export default function EquipmentPage() {
  const { sponsorships = [], incrementSponsorshipClicks } = useGlobalData();
  const activeSponsor = sponsorships.find(s => s.type === 'equipment' && s.active);

  const [tab,           setTab]           = useState('equipment');
  const [catFilter,     setCatFilter]     = useState('all');
  const [cityFilter,    setCityFilter]    = useState('الكل');
  const [typeFilter,    setTypeFilter]    = useState('all');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [keyword,       setKeyword]       = useState('');
  const [priceMin,      setPriceMin]      = useState('');
  const [priceMax,      setPriceMax]      = useState('');
  const [selectedEq,    setSelectedEq]   = useState(null);
  const [bookingEq,     setBookingEq]    = useState(null);
  const [checkoutEq,    setCheckoutEq]   = useState(null);
  const [contractorEq]                   = useState(() => getMarketEquipment());
  const [mounting,      setMounting]     = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setMounting(false), 380);
    return () => clearTimeout(t);
  }, []);
  const [compareList,   setCompareList]  = useState([]);
  const [showCompare,   setShowCompare]  = useState(false);

  const handleCompare = (eq) => {
    setCompareList(prev => {
      if (prev.some(e => e.id === eq.id)) return prev.filter(e => e.id !== eq.id);
      if (prev.length >= 2) { toast('يمكنك مقارنة معدتين فقط في وقت واحد', { icon: '⚖️' }); return prev; }
      return [...prev, eq];
    });
  };

  const ALL_EQ = useMemo(() => [...EQUIPMENT_SEED, ...contractorEq], [contractorEq]);

  const filtered = useMemo(() => ALL_EQ.filter(eq => {
    if (catFilter !== 'all'   && eq.category !== catFilter) return false;
    if (cityFilter !== 'الكل' && eq.city !== cityFilter)    return false;
    if (typeFilter === 'dry'  && !eq.dryAvailable)          return false;
    if (typeFilter === 'wet'  && !eq.wetAvailable)          return false;
    if (availableOnly         && !eq.available)             return false;
    if (keyword) {
      const kw = keyword.toLowerCase();
      if (
        !eq.name.toLowerCase().includes(kw) &&
        !eq.provider.toLowerCase().includes(kw) &&
        !eq.city.includes(keyword) &&
        !(eq.brand || '').toLowerCase().includes(kw)
      ) return false;
    }
    const basePrice = eq.rate || eq.wetRate;
    if (priceMin !== '' && basePrice < +priceMin) return false;
    if (priceMax !== '' && basePrice > +priceMax) return false;
    return true;
  }), [catFilter, cityFilter, typeFilter, availableOnly, keyword, priceMin, priceMax, ALL_EQ]);

  return (
    <div className="min-h-screen bg-[#f2f1ee]" dir="rtl">
      <SEO
        title="معدات البناء والمقاولات في سوريا"
        description="استئجار وبيع معدات البناء والمقاولات الثقيلة والخفيفة في سوريا. مرونة في التأجير بالساعة واليوم. محاضر استلام مصورة وضمانات دفع ذكية."
        path="/equipment"
      />
      <PageHero
        num="07"
        eyebrow="مجمع خدمات المقاولات الميدانية"
        title={<h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-[1.4]">سوق المعدات<br /><span className="text-cta">وتقاسم الموارد.</span></h1>}
        subtitle="استأجر بالساعة أو الوردية · عقود واضحة ومصوّرة لحفظ حقوقك · تأجير مباشر بين المقاولين"
        accent="bg-cta"
        breadcrumb={[{ label: 'الرئيسية', to: '/' }, { label: 'المعدات والمقاولات' }]}
      />

      {/* Tab nav */}
      <div className="bg-white border-b border-navy/10 sticky top-[62px] z-40">
        <div className="max-w-7xl mx-auto px-4 flex gap-1 overflow-x-auto py-2">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${tab === t.id ? 'bg-cta text-white' : 'text-charcoal/60 hover:text-navy hover:bg-cream'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#f2f1ee]">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">

          {/* ── Equipment tab ── */}
          {tab === 'equipment' && (
            <motion.div key="eq" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Filters */}
              <div className="space-y-3 mb-5">
                {/* Row 1: search + price range */}
                <div className="flex gap-2 flex-wrap items-center">
                  <div className="relative flex-1 min-w-[180px]">
                    <Search size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/35 pointer-events-none" />
                    <input
                      type="text" value={keyword}
                      onChange={e => setKeyword(e.target.value)}
                      placeholder="ابحث باسم المعدة أو المورد أو الماركة..."
                      className="w-full pr-8 pl-3 py-1.5 text-xs rounded-xl border border-navy/15 bg-white focus:outline-none focus:border-brand/50 placeholder:text-charcoal/30"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <input type="number" placeholder="سعر من" value={priceMin}
                      onChange={e => setPriceMin(e.target.value)}
                      className="w-24 px-2.5 py-1.5 text-xs rounded-xl border border-navy/15 bg-white focus:outline-none focus:border-brand/50 placeholder:text-charcoal/30" />
                    <span className="text-charcoal/30 text-xs">—</span>
                    <input type="number" placeholder="حتى" value={priceMax}
                      onChange={e => setPriceMax(e.target.value)}
                      className="w-24 px-2.5 py-1.5 text-xs rounded-xl border border-navy/15 bg-white focus:outline-none focus:border-brand/50 placeholder:text-charcoal/30" />
                    <span className="text-charcoal/40 text-[10px]">$/وحدة</span>
                  </div>
                  {(keyword || priceMin || priceMax) && (
                    <button onClick={() => { setKeyword(''); setPriceMin(''); setPriceMax(''); }}
                      className="flex items-center gap-1 text-xs text-charcoal/40 hover:text-navy transition-colors shrink-0">
                      <X size={12} /> مسح
                    </button>
                  )}
                </div>
                {/* Row 2: category + city + type + availability */}
                <div className="flex gap-2 flex-wrap items-center">
                  <div className="flex gap-1.5 flex-wrap">
                    {CATEGORIES.map(c => (
                      <button key={c.id} onClick={() => setCatFilter(c.id)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${catFilter === c.id ? 'bg-cta border-cta text-white' : 'border-navy/15 text-charcoal/60 hover:border-cta/40 hover:text-navy'}`}>
                        {c.label}
                      </button>
                    ))}
                  </div>
                  <span className="text-navy/20 text-xs">|</span>
                  <select value={cityFilter} onChange={e => setCityFilter(e.target.value)}
                    className="input-field text-xs py-1.5 px-3 w-auto">
                    {CITIES_EQ.map(c => <option key={c}>{c}</option>)}
                  </select>
                  <div className="flex gap-1.5">
                    {[['all', 'الكل'], ['dry', 'إيجار جاف'], ['wet', 'مع مشغّل (رطب)']].map(([v, l]) => (
                      <button key={v} onClick={() => setTypeFilter(v)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${typeFilter === v ? 'bg-brand border-brand text-white' : 'border-navy/15 text-charcoal/60 hover:border-brand/40'}`}>
                        {l}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setAvailableOnly(v => !v)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${availableOnly ? 'bg-green-500 border-green-500 text-white' : 'border-navy/15 text-charcoal/60 hover:border-green-400/50'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${availableOnly ? 'bg-white' : 'bg-green-400'}`} />
                    متاح فقط
                  </button>
                </div>
              </div>

              {filtered.length === 0 ? (
                <div className="text-center py-20">
                  <Truck size={44} className="mx-auto mb-4 text-charcoal/20" />
                  <p className="text-navy font-bold text-base mb-1">لا توجد معدات</p>
                  <p className="text-charcoal/50 text-sm mb-5 max-w-xs mx-auto leading-relaxed">
                    {keyword
                      ? `لا نتائج لـ "${keyword}" — جرب كلمة أخرى أو اسم الماركة`
                      : catFilter !== 'all'
                      ? `لا توجد معدات من فئة "${CATEGORIES.find(c => c.id === catFilter)?.label}"${cityFilter !== 'الكل' ? ` في ${cityFilter}` : ''}`
                      : cityFilter !== 'الكل'
                      ? `لا توجد معدات في ${cityFilter} تطابق معاييرك الحالية`
                      : 'جرّب تغيير الفلاتر أو مسحها للعثور على ما تبحث عنه'}
                  </p>
                  <button
                    onClick={() => { setCatFilter('all'); setCityFilter('الكل'); setTypeFilter('all'); setAvailableOnly(false); setKeyword(''); setPriceMin(''); setPriceMax(''); }}
                    className="inline-flex items-center gap-1.5 text-brand text-sm font-semibold hover:underline">
                    <X size={14} /> مسح جميع الفلاتر
                  </button>
                </div>
              ) : (
                <div className="grid lg:grid-cols-[1fr_360px] gap-6">
                  <div>
                    <p className="text-charcoal/60 text-xs mb-4">
                      <span className="text-navy font-bold">{filtered.length}</span> معدة {keyword ? `لـ "${keyword}"` : 'متاحة'}
                    </p>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {mounting
                        ? [...Array(6)].map((_, i) => <EquipmentSkeletonCard key={i} />)
                        : filtered.map((eq, i) => (
                            <EquipmentCard
                              key={eq.id}
                              eq={eq}
                              index={i}
                              onSelect={setSelectedEq}
                              selected={selectedEq}
                              onBook={setBookingEq}
                              onCompare={handleCompare}
                              inCompare={compareList.some(e => e.id === eq.id)}
                            />
                          ))
                      }
                    </div>
                  </div>
                  <div className="hidden lg:block">
                    <EquipmentDetail eq={selectedEq} onClose={() => setSelectedEq(null)} onBook={setBookingEq} />
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ── Escrow tab ── */}
          {tab === 'escrow' && (
            <motion.div key="escrow" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="mb-5 bg-white p-4 flex items-start gap-3 border border-brand/20 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
                <Camera size={24} className="text-brand shrink-0 mt-0.5" />
                <div>
                  <p className="text-navy font-bold text-sm">نظام الاستلام والتسليم الموثق بالصور</p>
                  <p className="text-charcoal/60 text-xs mt-1 leading-relaxed">
                    لا يتم الإفراج عن الدفعات في حالة التأجير إلا بعد رفع <strong className="text-navy font-bold">محضر استلام مصوّر حياً</strong> (عبر الكاميرا حصراً لضمان الوقت والمكان). يُلزم السائق والمستأجر بالتقاط 4 صور للمعدة قبل العمل لتجنب نزاعات الأعطال لاحقاً. هذه الآلية تغني عن التعقيدات التقنية الكبيرة وتعتمد على الواقع.
                  </p>
                </div>
              </div>
              <div className="grid lg:grid-cols-2 gap-5">
                {ESCROW_CONTRACTS.map(c => <MilestoneTracker key={c.id} contract={c} />)}
              </div>
            </motion.div>
          )}

          {/* ── Billing tab ── */}
          {tab === 'billing' && (
            <motion.div key="billing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="max-w-2xl mx-auto">
              <InvoiceCalculator />
            </motion.div>
          )}

          {/* ── Waiver tab ── */}
          {tab === 'waiver' && (
            <motion.div key="waiver" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="max-w-2xl mx-auto">
              <DamageWaiverSection />
            </motion.div>
          )}

        </AnimatePresence>
      </div>
      </div>

      {/* Mobile equipment detail bottom sheet */}
      <AnimatePresence>
        {selectedEq && (
          <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end" dir="rtl">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-navy/60 backdrop-blur-sm"
              onClick={() => setSelectedEq(null)} />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 340, damping: 32 }}
              className="relative bg-white rounded-t-3xl max-h-[88vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-navy/8 px-5 py-3 flex items-center justify-between z-10">
                <p className="text-navy font-bold text-sm truncate pl-4">{selectedEq.name}</p>
                <button onClick={() => setSelectedEq(null)} className="text-charcoal/40 hover:text-navy shrink-0"><X size={18} /></button>
              </div>
              <div className="p-4 space-y-3">
                <p className="text-charcoal/50 text-xs flex items-center gap-1"><MapPin size={11} />{selectedEq.city} · {selectedEq.provider}</p>
                <div className="flex gap-2 flex-wrap">
                  {selectedEq.dryAvailable && <span className="text-xs bg-cream border border-navy/10 text-charcoal/60 px-2.5 py-1 rounded-full">إيجار جاف</span>}
                  {selectedEq.wetAvailable  && <span className="text-xs bg-brand/8 border border-brand/20 text-brand px-2.5 py-1 rounded-full">مع مشغّل (رطب)</span>}
                  <span className={`text-xs px-2.5 py-1 rounded-full border ${selectedEq.fuelIncluded ? 'bg-green-50 border-green-200 text-green-700' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
                    {selectedEq.fuelIncluded ? 'شامل الوقود' : 'الوقود على المستأجر'}
                  </span>
                </div>
                <div className="bg-cream rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-charcoal/40 text-xs">السعر يبدأ من</p>
                    <p className="text-navy font-black text-2xl leading-none">{selectedEq.rate || selectedEq.wetRate} <span className="text-sm text-cta">$</span></p>
                    <p className="text-charcoal/40 text-xs mt-0.5">/ {UNIT_AR[selectedEq.pricingUnit]}</p>
                  </div>
                  {selectedEq.transport !== 'included' && (
                    <div className="text-right">
                      <p className="text-charcoal/40 text-xs">نقل وتركيب</p>
                      <p className="text-navy font-bold text-sm">+{selectedEq.transportCost} $</p>
                    </div>
                  )}
                </div>
                <button onClick={() => { setBookingEq(selectedEq); setSelectedEq(null); }}
                  className="w-full py-3 bg-cta text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                  <FileText size={15} /> تأكيد الحجز وتحديد المواعيد
                </button>
                <a href={`https://wa.me/963000000000?text=${encodeURIComponent(`استفسار عن: ${selectedEq.name} · ${selectedEq.city}`)}`}
                  target="_blank" rel="noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-green-400/40 bg-green-50 text-green-700 text-sm font-medium hover:bg-green-100 transition-colors">
                  <MessageCircle size={14} /> استفسر عبر واتساب
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 pb-4">
        <SponsorCard
          sponsor={activeSponsor}
          onClick={() => incrementSponsorshipClicks?.(activeSponsor.id)}
        />
      </div>

      {/* Compare floating bar */}
      <AnimatePresence>
        {compareList.length > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-navy text-white rounded-2xl shadow-2xl px-5 py-3 flex items-center gap-4"
            dir="rtl">
            <div className="flex items-center gap-2">
              {compareList.map(eq => (
                <div key={eq.id} className="flex items-center gap-1.5 bg-white/10 rounded-xl px-2.5 py-1">
                  <span className="text-xs font-bold truncate max-w-[100px]">{eq.name.split(' ').slice(0, 2).join(' ')}</span>
                  <button onClick={() => handleCompare(eq)} className="text-white/50 hover:text-white transition-colors">
                    <X size={11} />
                  </button>
                </div>
              ))}
            </div>
            {compareList.length < 2 && (
              <span className="text-white/55 text-xs">اختر معدة أخرى</span>
            )}
            {compareList.length === 2 && (
              <button
                onClick={() => setShowCompare(true)}
                className="bg-cta hover:bg-cta/90 text-white text-xs font-black px-4 py-1.5 rounded-xl transition-colors">
                مقارنة ⚖️
              </button>
            )}
            <button onClick={() => setCompareList([])} className="text-white/40 hover:text-white transition-colors mr-1">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compare Drawer */}
      <AnimatePresence>
        {showCompare && compareList.length === 2 && (
          <EquipmentCompareDrawer
            items={compareList}
            onClose={() => setShowCompare(false)}
          />
        )}
      </AnimatePresence>

      {/* Existing Escrow Modal (optional for later) */}
      <EscrowCheckoutModal
        isOpen={!!checkoutEq}
        onClose={() => setCheckoutEq(null)}
        project="مشروع ياسمين الشام"
        amount={checkoutEq?.rate * 5 || 0}
        type="equipment"
      />

      {/* New Booking & Calendar Modal */}
      <EquipmentBookingModal
        isOpen={!!bookingEq}
        onClose={() => setBookingEq(null)}
        equipment={bookingEq}
      />
    </div>
  );
}
