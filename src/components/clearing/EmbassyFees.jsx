import { useState } from 'react';
import { Globe, FileText, Info, Clock, DollarSign } from 'lucide-react';

const SERVICES = [
  {
    id: 'poa_sale',
    label: 'وكالة خاصة ببيع عقار',
    fee: 100,
    currency: '$',
    validity: '12 شهراً',
    docs: [
      'جواز سفر الموكل أو هويته الوطنية',
      'صورة هوية الوكيل',
      'بيان قيد عقاري مصدق من الخارجية بدمشق (أقل من 3 أشهر)',
    ],
    note: 'يشترط حضور الموكل شخصياً أمام القنصل للتوقيع',
    warning: null,
  },
  {
    id: 'poa_cert',
    label: 'تصديق وكالة منظمة بالخارج',
    fee: 50,
    currency: '$',
    validity: '12 شهراً',
    docs: [
      'الوكالة مصدقة من وزارتي العدل والخارجية بالبلد المضيف',
      'ترجمة معتمدة إلى العربية',
    ],
    note: 'للوكالات المنظمة لدى كاتب عدل أجنبي وتسلك مسار التوثيق الأجنبي',
    warning: null,
  },
  {
    id: 'poa_revoke',
    label: 'عزل وكالة خارجية',
    fee: 100,
    currency: '$',
    validity: null,
    docs: [
      'جواز سفر الموكل',
      'صورة الوكالة المطلوب عزلها',
      'عنوان الوكيل التفصيلي في سوريا',
    ],
    note: 'يجب أن تكون الوكالة منظمة في نفس البعثة، أو إنشاء وكالة عزل خاصة',
    warning: 'تظل الوكالة سارية حتى يتبلغ الوكيل الإنذار رسمياً — يضع الكاتب إشارة حمراء بعد ثبوت التبليغ',
  },
  {
    id: 'consular_reg',
    label: 'التسجيل القنصلي',
    fee: 50,
    currency: '$',
    validity: null,
    docs: [
      'جواز السفر الأصلي وصورته',
      'بطاقة شخصية أو بيان قيد فردي مصدق',
      'صورتان شخصيتان',
    ],
    note: 'خطوة تأسيسية إلزامية — تمكّن المغترب من إجراء أي معاملة قنصلية لاحقة',
    warning: null,
  },
  {
    id: 'expat_card',
    label: 'سند إقامة للمغترب',
    fee: 100,
    currency: '$',
    validity: null,
    docs: [
      'إقامة نظامية بالبلد المضيف أو ختم دخول/خروج نظامي',
      '4 صور شخصية حديثة',
    ],
    note: 'يُستخدم لإثبات الإقامة بالخارج وتيسير الإعفاءات الجمركية عند العودة',
    warning: null,
  },
  {
    id: 'transit',
    label: 'تذكرة عبور قنصلية',
    fee: 25,
    currency: '$',
    validity: '15 يوماً (مرة واحدة)',
    docs: [
      'هوية أو جواز سفر (منتهي مقبول) أو إخراج قيد',
      'صورتان شخصيتان',
      'ضبط شرطة في حال فقدان الجواز',
    ],
    note: 'صالحة للاستعمال مرة واحدة — تستغرق الموافقة 7 أيام',
    warning: null,
  },
];

const CHAIN = [
  { step: 1, label: 'كاتب عدل أجنبي',            note: 'توثيق الوكالة' },
  { step: 2, label: 'وزارة عدل البلد المضيف',     note: 'تصديق رسمي' },
  { step: 3, label: 'وزارة خارجية البلد المضيف',  note: 'تصديق دبلوماسي' },
  { step: 4, label: 'السفارة / القنصلية السورية', note: 'تصديق قنصلي' },
  { step: 5, label: 'وزارة خارجية دمشق',          note: 'تصديق نهائي' },
  { step: 6, label: 'كاتب العدل المحلي',           note: 'إيداع وتفعيل' },
];

const INTERNAL = [
  { label: 'رسوم كاتب العدل',                   est: '15,000 – 30,000' },
  { label: 'رسوم مديرية المصالح العقارية',        est: '10,000 – 25,000' },
  { label: 'طوابع مالية وبلدية وخدمية',           est: '5,000 – 15,000' },
  { label: 'موافقة أمنية "لا مانع" (إن لزم)',     est: 'مجانية — آلية' },
];

export default function EmbassyFees() {
  const [selected, setSelected] = useState('poa_sale');
  const [showChain, setShowChain] = useState(false);
  const svc = SERVICES.find(s => s.id === selected);

  return (
    <div className="space-y-5" dir="rtl">
      {/* Service selector */}
      <div>
        <p className="text-xs font-bold text-charcoal/60 mb-2">نوع المعاملة القنصلية</p>
        <div className="space-y-2">
          {SERVICES.map(s => (
            <button key={s.id} onClick={() => setSelected(s.id)}
              className={`w-full text-right flex items-center justify-between gap-3 px-4 py-3 rounded-xl border-2 transition-all ${selected === s.id ? 'border-brand bg-brand/5' : 'border-navy/12 hover:border-brand/30 bg-white'}`}>
              <p className={`text-sm font-medium ${selected === s.id ? 'text-navy font-bold' : 'text-charcoal/70'}`}>{s.label}</p>
              <span className={`text-base font-black shrink-0 ${selected === s.id ? 'text-brand' : 'text-charcoal/40'}`}>
                {s.currency}{s.fee}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Selected service details */}
      {svc && (
        <div className="bg-white p-4 space-y-4 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-navy font-bold text-sm">{svc.label}</p>
              {svc.validity && (
                <p className="text-charcoal/50 text-xs mt-0.5 flex items-center gap-1">
                  <Clock size={11} />صلاحية الوثيقة: {svc.validity}
                </p>
              )}
            </div>
            <div className="text-right shrink-0">
              <p className="text-brand font-black text-2xl">{svc.currency}{svc.fee}</p>
              <p className="text-charcoal/40 text-[10px]">رسوم السفارة</p>
            </div>
          </div>

          {/* Required docs */}
          <div>
            <p className="text-xs font-bold text-charcoal/60 mb-2 flex items-center gap-1.5">
              <FileText size={12} className="text-brand" />
              الوثائق المطلوبة
            </p>
            <ul className="space-y-2">
              {svc.docs.map((d, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-charcoal/70">
                  <span className="w-5 h-5 rounded-full bg-brand/10 text-brand text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-bold">
                    {i + 1}
                  </span>
                  {d}
                </li>
              ))}
            </ul>
          </div>

          {/* Note */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700 flex items-start gap-2">
            <Info size={12} className="shrink-0 mt-0.5" />
            {svc.note}
          </div>

          {/* Warning if any */}
          {svc.warning && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 flex items-start gap-2">
              <Info size={12} className="shrink-0 mt-0.5" />
              {svc.warning}
            </div>
          )}
        </div>
      )}

      {/* Internal fees estimate */}
      <div>
        <p className="text-xs font-bold text-charcoal/60 mb-2 flex items-center gap-1.5">
          <DollarSign size={12} className="text-brand" />
          الرسوم الداخلية المتوقعة (ل.س)
        </p>
        <div className="bg-white divide-y divide-navy/8 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
          {INTERNAL.map((f, i) => (
            <div key={i} className="flex justify-between items-center px-4 py-2.5 text-xs">
              <span className="text-charcoal/60">{f.label}</span>
              <span className="text-navy font-bold">{f.est}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Certification chain */}
      <div>
        <button onClick={() => setShowChain(!showChain)}
          className="flex items-center gap-2 text-xs text-charcoal/60 hover:text-brand transition-colors w-full text-right">
          <Globe size={12} className="text-brand" />
          <span className="flex-1">سلسلة تصديق الوكالة الخارجية (6 مراحل)</span>
          <span className="text-charcoal/40">{showChain ? '▲' : '▼'}</span>
        </button>
        {showChain && (
          <div className="mt-3 space-y-2">
            {CHAIN.map((c, i) => (
              <div key={c.step} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-brand/10 text-brand text-[10px] flex items-center justify-center shrink-0 font-bold border border-brand/20">
                  {c.step}
                </div>
                {i < CHAIN.length - 1 && (
                  <div className="absolute mt-6 mr-3 w-px h-4 bg-brand/20" />
                )}
                <div>
                  <p className="text-xs text-navy font-medium">{c.label}</p>
                  <p className="text-[10px] text-charcoal/50">{c.note}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Embassy contact */}
      <div className="bg-navy/5 rounded-xl p-3 text-xs text-charcoal/60 space-y-1">
        <p className="font-bold text-navy text-xs">السفارة السورية في الرياض</p>
        <p>شارع عمرو الضمري، حي السفارات — ر.ب 12512</p>
        <p>+966 11 488 7481 · info@syrianembassy-sa.org</p>
        <p className="text-brand">syrianembassy-sa.org</p>
        <p className="text-charcoal/40 mt-1">الحجز: تطبيق MOFA SY أو شركات التيسير القنصلي</p>
      </div>
    </div>
  );
}
