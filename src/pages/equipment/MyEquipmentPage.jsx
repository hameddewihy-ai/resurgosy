import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus, Settings, Truck, TrendingUp, CheckCircle, Clock,
  AlertCircle, Radio, Inbox, FileText, Phone, X, BarChart3,
} from 'lucide-react';
import SEO from '../../components/SEO';
import EquipmentFormModal from '../../components/EquipmentFormModal';
import IoTTrackerMap from '../../components/equipment/IoTTrackerMap';
import { EQUIPMENT_SEED } from '../../data/equipmentData';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { supabase, isConfigured } from '../../lib/supabase';

const MOCK_MONTHLY = [];

const EQ_LIST_KEY  = 'resurgo-my-equipment';
const REQUESTS_KEY = 'resurgo-equipment-requests';

const lsLoad = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; }
  catch { return fallback; }
};

const INITIAL_MY_EQUIPMENT = [];

const MOCK_REQUESTS = [];

const STATUS_CONFIG = {
  available:   { label: 'متاح للإيجار', short: 'متاح',  color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle },
  rented:      { label: 'مؤجر حالياً',  short: 'مؤجر',  color: 'text-amber-600', bg: 'bg-amber-50', icon: Clock },
  maintenance: { label: 'قيد الصيانة', short: 'صيانة', color: 'text-red-600',   bg: 'bg-red-50',   icon: AlertCircle },
};

const REQ_STATUS = {
  pending:  { label: 'بانتظار الرد',  color: 'text-amber-600',  bg: 'bg-amber-50',  border: 'border-amber-200' },
  accepted: { label: 'مقبول',         color: 'text-green-600',  bg: 'bg-green-50',  border: 'border-green-200' },
  rejected: { label: 'مرفوض',         color: 'text-red-600',    bg: 'bg-red-50',    border: 'border-red-200' },
};

export default function MyEquipmentPage() {
  const { user } = useAuth();
  const [equipmentList, setEquipmentList] = useState(() => lsLoad(EQ_LIST_KEY, INITIAL_MY_EQUIPMENT));
  const [requests, setRequests]           = useState(() => lsLoad(REQUESTS_KEY, MOCK_REQUESTS));
  const [isModalOpen, setIsModalOpen]     = useState(false);
  const [editingEq, setEditingEq]         = useState(null);
  const [activeTab, setActiveTab]         = useState('list');

  // Load from Supabase on mount
  useEffect(() => {
    if (!isConfigured || !user) return;
    supabase.from('owner_equipment').select('*').eq('owner_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data?.length) {
          const normalized = data.map(r => ({
            id: r.id, name: r.name, category: r.category,
            rate: r.rate, pricingUnit: r.pricing_unit,
            status: r.status, totalEarnings: r.total_earnings,
            pendingEarnings: r.pending_earnings,
            description: r.description, location: r.location,
          }));
          setEquipmentList(normalized);
          localStorage.setItem(EQ_LIST_KEY, JSON.stringify(normalized));
        }
      });
    supabase.from('equipment_bookings').select('*')
      .order('created_at', { ascending: false }).limit(100)
      .then(({ data }) => {
        if (data?.length) {
          const normalized = data.map(r => ({
            id: r.id, equipmentId: r.equipment_id,
            equipmentName: r.equipment_name,
            renterName: r.renter_name, renterPhone: r.renter_phone,
            days: r.days, totalCost: Number(r.total_cost),
            rentalType: r.rental_type,
            dates: r.selected_dates?.join(', ') || '',
            date: r.created_at?.slice(0, 10),
            status: r.status,
          }));
          setRequests(normalized);
          localStorage.setItem(REQUESTS_KEY, JSON.stringify(normalized));
        }
      });
  }, [user]);

  // Persist to localStorage as cache
  useEffect(() => {
    localStorage.setItem(EQ_LIST_KEY, JSON.stringify(equipmentList));
  }, [equipmentList]);
  useEffect(() => {
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
  }, [requests]);

  const totalEarnings = equipmentList.reduce((sum, eq) => sum + (eq.totalEarnings || 0), 0);
  const totalPending  = equipmentList.reduce((sum, eq) => sum + (eq.pendingEarnings || 0), 0);
  const activeCount   = equipmentList.filter(eq => eq.status === 'rented').length;
  const pendingReqs   = requests.filter(r => r.status === 'pending').length;

  const handleSave = async (savedEq) => {
    if (editingEq) {
      setEquipmentList(prev => prev.map(eq => eq.id === savedEq.id ? { ...eq, ...savedEq } : eq));
      if (isConfigured && user) {
        supabase.from('owner_equipment').update({
          name: savedEq.name, category: savedEq.category,
          rate: savedEq.rate, pricing_unit: savedEq.pricingUnit,
          description: savedEq.description, location: savedEq.location,
        }).eq('id', savedEq.id).catch(() => {});
      }
    } else {
      const newEq = { ...savedEq, status: 'available', totalEarnings: 0, pendingEarnings: 0 };
      if (isConfigured && user) {
        const { data } = await supabase.from('owner_equipment').insert({
          owner_id: user.id, name: savedEq.name, category: savedEq.category,
          rate: savedEq.rate, pricing_unit: savedEq.pricingUnit,
          description: savedEq.description, location: savedEq.location,
          status: 'available', total_earnings: 0, pending_earnings: 0,
        }).select().single();
        if (data) { setEquipmentList(prev => [{ ...newEq, id: data.id }, ...prev]); return; }
      }
      setEquipmentList(prev => [{ ...newEq, id: Date.now() }, ...prev]);
    }
  };

  const handleStatusChange = (id, newStatus) => {
    setEquipmentList(prev => prev.map(eq => eq.id === id ? { ...eq, status: newStatus } : eq));
    if (isConfigured) {
      supabase.from('owner_equipment').update({ status: newStatus }).eq('id', id).catch(() => {});
    }
  };

  const handleRequest = (id, action) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: action } : r));
    if (isConfigured) {
      supabase.from('equipment_bookings').update({ status: action === 'accepted' ? 'confirmed' : 'cancelled' }).eq('id', id).catch(() => {});
    }
    if (action === 'accepted') {
      const req = requests.find(r => r.id === id);
      if (req) {
        setEquipmentList(prev => prev.map(eq => {
          if (eq.id !== req.equipmentId) return eq;
          const updated = { ...eq, status: 'rented', pendingEarnings: (eq.pendingEarnings || 0) + req.totalCost };
          if (isConfigured) supabase.from('owner_equipment').update({ status: 'rented', pending_earnings: updated.pendingEarnings }).eq('id', eq.id).catch(() => {});
          return updated;
        }));
      }
      toast.success('تم قبول طلب الإيجار — سيتم إنشاء عقد الضمان');
    } else {
      toast('تم رفض طلب الإيجار', { icon: '❌' });
    }
  };

  const openEdit = (eq) => { setEditingEq(eq); setIsModalOpen(true); };
  const openAdd  = () =>    { setEditingEq(null); setIsModalOpen(true); };

  const TABS = [
    { id: 'list',     label: 'معداتي',        icon: Truck },
    { id: 'requests', label: 'طلبات الإيجار', icon: Inbox,    badge: pendingReqs },
    { id: 'iot',      label: 'تتبع IoT',      icon: Radio },
    { id: 'reports',  label: 'التقارير',       icon: BarChart3 },
  ];

  // Analytics derived values
  const occupancyPct   = equipmentList.length ? Math.round((activeCount / equipmentList.length) * 100) : 0;
  const maxMonthlyRev  = MOCK_MONTHLY.length ? Math.max(...MOCK_MONTHLY.map(m => m.rev)) : 0;
  const bestEq         = [...equipmentList].sort((a, b) => (b.totalEarnings || 0) - (a.totalEarnings || 0))[0];
  const worstEq        = [...equipmentList].sort((a, b) => (a.totalEarnings || 0) - (b.totalEarnings || 0))[0];

  return (
    <div className="min-h-screen bg-cream pt-[62px]" dir="rtl">
      <SEO title="معداتي | Resurgo" description="إدارة معداتك، تتبع الإيجارات، ومراقبة العوائد المالية" />

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black text-navy flex items-center gap-2">
              <Truck className="text-brand" /> إدارة معداتي
            </h1>
            <p className="text-sm text-charcoal/60 mt-1">
              أضف معداتك، تتبع حالتها، واكسب عوائد عبر تأجيرها في المنصة
            </p>
          </div>
          <button onClick={openAdd}
            className="btn-primary py-2.5 px-5 flex items-center justify-center gap-2 text-sm shadow-lg shadow-brand/20">
            <Plus size={16} /> إضافة معدة جديدة
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          {TABS.map(({ id, label, icon: Icon, badge }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === id ? 'bg-navy text-white' : 'border border-navy/10 text-charcoal/60 hover:text-navy hover:border-brand/30'
              }`}>
              <Icon size={14} /> {label}
              {id === 'iot' && (
                <span className="text-[9px] bg-brand/20 text-brand px-1.5 py-0.5 rounded-full font-black">مباشر</span>
              )}
              {badge > 0 && (
                <span className="absolute -top-1.5 -left-1.5 w-5 h-5 bg-cta text-white text-[10px] font-black rounded-full flex items-center justify-center">
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Stats — list & requests tabs */}
        {(activeTab === 'list' || activeTab === 'requests') && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-5 border-b-4 border-b-navy shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
              <p className="text-xs text-charcoal/50 font-bold uppercase tracking-wider mb-1">إجمالي العوائد المحققة</p>
              <p className="text-2xl font-black text-navy">{totalEarnings.toLocaleString()}$</p>
              <p className="text-[10px] text-green-600 font-semibold mt-1 flex items-center gap-1">
                <TrendingUp size={12} /> تم تحويلها للمحفظة
              </p>
            </div>
            <div className="bg-white p-5 border-b-4 border-b-amber-500 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
              <p className="text-xs text-charcoal/50 font-bold uppercase tracking-wider mb-1">أرباح معلقة (Escrow)</p>
              <p className="text-2xl font-black text-amber-600">{totalPending.toLocaleString()}$</p>
              <p className="text-[10px] text-charcoal/40 font-semibold mt-1">تُحرر للمحفظة عند انتهاء الإيجار</p>
            </div>
            <div className="bg-white p-5 border-b-4 border-b-brand shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
              <p className="text-xs text-charcoal/50 font-bold uppercase tracking-wider mb-1">إحصائية التأجير</p>
              <div className="flex items-end gap-2">
                <p className="text-2xl font-black text-navy">{activeCount}</p>
                <p className="text-sm font-bold text-charcoal/40 mb-1">/ {equipmentList.length} مؤجرة</p>
              </div>
            </div>
          </div>
        )}

        {/* ── IoT Tab ── */}
        {activeTab === 'iot' && (
          <div className="bg-white rounded-3xl border border-navy/8 p-6">
            <IoTTrackerMap equipmentSeed={EQUIPMENT_SEED} />
          </div>
        )}

        {/* ── Requests Tab ── */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            <p className="text-charcoal/60 text-xs mb-2">
              <span className="text-navy font-bold">{requests.length}</span> طلب إيجار
              {pendingReqs > 0 && (
                <span className="mr-2 text-cta font-bold">({pendingReqs} بانتظار ردك)</span>
              )}
            </p>
            {requests.length === 0 ? (
              <div className="bg-white p-10 text-center shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
                <Inbox size={36} className="mx-auto text-navy/20 mb-3" />
                <p className="text-charcoal/50 text-sm">لا توجد طلبات إيجار بعد</p>
                <p className="text-charcoal/40 text-xs mt-1">ستظهر هنا طلبات المستأجرين عند حجز معداتك</p>
              </div>
            ) : (
              requests.map((req, i) => {
                const st = REQ_STATUS[req.status];
                return (
                  <motion.div key={req.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="bg-white p-5 shadow-[0_2px_8px_rgba(31,42,56,0.06)] hover:shadow-[0_8px_24px_rgba(31,42,56,0.10)] transition-all"
                    style={{ borderRadius: '8px' }}>
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-navy font-black text-base">{req.renterName}</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${st.bg} ${st.color} ${st.border}`}>
                            {st.label}
                          </span>
                        </div>
                        <p className="text-charcoal/55 text-xs flex items-center gap-1">
                          <Truck size={11} /> {req.equipmentName}
                        </p>
                      </div>
                      <p className="text-charcoal/35 text-[11px] shrink-0">{req.date}</p>
                    </div>

                    <div className="bg-cream rounded-xl p-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-4">
                      <div>
                        <p className="text-charcoal/45 text-[10px] mb-0.5">المدة</p>
                        <p className="text-navy font-bold">{req.days} يوم</p>
                      </div>
                      <div>
                        <p className="text-charcoal/45 text-[10px] mb-0.5">التواريخ</p>
                        <p className="text-navy font-bold">{req.dates}</p>
                      </div>
                      <div>
                        <p className="text-charcoal/45 text-[10px] mb-0.5">نوع الإيجار</p>
                        <p className="text-navy font-bold">{req.rentalType}</p>
                      </div>
                      <div>
                        <p className="text-charcoal/45 text-[10px] mb-0.5">إجمالي العقد</p>
                        <p className="text-green-600 font-black">{req.totalCost.toLocaleString()}$</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {req.status === 'pending' && (
                        <>
                          <button onClick={() => handleRequest(req.id, 'accepted')}
                            className="flex items-center gap-1.5 text-xs font-bold bg-green-50 text-green-600 border border-green-200 hover:bg-green-100 px-4 py-2 rounded-xl transition-all">
                            <CheckCircle size={13} /> قبول الطلب
                          </button>
                          <button onClick={() => handleRequest(req.id, 'rejected')}
                            className="flex items-center gap-1.5 text-xs font-bold bg-red-50 text-red-500 border border-red-200 hover:bg-red-100 px-4 py-2 rounded-xl transition-all">
                            <X size={13} /> رفض
                          </button>
                        </>
                      )}
                      {req.status === 'accepted' && (
                        <Link to={`/handover/EQ-${req.equipmentId}`}
                          className="flex items-center gap-1.5 text-xs font-bold bg-brand/10 text-brand border border-brand/20 hover:bg-brand/20 px-4 py-2 rounded-xl transition-all">
                          <FileText size={13} /> إنشاء محضر الاستلام والتسليم
                        </Link>
                      )}
                      {req.renterPhone && (
                        <a href={`https://wa.me/${req.renterPhone.replace(/[\s+\-()]/g, '')}`}
                          target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs font-bold text-green-600 border border-green-200 bg-green-50 hover:bg-green-100 px-3 py-2 rounded-xl transition-all">
                          <Phone size={12} /> واتساب
                        </a>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        )}

        {/* ── Equipment List Tab ── */}
        {activeTab === 'list' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {equipmentList.map(eq => {
                const statusConfig = STATUS_CONFIG[eq.status];
                const StatusIcon   = statusConfig.icon;

                return (
                  <motion.div key={eq.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-white overflow-hidden flex flex-col group shadow-[0_2px_8px_rgba(31,42,56,0.06)]"
                    style={{ borderRadius: '8px' }}>

                    {/* Image */}
                    <div className="relative h-40 bg-navy/5 overflow-hidden">
                      {eq.image ? (
                        <img src={eq.image} alt={eq.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-charcoal/20">
                          <Truck size={48} />
                        </div>
                      )}
                      <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-full flex items-center gap-1.5 text-[10px] font-bold shadow-sm backdrop-blur-md ${statusConfig.bg} ${statusConfig.color} border border-white/40`}>
                        <StatusIcon size={12} /> {statusConfig.label}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-black text-navy text-base leading-snug pr-2">{eq.name}</h3>
                        <button onClick={() => openEdit(eq)}
                          className="w-8 h-8 rounded-full bg-cream flex items-center justify-center text-charcoal/40 hover:text-brand hover:bg-brand/10 transition-colors shrink-0">
                          <Settings size={14} />
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-navy/5 text-navy font-semibold">{eq.rate}$ / يوم (جاف)</span>
                        {eq.wetAvailable && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-brand/10 text-brand font-semibold">{eq.wetRate}$ / يوم (رطب)</span>
                        )}
                      </div>

                      {/* Financials */}
                      <div className="mt-auto bg-cream rounded-xl p-3 border border-navy/5">
                        <div className="flex justify-between items-center text-xs mb-1.5">
                          <span className="text-charcoal/50 font-medium">إجمالي العوائد</span>
                          <span className="text-navy font-bold">{(eq.totalEarnings || 0).toLocaleString()}$</span>
                        </div>
                        {eq.pendingEarnings > 0 && (
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="text-amber-600 font-medium">أرباح معلقة (الضمان)</span>
                            <span className="text-amber-600 font-bold">+{eq.pendingEarnings.toLocaleString()}$</span>
                          </div>
                        )}
                      </div>

                      {/* Quick status toggle */}
                      <div className="flex gap-1.5 mt-3">
                        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                          const active = eq.status === key;
                          return (
                            <button key={key}
                              onClick={() => handleStatusChange(eq.id, key)}
                              className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${
                                active
                                  ? `${cfg.bg} ${cfg.color} border-current shadow-sm`
                                  : 'bg-white text-charcoal/40 border-navy/10 hover:border-brand/30 hover:text-brand'
                              }`}>
                              {cfg.short}
                            </button>
                          );
                        })}
                      </div>

                      {/* Handover link — only when rented */}
                      {eq.status === 'rented' && (
                        <Link to={`/handover/EQ-${eq.id}`}
                          className="mt-2 flex items-center justify-center gap-1.5 text-[11px] font-bold text-brand border border-brand/20 hover:bg-brand/5 py-1.5 rounded-lg transition-all">
                          <FileText size={12} /> محضر الاستلام والتسليم
                        </Link>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {equipmentList.length === 0 && (
              <div className="text-center py-20 bg-white/50 rounded-3xl border border-navy/5">
                <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="text-brand" size={28} />
                </div>
                <p className="text-navy font-bold text-lg mb-2">لا توجد معدات مسجلة</p>
                <p className="text-charcoal/50 text-sm mb-6 max-w-sm mx-auto">
                  أضف معداتك الآن واجعلها متاحة للإيجار لتوليد دخل إضافي محمي بنظام الضمان.
                </p>
                <button onClick={openAdd} className="btn-primary px-6 py-2 text-sm mx-auto">
                  إضافة أول معدة
                </button>
              </div>
            )}
          </>
        )}

        {/* ── Reports Tab ── */}
        {activeTab === 'reports' && (
          <div className="space-y-6">

            {/* KPI row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'نسبة الإشغال',   val: `${occupancyPct}%`,                         color: 'text-brand',   sub: `${activeCount} من ${equipmentList.length} مؤجرة` },
                { label: 'إجمالي العوائد', val: `${totalEarnings.toLocaleString()} $`,       color: 'text-green-600', sub: 'محقق ومُحوَّل' },
                { label: 'معلّق (Escrow)',  val: `${totalPending.toLocaleString()} $`,        color: 'text-amber-600', sub: 'ينتظر إفراج' },
                { label: 'طلبات معالجة',   val: requests.filter(r => r.status === 'accepted').length, color: 'text-navy', sub: 'إيجارات مقبولة' },
              ].map(({ label, val, color, sub }) => (
                <div key={label} className="bg-white p-4 text-center shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
                  <p className={`text-2xl font-black ${color}`}>{val}</p>
                  <p className="text-charcoal/50 text-xs font-medium mt-0.5">{label}</p>
                  <p className="text-charcoal/35 text-[10px] mt-0.5">{sub}</p>
                </div>
              ))}
            </div>

            {/* Monthly revenue bar chart */}
            <div className="bg-white p-5 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
              <div className="flex items-center gap-2 mb-5">
                <BarChart3 size={15} className="text-brand" />
                <p className="text-navy font-bold text-sm">الإيرادات الشهرية (آخر 6 أشهر)</p>
                <span className="mr-auto text-xs text-charcoal/40 font-mono">$ موك</span>
              </div>
              <div className="flex items-end gap-2 h-36">
                {MOCK_MONTHLY.map(({ month, rev }) => {
                  const pct = Math.round((rev / maxMonthlyRev) * 100);
                  return (
                    <div key={month} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[9px] font-bold text-navy">{rev.toLocaleString()}</span>
                      <motion.div
                        initial={{ height: 0 }} whileInView={{ height: `${pct}%` }} viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: MOCK_MONTHLY.findIndex(m => m.month === month) * 0.08 }}
                        className="w-full rounded-t-lg bg-gradient-to-t from-brand to-brand/60"
                        style={{ minHeight: 4 }}
                      />
                      <span className="text-[8px] text-charcoal/45 text-center leading-tight">{month}</span>
                    </div>
                  );
                })}
              </div>
              <p className="text-charcoal/35 text-[10px] text-center mt-3">
                أفضل شهر: <strong className="text-navy">مايو — 2,200 $</strong>
              </p>
            </div>

            {/* Per-equipment performance */}
            {equipmentList.length > 0 && (
              <div className="bg-white p-5 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
                <p className="text-navy font-bold text-sm mb-4">أداء كل معدة</p>
                <div className="space-y-3">
                  {[...equipmentList]
                    .sort((a, b) => (b.totalEarnings || 0) - (a.totalEarnings || 0))
                    .map((eq, i) => {
                      const pct = totalEarnings > 0 ? Math.round(((eq.totalEarnings || 0) / totalEarnings) * 100) : 0;
                      const statusConfig = STATUS_CONFIG[eq.status];
                      return (
                        <div key={eq.id} className="flex items-center gap-3">
                          <span className="text-charcoal/30 text-xs font-mono w-4 shrink-0">{i + 1}</span>
                          <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-navy/5">
                            {eq.image ? <img src={eq.image} alt="" className="w-full h-full object-cover" /> : <Truck size={16} className="m-auto text-charcoal/30 mt-1" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-navy font-bold text-xs truncate">{eq.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex-1 h-1.5 bg-navy/8 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }} whileInView={{ width: `${pct}%` }} viewport={{ once: true }}
                                  transition={{ duration: 0.8, delay: i * 0.1 }}
                                  className="h-full bg-brand rounded-full"
                                />
                              </div>
                              <span className="text-[10px] text-charcoal/40 shrink-0">{pct}%</span>
                            </div>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="text-navy font-black text-sm">{(eq.totalEarnings || 0).toLocaleString()} $</p>
                            <span className={`text-[9px] font-bold ${statusConfig.color}`}>{statusConfig.short}</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Best / Worst highlight */}
            {equipmentList.length >= 2 && bestEq && worstEq && bestEq.id !== worstEq.id && (
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-white p-4 border-b-4 border-b-green-500 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
                  <p className="text-[10px] text-green-600 font-bold uppercase tracking-wider mb-2">🏆 الأعلى أداءً</p>
                  <p className="text-navy font-black text-sm">{bestEq.name}</p>
                  <p className="text-green-600 font-black text-lg mt-1">{(bestEq.totalEarnings || 0).toLocaleString()} $</p>
                  <p className="text-charcoal/40 text-[10px]">إجمالي عوائد محققة</p>
                </div>
                <div className="bg-white p-4 border-b-4 border-b-amber-400 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
                  <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider mb-2">💡 يحتاج تحسين</p>
                  <p className="text-navy font-black text-sm">{worstEq.name}</p>
                  <p className="text-amber-600 font-black text-lg mt-1">{(worstEq.totalEarnings || 0).toLocaleString()} $</p>
                  <p className="text-charcoal/40 text-[10px]">راجع السعر أو التوافر</p>
                </div>
              </div>
            )}

            {/* Occupancy gauge */}
            <div className="bg-white p-5 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <p className="text-navy font-bold text-sm">معدل الإشغال الإجمالي</p>
                <span className={`text-sm font-black ${occupancyPct >= 70 ? 'text-green-600' : occupancyPct >= 40 ? 'text-amber-600' : 'text-red-500'}`}>
                  {occupancyPct}%
                </span>
              </div>
              <div className="h-3 bg-navy/8 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }} whileInView={{ width: `${occupancyPct}%` }} viewport={{ once: true }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                  className={`h-full rounded-full ${occupancyPct >= 70 ? 'bg-green-500' : occupancyPct >= 40 ? 'bg-amber-500' : 'bg-red-400'}`}
                />
              </div>
              <div className="flex justify-between text-[10px] text-charcoal/40 mt-2">
                <span>0%</span>
                <span className="text-charcoal/55">المستهدف: 70%+</span>
                <span>100%</span>
              </div>
            </div>

          </div>
        )}
      </div>

      <EquipmentFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        equipmentToEdit={editingEq}
        onSave={handleSave}
      />
    </div>
  );
}
