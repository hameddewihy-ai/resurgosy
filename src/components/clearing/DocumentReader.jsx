import { useRef, useState } from 'react';
import { FileText, Upload, Loader2, CheckCircle, AlertCircle, Sparkles, Eye } from 'lucide-react';

const CONFIDENCE_COLOR = (c) => c >= 0.9 ? 'text-green-600' : c >= 0.75 ? 'text-amber-600' : 'text-red-500';
const CONFIDENCE_LABEL = (c) => c >= 0.9 ? 'عالي الدقة' : c >= 0.75 ? 'دقة متوسطة' : 'يحتاج مراجعة';

const DOC_TYPE_LABELS = {
  inheritance_inventory: 'حصر إرث',
  power_of_attorney:     'وكالة قانونية',
  title_recovery:        'طلب استرداد ملكية',
};

function FieldRow({ label, value, editable, onChange }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-3 items-start py-2 border-b border-navy/10 last:border-0">
      <span className="text-charcoal/60 text-xs font-medium pt-2">{label}</span>
      {editable ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)}
          rows={value?.includes('\n') ? 4 : 1}
          className="input-field text-xs py-1.5 resize-none font-mono" />
      ) : (
        <span className="text-navy text-sm py-1 font-mono break-all">{value || '—'}</span>
      )}
    </div>
  );
}

export default function DocumentReader({ onExtracted, extracting, extractResult }) {
  const inputRef = useRef();
  const [file, setFile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [edited, setEdited] = useState(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = (f) => {
    if (!f) return;
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/tiff'];
    if (!allowed.includes(f.type)) { alert('يُقبل: PDF, JPG, PNG, TIFF فقط'); return; }
    setFile(f);
    setEdited(null);
    onExtracted(f);
  };

  const onDrop = (e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); };

  const data = edited || extractResult?.extracted;

  return (
    <div className="space-y-5" dir="rtl">
      {/* Drop zone */}
      {!file && (
        <div
          onClick={() => inputRef.current.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${dragging ? 'border-brand bg-brand/5 scale-[1.01]' : 'border-navy/20 hover:border-brand/40 hover:bg-brand/[0.02]'}`}
        >
          <input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.tiff" className="hidden"
            onChange={(e) => handleFile(e.target.files[0])} />
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-brand/10 flex items-center justify-center">
              <Upload size={28} className="text-brand" />
            </div>
            <div>
              <p className="text-navy font-semibold">ارفع وثيقة الإرث أو الوكالة</p>
              <p className="text-charcoal/60 text-sm mt-1">PDF · JPG · PNG · TIFF — تتم قراءتها آلياً</p>
            </div>
            <div className="flex gap-2 text-xs text-charcoal/50">
              {['حصر الإرث','وكالة قانونية','سند التمليك','استرداد ملكية'].map((t) => (
                <span key={t} className="bg-cream border border-navy/10 px-2 py-1 rounded">{t}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Processing state */}
      {file && extracting && (
        <div className="bg-white p-8 text-center space-y-4 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
          <div className="relative mx-auto w-16 h-16">
            <div className="w-16 h-16 rounded-full border-2 border-brand/20 flex items-center justify-center">
              <Loader2 size={28} className="text-brand animate-spin" />
            </div>
            <Sparkles size={14} className="text-cta absolute -top-1 -right-1 animate-pulse" />
          </div>
          <div>
            <p className="text-navy font-bold">محرك القراءة الآلية يحلل الوثيقة...</p>
            <p className="text-charcoal/60 text-sm mt-1">استخراج البيانات · التحقق من الصيغة القانونية · مطابقة القانون السوري 2026</p>
          </div>
          <div className="flex justify-center gap-2 text-xs text-charcoal/50">
            {['قراءة النص', 'استخراج الكيانات', 'التحقق القانوني'].map((s, i) => (
              <span key={i} className="flex items-center gap-1">
                <Loader2 size={10} className="animate-spin" />{s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Result */}
      {!extracting && extractResult && (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-50 border border-green-200 flex items-center justify-center">
                <CheckCircle size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-navy font-bold text-sm">تم استخراج البيانات بنجاح</p>
                <p className="text-charcoal/60 text-xs mt-0.5">
                  النوع المُكتشَف: <span className="text-brand font-medium">{DOC_TYPE_LABELS[extractResult.doc_type]}</span>
                  {' · '}
                  <span className={`font-medium ${CONFIDENCE_COLOR(extractResult.confidence)}`}>
                    {CONFIDENCE_LABEL(extractResult.confidence)} ({Math.round(extractResult.confidence * 100)}%)
                  </span>
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setFile(null); setEdited(null); }}
                className="text-xs text-charcoal/60 hover:text-navy border border-navy/12 hover:border-navy/30 px-3 py-1.5 rounded-lg transition-colors">
                تغيير الوثيقة
              </button>
              <button onClick={() => setEditMode(!editMode)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1 ${editMode ? 'bg-brand/10 border-brand/30 text-brand' : 'border-navy/12 text-charcoal/60 hover:text-navy'}`}>
                <Eye size={12} />
                {editMode ? 'إخفاء التحرير' : 'تحرير البيانات'}
              </button>
            </div>
          </div>

          {/* Confidence bar */}
          <div>
            <div className="flex justify-between text-xs text-charcoal/60 mb-1">
              <span>دقة الاستخراج</span>
              <span>{Math.round(extractResult.confidence * 100)}%</span>
            </div>
            <div className="h-1.5 bg-navy/10 rounded-full">
              <div className="h-full rounded-full transition-all"
                style={{ width: `${extractResult.confidence * 100}%`, background: extractResult.confidence >= 0.9 ? '#22c55e' : extractResult.confidence >= 0.75 ? '#f59e0b' : '#ef4444' }} />
            </div>
          </div>

          {/* Fields */}
          {data && (
            <div className="bg-white p-4 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
              <p className="text-navy text-xs font-bold mb-3 flex items-center gap-1.5">
                <FileText size={13} className="text-brand" />
                البيانات المستخرجة {editMode && <span className="text-brand">(وضع التحرير)</span>}
              </p>
              {Object.entries(data).map(([key, value]) => (
                <FieldRow key={key}
                  label={key.replace(/_/g, ' ')}
                  value={edited?.[key] ?? value}
                  editable={editMode}
                  onChange={(v) => setEdited({ ...(edited || extractResult.extracted), [key]: v })}
                />
              ))}
            </div>
          )}

          {/* Warning if low confidence */}
          {extractResult.confidence < 0.8 && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
              <AlertCircle size={17} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-700 font-semibold text-sm">دقة استخراج منخفضة</p>
                <p className="text-amber-600/80 text-xs mt-0.5">يُنصح بمراجعة البيانات المستخرجة يدوياً قبل توليد المسودة القانونية.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
