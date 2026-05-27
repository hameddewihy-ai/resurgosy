
import SEO from '../../components/SEO';







const PROPERTY_TYPES = [
  { value: 'residential', label: 'سكني',  icon: '🏠' },
  { value: 'commercial',  label: 'تجاري', icon: '🏢' },
  { value: 'industrial',  label: 'صناعي', icon: '🏭' },
  { value: 'land',        label: 'أرض',   icon: '🗺️' },
];
const LISTING_TYPES = [
  { value: 'sale', label: 'للبيع',     icon: '🏷️' },
  { value: 'rent', label: 'للإيجار',   icon: '🔑' },
  { value: 'both', label: 'بيع وإيجار',icon: '🔄' },
];
const SYRIAN_PROVINCES = [
  'دمشق','ريف دمشق','حلب','حمص','حماة','اللاذقية','طرطوس',
  'إدلب','دير الزور','الرقة','الحسكة','السويداء','درعا','القنيطرة',
];
const AMENITIES_LIST = [
  'موقف سيارات','مصعد','حديقة','تكييف مركزي','أمن 24/7',
  'مولد كهربائي','خزان مياه','إنترنت فائق السرعة',
  'قريب من المدارس','قريب من المستشفى',
];

export default function EditPropertyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [notFound, setNotFound] = useState(false);

  const [form, setForm] = useState({
    title: '', property_type: '', listing_type: 'sale',
    province: '', city: '', address: '',
    price_estimate: '', rent_price: '',
    area: '', bedrooms: '', bathrooms: '', floor: '',
    description: '', amenities: [],
  });

  // Existing image URLs already in DB (strings)
  const [existingImages, setExistingImages] = useState([]);
  // New images added via SmartImageGallery (objects with .url)
  const [newImages, setNewImages] = useState([]);

  // Load property on mount
  useEffect(() => {
    if (!id) return;
    supabase.from('properties').select('*').eq('id', id).single()
      .then(({ data, error }) => {
        if (error || !data) { setNotFound(true); setLoading(false); return; }
        if (data.owner_id !== user?.id) { setNotFound(true); setLoading(false); return; }
        setForm({
          title:         data.title         || '',
          property_type: data.property_type || '',
          listing_type:  data.listing_type  || 'sale',
          province:      data.province      || '',
          city:          data.city          || '',
          address:       data.address       || '',
          price_estimate:data.price_estimate ? String(data.price_estimate) : '',
          rent_price:    data.rent_price    ? String(data.rent_price)    : '',
          area:          data.area          ? String(data.area)          : '',
          bedrooms:      data.bedrooms      ? String(data.bedrooms)      : '',
          bathrooms:     data.bathrooms     ? String(data.bathrooms)     : '',
          floor:         data.floor         ? String(data.floor)         : '',
          description:   data.description   || '',
          amenities:     data.amenities     || [],
        });
        setExistingImages(data.images || []);
        setLoading(false);
      });
  }, [id, user]);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const toggleAmenity = (a) => setForm(f => ({
    ...f,
    amenities: f.amenities.includes(a) ? f.amenities.filter(x => x !== a) : [...f.amenities, a],
  }));

  const removeExistingImage = (url) =>
    setExistingImages(prev => prev.filter(u => u !== url));

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.property_type || !form.province) {
      toast.error('العنوان، النوع، والمحافظة مطلوبة');
      return;
    }
    setSaving(true);
    try {
      const uploadedUrls = newImages.filter(i => !i.duplicate && i.url).map(i => i.url);
      const allImages = [...existingImages, ...uploadedUrls];

      const { error } = await supabase.from('properties').update({
        title:          form.title.trim(),
        property_type:  form.property_type,
        listing_type:   form.listing_type,
        province:       form.province,
        city:           form.city,
        address:        form.address,
        price_estimate: form.price_estimate ? parseFloat(form.price_estimate) : null,
        rent_price:     form.rent_price     ? parseFloat(form.rent_price)     : null,
        area:           form.area           ? parseFloat(form.area)           : null,
        bedrooms:       form.bedrooms       ? parseInt(form.bedrooms)         : null,
        bathrooms:      form.bathrooms      ? parseInt(form.bathrooms)        : null,
        floor:          form.floor          ? parseInt(form.floor)            : null,
        description:    form.description,
        amenities:      form.amenities,
        images:         allImages,
        updated_at:     new Date().toISOString(),
      }).eq('id', id).eq('owner_id', user.id);

      if (error) throw error;
      toast.success('تم حفظ التعديلات');
      navigate('/dashboard');
    } catch (err) {
      toast.error('حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <SEO title="تعديل عقار" noindex />
      <Loader2 size={28} className="animate-spin text-brand" />
    </div>
  );

  if (notFound) return (
    <div className="min-h-screen bg-cream flex items-center justify-center" dir="rtl">
      <SEO title="تعديل عقار" noindex />
      <div className="text-center space-y-3">
        <p className="text-navy font-bold text-lg">العقار غير موجود أو لا تملك صلاحية تعديله</p>
        <Link to="/dashboard" className="text-brand hover:underline text-sm flex items-center gap-1 justify-center">
          <ArrowRight size={14} /> العودة للوحة التحكم
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-cream pb-20 pt-20" dir="rtl">
      <SEO title="تعديل عقار" noindex />
      <div className="max-w-2xl mx-auto px-4">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link to="/dashboard" className="text-charcoal/50 hover:text-navy transition-colors">
            <ArrowRight size={20} />
          </Link>
          <div>
            <h1 className="text-navy font-black text-xl">تعديل العقار</h1>
            <p className="text-charcoal/50 text-xs mt-0.5">جميع التغييرات تُحفظ مباشرةً في قاعدة البيانات</p>
          </div>
        </div>

        <div className="space-y-6">

          {/* Basic Info */}
          <div className="card p-5 space-y-5">
            <h3 className="text-navy font-bold text-sm border-b border-navy/10 pb-2">المعلومات الأساسية</h3>

            <div>
              <label className="text-xs text-charcoal/60 font-medium block mb-2">عنوان العقار <span className="text-red-400">*</span></label>
              <input name="title" value={form.title} onChange={handleChange}
                placeholder="مثال: شقة فاخرة في المزة" className="input-field" />
            </div>

            <div>
              <label className="text-xs text-charcoal/60 font-medium block mb-2">نوع العقار <span className="text-red-400">*</span></label>
              <div className="grid grid-cols-4 gap-2">
                {PROPERTY_TYPES.map(t => (
                  <button key={t.value} type="button"
                    onClick={() => handleChange({ target: { name: 'property_type', value: t.value } })}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-xs font-semibold ${form.property_type === t.value ? 'border-brand bg-brand/10 text-navy' : 'border-navy/15 text-charcoal/60 hover:border-navy/30'}`}>
                    <span className="text-xl">{t.icon}</span>{t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-charcoal/60 font-medium block mb-2">نوع العرض</label>
              <div className="grid grid-cols-3 gap-2">
                {LISTING_TYPES.map(t => (
                  <button key={t.value} type="button"
                    onClick={() => handleChange({ target: { name: 'listing_type', value: t.value } })}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border-2 transition-all text-sm font-semibold ${form.listing_type === t.value ? 'border-brand bg-brand/10 text-navy' : 'border-navy/15 text-charcoal/60 hover:border-navy/30'}`}>
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="card p-5 space-y-4">
            <h3 className="text-navy font-bold text-sm border-b border-navy/10 pb-2 flex items-center gap-2">
              <MapPin size={14} className="text-brand" /> الموقع
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-charcoal/60 font-medium block mb-2">المحافظة <span className="text-red-400">*</span></label>
                <select name="province" value={form.province} onChange={handleChange} className="input-field appearance-none">
                  <option value="">اختر المحافظة</option>
                  {SYRIAN_PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-charcoal/60 font-medium block mb-2">المدينة / الحي</label>
                <input name="city" value={form.city} onChange={handleChange} placeholder="المزة، العزيزية..." className="input-field" />
              </div>
            </div>
            <div>
              <label className="text-xs text-charcoal/60 font-medium block mb-2">العنوان التفصيلي</label>
              <input name="address" value={form.address} onChange={handleChange} placeholder="الشارع، رقم البناء..." className="input-field" />
            </div>
          </div>

          {/* Specs & Price */}
          <div className="card p-5 space-y-4">
            <h3 className="text-navy font-bold text-sm border-b border-navy/10 pb-2">المساحة والسعر</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { name:'area',      label:'المساحة (م²)', placeholder:'120' },
                { name:'bedrooms',  label:'غرف النوم',    placeholder:'3'   },
                { name:'bathrooms', label:'الحمامات',     placeholder:'2'   },
                { name:'floor',     label:'الطابق',       placeholder:'4'   },
              ].map(f => (
                <div key={f.name}>
                  <label className="text-xs text-charcoal/60 font-medium block mb-2">{f.label}</label>
                  <input name={f.name} value={form[f.name]} onChange={handleChange}
                    type="number" min="0" placeholder={f.placeholder} className="input-field text-sm" />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(form.listing_type === 'sale' || form.listing_type === 'both') && (
                <div>
                  <label className="text-xs text-charcoal/60 font-medium block mb-2 flex items-center gap-1">
                    <DollarSign size={12} className="text-brand" /> سعر البيع (USD)
                  </label>
                  <input name="price_estimate" value={form.price_estimate} onChange={handleChange}
                    type="number" min="0" placeholder="85000" className="input-field" />
                </div>
              )}
              {(form.listing_type === 'rent' || form.listing_type === 'both') && (
                <div>
                  <label className="text-xs text-charcoal/60 font-medium block mb-2 flex items-center gap-1">
                    <DollarSign size={12} className="text-cta" /> الإيجار الشهري (USD)
                  </label>
                  <input name="rent_price" value={form.rent_price} onChange={handleChange}
                    type="number" min="0" placeholder="500" className="input-field" />
                </div>
              )}
            </div>
          </div>

          {/* Description & Amenities */}
          <div className="card p-5 space-y-4">
            <h3 className="text-navy font-bold text-sm border-b border-navy/10 pb-2">الوصف والمزايا</h3>
            <div>
              <label className="text-xs text-charcoal/60 font-medium block mb-2">وصف العقار</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={4}
                placeholder="أضف تفاصيل إضافية..." className="input-field resize-none" />
            </div>
            <div>
              <label className="text-xs text-charcoal/60 font-medium block mb-2">المزايا</label>
              <div className="flex flex-wrap gap-2">
                {AMENITIES_LIST.map(a => (
                  <button key={a} type="button" onClick={() => toggleAmenity(a)}
                    className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${form.amenities.includes(a) ? 'bg-brand border-brand text-white' : 'border-navy/15 text-charcoal/60 hover:border-brand/40'}`}>
                    {a}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="card p-5 space-y-4">
            <h3 className="text-navy font-bold text-sm border-b border-navy/10 pb-2">الصور</h3>

            {/* Existing images */}
            {existingImages.length > 0 && (
              <div>
                <p className="text-xs text-charcoal/50 font-medium mb-2">الصور الحالية ({existingImages.length})</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {existingImages.map((url, i) => (
                    <div key={i} className="relative group rounded-xl overflow-hidden border border-navy/10">
                      <img src={url} alt="" className="w-full h-24 object-cover" />
                      <button onClick={() => removeExistingImage(url)}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New images upload */}
            <div>
              <p className="text-xs text-charcoal/50 font-medium mb-2">إضافة صور جديدة</p>
              <SmartImageGallery images={newImages} onChange={setNewImages} />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link to="/dashboard"
              className="flex-1 text-center py-3 border border-navy/15 text-charcoal/60 hover:border-navy/30 hover:text-navy rounded-xl font-semibold text-sm transition-colors">
              إلغاء
            </Link>
            <button onClick={handleSubmit}
              disabled={saving || newImages.some(i => i.processing)}
              className="flex-1 btn-cta flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
              {(saving || newImages.some(i => i.processing))
                ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <CheckCircle size={16} />}
              {saving ? 'جارٍ الحفظ...' : newImages.some(i => i.processing) ? 'جارٍ رفع الصور...' : 'حفظ التعديلات'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
