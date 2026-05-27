import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Pencil, Trash2, Search, X,
  CheckCircle, FileText, Globe, AlertTriangle, ChevronDown,
  Image as ImageIcon, Tag, Clock,
} from 'lucide-react';
import { useNews } from '../../hooks/useNews';
import { CATEGORIES, getCategoryColor, getCategoryLabel } from '../../data/newsData';
import toast from 'react-hot-toast';

// ── Blank form state ──────────────────────────────────────────────────────────
const BLANK = {
  title: '', summary: '', body: '', cat: 'market',
  image: '', tags: '', author: 'فريق RESURGO',
  status: 'draft', featured: false,
};

// ── Confirm delete dialog ─────────────────────────────────────────────────────
function ConfirmDialog({ title, onConfirm, onCancel }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-navy/50 backdrop-blur-sm px-4"
      onClick={onCancel}>
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" dir="rtl">
        <div className="flex items-start gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
            <AlertTriangle size={18} className="text-red-500" />
          </div>
          <div>
            <p className="text-navy font-bold text-sm mb-1">تأكيد الحذف</p>
            <p className="text-charcoal/60 text-xs leading-relaxed">
              هل أنت متأكد من حذف "<span className="font-semibold text-navy">{title}</span>"؟ لا يمكن التراجع عن هذا الإجراء.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={onConfirm}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm font-bold py-2.5 rounded-xl transition-colors">
            حذف
          </button>
          <button onClick={onCancel}
            className="flex-1 border border-navy/15 text-charcoal/60 text-sm py-2.5 rounded-xl hover:text-navy transition-colors">
            إلغاء
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Article form panel ────────────────────────────────────────────────────────
function ArticleForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState({ ...BLANK, ...initial });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const wordCount = (form.body || '').split(/\s+/).filter(Boolean).length;
  const readTime  = Math.max(1, Math.ceil(wordCount / 200));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('العنوان مطلوب'); return; }
    if (!form.summary.trim()) { toast.error('الملخص مطلوب'); return; }
    if (!form.body.trim())    { toast.error('نص المقال مطلوب'); return; }
    if (!form.image.trim())   { toast.error('رابط الصورة مطلوب'); return; }
    onSave({
      ...form,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
    });
  };

  return (
    <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 260 }}
      className="fixed top-0 left-0 bottom-0 w-full max-w-xl bg-white z-50 flex flex-col shadow-2xl border-r border-navy/10"
      dir="rtl">

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-navy/10 shrink-0">
        <p className="text-navy font-black text-base">
          {initial?.id ? 'تعديل المقال' : 'مقال جديد'}
        </p>
        <button onClick={onClose} className="text-charcoal/40 hover:text-navy transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* Scrollable form */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-charcoal/60 mb-1.5 uppercase tracking-wider">
            العنوان <span className="text-red-400">*</span>
          </label>
          <input value={form.title} onChange={e => set('title', e.target.value)}
            placeholder="عنوان المقال..."
            className="w-full input-field text-sm py-3 font-bold" />
        </div>

        {/* Summary */}
        <div>
          <label className="block text-xs font-semibold text-charcoal/60 mb-1.5 uppercase tracking-wider">
            الملخص <span className="text-red-400">*</span>
          </label>
          <textarea value={form.summary} onChange={e => set('summary', e.target.value)}
            rows={3} placeholder="ملخص موجز للمقال (150-200 حرف)..."
            className="w-full input-field text-xs leading-relaxed resize-none" />
          <p className="text-charcoal/35 text-[10px] mt-1">{form.summary.length} حرف</p>
        </div>

        {/* Body */}
        <div>
          <label className="block text-xs font-semibold text-charcoal/60 mb-1.5 uppercase tracking-wider">
            نص المقال <span className="text-red-400">*</span>
          </label>
          <p className="text-charcoal/40 text-[10px] mb-1.5">
            اترك سطراً فارغاً بين الفقرات. ابدأ السطر بـ <code className="bg-cream px-1 rounded"># </code> لعنوان رئيسي.
          </p>
          <textarea value={form.body} onChange={e => set('body', e.target.value)}
            rows={12} placeholder="اكتب نص المقال هنا..."
            className="w-full input-field text-xs leading-loose resize-y font-mono" />
          <div className="flex items-center justify-between mt-1">
            <p className="text-charcoal/35 text-[10px]">{wordCount} كلمة</p>
            <p className="text-charcoal/35 text-[10px] flex items-center gap-1">
              <Clock size={9} /> وقت القراءة المقدَّر: {readTime} دق
            </p>
          </div>
        </div>

        {/* Category + Author */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal/60 mb-1.5 uppercase tracking-wider">التصنيف</label>
            <div className="relative">
              <select value={form.cat} onChange={e => set('cat', e.target.value)}
                className="w-full input-field text-xs appearance-none pr-3 pl-7 py-2.5">
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
              <ChevronDown size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-charcoal/40 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-charcoal/60 mb-1.5 uppercase tracking-wider">الكاتب</label>
            <input value={form.author} onChange={e => set('author', e.target.value)}
              placeholder="اسم الكاتب" className="w-full input-field text-xs py-2.5" />
          </div>
        </div>

        {/* Image URL + preview */}
        <div>
          <label className="block text-xs font-semibold text-charcoal/60 mb-1.5 uppercase tracking-wider">
            رابط الصورة <span className="text-red-400">*</span>
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <ImageIcon size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
              <input value={form.image} onChange={e => set('image', e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full input-field text-xs py-2.5 pr-8" />
            </div>
          </div>
          {form.image && (
            <div className="mt-2 h-24 rounded-xl overflow-hidden border border-navy/10">
              <img src={form.image} alt="" className="w-full h-full object-cover"
                onError={e => { e.target.style.display = 'none'; }} />
            </div>
          )}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs font-semibold text-charcoal/60 mb-1.5 uppercase tracking-wider">
            الوسوم
          </label>
          <div className="relative">
            <Tag size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
            <input value={form.tags} onChange={e => set('tags', e.target.value)}
              placeholder="استثمار، دمشق، 2025 (مفصولة بفواصل)"
              className="w-full input-field text-xs py-2.5 pr-8" />
          </div>
        </div>

        {/* Status + Featured */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-charcoal/60 mb-2 uppercase tracking-wider">الحالة</label>
            <div className="flex gap-2">
              {[['published', 'منشور', Globe], ['draft', 'مسودة', FileText]].map(([val, label, Icon]) => (
                <button key={val} type="button" onClick={() => set('status', val)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border text-xs font-semibold transition-all ${form.status === val
                    ? val === 'published' ? 'bg-green-500 border-green-500 text-white' : 'bg-navy/10 border-navy/20 text-navy'
                    : 'border-navy/15 text-charcoal/50 hover:border-navy/25'}`}>
                  <Icon size={12} /> {label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-charcoal/60 mb-2 uppercase tracking-wider">مميز</label>
            <button type="button" onClick={() => set('featured', !form.featured)}
              className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border text-xs font-semibold transition-all ${form.featured ? 'bg-cta border-cta text-white' : 'border-navy/15 text-charcoal/50 hover:border-navy/25'}`}>
              {form.featured ? <CheckCircle size={12} /> : <Plus size={12} />}
              {form.featured ? 'مميز' : 'عادي'}
            </button>
          </div>
        </div>
      </form>

      {/* Footer actions */}
      <div className="px-6 py-4 border-t border-navy/10 flex gap-3 shrink-0 bg-white">
        <button type="button" onClick={handleSubmit}
          className="flex-1 btn-cta flex items-center justify-center gap-2 text-sm font-bold py-3">
          <CheckCircle size={15} />
          {initial?.id ? 'حفظ التعديلات' : 'نشر المقال'}
        </button>
        <button type="button" onClick={onClose}
          className="px-5 border border-navy/15 text-charcoal/60 rounded-2xl hover:text-navy text-sm transition-colors">
          إلغاء
        </button>
      </div>
    </motion.div>
  );
}

// ── Stats card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color = 'text-navy' }) {
  return (
    <div className="bg-white p-4 text-center shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
      <p className={`font-black text-2xl ${color}`}>{value}</p>
      <p className="text-charcoal/60 text-xs mt-0.5">{label}</p>
      {sub && <p className="text-charcoal/35 text-[10px] mt-0.5">{sub}</p>}
    </div>
  );
}

// ── Main CMS page ─────────────────────────────────────────────────────────────
export default function NewsCMSPage() {
  const { articles, loading: newsLoading, addArticle, updateArticle, deleteArticle, toggleStatus } = useNews();

  const [search,      setSearch]      = useState('');
  const [filterCat,   setFilterCat]   = useState('all');
  const [filterStatus,setFilterStatus]= useState('all');
  const [formOpen,    setFormOpen]    = useState(false);
  const [editing,     setEditing]     = useState(null);
  const [deleteTarget,setDeleteTarget]= useState(null);

  const stats = useMemo(() => ({
    total:     articles.length,
    published: articles.filter(a => a.status === 'published').length,
    draft:     articles.filter(a => a.status === 'draft').length,
  }), [articles]);

  const visible = useMemo(() => {
    let r = articles;
    if (filterCat    !== 'all') r = r.filter(a => a.cat    === filterCat);
    if (filterStatus !== 'all') r = r.filter(a => a.status === filterStatus);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      r = r.filter(a => a.title.toLowerCase().includes(q) || a.author.toLowerCase().includes(q));
    }
    return r;
  }, [articles, filterCat, filterStatus, search]);

  const openAdd  = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (a) => { setEditing(a);   setFormOpen(true); };

  const handleSave = async (data) => {
    try {
      if (editing?.id) {
        await updateArticle(editing.id, data);
        toast.success('تم حفظ التعديلات');
      } else {
        await addArticle(data);
        toast.success('تم نشر المقال');
      }
      setFormOpen(false);
      setEditing(null);
    } catch (err) {
      toast.error('خطأ: ' + (err.message ?? 'تعذّر الحفظ'));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteArticle(deleteTarget.id);
      toast('تم حذف المقال', { icon: '🗑️' });
    } catch (err) {
      toast.error('خطأ: ' + (err.message ?? 'تعذّر الحذف'));
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleToggle = async (a) => {
    try {
      await toggleStatus(a.id);
      toast(a.status === 'published' ? 'تحويل إلى مسودة' : 'تم النشر', {
        icon: a.status === 'published' ? '📝' : '✅',
      });
    } catch (err) {
      toast.error('خطأ: ' + (err.message ?? 'تعذّر التحديث'));
    }
  };

  return (
    <div className="min-h-screen bg-cream pt-[62px]" dir="rtl">
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <p className="text-brand text-xs font-bold uppercase tracking-widest mb-1">لوحة التحكم</p>
            <h1 className="text-navy font-black text-2xl">إدارة الأخبار</h1>
          </div>
          <button onClick={openAdd}
            className="btn-cta flex items-center gap-2 text-sm font-bold px-5 py-3">
            <Plus size={16} /> مقال جديد
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 sm:grid-cols-3 gap-4 mb-8">
          <StatCard label="إجمالي المقالات" value={stats.total} />
          <StatCard label="منشور" value={stats.published} color="text-green-600" />
          <StatCard label="مسودة" value={stats.draft} color="text-amber-600" />
        </div>

        {/* Filters */}
        <div className="bg-white p-4 mb-5 flex flex-wrap items-center gap-3 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="ابحث بالعنوان أو الكاتب..."
              className="w-full input-field text-xs py-2.5 pr-9 pl-3" />
            {search && (
              <button onClick={() => setSearch('')} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/30 hover:text-navy">
                <X size={11} />
              </button>
            )}
          </div>

          {/* Category */}
          <div className="relative">
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
              className="input-field text-xs py-2.5 pr-3 pl-7 appearance-none">
              <option value="all">كل التصنيفات</option>
              {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
            <ChevronDown size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-charcoal/40 pointer-events-none" />
          </div>

          {/* Status */}
          <div className="flex gap-1.5">
            {[['all', 'الكل'], ['published', 'منشور'], ['draft', 'مسودة']].map(([val, label]) => (
              <button key={val} onClick={() => setFilterStatus(val)}
                className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${filterStatus === val ? 'bg-brand border-brand text-white' : 'border-navy/15 text-charcoal/60 hover:border-brand/30'}`}>
                {label}
              </button>
            ))}
          </div>

          <p className="text-charcoal/40 text-xs mr-auto">
            <span className="font-bold text-navy">{visible.length}</span> مقال
          </p>
        </div>

        {/* Articles table */}
        <div className="space-y-2">
          {newsLoading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-4 flex items-center gap-4 animate-pulse shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
                <div className="w-16 h-12 rounded-xl bg-navy/8 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-navy/8 rounded-full w-2/3" />
                  <div className="h-2 bg-navy/6 rounded-full w-1/3" />
                </div>
              </div>
            ))
          ) : visible.length === 0 ? (
            <div className="text-center py-16 text-charcoal/40">
              <FileText size={36} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">لا توجد مقالات</p>
            </div>
          ) : visible.map((a) => (
            <motion.div key={a.id} layout
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white p-4 flex items-center gap-4 shadow-[0_2px_8px_rgba(31,42,56,0.06)]"
              style={{ borderRadius: '8px' }}>

              {/* Thumbnail */}
              <div className="w-16 h-12 rounded-xl overflow-hidden shrink-0 border border-navy/10">
                <img src={a.image} alt="" className="w-full h-full object-cover" loading="lazy" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-navy font-bold text-sm truncate">{a.title}</h3>
                  {a.featured && (
                    <span className="text-[9px] bg-cta/10 text-cta border border-cta/20 px-1.5 py-0.5 rounded-full font-bold shrink-0">مميز</span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${getCategoryColor(a.cat)}`}>
                    {getCategoryLabel(a.cat)}
                  </span>
                  <span className="text-charcoal/40 text-[10px]">{a.author}</span>
                  <span className="text-charcoal/40 text-[10px] flex items-center gap-1">
                    <Clock size={9} /> {a.date}
                  </span>
                </div>
              </div>

              {/* Status + actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => handleToggle(a)}
                  className={`flex items-center gap-1.5 text-[10px] px-2.5 py-1.5 rounded-lg border font-semibold transition-all ${a.status === 'published'
                    ? 'bg-green-50 border-green-200 text-green-700 hover:bg-red-50 hover:border-red-200 hover:text-red-600'
                    : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-green-50 hover:border-green-200 hover:text-green-600'}`}>
                  {a.status === 'published' ? <><Globe size={10} /> منشور</> : <><FileText size={10} /> مسودة</>}
                </button>

                <button onClick={() => openEdit(a)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl border border-navy/15 text-charcoal/50 hover:text-brand hover:border-brand/30 transition-all">
                  <Pencil size={13} />
                </button>

                <button onClick={() => setDeleteTarget(a)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl border border-navy/15 text-charcoal/50 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all">
                  <Trash2 size={13} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Form panel overlay */}
      <AnimatePresence>
        {formOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-navy/30 z-40 backdrop-blur-sm"
              onClick={() => setFormOpen(false)} />
            <ArticleForm
              key={editing?.id ?? 'new'}
              initial={editing ? {
                ...editing,
                tags: editing.tags?.join('، ') ?? '',
              } : undefined}
              onSave={handleSave}
              onClose={() => { setFormOpen(false); setEditing(null); }}
            />
          </>
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <AnimatePresence>
        {deleteTarget && (
          <ConfirmDialog
            title={deleteTarget.title}
            onConfirm={handleDelete}
            onCancel={() => setDeleteTarget(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
