import { useState, useEffect } from 'react';
import { MapPin, Star, HardHat, Navigation, CheckCircle, Loader2, Send } from 'lucide-react';
import { useNearestEngineer } from '../../hooks/useNearestEngineer';

function EngineerCard({ engineer, rank, onSelect, selected }) {
  const isNearest = rank === 0;
  return (
    <div
      onClick={() => onSelect(engineer)}
      className={`cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 ${
        selected?.id === engineer.id
          ? 'border-brand bg-brand/10'
          : isNearest
          ? 'border-cta/40 bg-cta/5 hover:border-cta/70'
          : 'border-slate-700 hover:border-slate-500 bg-slate-800/30'
      }`}
    >
      <div className="flex items-start gap-3" dir="rtl">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
            {engineer.full_name[0]}
          </div>
          {isNearest && (
            <span className="absolute -top-1.5 -right-1.5 bg-cta text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              الأقرب
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <p className="text-white font-bold text-sm">{engineer.full_name}</p>
            {selected?.id === engineer.id && (
              <CheckCircle size={16} className="text-brand shrink-0" />
            )}
          </div>
          <p className="text-slate-400 text-xs mt-0.5 flex items-center gap-1">
            <MapPin size={11} />
            {engineer.city}
          </p>
          <p className="text-slate-500 text-xs mt-0.5 truncate">{engineer.license}</p>

          <div className="flex items-center gap-3 mt-2 flex-wrap">
            {/* Distance */}
            <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
              isNearest ? 'bg-cta/10 text-cta' : 'bg-slate-700 text-slate-300'}`}>
              <Navigation size={10} />
              {engineer.distanceKm} كم
            </span>
            {/* Rating */}
            <span className="flex items-center gap-1 text-xs text-yellow-400">
              <Star size={11} fill="currentColor" />
              {engineer.rating}
            </span>
            {/* Inspections */}
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <HardHat size={11} />
              {engineer.inspections} فحص
            </span>
          </div>

          <p className="text-slate-500 text-xs mt-1">التخصص: {engineer.specialty}</p>
        </div>
      </div>
    </div>
  );
}

export default function EngineerMatcher({ propertyCoords, onEngineerSelected }) {
  const { engineers, loading, error, findNearest, getUserLocation } = useNearestEngineer();
  const [selected, setSelected] = useState(null);
  const [requested, setRequested] = useState(false);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (propertyCoords?.lat && propertyCoords?.lng) {
      findNearest(propertyCoords.lat, propertyCoords.lng);
    }
  }, [propertyCoords, findNearest]);

  const handleAutoLocate = async () => {
    setLocating(true);
    try {
      const coords = await getUserLocation();
      await findNearest(coords.lat, coords.lng);
    } finally {
      setLocating(false);
    }
  };

  const handleSelect = (engineer) => {
    setSelected(engineer);
    onEngineerSelected?.(engineer);
  };

  const handleRequest = () => {
    if (!selected) return;
    setRequested(true);
    onEngineerSelected?.(selected);
  };

  if (requested) {
    return (
      <div className="card p-8 text-center" dir="rtl">
        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} className="text-green-400" />
        </div>
        <h3 className="text-white font-bold text-lg mb-2">تم إرسال طلب الفحص!</h3>
        <p className="text-slate-400 text-sm mb-4">
          تم إرسال طلبك إلى <span className="text-white font-semibold">{selected.full_name}</span> في {selected.city}.
          سيتواصل معك خلال 24 ساعة لتحديد موعد الفحص الميداني.
        </p>
        <div className="bg-slate-800/60 rounded-xl p-4 text-right">
          <p className="text-slate-400 text-xs mb-2">تفاصيل الطلب</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-slate-400">المهندس</span><span className="text-white">{selected.full_name}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">المسافة</span><span className="text-cta">{selected.distanceKm} كم</span></div>
            <div className="flex justify-between"><span className="text-slate-400">التقييم</span><span className="text-yellow-400">★ {selected.rating}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">حالة الطلب</span><span className="text-green-400">قيد الانتظار</span></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5" dir="rtl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h3 className="text-white font-bold text-base flex items-center gap-2">
            <HardHat size={18} className="text-brand" />
            أقرب مهندس ميداني
          </h3>
          <p className="text-slate-400 text-xs mt-1">جميع المهندسين مرخّصون من نقابة المهندسين السوريين</p>
        </div>
        <button onClick={handleAutoLocate} disabled={locating}
          className="flex items-center gap-2 text-xs bg-slate-700/60 hover:bg-slate-700 border border-slate-600 text-slate-300 px-3 py-2 rounded-lg transition-colors disabled:opacity-50">
          {locating ? <Loader2 size={13} className="animate-spin" /> : <Navigation size={13} />}
          تحديد موقعي
        </button>
      </div>

      {/* States */}
      {loading && (
        <div className="flex items-center justify-center py-12 gap-3 text-slate-400">
          <Loader2 size={20} className="animate-spin text-brand" />
          <span className="text-sm">جارٍ البحث عن أقرب مهندس...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-300 text-sm">{error}</div>
      )}

      {!loading && !error && engineers.length === 0 && (
        <div className="card p-8 text-center">
          <MapPin size={32} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">اضغط "تحديد موقعي" أو أدخل إحداثيات العقار في الخطوة السابقة</p>
        </div>
      )}

      {/* Engineer list */}
      {engineers.length > 0 && (
        <>
          <div className="space-y-3">
            {engineers.slice(0, 4).map((eng, i) => (
              <EngineerCard key={eng.id} engineer={eng} rank={i} onSelect={handleSelect} selected={selected} />
            ))}
          </div>

          {/* Action bar */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleRequest}
              disabled={!selected}
              className="btn-cta flex-1 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100"
            >
              <Send size={17} />
              {selected ? `إرسال الطلب إلى ${selected.full_name.split(' ')[0]}` : 'اختر مهندساً أولاً'}
            </button>
          </div>

          <p className="text-slate-500 text-xs text-center">
            سيحصل المهندس على تفاصيل العقار وموقعه الجغرافي فور إرسال الطلب
          </p>
        </>
      )}
    </div>
  );
}
