import { useState, useEffect } from 'react';
import { FileText, RefreshCw, Copy, CheckCheck, Wand2, ChevronDown, BookOpen, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { LEGAL_TEMPLATES } from '../../hooks/useAIClearing';

const CLAIM_TYPES = [
  { value: 'sale_contract',        label: 'عقد بيع قطعي',              icon: '🏠' },
  { value: 'attorney_special',     label: 'وكالة خاصة ببيع عقار',      icon: '📜' },
  { value: 'attorney_irrevocable', label: 'وكالة غير قابلة للعزل',     icon: '🔒' },
  { value: 'inheritance_inventory',label: 'حصر الإرث',                  icon: '⚖️' },
  { value: 'power_of_attorney',    label: 'وكالة قانونية عامة',         icon: '📋' },
  { value: 'title_recovery',       label: 'طلب استرداد ملكية',          icon: '🏛️' },
];

function generateRefNo() {
  const yr  = new Date().getFullYear();
  const seq = String(Math.floor(Math.random() * 90000 + 10000));
  return `SY-CLR-${yr}-${seq}`;
}

function buildData(claimType, extractResult, partyData, refNo, today) {
  const ext = extractResult?.extracted || {};
  const pd  = partyData || {};

  // Flatten all party data into a single map for easy lookup
  const flat = {};
  Object.entries(pd).forEach(([party, fields]) => {
    if (typeof fields === 'object') {
      Object.entries(fields).forEach(([k, v]) => { flat[`${party}__${k}`] = v; });
    }
  });

  const any = (keys, fallback = '______________________') => {
    for (const k of keys) {
      const v = flat[k] || ext[k];
      if (v) return v;
    }
    return fallback;
  };

  if (claimType === 'sale_contract') {
    return {
      refNo, date: today,
      seller_name:    any(['البائع__الاسم الكامل'], ext.grantor_name    || '______________________'),
      seller_id:      any(['البائع__الرقم الوطني'], ext.grantor_id      || '______________'),
      seller_address: any(['البائع__محل الإقامة'],  ext.grantor_address || '______________________'),
      buyer_name:     any(['المشتري__الاسم الكامل'],ext.agent_name      || '______________________'),
      buyer_id:       any(['المشتري__الرقم الوطني'],ext.agent_id        || '______________'),
      buyer_address:  any(['المشتري__محل الإقامة'], ext.agent_address   || '______________________'),
      property_no:    ext.property_no   || '______',
      property_area:  ext.property_area || '______',
      property_city:  ext.property_city || 'دمشق',
      property_area_m2: ext.property_area_m2 || '______',
      property_desc:  ext.property_description || 'شقة سكنية — يُحدَّد وفق السجل العقاري',
      price:          ext.price   || '______________________',
      deposit:        ext.deposit || '______________________',
      city:           ext.city    || 'دمشق',
    };
  }

  if (claimType === 'attorney_special') {
    const gName = any(['الموكِّل__الاسم الكامل', 'المغترب (الموكِّل)__الاسم الكامل'], ext.grantor_name || '______________________');
    const gId   = any(['الموكِّل__الرقم الوطني', 'المغترب (الموكِّل)__الرقم الوطني'], ext.grantor_id   || '______________');
    const gAddr = any(['الموكِّل__محل الإقامة',  'المغترب (الموكِّل)__محل الإقامة'],  ext.grantor_address || '______________________');
    const aName = any(['الوكيل__الاسم الكامل',   'الوكيل المحلي__الاسم الكامل'],       ext.agent_name   || '______________________');
    const aId   = any(['الوكيل__الرقم الوطني',   'الوكيل المحلي__الرقم الوطني'],       ext.agent_id     || '______________');
    const aAddr = any(['الوكيل__محل الإقامة',    'الوكيل المحلي__محل الإقامة'],        ext.agent_address || '______________________');
    return {
      refNo, date: today,
      notary_city: ext.notary_city || 'دمشق',
      grantor_name: gName, grantor_id: gId, grantor_address: gAddr,
      agent_name:   aName, agent_id:   aId, agent_address:   aAddr,
      property_no:   ext.property_no   || '______',
      property_area: ext.property_area || '______',
      property_desc: ext.property_description || 'يُحدَّد وفق وثيقة التمليك',
    };
  }

  if (claimType === 'attorney_irrevocable') {
    return {
      refNo, date: today,
      notary_city: ext.notary_city || 'دمشق',
      grantor_name:    any(['البائع (الموكِّل)__الاسم الكامل'], ext.grantor_name    || '______________________'),
      grantor_id:      any(['البائع (الموكِّل)__الرقم الوطني'], ext.grantor_id      || '______________'),
      grantor_address: any(['البائع (الموكِّل)__محل الإقامة'],  ext.grantor_address || '______________________'),
      agent_name:      any(['المشتري (الوكيل)__الاسم الكامل'],  ext.agent_name      || '______________________'),
      agent_id:        any(['المشتري (الوكيل)__الرقم الوطني'],  ext.agent_id        || '______________'),
      agent_address:   any(['المشتري (الوكيل)__محل الإقامة'],   ext.agent_address   || '______________________'),
      price:                ext.price            || '______________________',
      property_description: ext.property_description || 'يُحدَّد وفق وثيقة التمليك',
      land_registry_no:     ext.land_registry_no || '______',
    };
  }

  if (claimType === 'inheritance_inventory') {
    return {
      refNo,
      death_date:       ext.death_date        || '___/___/______',
      court:            ext.court             || 'محكمة الأحوال الشخصية المختصة',
      deceased_name:    any(['المتوفى__الاسم الكامل'], ext.deceased_name || '______________________'),
      deceased_id:      any(['المتوفى__الرقم الوطني'], ext.deceased_id   || '______________'),
      death_place:      any(['المتوفى__مكان القيد'],    ext.death_place   || '______________________'),
      religion:         any(['المتوفى__الديانة'],        ext.religion      || 'مسلم'),
      heirs:            any(['الورثة__أسماء الورثة وحصصهم السهمية'], ext.heirs || '  لم تُحدَّد بعد'),
      real_estate:      ext.real_estate  || 'يُحدَّد لاحقاً',
      movables:         ext.movables     || 'يُحدَّد لاحقاً',
      debts:            ext.debts        || 'لا يوجد',
      court_decision_no: ext.court_decision_no || 'قيد الإصدار',
    };
  }

  if (claimType === 'power_of_attorney') {
    return {
      refNo, date: today,
      grantor_name:    ext.grantor_name    || '______________________',
      grantor_id:      ext.grantor_id      || '______________',
      grantor_address: ext.grantor_address || '______________________',
      agent_name:      ext.agent_name      || '______________________',
      agent_id:        ext.agent_id        || '______________',
      agent_address:   ext.agent_address   || '______________________',
      scope:                ext.scope                || 'تسجيل العقار وإتمام كافة الإجراءات القانونية ذات الصلة',
      property_description: ext.property_description || 'يُحدَّد وفق وثيقة التمليك',
      special_powers:       ext.special_powers       || 'التصرف بالبيع والشراء والتسجيل',
      duration:             ext.duration             || 'سنة واحدة من تاريخ التوثيق',
    };
  }

  // title_recovery
  return {
    refNo, date: today,
    applicant_name:       any(['مقدم الطلب__الاسم الكامل'], ext.applicant_name || '______________________'),
    applicant_id:         any(['مقدم الطلب__الرقم الوطني'], ext.applicant_id   || '______________'),
    applicant_role:       any(['مقدم الطلب__صفته القانونية'], ext.applicant_role || 'المالك الأصلي أو وريثه الشرعي'),
    property_description: ext.property_description || 'يُحدَّد وفق مستندات الملكية',
    land_registry_no:     ext.land_registry_no     || '______',
    cadastral_no:         ext.cadastral_no          || '______',
    legal_basis:          'القانون رقم 10 لعام 2018 وتعديلاته — حق الملكية الدستوري المادة 15',
    attached_docs:        ext.attached_docs || 'يُحدَّد لاحقاً',
    notes:                ext.notes || '',
  };
}

export default function LegalDraftGenerator({ extractResult, onDraftReady, forcedType, partyData }) {
  const defaultType = forcedType || extractResult?.doc_type || 'inheritance_inventory';
  const [claimType,  setClaimType]  = useState(defaultType);
  const [draft,      setDraft]      = useState('');
  const [generating, setGenerating] = useState(false);
  const [copied,     setCopied]     = useState(false);
  const [refNo]                     = useState(generateRefNo);
  const [showLawRef, setShowLawRef] = useState(false);

  const template = LEGAL_TEMPLATES[claimType];

  useEffect(() => {
    if (forcedType) setClaimType(forcedType);
    else if (extractResult?.doc_type) setClaimType(extractResult.doc_type);
  }, [forcedType, extractResult]);

  const generateDraft = async () => {
    setGenerating(true);
    await new Promise(r => setTimeout(r, 900));
    const today = new Date().toLocaleDateString('ar-SY', { year: 'numeric', month: 'long', day: 'numeric' });
    const data   = buildData(claimType, extractResult, partyData, refNo, today);
    const text   = template?.template(data) || '';
    setDraft(text);
    setGenerating(false);
    onDraftReady?.({ text, refNo, claimType });
  };

  const copyDraft = () => {
    navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5" dir="rtl">
      {/* Type selector — only show if not forced */}
      {!forcedType && (
        <div>
          <p className="text-charcoal/60 text-xs font-medium mb-2">نوع الوثيقة القانونية</p>
          <div className="grid grid-cols-3 gap-2">
            {CLAIM_TYPES.map(ct => (
              <button key={ct.value} onClick={() => setClaimType(ct.value)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${claimType === ct.value ? 'border-brand bg-brand/5 text-navy' : 'border-navy/12 text-charcoal/60 hover:border-brand/30 hover:text-navy'}`}>
                <span className="text-xl">{ct.icon}</span>
                <span className="text-[10px] font-medium text-center leading-tight">{ct.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Forced type badge */}
      {forcedType && (
        <div className="flex items-center gap-2 bg-brand/5 border border-brand/20 rounded-xl px-4 py-2.5">
          <span className="text-xl">{CLAIM_TYPES.find(c => c.value === forcedType)?.icon}</span>
          <div>
            <p className="text-navy font-bold text-xs">{CLAIM_TYPES.find(c => c.value === forcedType)?.label}</p>
            <p className="text-charcoal/50 text-[10px]">محدد تلقائياً من نوع المعاملة</p>
          </div>
        </div>
      )}

      {/* Law reference */}
      <div>
        <button onClick={() => setShowLawRef(!showLawRef)}
          className="flex items-center gap-2 text-xs text-charcoal/60 hover:text-brand transition-colors">
          <BookOpen size={13} />
          المرجع القانوني المعتمد
          <ChevronDown size={13} className={`transition-transform ${showLawRef ? 'rotate-180' : ''}`} />
        </button>
        {showLawRef && (
          <div className="mt-2 bg-cream border border-navy/10 rounded-xl p-3 text-xs text-charcoal/70 font-mono leading-relaxed">
            {template?.lawRef || '—'}
          </div>
        )}
      </div>

      {/* Ref number */}
      <div className="flex items-center justify-between bg-cream border border-navy/10 rounded-xl px-4 py-3">
        <span className="text-charcoal/60 text-xs">رقم المرجع التلقائي</span>
        <span className="text-brand font-mono text-sm font-bold">{refNo}</span>
      </div>

      {/* Generate button */}
      <button onClick={generateDraft} disabled={generating}
        className="btn-cta w-full flex items-center justify-center gap-2 disabled:opacity-60">
        {generating
          ? <><RefreshCw size={17} className="animate-spin" /> جارٍ صياغة المسودة القانونية...</>
          : <><Wand2 size={17} /> توليد المسودة القانونية آلياً</>}
      </button>

      {/* Draft output */}
      {draft && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-navy font-bold text-sm flex items-center gap-2">
              <FileText size={15} className="text-brand" />
              المسودة — {CLAIM_TYPES.find(c => c.value === claimType)?.label}
            </p>
            <div className="flex gap-2">
              <button onClick={copyDraft}
                className="flex items-center gap-1 text-xs text-charcoal/60 hover:text-navy border border-navy/12 hover:border-navy/30 px-3 py-1.5 rounded-lg transition-colors">
                {copied ? <CheckCheck size={12} className="text-green-600" /> : <Copy size={12} />}
                {copied ? 'تم النسخ' : 'نسخ'}
              </button>
              <button onClick={generateDraft}
                className="flex items-center gap-1 text-xs text-brand border border-brand/25 hover:border-brand px-3 py-1.5 rounded-lg transition-colors">
                <RefreshCw size={12} />
                إعادة الصياغة
              </button>
            </div>
          </div>

          <textarea
            value={draft}
            onChange={e => { setDraft(e.target.value); onDraftReady?.({ text: e.target.value, refNo, claimType }); }}
            rows={20}
            className="w-full bg-white border border-navy/15 rounded-xl p-4 text-navy text-sm font-mono leading-7 focus:outline-none focus:border-brand/40 resize-none"
            dir="rtl"
          />

          {/* QR Code verification block */}
          <div className="flex items-center gap-4 bg-cream border border-navy/10 rounded-xl p-4">
            <QRCodeSVG
              value={`RESURGO-DOC|${refNo}|${claimType}|${new Date().toISOString().slice(0,10)}`}
              size={72}
              bgColor="transparent"
              fgColor="#1f2a38"
              level="M"
            />
            <div className="flex-1 min-w-0">
              <p className="text-navy font-bold text-xs flex items-center gap-1.5">
                <QrCode size={12} className="text-brand" />
                رمز التحقق من الوثيقة
              </p>
              <p className="text-charcoal/55 text-[10px] mt-1 leading-relaxed">
                امسح الرمز للتحقق من صحة الوثيقة ومطابقتها للمرجع <span className="font-mono text-brand">{refNo}</span>
              </p>
              <p className="text-charcoal/35 text-[10px] mt-1">
                صادر من RESURGO · {new Date().toLocaleDateString('ar-SY')}
              </p>
            </div>
          </div>

          <p className="text-charcoal/40 text-xs text-center">
            يمكن تحرير المسودة مباشرةً · تُحفظ التعديلات تلقائياً للأرشفة
          </p>
        </div>
      )}
    </div>
  );
}
