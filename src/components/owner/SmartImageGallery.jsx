import { useState, useRef } from 'react';
import { X, AlertTriangle, CheckCircle2, Loader2, Camera, Upload, ShieldCheck } from 'lucide-react';
import { supabase, isConfigured } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useImageDedup } from '../../hooks/useImageDedup';

const MAX_IMAGES = 20;
const MAX_SIZE_MB = 8;

function ImageTile({ item, onRemove }) {
  return (
    <div className={`relative group rounded-xl overflow-hidden border-2 transition-all ${item.duplicate ? 'border-red-500/60 opacity-60' : 'border-transparent hover:border-brand/50'}`}>
      <img src={item.preview} alt={item.file.name} className="w-full h-32 object-cover" />

      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all" />

      {item.verified && (
        <div className="absolute top-2 left-2 bg-amber-400 text-amber-950 font-bold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm z-10">
          <ShieldCheck size={12} /> موثقة حية
        </div>
      )}

      {item.duplicate ? (
        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
          <AlertTriangle size={10} /> مكرر
        </div>
      ) : item.error ? (
        <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
          <AlertTriangle size={10} /> فشل الرفع
        </div>
      ) : item.processing ? (
        <div className="absolute top-2 right-2 bg-slate-800/80 text-slate-300 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
          <Loader2 size={10} className="animate-spin" /> جاري الرفع...
        </div>
      ) : (
        <div className="absolute top-2 right-2 bg-green-500/80 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <CheckCircle2 size={10} /> تم الرفع
        </div>
      )}

      <button onClick={() => onRemove(item)}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg z-20">
        <X size={16} />
      </button>

      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <p className="text-white text-xs truncate">{item.file.name}</p>
        <p className="text-slate-400 text-xs">{(item.file.size / 1024).toFixed(0)} KB</p>
      </div>
    </div>
  );
}

export default function SmartImageGallery({ images, onChange }) {
  const [processing, setProcessing] = useState(false);
  const [dupeCount, setDupeCount]   = useState(0);
  const galleryRef  = useRef();
  const cameraRef   = useRef();
  const { filterDuplicates } = useImageDedup();
  const { user } = useAuth();

  const uniqueCount = images.filter(i => !i.duplicate).length;
  const remaining   = MAX_IMAGES - uniqueCount;

  const uploadToSupabase = async (file, userId) => {
    if (!isConfigured || !supabase) return null;
    const ext  = file.name.split('.').pop();
    const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from('property-images').upload(path, file, { upsert: false });
    if (error) return null;
    const { data } = supabase.storage.from('property-images').getPublicUrl(path);
    return data?.publicUrl ?? null;
  };

  const handleFiles = async (fileList, isVerified = false) => {
    const incoming = Array.from(fileList).filter(f => f.type.startsWith('image/'));
    if (!incoming.length) return;

    // Size filter
    const oversized = incoming.filter(f => f.size > MAX_SIZE_MB * 1024 * 1024);
    if (oversized.length) {
      alert(`هذه الصور تتجاوز ${MAX_SIZE_MB} MB وسيتم تخطيها:\n${oversized.map(f => f.name).join('\n')}`);
    }
    const valid = incoming.filter(f => f.size <= MAX_SIZE_MB * 1024 * 1024);
    if (!valid.length) return;

    // Max limit
    const allowed = valid.slice(0, remaining);
    if (valid.length > remaining) {
      alert(`يمكنك إضافة ${remaining} صورة فقط. تم تجاهل الباقي.`);
    }
    if (!allowed.length) return;

    setProcessing(true);

    const pendingItems = allowed.map(file => ({
      file, preview: URL.createObjectURL(file),
      duplicate: false, processing: true, verified: isVerified, url: null,
    }));
    onChange([...images, ...pendingItems]);

    const existingFiles = images.map(img => ({ file: img.file }));
    const { duplicates } = await filterDuplicates(allowed, existingFiles);

    const finalItems = await Promise.all(allowed.map(async file => {
      const isDupe   = duplicates.some(d => d.file === file);
      const pending  = pendingItems.find(p => p.file === file);
      if (isDupe) return { ...pending, duplicate: true, processing: false };

      const publicUrl = await uploadToSupabase(file, user?.id ?? 'anon');
      return {
        ...pending,
        duplicate:  false,
        processing: false,
        error:      !publicUrl,
        url:        publicUrl,
        preview:    publicUrl ?? pending.preview,
      };
    }));

    const newDupes = finalItems.filter(i => i.duplicate).length;
    onChange(prev => {
      const withoutPending = prev.filter(i => !pendingItems.includes(i));
      return [...withoutPending, ...finalItems];
    });
    setDupeCount(c => c + newDupes);
    setProcessing(false);
  };

  const removeItem = (target) => {
    URL.revokeObjectURL(target.preview);
    onChange(images.filter(img => img !== target));
    if (target.duplicate) setDupeCount(c => Math.max(0, c - 1));
  };

  const removeDuplicates = () => {
    images.filter(img => img.duplicate).forEach(img => URL.revokeObjectURL(img.preview));
    onChange(images.filter(img => !img.duplicate));
    setDupeCount(0);
  };

  return (
    <div className="space-y-4" dir="rtl">

      {/* Counter */}
      <div className="flex items-center justify-between flex-wrap gap-3 text-sm">
        <div className="flex items-center gap-4">
          <span className="text-slate-300">
            <span className="text-white font-bold">{uniqueCount}</span> / {MAX_IMAGES} صورة
          </span>
          {dupeCount > 0 && (
            <span className="text-red-400 flex items-center gap-1">
              <AlertTriangle size={14} /> {dupeCount} مكررة
            </span>
          )}
          {processing && (
            <span className="text-slate-400 flex items-center gap-1 text-xs">
              <Loader2 size={12} className="animate-spin" /> جارٍ الرفع...
            </span>
          )}
        </div>
        {dupeCount > 0 && (
          <button onClick={removeDuplicates}
            className="text-xs bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
            <X size={12} /> حذف المكررة ({dupeCount})
          </button>
        )}
      </div>

      {/* Upload buttons */}
      {remaining > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {/* Gallery upload */}
          <div onClick={() => galleryRef.current.click()}
            className="border-2 border-brand/30 hover:border-brand bg-brand/5 hover:bg-brand/10 rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center gap-3 group">
            <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden"
              onChange={e => handleFiles(e.target.files, false)} />
            <div className="w-12 h-12 rounded-2xl bg-brand/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Upload size={22} className="text-brand" />
            </div>
            <div>
              <p className="text-brand font-bold text-sm">رفع من الجهاز</p>
              <p className="text-brand/50 text-xs mt-1">من المكتبة أو الكمبيوتر</p>
            </div>
          </div>

          {/* Live camera */}
          <div onClick={() => cameraRef.current.click()}
            className="border-2 border-amber-500/30 hover:border-amber-400 bg-amber-500/5 hover:bg-amber-500/10 rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center gap-3 group">
            <input ref={cameraRef} type="file" accept="image/*" capture="environment" multiple className="hidden"
              onChange={e => handleFiles(e.target.files, true)} />
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Camera size={22} className="text-amber-500" />
            </div>
            <div>
              <p className="text-amber-500 font-bold text-sm flex items-center justify-center gap-1">
                <ShieldCheck size={14} /> تصوير مباشر
              </p>
              <p className="text-amber-500/50 text-xs mt-1">يُضاف شارة "موثقة حية"</p>
            </div>
          </div>
        </div>
      )}

      {remaining === 0 && (
        <div className="text-center py-3 text-charcoal/50 text-sm bg-cream rounded-xl border border-navy/10">
          وصلت للحد الأقصى ({MAX_IMAGES} صورة)
        </div>
      )}

      {/* Gallery grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((item, i) => (
            <ImageTile key={i} item={item} onRemove={removeItem} />
          ))}
        </div>
      )}

      {dupeCount > 0 && (
        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <AlertTriangle size={18} className="text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-red-300 text-sm font-semibold">تم اكتشاف {dupeCount} صورة مكررة</p>
            <p className="text-red-400/70 text-xs mt-0.5">الصور المحاطة بإطار أحمر متشابهة. يمكنك حذفها أو الاحتفاظ بها.</p>
          </div>
        </div>
      )}
    </div>
  );
}
