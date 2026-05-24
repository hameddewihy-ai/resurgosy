import { useState } from 'react';
import { Clock, Plus, X, AlertTriangle, CheckCircle } from 'lucide-react';

const DOC_PRESETS = [
  { id: 'la_mane',       label: 'وثيقة "لا مانع" الأمنية',           days: 90  },
  { id: 'foreign_poa',   label: 'وكالة خارجية مُصدَّقة',              days: 365 },
  { id: 'poa_5day',      label: 'وكالة عادية — قبول عقاري (5 أيام)', days: 5   },
  { id: 'civil_record',  label: 'إخراج قيد فردي (إثبات حياة موكل)',   days: 90  },
  { id: 'guardianship',  label: 'قوامة / وصاية للقاصرين',            days: 90  },
  { id: 'border_permit', label: 'ترخيص حدودي',                        days: 365 },
  { id: 'probate',       label: 'حصر إرث صادر من المحكمة',            days: 180 },
  { id: 'court_ruling',  label: 'حكم قضائي (قبل اكتساب القطعية)',     days: 30  },
];

const INITIAL = [
  { id: 1, type: 'la_mane',      party: 'محمد الصالح',   date: '2026-07-15', ref: 'SY-CLR-2025-11241' },
  { id: 2, type: 'foreign_poa',  party: 'رنا الحسيني',   date: '2026-06-01', ref: 'SY-CLR-2025-22891' },
  { id: 3, type: 'civil_record', party: 'خالد العمر',    date: '2026-05-30', ref: 'SY-CLR-2025-33401' },
  { id: 4, type: 'guardianship', party: 'سارة الكردي',   date: '2026-05-25', ref: 'SY-CLR-2025-41120' },
];

function daysLeft(dateStr) {
  const d   = new Date(dateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((d - now) / (1000 * 60 * 60 * 24));
}

function StatusBadge({ days }) {
  if (days <= 0)
    return <span className="text-[10px] font-bold text-white bg-red-500 px-2 py-0.5 rounded-full">منتهية</span>;
  if (days <= 7)
    return <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">تنتهي خلال {days} أيام</span>;
  if (days <= 30)
    return <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">{days} يوم</span>;
  return <span className="text-[10px] font-bold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">{days} يوم</span>;
}

function RowIcon({ days }) {
  if (days <= 0)  return <AlertTriangle size={14} className="text-red-500 shrink-0" />;
  if (days <= 7)  return <AlertTriangle size={14} className="text-red-400 shrink-0" />;
  if (days <= 30) return <Clock size={14} className="text-amber-500 shrink-0" />;
  return <CheckCircle size={14} className="text-green-500 shrink-0" />;
}

const EMPTY_FORM = { type: 'la_mane', party: '', date: '', ref: '' };

export default function ValidityTracker() {
  const today = new Date().toISOString().slice(0, 10);
  const [docs,   setDocs]   = useState(INITIAL);
  const [form,   setForm]   = useState(EMPTY_FORM);
  const [adding, setAdding] = useState(false);

  const addDoc = () => {
    if (!form.party.trim() || !form.date) return;
    setDocs(prev => [...prev, { id: Date.now(), ...form }]);
    setForm(EMPTY_FORM);
    setAdding(false);
  };

  const removeDoc = (id) => setDocs(prev => prev.filter(d => d.id !== id));

  const sorted = [...docs].sort((a, b) => new Date(a.date) - new Date(b.date));

  const expired  = sorted.filter(d => daysLeft(d.date) <= 0).length;
  const critical = sorted.filter(d => daysLeft(d.date) > 0 && daysLeft(d.date) <= 7).length;
  const warning  = sorted.filter(d => daysLeft(d.date) > 7 && daysLeft(d.date) <= 30).length;

  return (
    <div className="space-y-4" dir="rtl">
      {/* Summary chips */}
      {(expired > 0 || critical > 0 || warning > 0) && (
        <div className="flex gap-2 flex-wrap">
          {expired  > 0 && <span className="text-xs font-bold text-white bg-red-500 px-3 py-1 rounded-full">{expired} منتهية</span>}
          {critical > 0 && <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-3 py-1 rounded-full">⚠ {critical} حرجة</span>}
          {warning  > 0 && <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">{warning} تقترب</span>}
        </div>
      )}

      {/* Header + add button */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-charcoal/60 flex items-center gap-1.5">
          <Clock size={13} className="text-brand" />
          {docs.length} وثيقة مُتابَعة
        </p>
        <button onClick={() => setAdding(!adding)}
          className="flex items-center gap-1 text-xs text-brand border border-brand/25 hover:border-brand px-3 py-1.5 rounded-lg transition-colors">
          <Plus size={12} />
          إضافة وثيقة
        </button>
      </div>

      {/* Add form */}
      {adding && (
        <div className="bg-white p-4 space-y-3 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] text-charcoal/60 mb-1">نوع الوثيقة</p>
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-navy/12 focus:border-brand/40 text-xs text-navy outline-none bg-white">
                {DOC_PRESETS.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
              </select>
            </div>
            <div>
              <p className="text-[10px] text-charcoal/60 mb-1">اسم الطرف</p>
              <input type="text" value={form.party}
                onChange={e => setForm(p => ({ ...p, party: e.target.value }))}
                placeholder="صاحب الوثيقة"
                className="w-full px-3 py-2 rounded-xl border border-navy/12 focus:border-brand/40 text-xs text-navy outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] text-charcoal/60 mb-1">تاريخ انتهاء الصلاحية</p>
              <input type="date" value={form.date} min={today}
                onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-navy/12 focus:border-brand/40 text-xs text-navy outline-none" />
            </div>
            <div>
              <p className="text-[10px] text-charcoal/60 mb-1">رقم المعاملة (اختياري)</p>
              <input type="text" value={form.ref}
                onChange={e => setForm(p => ({ ...p, ref: e.target.value }))}
                placeholder="SY-CLR-..."
                className="w-full px-3 py-2 rounded-xl border border-navy/12 focus:border-brand/40 text-xs text-navy outline-none font-mono" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={addDoc}
              className="flex-1 py-2 rounded-xl bg-brand text-white text-xs font-bold hover:bg-brand/90 transition-colors">
              إضافة
            </button>
            <button onClick={() => { setAdding(false); setForm(EMPTY_FORM); }}
              className="px-4 py-2 rounded-xl border border-navy/12 text-charcoal/60 text-xs hover:text-navy transition-colors">
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white overflow-hidden shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-xs" dir="rtl">
            <thead>
              <tr className="border-b border-navy/10 bg-cream">
                {['', 'الوثيقة', 'الطرف', 'رقم المعاملة', 'تاريخ الانتهاء', 'الحالة', ''].map((h, i) => (
                  <th key={i} className="text-right text-charcoal/60 font-semibold py-2.5 px-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map(doc => {
                const preset = DOC_PRESETS.find(p => p.id === doc.type);
                const days   = daysLeft(doc.date);
                return (
                  <tr key={doc.id}
                    className={`border-b border-navy/[0.06] transition-colors ${days <= 0 ? 'bg-red-50/40' : days <= 7 ? 'bg-red-50/20' : days <= 30 ? 'bg-amber-50/20' : 'hover:bg-cream/50'}`}>
                    <td className="py-3 px-3"><RowIcon days={days} /></td>
                    <td className="py-3 px-3 text-navy font-medium whitespace-nowrap">{preset?.label || doc.type}</td>
                    <td className="py-3 px-3 text-charcoal/70">{doc.party}</td>
                    <td className="py-3 px-3 text-brand font-mono">{doc.ref || '—'}</td>
                    <td className="py-3 px-3 text-charcoal/60 font-mono whitespace-nowrap">{doc.date}</td>
                    <td className="py-3 px-3"><StatusBadge days={days} /></td>
                    <td className="py-3 px-3">
                      <button onClick={() => removeDoc(doc.id)}
                        className="text-charcoal/30 hover:text-red-500 transition-colors">
                        <X size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {docs.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-charcoal/40">
                    لا توجد وثائق مُتابَعة — أضف وثيقة للبدء
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-[10px] text-charcoal/35 text-center">
        يُعرض التنبيه قبل انتهاء الصلاحية بـ 30 يوماً (أصفر) وبـ 7 أيام (أحمر)
      </p>
    </div>
  );
}
