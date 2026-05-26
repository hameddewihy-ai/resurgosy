import { useState, useEffect, useRef } from 'react';
import { supabase, isConfigured } from '../../lib/supabase';
import { Upload, FileText, Image, File, Trash2, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const DOC_TYPES = [
  { value: 'deed',       label: 'صك الملكية',     accept: '.pdf,.jpg,.jpeg,.png,.webp' },
  { value: 'floor_plan', label: 'مخطط المنزل',    accept: '.pdf,.jpg,.jpeg,.png,.webp' },
  { value: 'permit',     label: 'رخصة البناء',    accept: '.pdf,.jpg,.jpeg,.png,.webp' },
  { value: 'photo',      label: 'صور إضافية',     accept: '.jpg,.jpeg,.png,.webp' },
  { value: 'other',      label: 'وثيقة أخرى',     accept: '.pdf,.jpg,.jpeg,.png,.webp,.doc,.docx' },
];

const MAX_SIZE_MB = 10;

function fileIcon(docType) {
  if (docType === 'photo') return <Image size={14} />;
  if (['deed','floor_plan','permit'].includes(docType)) return <FileText size={14} />;
  return <File size={14} />;
}

function typeLabel(docType) {
  return DOC_TYPES.find(t => t.value === docType)?.label || docType;
}

export default function DocumentManager({ propertyId, ownerId }) {
  const [docs,        setDocs]        = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [uploading,   setUploading]   = useState(false);
  const [docType,     setDocType]     = useState('deed');
  const [deletingId,  setDeletingId]  = useState(null);
  const fileRef = useRef(null);

  const fetchDocs = async () => {
    if (!isConfigured || !propertyId) { setLoading(false); return; }
    const { data } = await supabase
      .from('property_documents')
      .select('*')
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false });
    setDocs(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchDocs(); }, [propertyId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`الحجم الأقصى ${MAX_SIZE_MB} ميغابايت`);
      return;
    }

    setUploading(true);
    try {
      const ext      = file.name.split('.').pop();
      const safeName = `${Date.now()}.${ext}`;
      const path     = `${ownerId}/${propertyId}/${safeName}`;

      const { error: uploadErr } = await supabase.storage
        .from('property-docs')
        .upload(path, file, { upsert: false });

      if (uploadErr) throw uploadErr;

      const { data: { publicUrl } } = supabase.storage
        .from('property-docs')
        .getPublicUrl(path);

      const { error: dbErr } = await supabase
        .from('property_documents')
        .insert({
          property_id: propertyId,
          owner_id:    ownerId,
          file_name:   file.name,
          file_path:   path,
          file_url:    publicUrl,
          file_type:   docType,
          file_size:   file.size,
        });

      if (dbErr) throw dbErr;

      toast.success('تم رفع الوثيقة بنجاح');
      fetchDocs();
    } catch (err) {
      toast.error('فشل رفع الملف — تحقق من الصلاحيات');
      console.error(err);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleDelete = async (doc) => {
    if (!window.confirm(`حذف "${doc.file_name}"؟`)) return;
    setDeletingId(doc.id);
    try {
      await supabase.storage.from('property-docs').remove([doc.file_path]);
      await supabase.from('property_documents').delete().eq('id', doc.id);
      setDocs(prev => prev.filter(d => d.id !== doc.id));
      toast.success('تم حذف الوثيقة');
    } catch {
      toast.error('فشل الحذف');
    } finally {
      setDeletingId(null);
    }
  };

  if (!isConfigured) return (
    <div className="flex items-center gap-2 text-charcoal/40 text-xs py-2">
      <AlertCircle size={13} /> رفع الوثائق يتطلب تفعيل Supabase
    </div>
  );

  return (
    <div className="px-4 pb-4 pt-3 border-t border-navy/[0.05]" dir="rtl">
      <p className="text-[11px] font-bold text-charcoal/50 uppercase tracking-widest mb-3">
        الوثائق والمرفقات
      </p>

      {/* Existing documents */}
      {loading ? (
        <div className="flex items-center gap-2 text-charcoal/40 text-xs py-1">
          <Loader2 size={12} className="animate-spin" /> جارٍ التحميل...
        </div>
      ) : docs.length === 0 ? (
        <p className="text-charcoal/35 text-xs mb-3">لا توجد وثائق مرفوعة بعد</p>
      ) : (
        <div className="space-y-1.5 mb-3">
          {docs.map(doc => (
            <div key={doc.id}
              className="flex items-center gap-2.5 bg-cream/60 border border-navy/[0.06] rounded-lg px-3 py-2">
              <span className="text-brand shrink-0">{fileIcon(doc.file_type)}</span>
              <div className="flex-1 min-w-0">
                <a href={doc.file_url} target="_blank" rel="noopener noreferrer"
                  className="text-[11px] font-semibold text-navy hover:text-brand transition-colors truncate block">
                  {doc.file_name}
                </a>
                <p className="text-[10px] text-charcoal/40">
                  {typeLabel(doc.file_type)} · {(doc.file_size / 1024).toFixed(0)} KB
                </p>
              </div>
              <button
                onClick={() => handleDelete(doc)}
                disabled={deletingId === doc.id}
                className="text-charcoal/25 hover:text-red-400 transition-colors shrink-0 disabled:opacity-50"
              >
                {deletingId === doc.id
                  ? <Loader2 size={12} className="animate-spin" />
                  : <Trash2 size={12} />}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload row */}
      <div className="flex items-center gap-2 flex-wrap">
        <select
          value={docType}
          onChange={e => setDocType(e.target.value)}
          className="text-xs border border-navy/15 rounded-lg px-2.5 py-1.5 bg-white outline-none focus:ring-2 focus:ring-brand/20 text-charcoal/70"
          dir="rtl"
        >
          {DOC_TYPES.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>

        <input
          ref={fileRef}
          type="file"
          className="hidden"
          accept={DOC_TYPES.find(t => t.value === docType)?.accept}
          onChange={handleUpload}
        />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-brand/10 text-brand hover:bg-brand/20 transition-colors disabled:opacity-50"
        >
          {uploading
            ? <><Loader2 size={12} className="animate-spin" /> جارٍ الرفع...</>
            : <><Upload size={12} /> رفع ملف</>}
        </button>
        <span className="text-[10px] text-charcoal/35">الحد الأقصى {MAX_SIZE_MB} MB</span>
      </div>
    </div>
  );
}
