import { Shield, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

const DOC_TYPES = [
  {
    id: 'tabu',
    label: 'طابو أخضر (سند التمليك)',
    level: 5,
    color: 'green',
    issuer: 'مديرية المصالح العقارية',
    desc: 'أقوى أدوات الإثبات القانوني — لا يُطعن فيه إلا بدعوى التزوير الجنائي. في حال الفقدان يُستخرج بدل ضائع.',
    action: null,
    risk: 'لا مخاطر',
  },
  {
    id: 'court',
    label: 'حكم محكمة مبرم',
    level: 4,
    color: 'green',
    issuer: 'المحاكم المدنية المختصة',
    desc: 'يُثبت الشراء قضائياً ويكثر في الأبنية على أراضٍ غير مفرزة. الملكية لا تنتقل تلقائياً بل تحتاج تنفيذاً.',
    action: 'فتح ملف تنفيذي في دائرة التنفيذ ونقل الحكم إلى الصحيفة العينية للعقار في مديرية المصالح العقارية.',
    risk: 'منخفض',
  },
  {
    id: 'irrevocable',
    label: 'وكالة غير قابلة للعزل',
    level: 3,
    color: 'amber',
    issuer: 'كاتب العدل المختص',
    desc: 'بيع منجز قانونياً وتعهد بنقل الملكية. لا تنتهي بوفاة الطرفين. تسقط بالتقادم العشري (10 سنوات).',
    action: 'التحقق من عدم انقضاء مدة التقادم العشري، وتسجيلها كإشارة على صحيفة العقار لمنع البيع المكرر.',
    risk: 'متوسط — يتطلب تحققاً',
  },
  {
    id: 'shares',
    label: 'أسهم على الشيوع',
    level: 2,
    color: 'amber',
    issuer: 'مديرية المصالح العقارية',
    desc: 'حصص سهمية غير مفرزة مادياً من أصل 2400 سهم. تنشأ عن الإرث غالباً. المالك يتصرف بحصته دون موافقة باقي الشركاء.',
    action: 'الفرز الرضائي بين الشركاء أو اللجوء للفرز القضائي لتحديد الحصة المادية وإصدار طابو مستقل.',
    risk: 'متوسط',
  },
  {
    id: 'informal',
    label: 'عقد عرفي / ساعة كهرباء',
    level: 1,
    color: 'red',
    issuer: 'مكاتب عقارية أو عقود عرفية',
    desc: 'يكثر في العشوائيات وأملاك الدولة. لا يوفر أي حماية قانونية عند منازعة الدولة على ملكية الرقبة.',
    action: 'رفع دعوى تثبيت بيع للحصول على حكم قضائي، أو تسوية الوضع مع كاتب العدل بعقد رسمي موثق.',
    risk: 'مرتفع جداً',
  },
];

const COLORS = {
  green: {
    bar:    'bg-green-500',
    text:   'text-green-700',
    bg:     'bg-green-50',
    border: 'border-green-200',
    icon:   'text-green-600',
    badge:  'bg-green-100 text-green-700 border-green-200',
    empty:  'bg-green-100',
  },
  amber: {
    bar:    'bg-amber-400',
    text:   'text-amber-700',
    bg:     'bg-amber-50',
    border: 'border-amber-200',
    icon:   'text-amber-600',
    badge:  'bg-amber-100 text-amber-700 border-amber-200',
    empty:  'bg-amber-100',
  },
  red: {
    bar:    'bg-red-500',
    text:   'text-red-700',
    bg:     'bg-red-50',
    border: 'border-red-200',
    icon:   'text-red-600',
    badge:  'bg-red-100 text-red-700 border-red-200',
    empty:  'bg-red-100',
  },
};

const LEVEL_LABELS = ['', 'ضعيف جداً', 'ضعيف', 'متوسط', 'قوي', 'قوي جداً'];

export default function DocStrengthMeter({ selected = 'tabu', onSelect }) {
  const doc = DOC_TYPES.find(d => d.id === selected) || DOC_TYPES[0];
  const c   = COLORS[doc.color];

  return (
    <div className="space-y-4" dir="rtl">
      {/* Selector */}
      <div>
        <p className="text-xs font-bold text-charcoal/60 mb-2">نوع مستند الملكية</p>
        <div className="space-y-2">
          {DOC_TYPES.map(d => {
            const dc = COLORS[d.color];
            const isSelected = selected === d.id;
            return (
              <button key={d.id} onClick={() => onSelect?.(d.id)}
                className={`w-full text-right flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${isSelected ? `${dc.border} ${dc.bg}` : 'border-navy/12 hover:border-navy/25 bg-white'}`}>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${isSelected ? dc.text : 'text-charcoal/70'}`}>{d.label}</p>
                  <p className="text-charcoal/40 text-[10px] mt-0.5">{d.issuer}</p>
                </div>
                {/* Strength bars */}
                <div className="flex gap-0.5 shrink-0">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className={`w-3.5 h-3.5 rounded-sm transition-colors ${i <= d.level ? dc.bar : 'bg-navy/10'}`} />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detail panel */}
      <div className={`rounded-2xl border-2 p-5 space-y-4 ${c.border} ${c.bg}`}>
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <p className={`font-black text-base ${c.text}`}>{doc.label}</p>
            <p className={`text-xs mt-0.5 ${c.text}/70`}>{doc.issuer}</p>
          </div>
          <div className="text-right shrink-0">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${c.badge}`}>
              {LEVEL_LABELS[doc.level]}
            </span>
            <div className="flex gap-1 mt-2 justify-end">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className={`w-5 h-5 rounded transition-colors ${i <= doc.level ? c.bar : c.empty}`} />
              ))}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className={`flex items-start gap-2 text-sm ${c.text}`}>
          <Shield size={15} className={`${c.icon} shrink-0 mt-0.5`} />
          <p className="leading-relaxed">{doc.desc}</p>
        </div>

        {/* Risk level */}
        <div className={`flex items-center gap-2 text-xs ${c.text}/80`}>
          <AlertTriangle size={13} className={c.icon} />
          <span>مستوى المخاطر: <strong>{doc.risk}</strong></span>
        </div>

        {/* Action required */}
        {doc.action && (
          <div className={`border-t ${c.border} pt-4 flex items-start gap-2`}>
            <TrendingUp size={14} className={`${c.icon} shrink-0 mt-0.5`} />
            <div>
              <p className={`text-xs font-bold ${c.text} mb-1`}>الإجراء المطلوب لتحصين الملكية:</p>
              <p className={`text-xs ${c.text}/80 leading-relaxed`}>{doc.action}</p>
            </div>
          </div>
        )}

        {/* No action needed */}
        {!doc.action && (
          <div className={`border-t ${c.border} pt-4 flex items-center gap-2 text-xs ${c.text}`}>
            <CheckCircle size={14} className={c.icon} />
            <span>لا يلزم أي إجراء — الوثيقة كاملة الحجية القانونية</span>
          </div>
        )}
      </div>

      {/* Upgrade path hint */}
      {doc.level < 5 && (
        <div className="text-[10px] text-charcoal/40 text-center leading-relaxed">
          الهدف النهائي دائماً: تسجيل الملكية في السجل العقاري والحصول على الطابو الأخضر
        </div>
      )}
    </div>
  );
}
