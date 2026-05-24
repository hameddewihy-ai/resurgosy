import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Link as LinkIcon, Send, FileText, CheckCircle, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function StudyWorkspaceModal({ isOpen, onClose, projectName, onHandover }) {
  const [links, setLinks] = useState([
    { id: 1, title: 'المخطط المعماري المبدئي (AutoCAD)', url: 'https://drive.google.com/...', time: '10:30 AM' }
  ]);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');

  if (!isOpen) return null;

  const handleAddLink = (e) => {
    e.preventDefault();
    if (!newTitle || !newUrl) return;
    setLinks([...links, { id: Date.now(), title: newTitle, url: newUrl, time: 'الآن' }]);
    setNewTitle('');
    setNewUrl('');
    toast.success('تمت إضافة رابط الملف بنجاح');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" dir="rtl">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-navy/60 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-navy text-white px-6 py-5 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-black mb-1">مساحة عمل التصميم</h2>
            <p className="text-white/60 text-xs">مشروع: {projectName}</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-cream/30">
          
          {/* Note for Syrian Context */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
            <ShieldCheck size={20} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-800 font-bold text-sm mb-1">توفير بيانات الإنترنت</p>
              <p className="text-amber-700/80 text-xs leading-relaxed">
                لتجنب مشاكل التحميل البطيء وانقطاع الاتصال، يُرجى رفع ملفات (AutoCAD / Revit) الثقيلة على خدمات التخزين السحابي مثل Google Drive أو Dropbox وإرفاق الروابط هنا.
              </p>
            </div>
          </div>

          {/* Links List */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-navy flex items-center gap-2">
              <FileText size={16} className="text-brand" /> الملفات المشتركة
            </h3>
            {links.length === 0 ? (
              <p className="text-center py-6 text-charcoal/40 text-sm">لا توجد ملفات مشتركة بعد</p>
            ) : (
              links.map(link => (
                <div key={link.id} className="bg-white border border-navy/10 rounded-xl p-4 flex items-start justify-between gap-4 hover:border-brand/30 transition-colors">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-navy/5 flex items-center justify-center shrink-0">
                      <LinkIcon size={18} className="text-navy/60" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-navy font-bold text-sm truncate">{link.title}</p>
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-brand text-xs hover:underline truncate block mt-0.5" dir="ltr">{link.url}</a>
                    </div>
                  </div>
                  <div className="text-left shrink-0">
                    <p className="text-[10px] text-charcoal/40 mb-1">{link.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add Link Form */}
          <form onSubmit={handleAddLink} className="bg-white border border-navy/10 rounded-2xl p-4 space-y-3 shadow-sm">
            <p className="text-xs font-bold text-navy mb-2">إرفاق رابط جديد</p>
            <input 
              type="text" 
              placeholder="وصف الملف (مثل: المخطط التنفيذي النهائي)" 
              className="w-full bg-cream border-0 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <div className="flex gap-2">
              <input 
                type="url" 
                placeholder="https://drive.google.com/..." 
                className="flex-1 bg-cream border-0 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand text-left" dir="ltr"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
              />
              <button type="submit" disabled={!newTitle || !newUrl} className="bg-navy text-white px-5 rounded-xl hover:bg-navy/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-bold text-sm">
                <Send size={16} /> إرسال
              </button>
            </div>
          </form>

        </div>

        {/* Footer actions */}
        <div className="p-6 bg-white border-t border-navy/5 flex flex-col sm:flex-row gap-3">
          <button onClick={() => { onClose(); onHandover(); }} className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-green-500/20 flex items-center justify-center gap-2">
            <CheckCircle size={18} /> تسليم المخطط وتحرير الأتعاب
          </button>
          <button onClick={onClose} className="sm:w-32 bg-cream text-charcoal hover:bg-navy/5 font-bold py-3.5 rounded-xl transition-colors">
            إغلاق
          </button>
        </div>

      </motion.div>
    </div>
  );
}
