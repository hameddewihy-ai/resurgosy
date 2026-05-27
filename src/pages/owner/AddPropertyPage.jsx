
import SEO from '../../components/SEO';











const STEPS = ['معلومات العقار', 'وثائق التمليك (اختياري)', 'معرض الصور (اختياري)', 'مراجعة وإرسال'];

const PROPERTY_TYPES = [
  { value: 'residential', label: 'سكني',    icon: '🏠' },
  { value: 'commercial',  label: 'تجاري',   icon: '🏢' },
  { value: 'industrial',  label: 'صناعي',   icon: '🏭' },
  { value: 'land',        label: 'أرض',     icon: '🗺️' },
];

const SYRIAN_PROVINCES = [
  'دمشق', 'ريف دمشق', 'حلب', 'حمص', 'حماة', 'اللاذقية', 'طرطوس',
  'إدلب', 'دير الزور', 'الرقة', 'الحسكة', 'السويداء', 'درعا', 'القنيطرة',
];

const LISTING_TYPES = [
  { value: 'sale',    label: 'للبيع',       icon: '🏷️' },
  { value: 'rent',    label: 'للإيجار',     icon: '🔑' },
  { value: 'both',    label: 'بيع وإيجار',  icon: '🔄' },
];

const AMENITIES_LIST = [
  'موقف سيارات', 'مصعد', 'حديقة', 'تكييف مركزي', 'أمن 24/7',
  'مولد كهربائي', 'خزان مياه', 'إنترنت فائق السرعة',
  'قريب من المدارس', 'قريب من المستشفى',
];

const INITIAL_FORM = {
  title: '', property_type: '', listing_type: 'sale',
  province: '', city: '', address: '',
  price_estimate: '', rent_price: '',
  area: '', bedrooms: '', bathrooms: '',
  floor: '', total_floors: '',
  description: '', lat: '', lng: '',
  amenities: [],
};

// ────────────────────────────────────────────────────────────────
// Step 1: Property Info
// ────────────────────────────────────────────────────────────────
function StepInfo({ form, onChange, onToggleAmenity }) {
  return (
    <div className="space-y-6" dir="rtl">
      <SEO title="إضافة عقار" noindex />
      {/* Title */}
      <div>
        <label className="text-xs text-charcoal/60 font-medium block mb-2">عنوان العقار <span className="text-red-400">*</span></label>
        <input name="title" value={form.title} onChange={onChange} required
          placeholder="مثال: شقة فاخرة في المزة، 3 غرف نوم"
          className="input-field" />
      </div>

      {/* Property type */}
      <div>
        <label className="text-xs text-charcoal/60 font-medium block mb-2">نوع العقار <span className="text-red-400">*</span></label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PROPERTY_TYPES.map((t) => (
            <button key={t.value} type="button"
              onClick={() => onChange({ target: { name: 'property_type', value: t.value } })}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${form.property_type === t.value ? 'border-brand bg-brand/10' : 'border-navy/15 text-charcoal/60 hover:border-navy/30'}`}>
              <span className="text-2xl">{t.icon}</span>
              <span className="text-xs font-semibold text-navy">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Listing type */}
      <div>
        <label className="text-xs text-charcoal/60 font-medium block mb-2">نوع العرض <span className="text-red-400">*</span></label>
        <div className="grid grid-cols-3 gap-3">
          {LISTING_TYPES.map((t) => (
            <button key={t.value} type="button"
              onClick={() => onChange({ target: { name: 'listing_type', value: t.value } })}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all text-sm font-semibold ${form.listing_type === t.value ? 'border-brand bg-brand/10 text-navy' : 'border-navy/15 text-charcoal/60 hover:border-navy/30'}`}>
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Location */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-charcoal/60 font-medium block mb-2">المحافظة <span className="text-red-400">*</span></label>
          <select name="province" value={form.province} onChange={onChange}
            className="input-field appearance-none">
            <option value="">اختر المحافظة</option>
            {SYRIAN_PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-charcoal/60 font-medium block mb-2">المدينة / الحي</label>
          <input name="city" value={form.city} onChange={onChange}
            placeholder="المزة، العزيزية، باب توما..." className="input-field" />
        </div>
      </div>

      <div>
        <label className="text-xs text-charcoal/60 font-medium block mb-2">العنوان التفصيلي</label>
        <input name="address" value={form.address} onChange={onChange}
          placeholder="الشارع، رقم البناء، الطابق..." className="input-field" />
      </div>

      {/* Area + rooms */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <label className="text-xs text-charcoal/60 font-medium block mb-2">المساحة (م²)</label>
          <input name="area" value={form.area} onChange={onChange}
            type="number" min="0" placeholder="120"
            className="input-field text-sm" />
        </div>
        <div>
          <label className="text-xs text-charcoal/60 font-medium block mb-2">غرف النوم</label>
          <input name="bedrooms" value={form.bedrooms} onChange={onChange}
            type="number" min="0" max="20" placeholder="3"
            className="input-field text-sm" />
        </div>
        <div>
          <label className="text-xs text-charcoal/60 font-medium block mb-2">الحمامات</label>
          <input name="bathrooms" value={form.bathrooms} onChange={onChange}
            type="number" min="0" max="10" placeholder="2"
            className="input-field text-sm" />
        </div>
        <div>
          <label className="text-xs text-charcoal/60 font-medium block mb-2">الطابق</label>
          <input name="floor" value={form.floor} onChange={onChange}
            type="number" min="0" max="150" placeholder="4"
            className="input-field text-sm" />
        </div>
      </div>

      {/* Price */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {(form.listing_type === 'sale' || form.listing_type === 'both') && (
          <div>
            <label className="text-xs text-charcoal/60 font-medium block mb-2 flex items-center gap-1">
              <DollarSign size={13} className="text-brand" /> سعر البيع (USD)
            </label>
            <input name="price_estimate" value={form.price_estimate} onChange={onChange}
              type="number" min="0" placeholder="85000"
              className="input-field" />
          </div>
        )}
        {(form.listing_type === 'rent' || form.listing_type === 'both') && (
          <div>
            <label className="text-xs text-charcoal/60 font-medium block mb-2 flex items-center gap-1">
              <DollarSign size={13} className="text-cta" /> الإيجار الشهري (USD)
            </label>
            <input name="rent_price" value={form.rent_price} onChange={onChange}
              type="number" min="0" placeholder="500"
              className="input-field" />
          </div>
        )}
      </div>

      {/* Amenities */}
      <div>
        <label className="text-xs text-charcoal/60 font-medium block mb-2">المميزات والخدمات</label>
        <div className="flex flex-wrap gap-2">
          {AMENITIES_LIST.map((a) => {
            const active = form.amenities.includes(a);
            return (
              <button key={a} type="button" onClick={() => onToggleAmenity(a)}
                className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${active ? 'bg-brand border-brand text-white' : 'border-navy/15 text-charcoal/60 hover:border-brand/40 hover:text-navy'}`}>
                {a}
              </button>
            );
          })}
        </div>
      </div>

      {/* Coordinates */}
      <div>
        <label className="text-xs text-charcoal/60 font-medium block mb-2 flex items-center gap-1">
          <MapPin size={13} className="text-brand" />
          الإحداثيات الجغرافية (اختياري)
        </label>
        <div className="grid grid-cols-2 gap-3">
          <input name="lat" value={form.lat} onChange={onChange}
            type="number" step="any" placeholder="خط العرض  33.5138"
            className="input-field text-sm" />
          <input name="lng" value={form.lng} onChange={onChange}
            type="number" step="any" placeholder="خط الطول  36.2765"
            className="input-field text-sm" />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="text-xs text-charcoal/60 font-medium block mb-2">وصف العقار</label>
        <textarea name="description" value={form.description} onChange={onChange} rows={4}
          placeholder="أضف تفاصيل إضافية عن العقار..."
          className="input-field resize-none" />
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Step 4: Review & Submit
// ────────────────────────────────────────────────────────────────
function StepReview({ form, docs, images, engineer }) {
  const typeLabel    = PROPERTY_TYPES.find((t) => t.value === form.property_type)?.label  || form.property_type;
  const listingLabel = LISTING_TYPES.find((t) => t.value === form.listing_type)?.label    || form.listing_type;
  const uniqueImages = images.filter((i) => !i.duplicate);

  const rows = [
    ['العنوان',       form.title],
    ['نوع العقار',    typeLabel],
    ['نوع العرض',     listingLabel],
    ['المحافظة',      form.province],
    ['المدينة',       form.city],
    ['المساحة',       form.area       ? `${form.area} م²`                           : null],
    ['غرف النوم',    form.bedrooms   ? `${form.bedrooms} غرفة`                     : null],
    ['الحمامات',      form.bathrooms  ? `${form.bathrooms} حمام`                    : null],
    ['الطابق',        form.floor      ? `الطابق ${form.floor}`                      : null],
    ['سعر البيع',     form.price_estimate ? `$${Number(form.price_estimate).toLocaleString()}` : null],
    ['الإيجار الشهري', form.rent_price   ? `$${Number(form.rent_price).toLocaleString()}/شهر`  : null],
  ].filter(([, v]) => v);

  return (
    <div className="space-y-5" dir="rtl">
      <SEO title="إضافة عقار" noindex />
      <div className="card p-5 space-y-3">
        <h4 className="text-navy font-bold text-sm border-b border-navy/10 pb-2">معلومات العقار</h4>
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between text-sm">
            <span className="text-charcoal/60">{k}</span>
            <span className="text-navy font-semibold text-right max-w-[60%]">{v}</span>
          </div>
        ))}
      </div>

      {form.amenities?.length > 0 && (
        <div className="card p-4">
          <p className="text-xs text-charcoal/50 font-semibold mb-2">المميزات</p>
          <div className="flex flex-wrap gap-1.5">
            {form.amenities.map(a => (
              <span key={a} className="text-[11px] bg-brand/8 text-brand border border-brand/15 px-2.5 py-1 rounded-full font-medium">{a}</span>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        <div className="card p-4 text-center">
          <p className="text-2xl font-black text-navy">{docs.length}</p>
          <p className="text-charcoal/60 text-xs mt-1">وثيقة PDF</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-black text-brand">{uniqueImages.length}</p>
          <p className="text-charcoal/60 text-xs mt-1">صورة فريدة</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-black text-cta">{engineer ? '✓' : '—'}</p>
          <p className="text-charcoal/60 text-xs mt-1">مهندس مختار</p>
        </div>
      </div>

      {engineer && (
        <div className="card p-4 flex items-center gap-3" dir="rtl">
          <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center text-white font-bold shrink-0">
            {engineer.full_name[0]}
          </div>
          <div>
            <p className="text-navy font-semibold text-sm">{engineer.full_name}</p>
            <p className="text-charcoal/60 text-xs">{engineer.city} · {engineer.distanceKm} كم · ★ {engineer.rating}</p>
          </div>
          <span className="mr-auto text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full">محدد</span>
        </div>
      )}

      <div className="bg-brand/10 border border-brand/20 rounded-xl p-4 text-sm text-brand">
        بعد الإرسال سيُراجَع العقار من فريق RESURGO وسيحصل على شارة التحقق خلال 3-5 أيام عمل.
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Main Page
// ────────────────────────────────────────────────────────────────
export default function AddPropertyPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step,      setStep]      = useState(0);
  const [form,      setForm]      = useState(INITIAL_FORM);
  const [docs,      setDocs]      = useState([]);
  const [images,    setImages]    = useState([]);
  const [engineer,  setEngineer]  = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [saving,    setSaving]    = useState(false);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleToggleAmenity = (amenity) => {
    setForm(f => ({
      ...f,
      amenities: f.amenities.includes(amenity)
        ? f.amenities.filter(a => a !== amenity)
        : [...f.amenities, amenity],
    }));
  };

  const canAdvance = () => {
    if (step === 0) return form.title.trim() && form.property_type && form.province;
    return true;
  };

  const next = () => { if (canAdvance()) setStep((s) => Math.min(s + 1, STEPS.length - 1)); };
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const listingStatusMap = { sale: 'للبيع', rent: 'للإيجار', both: 'للبيع والإيجار' };
      const listingStatus = listingStatusMap[form.listing_type] || 'للبيع';

      if (isConfigured && user) {
        const imageUrls = images
          .filter(i => !i.duplicate && i.url)
          .map(i => i.url);

        const payload = {
          owner_id:        user.id,
          title:           form.title,
          description:     form.description,
          property_type:   form.property_type,
          listing_type:    form.listing_type,
          province:        form.province,
          city:            form.city,
          address:         form.address,
          area:            form.area        ? parseFloat(form.area)        : null,
          bedrooms:        form.bedrooms    ? parseInt(form.bedrooms)      : null,
          bathrooms:       form.bathrooms   ? parseInt(form.bathrooms)     : null,
          floor:           form.floor       ? parseInt(form.floor)         : null,
          price_estimate:  form.price_estimate ? parseFloat(form.price_estimate) : null,
          rent_price:      form.rent_price  ? parseFloat(form.rent_price)  : null,
          lat:             form.lat         ? parseFloat(form.lat)         : null,
          lng:             form.lng         ? parseFloat(form.lng)         : null,
          amenities:       form.amenities,
          images:          imageUrls,
          status:          'pending_review',
        };
        const { error } = await supabase
          .from('properties').insert([payload]);
        if (error) throw error;

        // Notify admin
        sendAdminAlert('hameddewihy@gmail.com', 'عقار جديد للمراجعة', {
          Title:    form.title,
          Province: form.province,
          Owner:    user.email,
        }).catch(() => {});
      } else {
      // Save to localStorage only when Supabase is not configured
      try {
        const LIST_KEY = 'resurgo-my-listings';
        const existing = JSON.parse(localStorage.getItem(LIST_KEY) || '[]');
        const priceDisplay = form.listing_type === 'rent'
          ? (form.rent_price ? `$${Number(form.rent_price).toLocaleString()}/شهر` : '—')
          : (form.price_estimate ? `$${Number(form.price_estimate).toLocaleString()}` : '—');
        const listing = {
          id: Date.now(),
          title:        form.title,
          city:         form.city || form.province,
          district:     form.province,
          status:       listingStatus,
          area:         form.area     || null,
          bedrooms:     form.bedrooms || null,
          bathrooms:    form.bathrooms || null,
          amenities:    form.amenities,
          priceDisplay,
          images: images.filter(i => !i.duplicate).map(i => i.url).filter(Boolean),
        };
        localStorage.setItem(LIST_KEY, JSON.stringify([listing, ...existing]));
      } catch {}
      }
      setSubmitted(true);
    } catch (err) {
      toast.error('حدث خطأ أثناء الإرسال: ' + (err.message ?? 'يرجى المحاولة مجدداً'));
    } finally {
      setSaving(false);
    }
  };

  const propertyCoords = form.lat && form.lng
    ? { lat: parseFloat(form.lat), lng: parseFloat(form.lng) }
    : { lat: 33.5138, lng: 36.2765 }; // Damascus fallback

  if (submitted) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-24" dir="rtl">
      <SEO title="إضافة عقار" noindex />
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-black text-navy mb-3">تم إضافة العقار بنجاح!</h2>
          <p className="text-charcoal/60 mb-2">"{form.title}"</p>
          <p className="text-charcoal/50 text-sm mb-8">قيد المراجعة من فريق RESURGO. ستصلك إشعار عند اكتمال التحقق.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => { setSubmitted(false); setStep(0); setForm(INITIAL_FORM); setDocs([]); setImages([]); setEngineer(null); }}
              className="btn-primary flex items-center justify-center gap-2">
              <Building2 size={17} />
              إضافة عقار آخر
            </button>
            <button
              onClick={() => navigate('/dashboard', { state: { propertyAdded: true } })}
              className="btn-cta flex items-center justify-center gap-2">
              <Home size={17} />
              عرض عقاراتي في لوحة التحكم
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream py-24 px-4" dir="rtl">
      <SEO title="إضافة عقار" noindex />
      {/* Background glow */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-brand/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-2xl mx-auto relative">
        {/* Page header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-brand/10 border border-brand/20 rounded-full px-4 py-1.5 text-brand text-sm font-medium mb-4">
            <Building2 size={14} />
            بوابة الملاك
          </div>
          <h1 className="text-3xl font-black text-navy">إضافة عقار جديد</h1>
          <p className="text-charcoal/60 text-sm mt-2">أضف عقارك لتحصل على تقييم هندسي موثّق وتسجيل بالبلوكتشين</p>
        </div>

        {/* Step indicator */}
        <StepIndicator steps={STEPS} current={step} />

        {/* Card */}
        <div className="card p-6 sm:p-8">
          {step === 0 && <StepInfo form={form} onChange={handleChange} onToggleAmenity={handleToggleAmenity} />}
          {step === 1 && <DocUploader files={docs} onChange={setDocs} />}
          {step === 2 && <SmartImageGallery images={images} onChange={setImages} />}
          {step === 3 && (
            <div className="space-y-6">
              <StepReview form={form} docs={docs} images={images} engineer={engineer} />
              <details className="border border-navy/10 rounded-xl overflow-hidden">
                <summary className="flex items-center gap-2 px-4 py-3 cursor-pointer text-sm font-semibold text-charcoal/70 hover:bg-cream transition-colors select-none">
                  <HardHat size={15} className="text-brand shrink-0" />
                  طلب مهندس للتحقق (اختياري)
                  <span className="mr-auto text-[10px] bg-brand/10 text-brand px-2 py-0.5 rounded-full font-bold">يمنح شارة ✓ موثّق</span>
                </summary>
                <div className="border-t border-navy/10 p-4">
                  <p className="text-charcoal/50 text-xs mb-4">يمكنك إرسال العقار الآن وطلب التحقق لاحقاً من لوحة التحكم.</p>
                  <EngineerMatcher propertyCoords={propertyCoords} onEngineerSelected={setEngineer} />
                </div>
              </details>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button onClick={prev} disabled={step === 0}
            className="flex items-center gap-2 text-charcoal/60 hover:text-navy disabled:opacity-0 disabled:pointer-events-none transition-colors font-medium">
            <ArrowRight size={18} />
            السابق
          </button>

          <span className="text-charcoal/50 text-xs">{step + 1} / {STEPS.length}</span>

          {step < STEPS.length - 1 ? (
            <button onClick={next} disabled={!canAdvance()}
              className="btn-primary flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
              التالي
              <ArrowLeft size={18} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={saving || images.some(i => i.processing)}
              className="btn-cta flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
              {(saving || images.some(i => i.processing))
                ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <CheckCircle size={18} />}
              {saving ? 'جارٍ الإرسال...' : images.some(i => i.processing) ? 'جارٍ رفع الصور...' : 'إرسال العقار'}
            </button>
          )}
        </div>

        {/* Step hint */}
        {step === 0 && !canAdvance() && (
          <p className="text-center text-amber-400/70 text-xs mt-3">* العنوان، النوع، والمحافظة مطلوبة للمتابعة</p>
        )}
      </div>
    </div>
  );
}
