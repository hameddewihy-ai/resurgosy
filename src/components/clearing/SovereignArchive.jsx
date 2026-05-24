import { useState } from 'react';
import {
  Archive, Shield, Download, CheckCircle, Loader2,
  Film, Copy, CheckCheck, Lock, Server, AlertCircle, Key,
} from 'lucide-react';

function DownloadButton({ label, data, filename, icon: Icon }) {
  const handleDownload = () => {
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <button onClick={handleDownload}
      className="flex items-center gap-2 bg-cream hover:bg-navy/8 border border-navy/12 text-charcoal/70 text-xs px-3 py-2 rounded-lg transition-colors">
      <Icon size={14} />
      {label}
      <Download size={12} className="mr-auto" />
    </button>
  );
}

function MetadataTree({ data, depth = 0 }) {
  const [collapsed, setCollapsed] = useState(depth > 1);
  if (typeof data !== 'object' || data === null) {
    return <span className="text-green-700 font-mono text-xs break-all">{JSON.stringify(data)}</span>;
  }
  const entries = Object.entries(data);
  return (
    <div className={`${depth > 0 ? 'mr-4 border-r border-navy/10 pr-3' : ''}`}>
      {entries.map(([k, v]) => (
        <div key={k} className="py-0.5">
          <div className="flex items-start gap-2">
            <span className="text-brand text-xs font-mono shrink-0">{k}:</span>
            {typeof v === 'object' && v !== null ? (
              <div className="flex-1">
                <button onClick={() => setCollapsed(!collapsed)}
                  className="text-charcoal/50 text-xs hover:text-navy">
                  {collapsed ? '▶ {…}' : '▼'}
                </button>
                {!collapsed && <MetadataTree data={v} depth={depth + 1} />}
              </div>
            ) : (
              <MetadataTree data={v} depth={depth + 1} />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── X.509 Certificate mock ────────────────────────────────────────────
function generateX509(refNo, archiveDate) {
  const digits = refNo.replace(/\D/g, '');
  const serial = digits.slice(0, 12).padStart(12, '0');
  const validFrom = new Date(archiveDate);
  const validTo   = new Date(archiveDate);
  validTo.setFullYear(validTo.getFullYear() + 1);

  const fingerprint = Array.from({ length: 16 }, (_, i) =>
    ((parseInt(serial[i % serial.length] || '0') * 17 + i * 37 + 0xAB) % 256)
      .toString(16).padStart(2, '0')
  ).join(':').toUpperCase();

  return {
    version: 'v3',
    serial,
    algorithm: 'SHA256withRSA',
    keyBits: 2048,
    subject: `CN=RESURGO-CLR-${serial}, O=Resurgo PropTech, C=SY`,
    issuer: 'CN=RESURGO-ROOT-CA, O=Resurgo PropTech, OU=Clearing Dept, C=SY',
    validFrom: validFrom.toLocaleDateString('ar-SY'),
    validTo:   validTo.toLocaleDateString('ar-SY'),
    fingerprint,
    keyUsage: 'Digital Signature, Non-Repudiation',
    status: 'VALID',
  };
}

function X509CertPanel({ archiveResult }) {
  const cert = generateX509(archiveResult.refNo, archiveResult.archiveDate);
  const [copied, setCopied] = useState(false);

  const fields = [
    ['الإصدار',           cert.version],
    ['الرقم التسلسلي',    cert.serial],
    ['خوارزمية التوقيع',  cert.algorithm],
    ['حجم المفتاح',       `RSA ${cert.keyBits}-bit`],
    ['الموضوع (Subject)', cert.subject],
    ['المُصدِر (Issuer)', cert.issuer],
    ['صالح من',           cert.validFrom],
    ['صالح حتى',          cert.validTo],
    ['استخدام المفتاح',   cert.keyUsage],
  ];

  return (
    <div className="bg-white overflow-hidden shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
      {/* Header — navy strip like AI prompt display */}
      <div className="bg-navy px-4 py-3 flex items-center gap-2">
        <Key size={14} className="text-brand shrink-0" />
        <p className="text-white font-bold text-xs flex-1">شهادة التوقيع الرقمي X.509 v3</p>
        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${cert.status === 'VALID' ? 'bg-green-500/20 text-green-300 border-green-400/30' : 'bg-red-500/20 text-red-300 border-red-400/30'}`}>
          {cert.status}
        </span>
      </div>

      {/* Certificate fields */}
      <div className="p-4 space-y-0 divide-y divide-navy/[0.06]">
        {fields.map(([k, v]) => (
          <div key={k} className="flex items-start justify-between gap-4 py-2.5 text-xs">
            <span className="text-charcoal/50 shrink-0 w-36">{k}</span>
            <span className="text-navy font-mono text-right break-all flex-1">{v}</span>
          </div>
        ))}

        {/* Fingerprint row with copy */}
        <div className="flex items-start justify-between gap-4 py-2.5 text-xs">
          <span className="text-charcoal/50 shrink-0 w-36">بصمة SHA-256</span>
          <div className="flex items-center gap-2 flex-1 justify-end">
            <span className="text-brand font-mono text-right break-all">{cert.fingerprint}</span>
            <button onClick={() => { navigator.clipboard.writeText(cert.fingerprint); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
              className="text-charcoal/40 hover:text-navy transition-colors shrink-0">
              {copied ? <CheckCheck size={12} className="text-green-600" /> : <Copy size={12} />}
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 py-2.5 border-t border-navy/10 bg-cream/60">
        <p className="text-charcoal/40 text-[10px] flex items-center gap-1">
          <Shield size={10} />
          موقَّع بواسطة RESURGO-ROOT-CA · متوافق مع ITU-T X.509:2019
        </p>
      </div>
    </div>
  );
}

export default function SovereignArchive({ draft, onArchive, archiving, archiveResult }) {
  const [copied, setCopied] = useState(false);
  const [view, setView] = useState('metadata');

  const canArchive = !!draft?.text;

  const copyHash = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5" dir="rtl">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center shrink-0">
          <Archive size={20} className="text-brand" />
        </div>
        <div>
          <h3 className="text-navy font-bold text-sm">الأرشفة السيادية</h3>
          <p className="text-charcoal/60 text-xs mt-0.5">
            تشفير AES-256-GCM · بيانات ميكروفيلم ANSI/AIIM MS23 · أرشيف وطني دائم
          </p>
        </div>
      </div>

      {/* What gets archived */}
      {!archiveResult && (
        <div className="bg-white p-4 space-y-3 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
          <p className="text-charcoal/70 text-xs font-medium">محتوى الأرشفة</p>
          {[
            [Shield,  'نسخة مشفرة AES-256-GCM من نص المسودة القانونية'],
            [Film,    'بيانات ميكروفيلم موحّدة (ANSI/AIIM MS23) للأرشفة التقليدية'],
            [Server,  'ربط بالمركز الوطني للأرشفة الرقمية — دمشق'],
            [Lock,    'رقم مرجع سيادي غير قابل للتكرار'],
          ].map(([Icon, text], i) => (
            <div key={i} className="flex items-center gap-3 text-sm text-charcoal/60">
              <Icon size={14} className="text-brand shrink-0" />
              {text}
            </div>
          ))}
        </div>
      )}

      {/* No draft warning */}
      {!canArchive && !archiveResult && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-700 text-sm">
          <AlertCircle size={17} className="shrink-0" />
          يجب توليد مسودة قانونية أولاً قبل الأرشفة
        </div>
      )}

      {/* Archive button */}
      {!archiveResult && (
        <button
          onClick={onArchive}
          disabled={!canArchive || archiving}
          className="w-full flex items-center justify-center gap-2 bg-white hover:bg-cream border-2 border-navy/15 hover:border-navy/30 text-navy font-bold py-4 rounded-2xl transition-all disabled:opacity-40 disabled:cursor-not-allowed group"
        >
          {archiving ? (
            <><Loader2 size={20} className="animate-spin text-brand" /> جارٍ التشفير والأرشفة...</>
          ) : (
            <>
              <div className="w-8 h-8 rounded-xl bg-cream/80 group-hover:bg-brand/10 flex items-center justify-center transition-colors">
                <Archive size={18} className="text-charcoal/60 group-hover:text-brand transition-colors" />
              </div>
              أرشفة سيادية — حفظ مشفّر نهائي
            </>
          )}
        </button>
      )}

      {/* Archive result */}
      {archiveResult && (
        <div className="space-y-4">
          {/* Success banner */}
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
            <CheckCircle size={22} className="text-green-600 shrink-0" />
            <div>
              <p className="text-green-700 font-bold text-sm">تمت الأرشفة السيادية بنجاح</p>
              <p className="text-green-600/70 text-xs mt-0.5">{new Date(archiveResult.archiveDate).toLocaleString('ar-SY')}</p>
            </div>
          </div>

          {/* Reference number */}
          <div className="bg-white p-4 flex items-center justify-between gap-3 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
            <div>
              <p className="text-charcoal/60 text-xs mb-1">رقم الأرشيف السيادي</p>
              <p className="text-navy font-black text-lg font-mono tracking-widest">{archiveResult.refNo}</p>
            </div>
            <button onClick={() => copyHash(archiveResult.refNo)}
              className="flex items-center gap-1 text-xs text-charcoal/50 hover:text-navy transition-colors">
              {copied ? <CheckCheck size={14} className="text-green-600" /> : <Copy size={14} />}
            </button>
          </div>

          {/* X.509 Digital Certificate */}
          <X509CertPanel archiveResult={archiveResult} />

          {/* Encryption details */}
          <div className="bg-white p-4 space-y-2 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
            <p className="text-charcoal/70 text-xs font-medium">تفاصيل التشفير</p>
            {[
              ['الخوارزمية',        archiveResult.encResult.algorithm],
              ['متجه التهيئة (IV)', archiveResult.encResult.iv.slice(0, 20) + '…'],
              ['بصمة المفتاح',      archiveResult.encResult.keyHex.slice(0, 24) + '…'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-xs">
                <span className="text-charcoal/60">{k}</span>
                <span className="text-navy font-mono">{v}</span>
              </div>
            ))}
          </div>

          {/* View toggle */}
          <div className="flex gap-2 text-xs">
            {[['metadata','بيانات الأرشيف'],['microfilm','ميكروفيلم'],['encrypted','التشفير']].map(([k, l]) => (
              <button key={k} onClick={() => setView(k)}
                className={`px-3 py-1.5 rounded-lg border transition-all ${view === k ? 'bg-brand/10 border-brand/30 text-brand' : 'border-navy/12 text-charcoal/60 hover:text-navy'}`}>
                {l}
              </button>
            ))}
          </div>

          {/* Data view */}
          <div className="bg-cream border border-navy/10 rounded-2xl p-4 max-h-64 overflow-y-auto">
            {view === 'metadata' && <MetadataTree data={archiveResult.metadata} />}
            {view === 'microfilm' && <MetadataTree data={archiveResult.metadata.frame} />}
            {view === 'encrypted' && (
              <pre className="text-green-700 text-xs font-mono break-all whitespace-pre-wrap">
                {archiveResult.encResult.ciphertext.slice(0, 300)}…
              </pre>
            )}
          </div>

          {/* Download buttons */}
          <div className="grid grid-cols-2 gap-3">
            <DownloadButton
              label="تحميل البيانات المشفرة"
              data={archiveResult.downloadable.encrypted}
              filename={`${archiveResult.refNo}-encrypted.json`}
              icon={Shield}
            />
            <DownloadButton
              label="تحميل بيانات الميكروفيلم"
              data={archiveResult.downloadable.metadata}
              filename={`${archiveResult.refNo}-microfilm.json`}
              icon={Film}
            />
          </div>

          <p className="text-charcoal/30 text-xs text-center">
            رقم الأرشيف مُربوط بمنصة إنجز الحكومية · غير قابل للحذف
          </p>
        </div>
      )}
    </div>
  );
}
