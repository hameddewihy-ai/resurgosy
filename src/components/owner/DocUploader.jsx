import { useState, useRef } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';

const MAX_SIZE_MB = 20;
const ALLOWED_TYPES = ['application/pdf'];

function FileRow({ file, onRemove }) {
  const sizeMB = (file.size / 1024 / 1024).toFixed(2);
  const valid = ALLOWED_TYPES.includes(file.type) && file.size <= MAX_SIZE_MB * 1024 * 1024;
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border ${valid ? 'border-slate-700 bg-slate-800/40' : 'border-red-500/40 bg-red-500/5'}`}>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${valid ? 'bg-brand/10' : 'bg-red-500/10'}`}>
        <FileText size={20} className={valid ? 'text-brand' : 'text-red-400'} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate">{file.name}</p>
        <p className="text-slate-400 text-xs">{sizeMB} MB · PDF</p>
      </div>
      {valid
        ? <CheckCircle size={18} className="text-green-400 shrink-0" />
        : <AlertCircle size={18} className="text-red-400 shrink-0" />}
      <button onClick={() => onRemove(file)} className="text-slate-500 hover:text-red-400 transition-colors ml-1">
        <X size={16} />
      </button>
    </div>
  );
}

export default function DocUploader({ files, onChange }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  const addFiles = (incoming) => {
    const newFiles = Array.from(incoming).filter(
      (f) => !files.find((e) => e.name === f.name && e.size === f.size)
    );
    onChange([...files, ...newFiles]);
  };

  const removeFile = (target) => onChange(files.filter((f) => f !== target));

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Drop zone */}
      <div
        onClick={() => inputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200
          ${dragging ? 'border-brand bg-brand/10 scale-[1.01]' : 'border-slate-600 hover:border-brand/60 hover:bg-slate-800/40'}`}
      >
        <input ref={inputRef} type="file" accept=".pdf" multiple className="hidden"
          onChange={(e) => addFiles(e.target.files)} />
        <div className="flex flex-col items-center gap-3">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${dragging ? 'bg-brand text-white' : 'bg-slate-700/60 text-slate-400'}`}>
            <Upload size={26} />
          </div>
          <div>
            <p className="text-white font-semibold mb-1">اسحب ملفات PDF هنا أو انقر للاختيار</p>
            <p className="text-slate-400 text-sm">سندات التمليك، عقود الشراء، قرارات الإرث · حتى {MAX_SIZE_MB} MB لكل ملف</p>
          </div>
          <div className="flex gap-2 text-xs text-slate-500">
            <span className="bg-slate-700 px-2 py-1 rounded">PDF فقط</span>
            <span className="bg-slate-700 px-2 py-1 rounded">حتى {MAX_SIZE_MB} MB</span>
            <span className="bg-slate-700 px-2 py-1 rounded">ملفات متعددة</span>
          </div>
        </div>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-slate-400 text-xs font-medium">{files.length} ملف مرفوع</p>
          {files.map((f, i) => (
            <FileRow key={i} file={f} onRemove={removeFile} />
          ))}
        </div>
      )}
    </div>
  );
}
