import { useState } from 'react';
import { useGlobalData } from '../../context/GlobalContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar as CalendarIcon, Wrench, AlertTriangle, CheckCircle, Clock, Info, ChevronLeft, ChevronRight, Activity, MapPin, Fuel, Battery, Zap, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';

// ── Month names ──────────────────────────────────────────────────────────────
const MONTH_NAMES = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
const DAY_LABELS  = ['ح','ن','ث','ر','خ','ج','س'];

// ── Cost helpers ─────────────────────────────────────────────────────────────
function calcTotal(days, dailyRate) {
  if (!days || !dailyRate) return 0;
  const base = days * dailyRate;
  return days >= 7 ? Math.round(base * 0.9) : base; // 10% off for weekly+
}

// ── Calendar Day Cell ────────────────────────────────────────────────────────
function DayCell({ day, state, onClick }) {
  const base = 'relative aspect-square rounded-lg flex items-center justify-center text-sm font-bold transition-all duration-150 select-none ';
  const states = {
    booked:   base + 'bg-red-50 text-red-300 cursor-not-allowed after:absolute after:inset-x-2 after:top-1/2 after:h-px after:bg-red-200',
    selected: base + 'bg-navy text-white shadow-lg shadow-navy/20 scale-105 z-10',
    today:    base + 'bg-brand/10 text-brand border border-brand/30 hover:bg-brand hover:text-white cursor-pointer',
    free:     base + 'bg-cream text-navy border border-transparent hover:border-brand/40 hover:bg-brand/5 cursor-pointer hover:scale-105',
  };

  return (
    <motion.button
      whileTap={state !== 'booked' ? { scale: 0.92 } : undefined}
      onClick={onClick}
      disabled={state === 'booked'}
      className={states[state] || states.free}
      aria-label={`يوم ${day}`}
    >
      {day}
      {state === 'selected' && (
        <span className="absolute -top-1 -right-1 w-2 h-2 bg-brand rounded-full" />
      )}
    </motion.button>
  );
}

// ── Stat Pill ────────────────────────────────────────────────────────────────
function StatPill({ icon: Icon, label, value, accent = false }) {
  return (
    <div className={`rounded-2xl p-4 flex items-center gap-3.5 border ${
      accent
        ? 'bg-amber-50 border-amber-200/70'
        : 'bg-white border-navy/8'
    }`}>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
        accent ? 'bg-amber-100' : 'bg-navy/5'
      }`}>
        <Icon size={18} className={accent ? 'text-amber-600' : 'text-navy'} />
      </div>
      <div>
        <p className={`text-[9px] font-black tracking-widest uppercase mb-0.5 ${
          accent ? 'text-amber-700' : 'text-charcoal/40'
        }`}>{label}</p>
        <p className={`font-black text-xl leading-none ${
          accent ? 'text-amber-700' : 'text-navy'
        }`} style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", letterSpacing:'0.03em' }}>
          {value}
        </p>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function EquipmentBookingModal({ isOpen, onClose, equipment }) {
  const { pushCrossHint } = useGlobalData();
  const [selectedDates, setSelectedDates] = useState([]);
  const [tab, setTab] = useState('calendar');
  const [month, setMonth] = useState(4); // 0-indexed → May = 4

  if (!isOpen || !equipment) return null;

  const UNIT_LABEL = { hour: 'ساعة', shift: 'وردية', day: 'يوم', month: 'شهر' };

  const year          = 2026;
  const daysInMonth   = new Date(year, month + 1, 0).getDate();
  const bookedDates   = equipment.bookedDates || [12, 13, 14, 25, 26];
  const dailyRate     = equipment.rate || equipment.dailyRate || 120;
  const unitLabel     = UNIT_LABEL[equipment.pricingUnit] || 'يوم';
  const today         = new Date();
  const todayDay      = today.getMonth() === month && today.getFullYear() === year ? today.getDate() : null;

  const toggleDate = (day) => {
    if (bookedDates.includes(day)) return;
    setSelectedDates(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort((a, b) => a - b)
    );
  };

  const totalCost  = calcTotal(selectedDates.length, dailyRate);
  const isDiscount = selectedDates.length >= 7;

  const handleBooking = () => {
    if (selectedDates.length === 0) { toast.error('الرجاء تحديد أيام الحجز أولاً'); return; }
    try {
      const key  = 'resurgo-equipment-requests';
      const prev = JSON.parse(localStorage.getItem(key) || '[]');
      prev.unshift({
        id:            `req-${Date.now()}`,
        equipmentId:   equipment?.id,
        equipmentName: equipment?.name,
        renterName:    'مستأجر جديد',
        renterPhone:   '',
        days:          selectedDates.length,
        totalCost,
        rentalType:    'جاف (بدون مشغّل)',
        dates:         `${selectedDates[0]} — ${selectedDates[selectedDates.length - 1]} مايو 2026`,
        date:          new Date().toISOString().slice(0, 10),
        status:        'pending',
      });
      localStorage.setItem(key, JSON.stringify(prev.slice(0, 100)));
    } catch { /* silent */ }
    toast.success(`✅ تم إرسال طلب الحجز لـ ${selectedDates.length} يوم — قيمة العقد: ${totalCost.toLocaleString()}$`);
    pushCrossHint({
      emoji: '👷',
      text: 'هل تبحث عن مقاولين أو مهندسين معتمدين لتشغيل المعدة وإدارة المشروع؟',
      label: 'تصفح الوظائف',
      to: '/jobs'
    });
    setSelectedDates([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6" dir="rtl">

      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-navy/70 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Sheet */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 340, damping: 30 }}
        className="relative w-full max-w-2xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[93vh] sm:max-h-[88vh]"
      >

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="relative bg-navy overflow-hidden px-6 py-5 shrink-0">
          {/* Blueprint grid texture */}
          <div className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
              backgroundSize: '28px 28px'
            }}
          />
          <div className="relative flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-brand text-[9px] font-black tracking-[0.18em] uppercase">إدارة الحجز</span>
                <span className="w-1 h-1 rounded-full bg-brand/50" />
                <span className="text-white/40 text-[9px] font-mono">
                  {MONTH_NAMES[month]} {year}
                </span>
              </div>
              <h2 className="text-white font-black text-lg leading-snug">{equipment.name}</h2>
              <p className="text-white/50 text-xs mt-0.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                متاح للحجز الآن
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/8 hover:bg-white/15 border border-white/10 flex items-center justify-center transition-all"
            >
              <X size={16} className="text-white/70" />
            </button>
          </div>
        </div>

        {/* ── Tab Bar ────────────────────────────────────────────────────── */}
        <div className="flex border-b border-navy/8 shrink-0 bg-cream/40">
          {[
            { id: 'calendar', label: 'التقويم الحي', icon: CalendarIcon },
            { id: 'logbook',  label: 'سجل الصيانة',  icon: Wrench },
            { id: 'iot',      label: 'بيانات IoT',    icon: Activity },
          ].map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex-1 py-3 text-sm font-bold transition-all flex items-center justify-center gap-2 relative ${
                tab === id
                  ? 'text-navy'
                  : 'text-charcoal/40 hover:text-charcoal/70'
              }`}
            >
              <Icon size={14} />
              {label}
              {tab === id && (
                <motion.div layoutId="tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand rounded-full"
                />
              )}
            </button>
          ))}
        </div>

        {/* ── Body ───────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto bg-cream/20">
          <AnimatePresence mode="wait">

            {/* CALENDAR TAB */}
            {tab === 'calendar' && (
              <motion.div key="calendar"
                initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}
                className="p-5 space-y-4"
              >

                {/* Month nav */}
                <div className="bg-white rounded-2xl border border-navy/8 overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-3 border-b border-navy/6">
                    <button onClick={() => setMonth(m => Math.max(0, m - 1))}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-cream transition-colors">
                      <ChevronRight size={16} className="text-navy/50" />
                    </button>
                    <p className="text-navy font-black text-sm">
                      {MONTH_NAMES[month]} <span className="text-charcoal/40 font-normal">{year}</span>
                    </p>
                    <button onClick={() => setMonth(m => Math.min(11, m + 1))}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-cream transition-colors">
                      <ChevronLeft size={16} className="text-navy/50" />
                    </button>
                  </div>

                  {/* Days grid */}
                  <div className="p-4">
                    {/* Day labels */}
                    <div className="grid grid-cols-7 gap-1.5 mb-2">
                      {DAY_LABELS.map(d => (
                        <div key={d} className="text-center text-[10px] font-black text-charcoal/30 tracking-wider">{d}</div>
                      ))}
                    </div>
                    {/* Cells */}
                    <div className="grid grid-cols-7 gap-1.5">
                      {[...Array(daysInMonth)].map((_, i) => {
                        const day = i + 1;
                        const state = bookedDates.includes(day)    ? 'booked'
                                    : selectedDates.includes(day)  ? 'selected'
                                    : day === todayDay             ? 'today'
                                    : 'free';
                        return <DayCell key={day} day={day} state={state} onClick={() => toggleDate(day)} />;
                      })}
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="flex gap-4 px-5 py-3 border-t border-navy/5 bg-cream/30">
                    {[
                      { color: 'bg-navy', label: 'محدد' },
                      { color: 'bg-red-200', label: 'محجوز' },
                      { color: 'bg-brand/20 border border-brand/30', label: 'اليوم' },
                      { color: 'bg-cream border border-navy/10', label: 'متاح' },
                    ].map(({ color, label }) => (
                      <span key={label} className="flex items-center gap-1.5 text-[10px] text-charcoal/50 font-bold">
                        <span className={`w-2.5 h-2.5 rounded-sm ${color}`} />{label}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Cost estimator */}
                {selectedDates.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-navy text-white rounded-2xl p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-white/50 text-[10px] font-bold tracking-widest uppercase mb-0.5">تكلفة الإيجار المقدّرة</p>
                      <p className="font-black text-2xl leading-none" style={{ fontFamily: "'Bebas Neue', Impact", letterSpacing:'0.03em' }}>
                        {totalCost.toLocaleString()}$
                      </p>
                      {isDiscount && (
                        <span className="text-brand text-[10px] font-bold mt-0.5 block">✦ خصم أسبوعي 10% مطبّق</span>
                      )}
                    </div>
                    <div className="text-left">
                      <p className="text-white/30 text-[10px]">{selectedDates.length} {unitLabel} × {dailyRate}$</p>
                      {selectedDates.length >= 3 && (
                        <div className="mt-1 text-[10px] text-white/40">
                          {selectedDates[0]}–{selectedDates[selectedDates.length - 1]} {MONTH_NAMES[month]}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Info notice */}
                <div className="flex items-start gap-2.5 bg-brand/8 border border-brand/15 rounded-xl px-4 py-3 text-navy text-xs">
                  <Info size={14} className="shrink-0 mt-0.5 text-brand" />
                  <p className="text-charcoal/60">تأكيد الحجز يخضع لموافقة المالك. الأسعار تشمل التشغيل الجاف فقط — لا تشمل السائق أو الوقود.</p>
                </div>
              </motion.div>
            )}

            {/* LOGBOOK TAB */}
            {tab === 'logbook' && (
              <motion.div key="logbook"
                initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}
                className="p-5 space-y-5"
              >
                {/* Stats row */}
                <div className="grid sm:grid-cols-2 gap-3">
                  <StatPill
                    icon={Clock}
                    label="عداد الساعات الحالي"
                    value={`${(equipment.telematics?.engineHoursTotal?.toLocaleString() || '12,640')} ساعة`}
                  />
                  <StatPill
                    icon={AlertTriangle}
                    label="الحد الأقصى اليومي"
                    value={`${equipment.maintenanceLog?.maxDailyHours || '8'} ساعات`}
                    accent
                  />
                </div>

                {/* Policy note */}
                <div className="bg-white rounded-xl border border-navy/8 px-4 py-3">
                  <p className="text-xs text-charcoal/55 leading-relaxed">
                    في حال الإيجار الجاف، يُمنع تجاوز الحد الأقصى لساعات التشغيل. أي تجاوز يخضع لغرامة مالية تُحسب بسعر{' '}
                    <strong className="text-navy">1.5×</strong> التعريفة الساعية وتُستقطع من أمانة الحجز.
                  </p>
                </div>

                {/* Maintenance history */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-navy font-black text-sm">سجل الصيانة الدورية</h3>
                    <div className="flex-1 h-px bg-navy/8" />
                    <span className="text-[10px] text-charcoal/30 font-bold">تاريخ محدّث</span>
                  </div>

                  <div className="space-y-2">
                    {(equipment.maintenanceLog?.history || [
                      { id: 1, task: 'تغيير زيت المحرك والفلاتر', date: '2026-04-10', hours: 12400, status: 'ok' },
                      { id: 2, task: 'فحص الهيدروليك وتشحيم الذراع', date: '2026-03-22', hours: 12250, status: 'ok' },
                      { id: 3, task: 'استبدال فلتر الهواء الأساسي', date: '2026-02-14', hours: 11900, status: 'ok' },
                    ]).map((log, i) => (
                      <motion.div key={log.id}
                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                        className="bg-white border border-navy/8 rounded-xl px-4 py-3.5 flex items-center justify-between group hover:border-brand/25 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-lg bg-green-50 border border-green-200/70 flex items-center justify-center shrink-0">
                            <CheckCircle size={13} className="text-green-500" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-navy">{log.task}</p>
                            <p className="text-[10px] text-charcoal/40 mt-0.5 font-mono">{log.date}</p>
                          </div>
                        </div>
                        <div className="text-left">
                          <span className="text-[10px] font-black bg-navy/5 text-navy px-2.5 py-1 rounded-lg font-mono">
                            {log.hours?.toLocaleString()} h
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* IOT TAB */}
            {tab === 'iot' && (
              <motion.div key="iot"
                initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}
                className="p-5 space-y-5"
              >
                {/* Live Telemetry Grid */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: Fuel, label: 'الوقود', value: '78%', color: 'text-amber-500', bg: 'bg-amber-50' },
                    { icon: Battery, label: 'البطارية', value: '14.2V', color: 'text-emerald-500', bg: 'bg-emerald-50' },
                    { icon: Zap, label: 'الحمل', value: '62%', color: 'text-brand', bg: 'bg-brand/5' },
                  ].map((stat, i) => (
                    <div key={i} className={`${stat.bg} rounded-2xl p-4 border border-navy/5 text-center`}>
                      <stat.icon size={18} className={`${stat.color} mx-auto mb-2`} />
                      <p className="text-[10px] text-charcoal/40 font-bold mb-1">{stat.label}</p>
                      <p className="text-lg font-black text-navy">{stat.value}</p>
                    </div>
                  ))}
                </div>

                {/* Movement History */}
                <div className="bg-white rounded-2xl border border-navy/8 overflow-hidden">
                  <div className="px-5 py-3 border-b border-navy/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-brand" />
                      <h3 className="text-navy font-black text-sm">آخر التواجد والتحركات</h3>
                    </div>
                    <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-black animate-pulse">LIVE</span>
                  </div>
                  
                  <div className="p-4 space-y-3">
                    {[
                      { time: '10:45 AM', loc: 'قطاع A - المنطقة الصناعية', action: 'تشغيل المحرك' },
                      { time: '09:20 AM', loc: 'قطاع C - المخازن المركزية', action: 'تغيير الموقع' },
                      { time: 'أمس 04:30 PM', loc: 'موقع المشروع الرئيسي', action: 'إيقاف التشغيل' },
                    ].map((step, i) => (
                      <div key={i} className="flex gap-4 relative">
                        {i < 2 && <div className="absolute top-6 right-[7px] w-0.5 h-6 bg-navy/5" />}
                        <div className={`w-4 h-4 rounded-full mt-1 shrink-0 ${i === 0 ? 'bg-brand ring-4 ring-brand/10' : 'bg-navy/10'}`} />
                        <div className="flex-1 pb-2">
                          <div className="flex justify-between items-start">
                            <p className="text-xs font-bold text-navy">{step.action}</p>
                            <span className="text-[10px] text-charcoal/40 font-mono">{step.time}</span>
                          </div>
                          <p className="text-[10px] text-charcoal/50 mt-0.5">{step.loc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-cream/30 p-3 flex items-center justify-center gap-2 text-[10px] font-bold text-brand cursor-pointer hover:bg-cream/50 transition-colors border-t border-navy/5">
                    <Activity size={12} />
                    عرض المسار الكامل على الخريطة
                  </div>
                </div>

                {/* Health Index */}
                <div className="bg-navy rounded-2xl p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/5">
                    <Activity size={24} className="text-brand" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-white text-xs font-bold">مؤشر كفاءة المعدة</span>
                      <span className="text-brand text-xs font-black">94%</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: '94%' }} className="h-full bg-brand" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <div className="shrink-0 px-5 py-4 bg-white border-t border-navy/6">
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: selectedDates.length > 0 ? 1.01 : 1 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleBooking}
              className={`flex-1 py-3.5 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 ${
                selectedDates.length > 0
                  ? 'bg-navy text-white shadow-lg shadow-navy/20 hover:bg-navy/90'
                  : 'bg-cream text-charcoal/40 cursor-not-allowed'
              }`}
            >
              {selectedDates.length > 0
                ? <>✓ تأكيد الحجز — {selectedDates.length} {unitLabel}</>
                : `حدّد فترات الحجز (${unitLabel})`
              }
            </motion.button>
            <button onClick={onClose}
              className="px-5 py-3.5 rounded-xl font-bold text-sm text-charcoal/50 hover:text-navy hover:bg-cream/80 transition-all border border-navy/8">
              إلغاء
            </button>
          </div>
          <a
            href={`https://wa.me/963000000000?text=${encodeURIComponent(`طلب حجز: ${equipment.name} · ${selectedDates.length > 0 ? `${selectedDates.length} ${unitLabel} — ${selectedDates[0]}–${selectedDates[selectedDates.length - 1] ?? selectedDates[0]} ${MONTH_NAMES[month]}` : 'يرجى تحديد المواعيد'}`)}`}
            target="_blank" rel="noreferrer"
            className="flex items-center justify-center gap-2 w-full mt-2 py-2.5 rounded-xl border border-green-400/40 bg-green-50 text-green-700 text-sm font-medium hover:bg-green-100 transition-colors">
            <MessageCircle size={14} /> استفسر أو احجز عبر واتساب
          </a>
        </div>

      </motion.div>
    </div>
  );
}
