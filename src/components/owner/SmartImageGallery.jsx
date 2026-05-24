import { useState, useRef, useEffect } from 'react';
import { X, AlertTriangle, CheckCircle2, Image as ImageIcon, Loader2, Camera, ShieldCheck } from 'lucide-react';
import { useImageDedup } from '../../hooks/useImageDedup';

function ImageTile({ item, onRemove }) {
  return (
    <div className={`relative group rounded-xl overflow-hidden border-2 transition-all ${item.duplicate ? 'border-red-500/60 opacity-60' : 'border-transparent hover:border-brand/50'}`}>
      <img src={item.preview} alt={item.file.name} className="w-full h-32 object-cover" />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all" />

      {/* Verified Badge */}
      {item.verified && (
        <div className="absolute top-2 left-2 bg-amber-400 text-amber-950 font-bold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm z-10">
          <ShieldCheck size={12} />
          موثقة حية
        </div>
      )}

      {/* Status badge */}
      {item.duplicate ? (
        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
          <AlertTriangle size={10} />
          مكرر
        </div>
      ) : item.processing ? (
        <div className="absolute top-2 right-2 bg-slate-800/80 text-slate-300 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
          <Loader2 size={10} className="animate-spin" />
          فحص...
        </div>
      ) : (
        <div className="absolute top-2 right-2 bg-green-500/80 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <CheckCircle2 size={10} />
          فريد
        </div>
      )}

      {/* Remove button */}
      <button onClick={() => onRemove(item)}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg z-20">
        <X size={16} />
      </button>

      {/* Filename */}
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <p className="text-white text-xs truncate">{item.file.name}</p>
        <p className="text-slate-400 text-xs">{(item.file.size / 1024).toFixed(0)} KB</p>
      </div>
    </div>
  );
}

export default function SmartImageGallery({ images, onChange }) {
  const [processing, setProcessing] = useState(false);
  const [dupeCount, setDupeCount] = useState(0);
  const inputRef = useRef();
  const cameraRef = useRef();
  const { filterDuplicates } = useImageDedup();

  // Revoke preview URLs on unmount
  useEffect(() => {
    return () => images.forEach((img) => URL.revokeObjectURL(img.preview));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFiles = async (fileList, isVerified = false) => {
    const incoming = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
    if (!incoming.length) return;
    setProcessing(true);

    // Mark new items as "processing" immediately for responsive feel
    const pendingItems = incoming.map((file) => ({
      file, preview: URL.createObjectURL(file), duplicate: false, processing: true, verified: isVerified
    }));
    onChange([...images, ...pendingItems]);

    const existingFiles = images.map((img) => ({ file: img.file }));
    const { duplicates } = await filterDuplicates(incoming, existingFiles);

    // Build final items
    const finalItems = incoming.map((file) => {
      const isDupe = duplicates.some((d) => d.file === file);
      const existing = pendingItems.find((p) => p.file === file);
      return { ...existing, duplicate: isDupe, processing: false };
    });

    onChange([...images, ...finalItems]);
    setDupeCount((c) => c + duplicates.length);
    setProcessing(false);
  };

  const removeItem = (target) => {
    URL.revokeObjectURL(target.preview);
    onChange(images.filter((img) => img !== target));
    if (target.duplicate) setDupeCount((c) => Math.max(0, c - 1));
  };

  const removeDuplicates = () => {
    images.filter((img) => img.duplicate).forEach((img) => URL.revokeObjectURL(img.preview));
    onChange(images.filter((img) => !img.duplicate));
    setDupeCount(0);
  };

  const uniqueCount = images.filter((i) => !i.duplicate).length;

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header stats */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4 text-sm">
          <span className="text-slate-300">
            <span className="text-white font-bold">{uniqueCount}</span> صورة فريدة
          </span>
          {dupeCount > 0 && (
            <span className="text-red-400 flex items-center gap-1">
              <AlertTriangle size={14} />
              {dupeCount} مكررة
            </span>
          )}
          {processing && (
            <span className="text-slate-400 flex items-center gap-1 text-xs">
              <Loader2 size={12} className="animate-spin" />
              جارٍ فحص التكرار...
            </span>
          )}
        </div>
        {dupeCount > 0 && (
          <button onClick={removeDuplicates}
            className="text-xs bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
            <X size={12} />
            حذف المكررة ({dupeCount})
          </button>
        )}
      </div>

      {/* Drop zone & Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Standard Upload */}
        <div
          onClick={() => inputRef.current.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files, false); }}
          className="border-2 border-dashed border-slate-600 hover:border-brand/60 hover:bg-slate-800/30 rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2"
        >
          <input ref={inputRef} type="file" accept="image/*" multiple className="hidden"
            onChange={(e) => handleFiles(e.target.files, false)} />
          <div className="w-12 h-12 rounded-xl bg-slate-700/60 flex items-center justify-center">
            <ImageIcon size={22} className="text-slate-400" />
          </div>
          <div>
            <p className="text-slate-300 font-medium text-sm">رفع صور من الجهاز</p>
            <p className="text-slate-500 text-[10px] mt-1">يتم فحص التكرار تلقائياً</p>
          </div>
        </div>

        {/* Live Capture */}
        <div
          onClick={() => cameraRef.current.click()}
          className="border-2 border-amber-500/30 hover:border-amber-400 bg-amber-500/5 hover:bg-amber-500/10 rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group"
        >
          <input ref={cameraRef} type="file" accept="image/*" capture="environment" multiple className="hidden"
            onChange={(e) => handleFiles(e.target.files, true)} />
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Camera size={22} className="text-amber-500" />
          </div>
          <div>
            <p className="text-amber-500 font-bold text-sm flex items-center justify-center gap-1">
              <ShieldCheck size={14} /> تصوير مباشر موثق
            </p>
            <p className="text-amber-500/60 text-[10px] mt-1">يمنح عقارك شارة الموثوقية</p>
          </div>
        </div>
      </div>

      {/* Gallery grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((item, i) => (
            <ImageTile key={i} item={item} onRemove={removeItem} />
          ))}
        </div>
      )}

      {/* Dedup notice */}
      {dupeCount > 0 && (
        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <AlertTriangle size={18} className="text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-red-300 text-sm font-semibold">تم اكتشاف {dupeCount} صورة مكررة</p>
            <p className="text-red-400/70 text-xs mt-0.5">الصور المحاطة بإطار أحمر تشابهت بصمتها البصرية مع صور أخرى. يمكنك حذفها أو الاحتفاظ بها.</p>
          </div>
        </div>
      )}
    </div>
  );
}
