import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { supabase, isConfigured } from '../../lib/supabase';
import {
  Tractor, Plus, Save, Trash2, Edit3, Settings, X,
  MapPin, Clock, Box, Wrench, ChevronDown, CheckCircle, FileText, Search, MessageCircle,
  Inbox, Globe, Star, Phone, Bell, DollarSign, XCircle, ChevronLeft
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useGlobalData } from '../../context/GlobalContext';
import { EQ_MARKET_KEY, getMarketEquipment } from '../../data/equipmentData';
import { sendAdminAlert } from '../../utils/emailService';

const EQUIPMENT_CATEGORIES = [
  { id: 'earthmoving', label: 'حفريات وأعمال ترابية' },
  { id: 'demolition',  label: 'تكسير وهدم' },
  { id: 'lifting',     label: 'رافعات ومناولة' },
  { id: 'site',        label: 'كرفانات وتجهيزات موقع' },
  { id: 'generator',   label: 'طاقة وتجهيزات' },
];

const PRICING_UNITS = [
  { id: 'hour',  label: 'بالساعة' },
  { id: 'shift', label: 'بالوردية (8 ساعات)' },
  { id: 'day',   label: 'باليوم' },
  { id: 'month', label: 'بالشهر' },
];

const PROVINCES = [
  'دمشق', 'ريف دمشق', 'حلب', 'حمص', 'حماة', 'اللاذقية', 'طرطوس',
  'إدلب', 'دير الزور', 'الرقة', 'الحسكة', 'السويداء', 'درعا', 'القنيطرة',
];

const MOCK_RFQS = [];

const RFQ_STATUS_CFG = {
  new:      { label: 'جديد',         bg: 'bg-amber-100',   text: 'text-amber-700',   dot: 'bg-amber-500'  },
  quoted:   { label: 'قدّمت عرضاً', bg: 'bg-brand/10',    text: 'text-brand',       dot: 'bg-brand'      },
  accepted: { label: 'مقبول',        bg: 'bg-green-100',   text: 'text-green-700',   dot: 'bg-green-500'  },
  declined: { label: 'مرفوض',        bg: 'bg-red-50',      text: 'text-red-500',     dot: 'bg-red-400'    },
};

const URGENCY_CFG = {
  'عاجل': 'bg-red-100 text-red-600',
  'عادي': 'bg-blue-100 text-blue-600',
  'مرن':  'bg-slate-100 text-slate-600',
};

export default function ContractorDashboard() {
  const { user } = useAuth();
  const { tenders } = useGlobalData();
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'add' | 'tenders' | 'rfq'
  const [rfqSearch, setRfqSearch]     = useState('');
  const [rfqFilter, setRfqFilter]     = useState('all'); // 'all' | 'new' | 'quoted' | 'accepted' | 'declined'
  const [rfqItems, setRfqItems]       = useState(MOCK_RFQS);
  const [expandedRfq, setExpandedRfq] = useState(null);

  const newRfqCount = rfqItems.filter(r => r.status === 'new').length;

  const filteredRfqs = rfqItems.filter(r => {
    if (rfqFilter !== 'all' && r.status !== rfqFilter) return false;
    if (rfqSearch) {
      const q = rfqSearch.toLowerCase();
      return r.service.includes(rfqSearch) || r.governorate.includes(rfqSearch) ||
             r.city.includes(rfqSearch) || r.contactName.includes(rfqSearch) || r.id.toLowerCase().includes(q);
    }
    return true;
  });

  const handleRfqAction = (id, action) => {
    setRfqItems(prev => prev.map(r => r.id === id ? { ...r, status: action } : r));
    toast.success(action === 'quoted' ? 'تم إرسال عرض السعر للعميل!' : 'تم رفض الطلب');
    setExpandedRfq(null);
  };
  
  // Equipment List — loaded from Supabase if configured, else starts empty
  const [equipments, setEquipments] = useState([]);

  useEffect(() => {
    if (!isConfigured || !user) return;
    supabase
      .from('equipment')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (!data?.length) return;
        setEquipments(data.map(eq => ({
          id:       eq.id,
          name:     eq.name,
          category: eq.category,
          location: eq.city,
          type:     eq.hire_type || 'wet',
          price:    Number(eq.rate || eq.wet_rate || 0),
          unit:     eq.pricing_unit,
          status:   eq.available ? 'active' : 'rented',
        })));
      });
  }, [user]);

  const EMPTY_FORM = {
    name: '', category: 'earthmoving', location: '', type: 'wet',
    price: '', unit: 'shift', hasFuel: true, transportCost: '0',
    attachments: [], newAttachment: '', photos: [],
  };

  // Form State
  const [form, setForm] = useState(EMPTY_FORM);
  const [editTarget, setEditTarget] = useState(null); // equipment being edited

  const startEdit = (eq) => {
    setEditTarget(eq);
    setForm({
      name: eq.name, category: eq.category, location: eq.location,
      type: eq.type, price: String(eq.price), unit: eq.unit,
      hasFuel: true, transportCost: '0', attachments: [], newAttachment: '', photos: [],
    });
    setActiveTab('add');
  };

  const handleAddAttachment = () => {
    if (form.newAttachment.trim()) {
      setForm(f => ({ ...f, attachments: [...f.attachments, f.newAttachment.trim()], newAttachment: '' }));
    }
  };

  const handleRemoveAttachment = (idx) => {
    setForm(f => ({ ...f, attachments: f.attachments.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.location) {
      toast.error('يرجى تعبئة كافة الحقول المطلوبة');
      return;
    }
    const price = parseInt(form.price);

    // ── UPDATE existing equipment ──
    if (editTarget) {
      if (isConfigured && user) {
        await supabase.from('equipment').update({
          name: form.name, category: form.category, city: form.location,
          hire_type: form.type, pricing_unit: form.unit,
          rate: form.type === 'dry' ? price : 0,
          wet_rate: form.type === 'wet' ? price : 0,
        }).eq('id', editTarget.id).eq('owner_id', user.id);
      }
      setEquipments(prev => prev.map(eq =>
        eq.id === editTarget.id
          ? { ...eq, name: form.name, category: form.category, location: form.location, type: form.type, price, unit: form.unit }
          : eq
      ));
      toast.success('تم تحديث بيانات المعدة ✓');
      setEditTarget(null);
      setForm(EMPTY_FORM);
      setActiveTab('list');
      return;
    }

    if (isConfigured && user) {
      const { data, error } = await supabase.from('equipment').insert({
        owner_id:      user.id,
        name:          form.name,
        category:      form.category,
        city:          form.location,
        provider:      user.full_name || 'مقاول',
        rate:          form.type === 'dry' ? price : 0,
        wet_rate:      form.type === 'wet' ? price : 0,
        pricing_unit:  form.unit,
        fuel_included: form.hasFuel,
        transport:     parseInt(form.transportCost) === 0 ? 'included' : 'separate',
        transport_cost: parseInt(form.transportCost) || 0,
        dry_available: form.type === 'dry',
        wet_available: form.type === 'wet',
        hire_type:     form.type,
        available:     true,
        attachments:   form.attachments.map((att, i) => ({ id: `att-${i}`, name: att, price: 0 })),
      }).select().single();
      if (!error && data) {
        setEquipments(prev => [{
          id: data.id, name: data.name, category: data.category,
          location: data.city, type: data.hire_type, price, unit: data.pricing_unit, status: 'active',
        }, ...prev]);
        toast.success('تمت إضافة المعدة وستظهر في سوق المعدات!');
        setActiveTab('list');
        setForm({ ...form, name: '', price: '', attachments: [], photos: [] });

        // إرسال إشعار للإدارة
        sendAdminAlert(
          'hameddewihy@gmail.com',
          'إضافة معدة جديدة',
          { Contractor: user.full_name || 'مقاول', Equipment: form.name, Location: form.location }
        ).catch(() => {});

        return;
      }
    }

    // Fallback: localStorage only
    const newEq = {
      id: Date.now(), name: form.name, category: form.category,
      location: form.location, type: form.type, price, unit: form.unit, status: 'active',
    };
    setEquipments(prev => [newEq, ...prev]);
    const marketEq = {
      id: `eq-c-${Date.now()}`, ownerId: user?.id || 'contractor',
      name: form.name, brand: '—', model: '—', category: form.category,
      city: form.location, provider: user?.full_name || 'مقاول',
      rate: form.type === 'dry' ? price : 0, wetRate: form.type === 'wet' ? price : 0,
      pricingUnit: form.unit, fuelIncluded: form.hasFuel,
      transport: parseInt(form.transportCost) === 0 ? 'included' : 'separate',
      transportCost: parseInt(form.transportCost) || 0,
      dryAvailable: form.type === 'dry', wetAvailable: form.type === 'wet',
      rating: 0, reviewCount: 0, totalRentals: 0, available: true, nextAvailableDate: null,
      attachments: form.attachments.map((att, i) => ({ id: `att-${i}`, name: att, price: 0 })),
      telematics: { engineHoursTotal: 0, engineHoursToday: 0, fuelLevel: 0, state: 'stopped', engineLoad: 0, lastPing: '-', gps: form.location },
      inspectionHash: '—', condition: 3, waiverAvailable: false, bookedDates: [],
      maintenanceLog: { maxDailyHours: 8, history: [] },
      images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=70'],
      image:  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=70',
    };
    try {
      const existing = getMarketEquipment();
      localStorage.setItem(EQ_MARKET_KEY, JSON.stringify([marketEq, ...existing]));
    } catch {}
    toast.success('تمت إضافة المعدة وستظهر في سوق المعدات!');
    setActiveTab('list');
    setForm({ ...form, name: '', price: '', attachments: [], photos: [] });

    // إرسال إشعار للإدارة
    sendAdminAlert(
      'hameddewihy@gmail.com',
      'إضافة معدة جديدة (محلي)',
      { Contractor: user?.full_name || 'مقاول', Equipment: form.name, Location: form.location }
    ).catch(() => {});
  };

  return (
    <div className="min-h-screen bg-cream pt-16 pb-10" dir="rtl">
      <div className="max-w-6xl mx-auto px-5">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-navy mb-2 flex items-center gap-3">
              <Wrench className="text-brand" size={32} />
              لوحة تحكم المقاول
            </h1>
            <p className="text-charcoal/60">مرحباً {user?.full_name}، يمكنك هنا إدارة معداتك وعروض أسعارك بكل سهولة.</p>
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
            <button
              onClick={() => setActiveTab('list')}
              className={`shrink-0 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                activeTab === 'list' ? 'bg-navy text-white shadow-md' : 'bg-white text-navy border border-navy/10 hover:border-navy/30'
              }`}
            >
              معداتي
            </button>
            <button
              onClick={() => setActiveTab('tenders')}
              className={`shrink-0 px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                activeTab === 'tenders' ? 'bg-navy text-white shadow-md' : 'bg-white text-navy border border-navy/10 hover:border-navy/30'
              }`}
            >
              <FileText size={16} /> المناقصات المتاحة
              <span className="bg-brand text-white text-[10px] px-2 py-0.5 rounded-full">{tenders.length}</span>
            </button>
            <button
              onClick={() => setActiveTab('rfq')}
              className={`shrink-0 px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                activeTab === 'rfq' ? 'bg-cta text-white shadow-md shadow-cta/30' : 'bg-white text-cta border border-cta/20 hover:border-cta/40'
              }`}
            >
              <Inbox size={16} /> طلبات الإكساء
              {newRfqCount > 0 && (
                <span className="bg-cta text-white text-[10px] px-2 py-0.5 rounded-full leading-none"
                  style={activeTab === 'rfq' ? { background: 'rgba(255,255,255,0.3)' } : {}}>
                  {newRfqCount}
                </span>
              )}
            </button>
            <button
              onClick={() => { setEditTarget(null); setForm(EMPTY_FORM); setActiveTab('add'); }}
              className={`shrink-0 px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                activeTab === 'add' ? 'bg-brand text-white shadow-md' : 'bg-white text-brand border border-brand/20 hover:border-brand/40'
              }`}
            >
              <Plus size={16} /> إضافة معدة
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* ─── TAB: LIST EQUIPMENT ─────────────────────────────────────── */}
          {activeTab === 'list' && (
            <motion.div 
              key="list"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {equipments.length === 0 ? (
                <div className="col-span-full bg-white rounded-3xl p-12 text-center border-2 border-dashed border-navy/10">
                  <Tractor className="mx-auto text-charcoal/20 mb-4" size={48} />
                  <p className="text-navy font-bold text-lg">لا يوجد معدات مسجلة بعد</p>
                  <p className="text-charcoal/50 text-sm mt-2 mb-6">ابدأ بإضافة أول معدة لك لعرضها أمام آلاف المهندسين والمقاولين.</p>
                  <button onClick={() => setActiveTab('add')} className="btn-cta px-6 py-2.5 text-sm font-bold">
                    إضافة معدة الآن
                  </button>
                </div>
              ) : (
                equipments.map(eq => (
                  <div key={eq.id} className="bg-white rounded-3xl p-5 border border-navy/5 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold mb-2 ${
                          eq.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {eq.status === 'active' ? 'متاح للتأجير' : 'مؤجر / غير متاح'}
                        </span>
                        <h3 className="font-black text-navy text-lg leading-snug">{eq.name}</h3>
                        <p className="text-charcoal/50 text-xs mt-1 flex items-center gap-1">
                          <MapPin size={12}/> {eq.location}
                        </p>
                      </div>
                      <div className="bg-cream rounded-xl p-2 text-charcoal/40 group-hover:text-brand transition-colors cursor-pointer">
                        <Settings size={20} />
                      </div>
                    </div>
                    
                    <div className="bg-cream/50 rounded-xl p-3 mb-4 flex justify-between items-center">
                      <div>
                        <p className="text-[10px] text-charcoal/50 font-bold mb-0.5">سعر التأجير</p>
                        <p className="text-navy font-black">{eq.price.toLocaleString()} <span className="text-xs">ل.س / {PRICING_UNITS.find(u => u.id === eq.unit)?.label}</span></p>
                      </div>
                      <div className="text-left">
                        <span className="text-[10px] font-bold px-2 py-1 bg-white rounded border border-navy/5">
                          {eq.type === 'wet' ? 'شامل عامل/وقود' : 'إيجار جاف فقط'}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 mb-2">
                      <button onClick={() => startEdit(eq)} className="flex-1 py-2 rounded-xl bg-navy/5 text-navy font-bold text-xs hover:bg-navy/10 flex items-center justify-center gap-1.5">
                        <Edit3 size={14} /> تعديل
                      </button>
                      <button onClick={async () => {
                        if (isConfigured && user) await supabase.from('equipment').delete().eq('id', eq.id).eq('owner_id', user.id);
                        setEquipments(prev => prev.filter(e => e.id !== eq.id));
                        toast.success('تم حذف المعدة');
                      }} className="py-2 px-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <a
                      href={`https://wa.me/963000000000?text=${encodeURIComponent(`مرحباً، أودّ الاستفسار عن ${eq.name} المتواجدة في ${eq.location}`)}`}
                      target="_blank" rel="noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-2 rounded-xl border border-green-400/40 bg-green-50 text-green-700 text-xs font-bold hover:bg-green-100 transition-colors">
                      <MessageCircle size={13} /> تواصل عبر واتساب
                    </a>
                  </div>
                ))
              )}
            </motion.div>
          )}

          {/* ─── TAB: ADD / EDIT EQUIPMENT ───────────────────────────────── */}
          {activeTab === 'add' && (
            <motion.div
              key="add"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-3xl p-6 md:p-10 border border-navy/5 shadow-sm"
            >
              {editTarget && (
                <div className="flex items-center gap-2 mb-6 text-sm font-bold text-amber-600 bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-xl">
                  <Edit3 size={15} /> تعديل بيانات: {editTarget.name}
                  <button type="button" onClick={() => { setEditTarget(null); setForm(EMPTY_FORM); setActiveTab('list'); }}
                    className="mr-auto text-charcoal/40 hover:text-red-500">
                    <X size={15} />
                  </button>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">

                {/* Basic Info */}
                <div>
                  <h3 className="text-lg font-black text-navy border-b border-navy/10 pb-2 mb-5 flex items-center gap-2">
                    <Box size={20} className="text-brand"/> المعلومات الأساسية
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="text-xs font-bold text-charcoal/60 block mb-1.5">اسم المعدة / الموديل *</label>
                      <input 
                        type="text" required placeholder="مثال: حفارة كوماتسو 20 طن"
                        className="w-full bg-cream rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50 border border-transparent focus:border-brand"
                        value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-charcoal/60 block mb-1.5">الفئة *</label>
                      <div className="relative">
                        <select 
                          className="w-full bg-cream rounded-xl px-4 py-3 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-brand/50 border border-transparent focus:border-brand"
                          value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                        >
                          {EQUIPMENT_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                        </select>
                        <ChevronDown size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal/40 pointer-events-none"/>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-charcoal/60 block mb-1.5">المحافظة المتواجدة بها *</label>
                      <div className="relative">
                        <select 
                          required
                          className="w-full bg-cream rounded-xl px-4 py-3 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-brand/50 border border-transparent focus:border-brand"
                          value={form.location} onChange={e => setForm({...form, location: e.target.value})}
                        >
                          <option value="">اختر المحافظة...</option>
                          {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                        <ChevronDown size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal/40 pointer-events-none"/>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pricing & Terms */}
                <div>
                  <h3 className="text-lg font-black text-navy border-b border-navy/10 pb-2 mb-5 flex items-center gap-2">
                    <Clock size={20} className="text-brand"/> التسعير وطبيعة الإيجار
                  </h3>
                  
                  {/* Wet vs Dry */}
                  <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      form.type === 'wet' ? 'border-brand bg-brand/5' : 'border-navy/10 hover:border-navy/30 bg-white'
                    }`}>
                      <input type="radio" name="type" value="wet" className="hidden" 
                        checked={form.type === 'wet'} onChange={() => setForm({...form, type: 'wet'})} />
                      <div className="flex justify-between items-center">
                        <div>
                          <p className={`font-black text-sm mb-1 ${form.type === 'wet' ? 'text-navy' : 'text-charcoal/70'}`}>إيجار رطب (Wet Hire)</p>
                          <p className="text-xs text-charcoal/50">تتضمن توفير سائق/عامل من طرفك.</p>
                        </div>
                        {form.type === 'wet' && <CheckCircle size={20} className="text-brand"/>}
                      </div>
                    </label>

                    <label className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      form.type === 'dry' ? 'border-brand bg-brand/5' : 'border-navy/10 hover:border-navy/30 bg-white'
                    }`}>
                      <input type="radio" name="type" value="dry" className="hidden" 
                        checked={form.type === 'dry'} onChange={() => setForm({...form, type: 'dry'})} />
                      <div className="flex justify-between items-center">
                        <div>
                          <p className={`font-black text-sm mb-1 ${form.type === 'dry' ? 'text-navy' : 'text-charcoal/70'}`}>إيجار جاف (Dry Hire)</p>
                          <p className="text-xs text-charcoal/50">تأجير المعدة فقط بدون طاقم.</p>
                        </div>
                        {form.type === 'dry' && <CheckCircle size={20} className="text-brand"/>}
                      </div>
                    </label>
                  </div>

                  {/* Price & Unit */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
                    <div className="md:col-span-2">
                      <label className="text-xs font-bold text-charcoal/60 block mb-1.5">السعر ($) *</label>
                      <input
                        type="number" required placeholder="مثال: 150"
                        className="w-full bg-cream rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50 border border-transparent focus:border-brand"
                        value={form.price} onChange={e => setForm({...form, price: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-charcoal/60 block mb-1.5">وحدة التسعير *</label>
                      <div className="relative">
                        <select 
                          className="w-full bg-cream rounded-xl px-4 py-3 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-brand/50 border border-transparent focus:border-brand"
                          value={form.unit} onChange={e => setForm({...form, unit: e.target.value})}
                        >
                          {PRICING_UNITS.map(u => <option key={u.id} value={u.id}>{u.label}</option>)}
                        </select>
                        <ChevronDown size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal/40 pointer-events-none"/>
                      </div>
                    </div>
                  </div>

                  {/* Fuel & Transport */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="text-xs font-bold text-charcoal/60 block mb-1.5">سياسة المحروقات</label>
                      <label className="flex items-center gap-3 p-3 bg-cream rounded-xl cursor-pointer">
                        <input type="checkbox" className="w-5 h-5 rounded text-brand border-navy/20 focus:ring-brand" 
                          checked={form.hasFuel} onChange={e => setForm({...form, hasFuel: e.target.checked})} />
                        <span className="text-sm font-bold text-navy">السعر يشمل المحروقات</span>
                      </label>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-charcoal/60 block mb-1.5">أجور النقل (ل.س)</label>
                      <input 
                        type="number" placeholder="ضع 0 إذا كان النقل مجانياً"
                        className="w-full bg-cream rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50 border border-transparent focus:border-brand"
                        value={form.transportCost} onChange={e => setForm({...form, transportCost: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                {/* Attachments */}
                <div>
                  <h3 className="text-lg font-black text-navy border-b border-navy/10 pb-2 mb-5 flex items-center gap-2">
                    <Wrench size={20} className="text-brand"/> الملحقات المتاحة (إن وجدت)
                  </h3>
                  <div className="flex gap-2 mb-3">
                    <input 
                      type="text" placeholder="مثال: دقاق هيدروليكي، باكيت تنظيف..."
                      className="flex-1 bg-cream rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50 border border-transparent focus:border-brand"
                      value={form.newAttachment} onChange={e => setForm({...form, newAttachment: e.target.value})}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddAttachment())}
                    />
                    <button type="button" onClick={handleAddAttachment} className="px-5 py-2.5 bg-navy text-white rounded-xl text-sm font-bold hover:bg-navy/90">
                      إضافة
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {form.attachments.map((att, idx) => (
                      <div key={idx} className="bg-brand/10 text-brand px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2">
                        {att}
                        <button type="button" onClick={() => handleRemoveAttachment(idx)} className="text-brand/50 hover:text-brand">
                          <Trash2 size={12}/>
                        </button>
                      </div>
                    ))}
                    {form.attachments.length === 0 && <p className="text-xs text-charcoal/40">لم يتم إضافة ملحقات بعد.</p>}
                  </div>
                </div>

                {/* Submit */}
                <div className="pt-6 border-t border-navy/10 flex justify-end gap-3">
                  <button type="button" onClick={() => setActiveTab('list')} className="px-6 py-3 rounded-xl font-bold text-sm text-charcoal/60 hover:bg-navy/5">
                    إلغاء
                  </button>
                  <button type="submit" className="btn-cta px-8 py-3 text-sm font-bold flex items-center gap-2 shadow-lg shadow-brand/30">
                    <Save size={18} /> حفظ ونشر المعدة
                  </button>
                </div>

              </form>
            </motion.div>
          )}

          {/* ─── TAB: TENDERS ──────────────────────────────────────── */}
          {activeTab === 'tenders' && (
            <motion.div 
              key="tenders"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
                <h2 className="text-xl font-black text-navy">المناقصات المطروحة من المطورين</h2>
                <div className="relative">
                  <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
                  <input type="text" placeholder="ابحث في المناقصات..." className="w-full sm:w-56 bg-white border border-navy/10 rounded-xl pr-9 pl-4 py-2 text-sm focus:outline-none focus:border-brand" />
                </div>
              </div>

              <div className="grid gap-4">
                {tenders.map(tender => (
                  <div key={tender.id} className="flex flex-col md:flex-row items-center justify-between p-5 bg-white border border-navy/10 rounded-2xl hover:shadow-md transition-shadow gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-navy">{tender.title}</h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${tender.status === 'مفتوح' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {tender.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-charcoal/60 mt-2">
                        <span className="flex items-center gap-1"><Box size={12} className="text-brand" /> {tender.type}</span>
                        <span className="flex items-center gap-1"><Clock size={12} className="text-brand" /> آخر موعد: {tender.deadline}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 border-t md:border-t-0 md:border-r border-navy/10 pt-4 md:pt-0 md:pr-6 w-full md:w-auto">
                      <a
                        href={`https://wa.me/963000000000?text=${encodeURIComponent(`مرحباً، رأيت مناقصة "${tender.title}" على منصة ريسورغو وأودّ تقديم عرض سعر`)}`}
                        target="_blank" rel="noreferrer"
                        className="py-2 px-3 rounded-xl border border-green-400/40 bg-green-50 text-green-700 hover:bg-green-100 transition-colors flex items-center justify-center shrink-0">
                        <MessageCircle size={16} />
                      </a>
                      <button
                        onClick={() => toast.success('تم إرسال عرض سعرك للمطور')}
                        disabled={tender.status !== 'مفتوح'}
                        className="flex-1 md:flex-none px-6 py-2 bg-brand text-white hover:bg-navy rounded-xl text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        تقديم عرض سعر
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
          {/* ─── TAB: RFQ INBOX ──────────────────────────────────────── */}
          {activeTab === 'rfq' && (
            <motion.div
              key="rfq"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            >
              {/* toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-3">
                <div>
                  <h2 className="text-xl font-black text-navy flex items-center gap-2">
                    <Inbox size={20} className="text-cta" />
                    صندوق طلبات الإكساء الواردة
                  </h2>
                  <p className="text-xs text-charcoal/50 mt-0.5">الطلبات القادمة من منصة الإكساء — ردّ خلال 24 ساعة للحجز</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="relative">
                    <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
                    <input
                      type="text" placeholder="بحث..." dir="rtl"
                      value={rfqSearch} onChange={e => setRfqSearch(e.target.value)}
                      className="w-44 bg-white border border-navy/10 rounded-xl pr-8 pl-3 py-2 text-sm focus:outline-none focus:border-brand"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    {['all','new','quoted','accepted','declined'].map(f => (
                      <button
                        key={f}
                        onClick={() => setRfqFilter(f)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          rfqFilter === f ? 'bg-navy text-white' : 'bg-white text-charcoal/60 border border-navy/10 hover:border-navy/30'
                        }`}
                      >
                        {f === 'all' ? 'الكل' : RFQ_STATUS_CFG[f].label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* summary strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[
                  { label: 'إجمالي الطلبات', val: rfqItems.length,                                   clr: 'text-navy'        },
                  { label: 'جديدة',          val: rfqItems.filter(r=>r.status==='new').length,       clr: 'text-amber-600'   },
                  { label: 'مقبولة',         val: rfqItems.filter(r=>r.status==='accepted').length,  clr: 'text-green-600'   },
                  { label: 'معلقة',          val: rfqItems.filter(r=>r.status==='quoted').length,    clr: 'text-brand'       },
                ].map(({ label, val, clr }) => (
                  <div key={label} className="bg-white rounded-2xl p-4 border border-navy/5 text-center shadow-sm">
                    <p className={`text-2xl font-black ${clr}`}>{val}</p>
                    <p className="text-xs text-charcoal/50 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              {/* cards */}
              <div className="space-y-4">
                {filteredRfqs.length === 0 && (
                  <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-navy/10">
                    <Inbox size={40} className="mx-auto text-charcoal/20 mb-3" />
                    <p className="text-navy font-bold">لا توجد طلبات مطابقة</p>
                  </div>
                )}

                {filteredRfqs.map(rfq => {
                  const cfg = RFQ_STATUS_CFG[rfq.status];
                  const isOpen = expandedRfq === rfq.id;
                  return (
                    <div key={rfq.id} className="bg-white rounded-2xl border border-navy/8 shadow-sm overflow-hidden">
                      {/* card header — always visible */}
                      <button
                        onClick={() => setExpandedRfq(isOpen ? null : rfq.id)}
                        className="w-full text-right px-5 py-4 hover:bg-cream/40 transition-colors"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            {/* status dot */}
                            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${cfg.dot} ${rfq.status === 'new' ? 'animate-pulse' : ''}`} />
                            <div className="text-right">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-black text-navy">{rfq.service}</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${cfg.bg} ${cfg.text}`}>{cfg.label}</span>
                                {rfq.isExpat && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-brand/10 text-brand flex items-center gap-1">
                                    <Globe size={9} /> مغترب · {rfq.clientCountry}
                                  </span>
                                )}
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${URGENCY_CFG[rfq.urgency] || 'bg-slate-100 text-slate-600'}`}>
                                  {rfq.urgency}
                                </span>
                              </div>
                              <p className="text-xs text-charcoal/50 mt-0.5 flex items-center gap-2">
                                <MapPin size={11}/> {rfq.governorate} — {rfq.city}
                                <span className="text-charcoal/30">|</span>
                                <span>{rfq.area} م²</span>
                                <span className="text-charcoal/30">|</span>
                                <span>{rfq.materialTier}</span>
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <div className="text-right">
                              <p className="text-xs text-charcoal/40">{rfq.id}</p>
                              <p className="text-xs text-charcoal/40">{rfq.receivedAt}</p>
                            </div>
                            <div className="bg-cream rounded-xl p-2">
                              <DollarSign size={16} className="text-cta" />
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] text-charcoal/40">الميزانية التقديرية</p>
                              <p className="text-sm font-black text-navy">${rfq.budgetMin.toLocaleString()} – ${rfq.budgetMax.toLocaleString()}</p>
                            </div>
                            <ChevronLeft size={16} className={`text-charcoal/30 transition-transform ${isOpen ? 'rotate-90' : '-rotate-90'}`} />
                          </div>
                        </div>
                      </button>

                      {/* expanded details */}
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden border-t border-navy/6"
                          >
                            <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* details */}
                              <div className="space-y-3">
                                <h4 className="text-xs font-black text-charcoal/50 uppercase tracking-wider">تفاصيل الطلب</h4>
                                <div className="bg-cream rounded-xl p-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                                  {[
                                    ['الخدمة',          rfq.service],
                                    ['المحافظة',        rfq.governorate],
                                    ['المدينة',         rfq.city],
                                    ['المساحة',         `${rfq.area} م²`],
                                    ['حالة العقار',     rfq.propertyState],
                                    ['درجة المواد',     rfq.materialTier],
                                    ['الأولوية',        rfq.urgency],
                                  ].map(([k, v]) => (
                                    <div key={k}>
                                      <p className="text-[10px] text-charcoal/40 font-bold">{k}</p>
                                      <p className="text-navy font-semibold text-xs">{v}</p>
                                    </div>
                                  ))}
                                </div>
                                {rfq.notes && (
                                  <div className="bg-amber-50 border border-amber-200/60 rounded-xl p-3">
                                    <p className="text-[10px] text-amber-700 font-bold mb-1">ملاحظات العميل</p>
                                    <p className="text-xs text-charcoal/70 leading-relaxed">{rfq.notes}</p>
                                  </div>
                                )}
                              </div>

                              {/* contact + actions */}
                              <div className="space-y-3">
                                <h4 className="text-xs font-black text-charcoal/50 uppercase tracking-wider">معلومات التواصل</h4>
                                <div className="bg-cream rounded-xl p-4 space-y-2">
                                  <p className="font-bold text-navy">{rfq.contactName}</p>
                                  <a href={`tel:${rfq.contactPhone}`}
                                    className="flex items-center gap-2 text-sm text-brand hover:underline">
                                    <Phone size={13} /> {rfq.contactPhone}
                                  </a>
                                  {rfq.contactWhatsapp && (
                                    <a
                                      href={`https://wa.me/${rfq.contactWhatsapp.replace(/\D/g,'')}?text=${encodeURIComponent(`مرحباً ${rfq.contactName}، أود تقديم عرض سعر لطلبكم رقم ${rfq.id} — ${rfq.service} في ${rfq.governorate}`)}`}
                                      target="_blank" rel="noreferrer"
                                      className="flex items-center gap-2 text-sm text-green-700 hover:underline">
                                      <MessageCircle size={13} /> واتساب
                                    </a>
                                  )}
                                  {rfq.isExpat && (
                                    <div className="flex items-center gap-2 text-xs text-brand/70 pt-1 border-t border-navy/8">
                                      <Globe size={12} /> مغترب في {rfq.clientCountry} — يفضّل التواصل الرقمي
                                    </div>
                                  )}
                                </div>

                                {/* action buttons */}
                                <div className="flex gap-2">
                                  {rfq.status === 'new' && (
                                    <>
                                      <button
                                        onClick={() => handleRfqAction(rfq.id, 'quoted')}
                                        className="flex-1 py-2.5 bg-brand text-white rounded-xl text-sm font-bold hover:bg-navy transition-colors flex items-center justify-center gap-2">
                                        <Star size={14} /> إرسال عرض سعر
                                      </button>
                                      <button
                                        onClick={() => handleRfqAction(rfq.id, 'declined')}
                                        className="py-2.5 px-3 bg-red-50 text-red-500 hover:bg-red-100 rounded-xl flex items-center justify-center">
                                        <XCircle size={18} />
                                      </button>
                                    </>
                                  )}
                                  {rfq.status === 'quoted' && (
                                    <div className="flex-1 py-2.5 bg-brand/10 text-brand rounded-xl text-sm font-bold flex items-center justify-center gap-2">
                                      <Bell size={14} /> في انتظار رد العميل
                                    </div>
                                  )}
                                  {rfq.status === 'accepted' && (
                                    <div className="flex-1 py-2.5 bg-green-100 text-green-700 rounded-xl text-sm font-bold flex items-center justify-center gap-2">
                                      <CheckCircle size={14} /> تم قبول عرضك — تواصل مع العميل
                                    </div>
                                  )}
                                  {rfq.status === 'declined' && (
                                    <div className="flex-1 py-2.5 bg-red-50 text-red-400 rounded-xl text-sm font-bold flex items-center justify-center gap-2">
                                      <XCircle size={14} /> مرفوض
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

        </AnimatePresence>

      </div>
    </div>
  );
}
