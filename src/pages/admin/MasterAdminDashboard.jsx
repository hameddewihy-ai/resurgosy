import { useState, useMemo, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  Shield, Users, Trash2, Search, TrendingUp, Settings, DollarSign,
  Building2, UserX, UserCheck, Check, X, HardHat, ArrowLeft,
  Briefcase, Wrench, GraduationCap, Scale, FileCheck, Megaphone
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { useGlobalData } from '../../context/GlobalContext';
import { supabase, isConfigured } from '../../lib/supabase';
import SEO from '../../components/SEO';
import toast from 'react-hot-toast';
import { addNotification } from '../../components/NotificationsPanel';
import { sendEmail } from '../../utils/sendEmail';
import { propertyApprovedHtml, propertyRejectedHtml } from '../../utils/emailTemplates';

// Admin seeds are now imported and managed via GlobalContext

const CHART_DATA = [
  { name: 'يناير', users: 340, escrow: 120 },
  { name: 'فبراير', users: 480, escrow: 210 },
  { name: 'مارس', users: 620, escrow: 430 },
  { name: 'أبريل', users: 890, escrow: 680 },
  { name: 'مايو', users: 1248, escrow: 1245 },
];

const ROLES_INFO = {
  seeker: { label: 'باحث عقاري', color: 'bg-slate-100 text-slate-700' },
  owner: { label: 'مالك عقار', color: 'bg-blue-100 text-blue-700' },
  investor: { label: 'مستثمر', color: 'bg-emerald-100 text-emerald-700' },
  engineer: { label: 'مهندس مشرف', color: 'bg-violet-100 text-violet-700' },
  developer: { label: 'مطور عقاري', color: 'bg-orange-100 text-orange-700' },
  contractor: { label: 'مقاول معدات', color: 'bg-amber-100 text-amber-700' },
  internal_clerk: { label: 'كاتب داخلي', color: 'bg-teal-100 text-teal-700' },
  appraiser: { label: 'خبير تقييم', color: 'bg-cyan-100 text-cyan-700' },
  admin: { label: 'مدير النظام', color: 'bg-red-100 text-red-700' },
};

export default function MasterAdminDashboard() {
  const { user } = useAuth();
  
  // Get data from global context
  const {
    developers = [],
    jobs = [],
    setJobs,
    properties = [],
    setProperties,
    investmentProjects = [],
    setInvestmentProjects,
    finishingProjects = [],
    setFinishingProjects,
    sypExchangeRate,
    setSypExchangeRate,
    finishingCompanies = [],
    setFinishingCompanies,
    sponsorships = [],
    toggleSponsorship,
    updateSponsorship,
    users: userList = [],
    setUsers: setUserList,
    machineryList = [],
    setMachineryList,
    studiesList = [],
    setStudiesList,
    clearingList = [],
    setClearingList,
    valuationsList = [],
    setValuationsList,
  } = useGlobalData();

  // Dashboard navigation tab
  const [activeTab, setActiveTab] = useState('overview');

  // Search queries
  const [userQuery, setUserQuery] = useState('');
  const [propQuery, setPropQuery] = useState('');
  const [machineryQuery, setMachineryQuery] = useState('');
  const [jobQuery, setJobQuery] = useState('');

  // Local state for simulation databases
  const [exchangeInput, setExchangeInput] = useState(sypExchangeRate);

  // Sponsorship local states
  const [editingSponsorId, setEditingSponsorId] = useState(null);
  const [editForm, setEditForm] = useState({
    sponsor: '',
    title: '',
    desc: '',
    cta: '',
    link: '',
    type: 'solar',
  });

  // City price baselines state
  const [cityPrices, setCityPrices] = useState([]);
  const [editingCity, setEditingCity] = useState(null);
  const [cityPriceInput, setCityPriceInput] = useState('');

  // Supabase-loaded admin data (null = not yet loaded)
  const [pendingProps,   setPendingProps]   = useState(null); // pending_review properties
  const [adminProps,     setAdminProps]     = useState(null);
  const [adminEquipment, setAdminEquipment] = useState(null);
  const [adminProfiles,  setAdminProfiles]  = useState(null);
  const [adminUsers,     setAdminUsers]     = useState(null); // real users from Edge Function
  const [totalInquiries, setTotalInquiries] = useState(null);
  const [analyticsData,  setAnalyticsData]  = useState(null); // real metrics from Supabase

  const handleStartEditSponsor = (sp) => {
    setEditingSponsorId(sp.id);
    setEditForm({
      sponsor: sp.sponsor,
      title: sp.title,
      desc: sp.desc,
      cta: sp.cta,
      link: sp.link,
      type: sp.type,
    });
  };

  const handleSaveSponsor = (id) => {
    if (!editForm.sponsor || !editForm.title || !editForm.desc || !editForm.link || !editForm.cta) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    updateSponsorship(id, editForm);
    setEditingSponsorId(null);
    toast.success('تم تحديث بيانات الرعاية بنجاح');
  };

  // ── Filters & Memoized Searches ─────────────────────────────────────────────
  const filteredUsers = useMemo(() => {
    // Priority: Edge Function (real emails+roles) → profiles table → mock list
    const source = adminUsers ?? (isConfigured && adminProfiles
      ? adminProfiles.map(p => ({
          id:     p.id,
          name:   p.full_name || 'مستخدم',
          email:  p.id.slice(0, 8) + '…',
          role:   'seeker',
          date:   p.updated_at ? p.updated_at.split('T')[0] : '—',
          status: 'نشط',
        }))
      : userList);
    return source.filter(u =>
      u.name?.includes(userQuery) || u.email?.toLowerCase().includes(userQuery.toLowerCase())
    );
  }, [userList, adminProfiles, adminUsers, userQuery]);

  const filteredProps = useMemo(() => {
    const source = isConfigured && adminProps
      ? adminProps.map(p => ({
          id:           p.id,
          title:        p.title || 'عقار',
          city:         p.city  || '',
          priceDisplay: p.price_usd ? `$${Number(p.price_usd).toLocaleString()}` : '—',
          images:       Array.isArray(p.images) ? p.images : [],
        }))
      : properties;
    return source.filter(p =>
      p.title.includes(propQuery) || p.city.includes(propQuery)
    );
  }, [properties, adminProps, propQuery]);

  const filteredMachinery = useMemo(() => {
    const source = isConfigured && adminEquipment
      ? adminEquipment.map(e => ({
          id:       e.id,
          name:     e.name     || 'معدة',
          provider: adminProfiles?.find(p => p.id === e.owner_id)?.full_name || (e.owner_id ? e.owner_id.slice(0, 8) : '—'),
          rate:     e.rate     || '',
          location: e.location || '',
          status:   e.status   || 'نشط',
        }))
      : machineryList;
    return source.filter(m =>
      m.name.includes(machineryQuery) || m.provider.includes(machineryQuery)
    );
  }, [machineryList, adminEquipment, adminProfiles, machineryQuery]);

  const filteredJobs = useMemo(() => {
    return jobs.filter(j =>
      j.title.includes(jobQuery) || j.company.includes(jobQuery)
    );
  }, [jobs, jobQuery]);

  // ── Load real data from Supabase ──────────────────────────────────────────
  useEffect(() => {
    if (!isConfigured || !user) return;
    setPendingProps(null);
    supabase.from('properties').select('*')
      .eq('status', 'pending_review')
      .order('created_at', { ascending: false })
      .then(({ data }) => setPendingProps(data || []));
  }, [user, activeTab]);

  useEffect(() => {
    if (!isConfigured || !user) return;
    supabase.from('properties').select('*')
      .eq('status', 'listed')
      .order('created_at', { ascending: false })
      .then(({ data }) => data && setAdminProps(data));
  }, [user]);

  useEffect(() => {
    if (!isConfigured || !user) return;
    supabase.from('equipment').select('*').order('created_at', { ascending: false })
      .then(({ data }) => data && setAdminEquipment(data));
  }, [user]);

  useEffect(() => {
    if (!isConfigured || !user) return;
    supabase.from('profiles').select('*').order('updated_at', { ascending: false })
      .then(({ data }) => data && setAdminProfiles(data));
  }, [user]);

  useEffect(() => {
    if (!isConfigured || !user) return;
    supabase.from('inquiries').select('id', { count: 'exact', head: true })
      .then(({ count }) => setTotalInquiries(count || 0));
  }, [user]);

  // Load real users from admin Edge Function
  useEffect(() => {
    if (!isConfigured || !user) return;
    supabase.functions.invoke('admin-users', { method: 'GET' })
      .then(({ data }) => { if (data?.users) setAdminUsers(data.users); })
      .catch(() => {});
  }, [user]);

  // Load analytics metrics
  useEffect(() => {
    if (!isConfigured || !user) return;
    Promise.all([
      supabase.from('profiles').select('created_at'),
      supabase.from('properties').select('status, city, created_at'),
      supabase.from('valuation_requests').select('status, created_at'),
      supabase.from('property_views').select('id', { count: 'exact', head: true }),
    ]).then(([{ data: profs }, { data: props }, { data: vals }, { count: viewCount }]) => {
      // Build last-6-month labels
      const now = new Date();
      const months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
        return {
          label: d.toLocaleDateString('ar', { month: 'short' }),
          key:   `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        };
      });

      const tally = (rows, field) => {
        const map = {};
        (rows || []).forEach(r => {
          const k = r[field]?.slice(0, 7);
          if (k) map[k] = (map[k] || 0) + 1;
        });
        return map;
      };

      const profByMonth = tally(profs, 'created_at');
      const propByMonth = tally(props, 'created_at');

      const chartData = months.map(m => ({
        name:       m.label,
        users:      profByMonth[m.key] || 0,
        properties: propByMonth[m.key] || 0,
      }));

      // Properties by status
      const propStatus = {};
      (props || []).forEach(p => { propStatus[p.status] = (propStatus[p.status] || 0) + 1; });

      // Top cities (max 6)
      const cityMap = {};
      (props || []).forEach(p => { if (p.city) cityMap[p.city] = (cityMap[p.city] || 0) + 1; });
      const topCities = Object.entries(cityMap)
        .sort(([, a], [, b]) => b - a).slice(0, 6)
        .map(([name, count]) => ({ name, count }));

      // Valuation requests by status
      const valStatus = {};
      (vals || []).forEach(v => { valStatus[v.status] = (valStatus[v.status] || 0) + 1; });

      const hasRealData = chartData.some(d => d.users + d.properties > 0);

      setAnalyticsData({
        chartData:   hasRealData ? chartData : null,
        propStatus,
        topCities,
        valStatus,
        totalViews:  viewCount || 0,
        totalUsers:  profs?.length  || 0,
        totalProps:  props?.length  || 0,
        totalVals:   vals?.length   || 0,
      });
    }).catch(() => {});
  }, [user]);

  // Load city price baselines
  useEffect(() => {
    if (!isConfigured) return;
    supabase.from('city_price_baselines').select('*').order('city').then(({ data }) => {
      if (data) setCityPrices(data);
    });
  }, []);

  // Security Gate
  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" replace state={{ accessDenied: true, requiredRole: 'admin' }} />;
  }

  // ── Action Handlers ────────────────────────────────────────────────────────

  // 1. Users
  const toggleUserStatus = (userId) => {
    const target = (adminUsers ?? userList).find(u => u.id === userId);
    const willBan = target?.status === 'نشط';
    // Optimistic update
    const updater = u => u.id === userId ? { ...u, status: willBan ? 'معطل' : 'نشط' } : u;
    setAdminUsers(prev => prev ? prev.map(updater) : prev);
    setUserList(prev => prev.map(updater));
    toast.success(`تم ${willBan ? 'تعطيل' : 'تفعيل'} الحساب`);
    if (isConfigured) {
      supabase.functions.invoke('admin-users', {
        method: 'POST', body: { userId, ban: willBan },
      }).catch(() => toast.error('فشل تحديث الحالة'));
    }
  };

  const handleUpdateRole = (userId, newRole) => {
    // Optimistic update
    const updater = u => u.id === userId ? { ...u, role: newRole } : u;
    setAdminUsers(prev => prev ? prev.map(updater) : prev);
    setUserList(prev => prev.map(updater));
    toast.success('تم تحديث دور الصلاحيات');
    if (isConfigured) {
      supabase.functions.invoke('admin-users', {
        method: 'POST', body: { userId, role: newRole },
      }).catch(() => toast.error('فشل تحديث الدور'));
    }
  };

  // 2. Properties
  const handleDeleteListing = (propId) => {
    toast((t) => (
      <div dir="rtl" className="flex flex-col gap-3 min-w-[240px]">
        <p className="text-sm font-bold">هل أنت متأكد من حذف هذا العقار؟</p>
        <p className="text-[10px] text-white/60">سيتم حذفه من دليل العقارات بشكل نهائي</p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              if (isConfigured) {
                supabase.from('properties').delete().eq('id', propId)
                  .then(() => setAdminProps(prev => prev ? prev.filter(p => p.id !== propId) : prev));
              }
              setProperties(prev => prev.filter(p => p.id !== propId));
              toast.dismiss(t.id);
              toast.success('تم حذف العقار بنجاح');
            }}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-1.5 rounded-lg transition-colors"
          >
            نعم، احذف
          </button>
          <button onClick={() => toast.dismiss(t.id)} className="flex-1 bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-1.5 rounded-lg">إلغاء</button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  const handleApproveProperty = async (prop) => {
    setPendingProps(prev => prev ? prev.filter(p => p.id !== prop.id) : prev);
    setAdminProps(prev => prev ? [{ ...prop, status: 'listed' }, ...prev] : prev);
    toast.success(`تمت الموافقة على "${prop.title}" ونُشر في الدليل`);
    if (isConfigured) {
      const { error: updateErr } = await supabase
        .from('properties').update({ status: 'listed' }).eq('id', prop.id);
      if (updateErr) {
        toast.error(`خطأ في التحديث: ${updateErr.message}`);
        console.error('[Admin] approve property update error:', updateErr);
        return;
      }
      supabase.functions.invoke('match-search-alerts',     { body: { ...prop, status: 'listed' } }).catch(() => {});
      supabase.functions.invoke('notify-property-alerts', { body: { ...prop, status: 'listed' } }).catch(() => {});
    }
    if (prop.owner_id) {
      addNotification({
        user_id: prop.owner_id,
        type:    'property',
        title:   '✅ تمت الموافقة على عقارك',
        body:    `"${prop.title}" منشور الآن في دليل RESURGO`,
        link:    '/dashboard',
      });
      const ownerEmail = adminUsers?.find(u => u.id === prop.owner_id)?.email;
      sendEmail({
        to:      ownerEmail,
        subject: `✅ تمت الموافقة على عقارك — ${prop.title}`,
        html:    propertyApprovedHtml(prop.title),
      });
    }
  };

  const handleRejectProperty = async (propId, title, ownerId) => {
    setPendingProps(prev => prev ? prev.filter(p => p.id !== propId) : prev);
    toast(`تم رفض العقار "${title}" وإخطار المالك`, { icon: '🚫' });
    if (isConfigured) {
      const { error: rejectErr } = await supabase
        .from('properties').update({ status: 'rejected' }).eq('id', propId);
      if (rejectErr) {
        toast.error(`خطأ في الرفض: ${rejectErr.message}`);
        return;
      }
    }
    if (ownerId) {
      addNotification({
        user_id: ownerId,
        type:    'property',
        title:   'تعذّر نشر عقارك',
        body:    `"${title}" — يرجى مراجعة البيانات والتواصل مع الدعم`,
        link:    '/dashboard',
      });
      const ownerEmail = adminUsers?.find(u => u.id === ownerId)?.email;
      sendEmail({
        to:      ownerEmail,
        subject: `⚠️ بخصوص طلب نشر عقارك — ${title}`,
        html:    propertyRejectedHtml(title),
      });
    }
  };

  // 3. Equipment (المعدات)
  const toggleMachineryStatus = (eqId) => {
    if (isConfigured && adminEquipment) {
      const current = adminEquipment.find(m => m.id === eqId);
      const nextStatus = current?.status === 'نشط' ? 'معطل' : 'نشط';
      supabase.from('equipment').update({ status: nextStatus }).eq('id', eqId);
      setAdminEquipment(prev => prev.map(m => m.id === eqId ? { ...m, status: nextStatus } : m));
      toast.success(`تم تغيير حالة تشغيل المعدات إلى: ${nextStatus}`);
    } else {
      setMachineryList(prev => prev.map(m => {
        if (m.id === eqId) {
          const nextStatus = m.status === 'نشط' ? 'معطل' : 'نشط';
          toast.success(`تم تغيير حالة تشغيل المعدات إلى: ${nextStatus}`);
          return { ...m, status: nextStatus };
        }
        return m;
      }));
    }
  };

  // 4. Developers & Finishing
  const handleApproveCompanyBadge = (coId, nextBadge) => {
    setFinishingCompanies(prev => prev.map(co => {
      if (co.id === coId) {
        toast.success(`تم تحديث شارة توثيق شركة الإكساء إلى: ${nextBadge}`);
        return { ...co, badge: nextBadge };
      }
      return co;
    }));
  };

  // 5. Finishing Projects Escrow Release
  const handleReleaseProjectMilestone = (projId, amount) => {
    toast.success(`تم تحرير مبلغ الحساب الضامن بقيمة $${amount.toLocaleString()} للمقاول بنجاح`);
    setFinishingProjects(prev => prev.map(p => {
      if (p.id === projId) {
        return { ...p, progress: Math.min(p.progress + 25, 100) };
      }
      return p;
    }));
  };

  // 6. Crowdfund & Investments
  const handlePauseCrowdfund = (projId) => {
    setInvestmentProjects(prev => prev.map(p => {
      if (p.id === projId) {
        const nextStatus = p.status === 'paused' ? 'active' : 'paused';
        toast.success(nextStatus === 'paused' ? 'تم تعليق جولة التمويل مؤقتاً' : 'تم استئناف التمويل للجولة');
        return { ...p, status: nextStatus };
      }
      return p;
    }));
  };

  // 7. Appraisals & Valuations
  const handleApproveValuation = (valId) => {
    setValuationsList(prev => prev.map(v => {
      if (v.id === valId) {
        toast.success('تم اعتماد تقرير التقييم العقاري ونشره للمستعلم');
        return { ...v, status: 'معتمد رسمياً' };
      }
      return v;
    }));
  };

  // 8. Legal & Clearing
  const handleApproveClearing = (clId) => {
    setClearingList(prev => prev.map(c => {
      if (c.id === clId) {
        toast.success('تم المصادقة على المعاملة القانونية ونقل الملكية');
        return { ...c, status: 'مكتمل وموثق' };
      }
      return c;
    }));
  };

  // 9. Studies
  const handleApproveStudy = (stId) => {
    setStudiesList(prev => prev.map(s => {
      if (s.id === stId) {
        toast.success('تم تصديق الدراسة الهندسية وإصدار الترخيص الفني');
        return { ...s, status: 'مكتمل ومصدق' };
      }
      return s;
    }));
  };

  // 10. Jobs
  const handleDeleteJob = (jobId) => {
    setJobs(prev => prev.filter(j => j.id !== jobId));
    toast.success('تم إغلاق وأرشفة فرصة التوظيف');
  };

  // 11. Settings
  const handleSaveRate = () => {
    setSypExchangeRate(Number(exchangeInput));
    toast.success(`تم تحديث سعر الصرف العام للمنصة: 1$ = ${Number(exchangeInput).toLocaleString()} ل.س`);
  };

  const handleSaveCityPrice = async (id) => {
    const val = Number(cityPriceInput);
    if (!val || val <= 0) { toast.error('أدخل سعراً صحيحاً'); return; }
    if (isConfigured) {
      const { error } = await supabase.from('city_price_baselines').update({ base_price_usd: val }).eq('id', id);
      if (error) { toast.error('حدث خطأ أثناء الحفظ'); return; }
    }
    setCityPrices(prev => prev.map(c => c.id === id ? { ...c, base_price_usd: val } : c));
    setEditingCity(null);
    setCityPriceInput('');
    toast.success('تم تحديث سعر المدينة');
  };

  return (
    <div className="min-h-screen bg-cream" dir="rtl">
      <SEO title="لوحة تحكم الإدارة العليا — RESURGO" />

      {/* Hero Header */}
      <div className="bg-navy pt-[62px]">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
              <Shield className="text-red-400" size={24} />
            </div>
            <div>
              <p className="text-white/45 text-[10px] font-bold uppercase tracking-widest mb-0.5">منظومة الإشراف العام والضبط</p>
              <h1 className="text-white font-black text-xl">لوحة المشرف العام الموحدة</h1>
              <p className="text-white/40 text-xs mt-0.5">تحكم شامل ومحاكاة فورية لجميع أقسام المنصة السكنية والاستثمارية</p>
            </div>
            <div className="mr-auto">
              <Link to="/dashboard" className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
                <ArrowLeft size={14} /> العودة للوحة الشخصية
              </Link>
            </div>
          </div>

          {/* Bento Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {(() => {
              const propCount  = adminProps?.length     ?? properties.length;
              const equipCount = adminEquipment?.length ?? machineryList.length;
              const userCount  = adminProfiles?.length  ?? 0;
              return [
                { label: 'العقارات والمعدات العامة', val: propCount + equipCount,    sub: `عقارات: ${propCount} · معدات: ${equipCount}`,          color: 'text-brand',       icon: Building2 },
                { label: 'الأعضاء المسجلون',          val: isConfigured ? (userCount || '…') : developers.length + finishingCompanies.length, sub: isConfigured ? 'من قاعدة البيانات' : 'عضويات نشطة وموثقة', color: 'text-cta', icon: HardHat },
                { label: 'الضمان والتمويل الجماعي',   val: `$${(1245000 + investmentProjects.reduce((acc, p) => acc + p.raised, 0)).toLocaleString()}`, sub: 'ودائع الضمان وجمع التمويل', color: 'text-green-600', icon: DollarSign },
                { label: 'الخدمات والوظائف الجارية',  val: valuationsList.length + clearingList.length + jobs.length, sub: `استفسارات: ${totalInquiries ?? '…'}`, color: 'text-purple-600', icon: Briefcase },
              ];
            })().map((st, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 gpu-transition flex items-start justify-between">
                <div>
                  <p className="text-white/45 text-[11px] font-bold mb-1">{st.label}</p>
                  <p className="text-xl font-black text-white leading-none">{st.val}</p>
                  <p className="text-white/30 text-[10px] mt-1">{st.sub}</p>
                </div>
                <st.icon className={`${st.color} opacity-40`} size={20} />
              </div>
            ))}
          </div>

          {/* Extended Admin Tabs covering all 10 sections */}
          <div className="flex gap-1 mt-8 border-b border-white/10 overflow-x-auto no-scrollbar">
            {[
              { id: 'overview', label: 'نظرة عامة والتحليلات', icon: TrendingUp },
              { id: 'users', label: 'الأعضاء والشركات', icon: Users },
              { id: 'assets', label: 'العقارات والمعدات', icon: Building2 },
              { id: 'investment', label: 'التمويل والاستثمار', icon: DollarSign },
              { id: 'services', label: 'الخدمات والوظائف', icon: Briefcase },
              { id: 'ads', label: 'الإعلانات والرعايات', icon: Megaphone },
              { id: 'settings', label: 'إعدادات النظام', icon: Settings },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`relative flex items-center gap-2 px-4 py-3 text-xs font-bold transition-colors whitespace-nowrap ${
                  activeTab === t.id ? 'text-red-400 font-black' : 'text-white/45 hover:text-white'
                }`}
              >
                <t.icon size={13} />
                {t.label}
                {activeTab === t.id && (
                  <span className="absolute bottom-0 inset-x-4 h-[2.5px] bg-red-500 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* ── 1. Overview Tab ── */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-[1fr_300px] gap-6 items-start">
              
              {/* Performance Chart */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-navy/10 gpu-transition">
                <div className="mb-4 flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-navy font-black text-sm">نمو المستخدمين والعقارات</h3>
                    <p className="text-charcoal/50 text-[11px] mt-0.5">
                      {analyticsData ? 'بيانات حقيقية من Supabase — آخر 6 أشهر' : 'بيانات تجريبية — انتظار Supabase'}
                    </p>
                  </div>
                  {analyticsData && (
                    <div className="flex items-center gap-3 text-[10px] text-charcoal/50">
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-brand inline-block" /> مستخدمون</span>
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> عقارات</span>
                    </div>
                  )}
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analyticsData?.chartData ?? CHART_DATA} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#5979bb" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#5979bb" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorProps" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(31,42,56,0.06)" />
                      <XAxis dataKey="name" stroke="rgba(31,42,56,0.4)" fontSize={10} tickLine={false} />
                      <YAxis stroke="rgba(31,42,56,0.4)" fontSize={10} tickLine={false} />
                      <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid rgba(31,42,56,0.1)' }} />
                      <Area type="monotone" dataKey="users" name="مستخدمون جدد" stroke="#5979bb" strokeWidth={2.5} fillOpacity={1} fill="url(#colorUsers)" />
                      <Area type="monotone" dataKey={analyticsData ? 'properties' : 'escrow'} name={analyticsData ? 'عقارات جديدة' : 'ضمان (آلاف)'} stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorProps)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Sidebar: Quick Actions */}
              <div className="space-y-4">
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-navy/10 gpu-transition">
                  <h4 className="text-navy font-bold text-xs mb-3">حالة اتصال النظام البيني</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-charcoal/60">بوابة الاتصال:</span>
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${isConfigured ? 'bg-green-50 text-green-600 border-green-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                        {isConfigured ? 'متصل بـ Supabase ✓' : 'خادم محاكي'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-charcoal/60">قاعدة البيانات سحابياً:</span>
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${isConfigured ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-500 border-red-200'}`}>
                        {isConfigured ? 'مفعّلة ✓' : 'غير مفعلة (Supabase)'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-charcoal/60">التخزين الفعلي:</span>
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${isConfigured ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-green-50 text-green-600 border-green-200'}`}>
                        {isConfigured ? 'Supabase Cloud' : 'localStorage نشط'}
                      </span>
                    </div>
                    {totalInquiries !== null && (
                      <div className="flex justify-between items-center pt-1.5 border-t border-navy/5">
                        <span className="text-charcoal/60">إجمالي الاستفسارات:</span>
                        <span className="text-navy font-black text-[11px]">{totalInquiries}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-sm border border-navy/10 gpu-transition">
                  <h4 className="text-navy font-bold text-xs mb-2.5">اختصارات إدارية سريعة</h4>
                  <div className="grid grid-cols-2 gap-2 text-center text-[10px] font-bold">
                    <Link to="/admin/news" className="bg-navy/5 text-navy hover:bg-brand hover:text-white p-2.5 rounded-xl border border-navy/8 transition-all">إدارة المقالات</Link>
                    <Link to="/clearing/dashboard" className="bg-navy/5 text-navy hover:bg-brand hover:text-white p-2.5 rounded-xl border border-navy/8 transition-all">تخليص المعاملات</Link>
                    <Link to="/valuation/appraiser-dashboard" className="bg-navy/5 text-navy hover:bg-brand hover:text-white p-2.5 rounded-xl border border-navy/8 transition-all">لوحة التقييم</Link>
                    <Link to="/properties" className="bg-navy/5 text-navy hover:bg-brand hover:text-white p-2.5 rounded-xl border border-navy/8 transition-all">تصفح العقارات</Link>
                  </div>
                </div>
              </div>

            </div>

            {/* ── Real Analytics Cards ── */}
            {analyticsData && (
              <div className="grid md:grid-cols-3 gap-5">

                {/* Properties by status */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-navy/10">
                  <h4 className="text-navy font-bold text-xs mb-4">العقارات حسب الحالة</h4>
                  {(() => {
                    const items = [
                      { key: 'listed',         label: 'منشور',        color: '#10b981' },
                      { key: 'pending_review', label: 'قيد المراجعة', color: '#f59e0b' },
                      { key: 'rejected',       label: 'مرفوض',        color: '#ef4444' },
                      { key: 'sold',           label: 'مباع',         color: '#6366f1' },
                      { key: 'archived',       label: 'معلق',         color: '#94a3b8' },
                    ];
                    const total = Object.values(analyticsData.propStatus).reduce((a, b) => a + b, 0) || 1;
                    return (
                      <div className="space-y-2.5">
                        {items.map(it => {
                          const count = analyticsData.propStatus[it.key] || 0;
                          const pct   = Math.round((count / total) * 100);
                          return (
                            <div key={it.key}>
                              <div className="flex justify-between text-[11px] mb-1">
                                <span className="text-charcoal/60">{it.label}</span>
                                <span className="font-bold text-navy">{count} <span className="text-charcoal/40 font-normal">({pct}%)</span></span>
                              </div>
                              <div className="h-1.5 bg-navy/6 rounded-full overflow-hidden">
                                <div className="h-full rounded-full transition-all duration-700"
                                  style={{ width: `${pct}%`, backgroundColor: it.color }} />
                              </div>
                            </div>
                          );
                        })}
                        <p className="text-[10px] text-charcoal/35 pt-1 border-t border-navy/5">
                          الإجمالي: <span className="font-bold text-navy">{analyticsData.totalProps}</span> عقار
                        </p>
                      </div>
                    );
                  })()}
                </div>

                {/* Top cities bar chart */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-navy/10">
                  <h4 className="text-navy font-bold text-xs mb-4">أكثر المدن نشاطاً</h4>
                  {analyticsData.topCities.length === 0 ? (
                    <p className="text-charcoal/35 text-xs text-center py-6">لا توجد بيانات بعد</p>
                  ) : (
                    <div className="h-44">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analyticsData.topCities} layout="vertical"
                          margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                          <XAxis type="number" hide />
                          <YAxis type="category" dataKey="name" width={55}
                            stroke="rgba(31,42,56,0.4)" fontSize={10} tickLine={false} />
                          <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid rgba(31,42,56,0.1)' }} />
                          <Bar dataKey="count" name="عقارات" radius={[0, 4, 4, 0]}>
                            {analyticsData.topCities.map((_, idx) => (
                              <Cell key={idx} fill={idx === 0 ? '#5979bb' : idx === 1 ? '#f37124' : '#94a3b8'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                {/* Valuation requests + platform KPIs */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-navy/10 space-y-4">
                  <div>
                    <h4 className="text-navy font-bold text-xs mb-3">طلبات التقييم</h4>
                    {(() => {
                      const vs = analyticsData.valStatus;
                      const items = [
                        { key: 'pending',   label: 'معلق',         color: 'bg-amber-400' },
                        { key: 'in_review', label: 'قيد الدراسة',  color: 'bg-blue-400'  },
                        { key: 'completed', label: 'مكتمل',        color: 'bg-green-500' },
                        { key: 'rejected',  label: 'مرفوض',        color: 'bg-red-400'   },
                      ];
                      return (
                        <div className="grid grid-cols-2 gap-2">
                          {items.map(it => (
                            <div key={it.key} className="flex items-center gap-2 bg-cream/60 rounded-xl px-3 py-2">
                              <span className={`w-2 h-2 rounded-full shrink-0 ${it.color}`} />
                              <div>
                                <p className="text-[10px] text-charcoal/50">{it.label}</p>
                                <p className="text-sm font-black text-navy leading-none">{vs[it.key] || 0}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                  <div className="border-t border-navy/5 pt-3 space-y-2">
                    <h4 className="text-navy font-bold text-xs mb-2">مؤشرات المنصة</h4>
                    {[
                      { label: 'إجمالي المستخدمين',  val: analyticsData.totalUsers },
                      { label: 'إجمالي العقارات',    val: analyticsData.totalProps },
                      { label: 'إجمالي المشاهدات',   val: analyticsData.totalViews.toLocaleString() },
                      { label: 'طلبات التقييم',       val: analyticsData.totalVals  },
                    ].map(kpi => (
                      <div key={kpi.label} className="flex justify-between text-[11px]">
                        <span className="text-charcoal/55">{kpi.label}</span>
                        <span className="font-black text-navy">{kpi.val}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* Audit Log / Event Simulation */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-navy/10 gpu-transition">
              <h3 className="text-navy font-black text-sm mb-4">سجل نشاط النظام العام (System Audit Log)</h3>
              <div className="space-y-3 font-mono text-[11px] text-charcoal/70">
                <div className="flex items-start gap-2 border-b border-navy/5 pb-2">
                  <span className="text-green-600 font-bold shrink-0">[INFO]</span>
                  <span className="text-navy/40 shrink-0">10:42:15</span>
                  <span>تم بنجاح ربط ومعالجة لوحة تحكم المقاولين مع تطبيق تحسينات الحركات الرسومية (GPU Transition).</span>
                </div>
                <div className="flex items-start gap-2 border-b border-navy/5 pb-2">
                  <span className="text-blue-600 font-bold shrink-0">[AUTH]</span>
                  <span className="text-navy/40 shrink-0">09:12:44</span>
                  <span>قام المشرف بتسجيل الدخول إلى النظام من IP: 192.168.1.10.</span>
                </div>
                <div className="flex items-start gap-2 border-b border-navy/5 pb-2">
                  <span className="text-amber-600 font-bold shrink-0">[WARN]</span>
                  <span className="text-navy/40 shrink-0">08:04:10</span>
                  <span>محاولة اتصال فاشلة بـ Supabase Cloud. تم الانتقال التلقائي للعمل بنظام الموك والتخزين المحلي.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── 2. Users & Companies Tab ── */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            
            {/* User Directory */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-navy/10 gpu-transition space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h3 className="text-navy font-black text-sm">دليل الحسابات والأدوار</h3>
                  <p className="text-charcoal/50 text-[11px] mt-0.5">البحث في الحسابات، تجميد الحساب، وتعديل صلاحيات الأدوار</p>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40" size={13} />
                  <input
                    type="text"
                    placeholder="ابحث بالاسم أو البريد..."
                    value={userQuery}
                    onChange={e => setUserQuery(e.target.value)}
                    className="w-full pr-8 pl-3 py-2 text-xs border border-navy/12 rounded-xl bg-cream/30 focus:outline-none focus:border-brand"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-right">
                  <thead>
                    <tr className="border-b border-navy/10 bg-cream text-charcoal/60">
                      <th className="py-3 px-4 font-semibold">المستخدم</th>
                      <th className="py-3 px-4 font-semibold">البريد الإلكتروني</th>
                      <th className="py-3 px-4 font-semibold">الصلاحية / الدور</th>
                      <th className="py-3 px-4 font-semibold">تاريخ التسجيل</th>
                      <th className="py-3 px-4 font-semibold">الحالة</th>
                      <th className="py-3 px-4 font-semibold text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(u => (
                      <tr key={u.id} className="border-b border-navy/[0.06] hover:bg-cream/40 transition-colors">
                        <td className="py-3 px-4 font-bold text-navy">{u.name}</td>
                        <td className="py-3 px-4 font-mono">{u.email}</td>
                        <td className="py-3 px-4">
                          <select
                            value={u.role}
                            onChange={e => handleUpdateRole(u.id, e.target.value)}
                            className={`text-[10px] font-bold px-2 py-1 rounded-lg outline-none border border-navy/10 ${ROLES_INFO[u.role]?.color || ''}`}
                          >
                            {Object.entries(ROLES_INFO).map(([k, val]) => (
                              <option key={k} value={k}>{val.label}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3 px-4 text-charcoal/50">{u.date}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            u.status === 'نشط' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-600'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'نشط' ? 'bg-green-500' : 'bg-red-500'}`} />
                            {u.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => toggleUserStatus(u.id)}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1 mx-auto border transition-colors ${
                              u.status === 'نشط'
                                ? 'bg-red-50 hover:bg-red-100 text-red-600 border-red-200'
                                : 'bg-green-50 hover:bg-green-100 text-green-700 border-green-200'
                            }`}
                          >
                            {u.status === 'نشط' ? (
                              <><UserX size={11} /> تجميد</>
                            ) : (
                              <><UserCheck size={11} /> تفعيل</>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Developers & Finishing Verification Tiers */}
            <div className="grid md:grid-cols-2 gap-6">
              
              {/* 1. المطورون (Developers) */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-navy/10 gpu-transition space-y-4">
                <div>
                  <h3 className="text-navy font-black text-sm flex items-center gap-2">
                    <Building2 className="text-orange-500" size={16} />
                    بوابة المطورين العقاريين (Developers Verification)
                  </h3>
                  <p className="text-charcoal/50 text-[10px]">مراجعة التراخيص واعتماد شارات المطورين والمؤسسات العقارية</p>
                </div>

                <div className="space-y-3">
                  {developers.map(dev => (
                    <div key={dev.id} className="border border-navy/8 rounded-xl p-4 bg-cream/10 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-navy font-bold text-xs">{dev.name}</h4>
                          <p className="text-[10px] text-charcoal/40">تأسست: {dev.founded} · مدينة: {dev.city} · الموظفين: {dev.employees}</p>
                        </div>
                        <span className={`text-[9px] font-bold border rounded-full px-2 py-0.5 ${
                          dev.verified ? 'bg-green-50 border-green-200 text-green-600' : 'bg-slate-50 border-slate-200 text-slate-500'
                        }`}>
                          {dev.verified ? 'مطور معتمد ✓' : 'تحت التدقيق'}
                        </span>
                      </div>
                      <div className="text-[10px] text-charcoal/60 leading-relaxed border-t border-navy/5 pt-2">
                        {dev.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. الإكساء (Finishing Companies) */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-navy/10 gpu-transition space-y-4">
                <div>
                  <h3 className="text-navy font-black text-sm flex items-center gap-2">
                    <Wrench className="text-teal-600" size={16} />
                    شارة دليل شركات الإكساء (Finishing Companies)
                  </h3>
                  <p className="text-charcoal/50 text-[10px]">ترقية أو سحب شارة التوثيق لشركات الإكساء والديكور الداخلي</p>
                </div>

                <div className="space-y-3">
                  {finishingCompanies.slice(0, 2).map(co => (
                    <div key={co.id} className="border border-navy/8 rounded-xl p-4 bg-cream/10 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-navy font-bold text-xs">{co.name}</h4>
                          <p className="text-[10px] text-charcoal/40">تخصص: {co.specialty || 'إكساء شامل'} · التقييم: {co.rating} ★</p>
                        </div>
                        <span className={`text-[9px] font-bold border rounded-full px-2 py-0.5 ${
                          co.badge === 'موثق ومعتمد' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-blue-50 border-blue-200 text-brand'
                        }`}>
                          {co.badge}
                        </span>
                      </div>
                      <div className="flex gap-2 border-t border-navy/5 pt-2">
                        <button
                          onClick={() => handleApproveCompanyBadge(co.id, 'موثق ومعتمد')}
                          className="flex-1 bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 text-[10px] font-bold py-1.5 rounded-lg transition-colors"
                        >
                          شارة معتمد
                        </button>
                        <button
                          onClick={() => handleApproveCompanyBadge(co.id, 'موثق')}
                          className="flex-1 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-brand text-[10px] font-bold py-1.5 rounded-lg transition-colors"
                        >
                          شارة موثق
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ── 3. Assets Tab (العقارات والمعدات) ── */}
        {activeTab === 'assets' && (
          <div className="space-y-6">

            {/* ── قائمة انتظار الموافقة ── */}
            {isConfigured && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-amber-200">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <h3 className="text-navy font-black text-sm">قائمة انتظار الموافقة</h3>
                  {pendingProps !== null && (
                    <span className="text-[10px] bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full">
                      {pendingProps.length} عقار
                    </span>
                  )}
                  <button
                    onClick={() => {
                      setPendingProps(null);
                      supabase.from('properties').select('*')
                        .eq('status', 'pending_review')
                        .order('created_at', { ascending: false })
                        .then(({ data }) => setPendingProps(data || []));
                    }}
                    className="mr-auto text-[10px] text-charcoal/40 hover:text-brand transition-colors flex items-center gap-1"
                  >
                    ↻ تحديث
                  </button>
                </div>

                {pendingProps === null ? (
                  <div className="space-y-2">
                    {[1,2].map(i => (
                      <div key={i} className="border border-navy/8 rounded-xl p-3 flex items-center gap-3 animate-pulse">
                        <div className="flex-1 h-3 bg-navy/8 rounded" />
                        <div className="h-6 w-20 bg-navy/8 rounded-lg" />
                      </div>
                    ))}
                  </div>
                ) : pendingProps.length === 0 ? (
                  <p className="text-charcoal/40 text-xs text-center py-4">لا توجد عقارات بانتظار الموافقة</p>
                ) : (
                  <div className="space-y-2">
                    {pendingProps.map(p => (
                      <div key={p.id} className="border border-amber-100 bg-amber-50/40 rounded-xl p-3 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-navy font-bold text-xs">{p.title}</p>
                          <p className="text-[10px] text-charcoal/50 mt-0.5">
                            {p.province} · {p.listing_type === 'rent' ? 'للإيجار' : 'للبيع'}
                            {p.price_estimate ? ` · $${Number(p.price_estimate).toLocaleString()}` : ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button onClick={() => handleApproveProperty(p)}
                            className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors">
                            <Check size={11} /> موافقة
                          </button>
                          <button onClick={() => handleRejectProperty(p.id, p.title, p.owner_id)}
                            className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors">
                            <X size={11} /> رفض
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          <div className="grid md:grid-cols-2 gap-6">
            {/* العقارات (Properties) */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-navy/10 gpu-transition space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h3 className="text-navy font-black text-sm">العقارات المدرجة بالمنصة</h3>
                  <p className="text-charcoal/50 text-[11px] mt-0.5">مراقبة العقارات، البحث وحذف المخالف منها</p>
                </div>
                <div className="relative w-full sm:w-48">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40" size={13} />
                  <input
                    type="text"
                    placeholder="ابحث..."
                    value={propQuery}
                    onChange={e => setPropQuery(e.target.value)}
                    className="w-full pr-8 pl-3 py-1.5 text-xs border border-navy/12 rounded-xl bg-cream/30 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {isConfigured && adminProps === null ? (
                  [1,2,3].map(i => (
                    <div key={i} className="border border-navy/[0.08] rounded-xl p-3 flex items-center gap-3 animate-pulse">
                      <div className="w-10 h-8 rounded bg-navy/8" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-2.5 w-2/3 bg-navy/8 rounded" />
                        <div className="h-2 w-1/2 bg-navy/5 rounded" />
                      </div>
                    </div>
                  ))
                ) : filteredProps.map(p => (
                  <div key={p.id} className="border border-navy/[0.08] rounded-xl p-3 flex items-center justify-between gap-3 hover:bg-cream/10 transition-colors">
                    <div className="flex items-center gap-3">
                      {(p.images?.[0] || p.image) && (
                        <img src={p.images?.[0] || p.image} alt="" className="w-10 h-8 rounded object-cover" />
                      )}
                      <div>
                        <h4 className="text-navy font-bold text-xs">{p.title}</h4>
                        <p className="text-[9px] text-charcoal/45">{p.city} · {p.priceDisplay}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteListing(p.id)}
                      className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center border border-red-100"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* المعدات الثقيلة (Equipment) */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-navy/10 gpu-transition space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h3 className="text-navy font-black text-sm">تأجير المعدات الثقيلة وآلات البناء</h3>
                  <p className="text-charcoal/50 text-[11px] mt-0.5">مراقبة الآليات المسجلة لمشاريع إعادة الإعمار</p>
                </div>
                <div className="relative w-full sm:w-48">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40" size={13} />
                  <input
                    type="text"
                    placeholder="ابحث..."
                    value={machineryQuery}
                    onChange={e => setMachineryQuery(e.target.value)}
                    className="w-full pr-8 pl-3 py-1.5 text-xs border border-navy/12 rounded-xl bg-cream/30 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {isConfigured && adminEquipment === null ? (
                  [1,2,3].map(i => (
                    <div key={i} className="border border-navy/[0.08] rounded-xl p-3 flex items-center gap-3 animate-pulse">
                      <div className="flex-1 space-y-1.5">
                        <div className="h-2.5 w-1/2 bg-navy/8 rounded" />
                        <div className="h-2 w-3/4 bg-navy/5 rounded" />
                      </div>
                      <div className="w-14 h-5 bg-navy/8 rounded" />
                    </div>
                  ))
                ) : filteredMachinery.map(m => (
                  <div key={m.id} className="border border-navy/[0.08] rounded-xl p-3 flex items-center justify-between gap-3 hover:bg-cream/10 transition-colors">
                    <div>
                      <h4 className="text-navy font-bold text-xs">{m.name}</h4>
                      <p className="text-[9px] text-charcoal/45">المالك: {m.provider} · السعر: {m.rate} · مدينة: {m.location}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold border ${
                        m.status === 'نشط' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-600'
                      }`}>{m.status}</span>
                      <button
                        onClick={() => toggleMachineryStatus(m.id)}
                        className="w-7 h-7 rounded-lg bg-navy/5 hover:bg-navy/10 text-navy flex items-center justify-center border border-navy/10"
                        title="تغيير حالة النشاط"
                      >
                        {m.status === 'نشط' ? <X size={12} /> : <Check size={12} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
          </div>
        )}

        {/* ── 4. Investment & Crowdfund Tab (التمويل والاستثمار) ── */}
        {activeTab === 'investment' && (
          <div className="grid md:grid-cols-2 gap-6">
            
            {/* تمويل جماعي (Crowdfunding Rounds) */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-navy/10 gpu-transition space-y-6">
              <div>
                <h3 className="text-navy font-black text-sm flex items-center gap-2">
                  <TrendingUp className="text-emerald-500" size={16} />
                  جولات التمويل العقاري الجماعي (Crowdfund)
                </h3>
                <p className="text-charcoal/50 text-[10px] mt-0.5">مراقبة جولات التمويل الجارية وتعديل حالات المشاريع الاستثمارية</p>
              </div>

              <div className="space-y-4">
                {investmentProjects.map(proj => {
                  const pct = Math.min(Math.round((proj.raised / proj.target) * 100), 100);
                  return (
                    <div key={proj.id} className="border border-navy/8 rounded-xl p-4 bg-cream/10 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-navy font-bold text-xs">{proj.title}</h4>
                          <p className="text-[9px] text-charcoal/40">الهدف: ${proj.target?.toLocaleString()} · المتبقي: ${Math.max(0, proj.target - proj.raised).toLocaleString()}</p>
                        </div>
                        <span className={`text-[9px] font-bold border rounded-full px-2 py-0.5 ${
                          proj.status === 'active' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-600'
                        }`}>
                          {proj.status === 'active' ? 'تمويل مفتوح' : 'معلق مؤقتاً'}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-charcoal/60">
                          <span>نسبة جمع التمويل:</span>
                          <span className="font-bold">{pct}%</span>
                        </div>
                        <div className="w-full bg-navy/10 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>

                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => handlePauseCrowdfund(proj.id)}
                          className="flex-1 bg-navy/5 hover:bg-navy/10 border border-navy/10 text-navy text-[10px] font-bold py-1.5 rounded-lg transition-colors"
                        >
                          {proj.status === 'active' ? 'تعليق مؤقت' : 'استئناف'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* الحساب الضامن لمشاريع الإكساء (Finishing Escrow Ledger) */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-navy/10 gpu-transition space-y-6">
              <div>
                <h3 className="text-navy font-black text-sm flex items-center gap-2">
                  <DollarSign className="text-teal-600" size={16} />
                  حسابات الضمان لمشاريع الإكساء (Finishing Projects Escrow)
                </h3>
                <p className="text-charcoal/50 text-[10px] mt-0.5">الإفراج المالي للمقاولين بناءً على مراحل الإنجاز الهندسية</p>
              </div>

              <div className="space-y-3">
                {finishingProjects.map(p => (
                  <div key={p.id} className="border border-navy/8 rounded-xl p-4 bg-cream/10 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-navy font-bold text-xs">{p.name}</h4>
                        <p className="text-[9px] text-charcoal/45">القيمة الكلية: ${p.budget?.toLocaleString()} · مقاول: {p.contractor}</p>
                      </div>
                      <span className="bg-green-50 border border-green-200 text-green-700 text-[8px] font-bold px-2 py-0.5 rounded-full">محمية بالضمان</span>
                    </div>

                    <div className="flex justify-between items-center text-[10px] border-t border-navy/5 pt-2">
                      <span className="text-charcoal/50">المرحلة الحالية: {p.progress}%</span>
                      <button
                        onClick={() => handleReleaseProjectMilestone(p.id, Math.round(p.budget / 4))}
                        disabled={p.progress >= 100}
                        className="bg-green-600 hover:bg-green-700 text-white text-[9px] font-bold px-2.5 py-1 rounded-lg disabled:opacity-40"
                      >
                        تحرير دفعة مرحلية
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ── 5. Services & Careers Tab (الخدمات والوظائف) ── */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            
            {/* First Row: Valuations & Clearing (التقييم والتخليص) */}
            <div className="grid md:grid-cols-2 gap-6">
              
              {/* 1. التقييم العقاري (Valuation) */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-navy/10 gpu-transition space-y-4">
                <div>
                  <h3 className="text-navy font-black text-sm flex items-center gap-2">
                    <FileCheck className="text-cyan-500" size={16} />
                    طلبات التقييم العقاري المعتمدة (Appraisals)
                  </h3>
                  <p className="text-charcoal/50 text-[10px]">مراقبة واعتماد تقارير التثمين العقاري الرسمية</p>
                </div>

                <div className="space-y-3">
                  {valuationsList.map(v => (
                    <div key={v.id} className="border border-navy/8 rounded-xl p-3 bg-cream/10 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-navy font-bold text-xs">{v.property}</h4>
                          <p className="text-[9px] text-charcoal/40">العميل: {v.client} · خبير التقييم: {v.appraiser}</p>
                        </div>
                        <span className={`text-[8px] font-bold border rounded-full px-2 py-0.5 ${
                          v.status === 'معتمد رسمياً' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-amber-50 border-amber-200 text-amber-600'
                        }`}>{v.status}</span>
                      </div>
                      {v.status !== 'معتمد رسمياً' && (
                        <div className="flex justify-between items-center border-t border-navy/5 pt-2 text-[10px]">
                          <span className="text-charcoal/50">القيمة المقدرة: {v.value}</span>
                          <button
                            onClick={() => handleApproveValuation(v.id)}
                            className="bg-cyan-600 hover:bg-cyan-700 text-white text-[9px] font-bold px-2 py-1 rounded-lg"
                          >
                            مصادقة واعتماد القيمة
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. التخليص القانوني (Clearing) */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-navy/10 gpu-transition space-y-4">
                <div>
                  <h3 className="text-navy font-black text-sm flex items-center gap-2">
                    <Scale className="text-teal-600" size={16} />
                    المعاملات والتراخيص القانونية (Clearing)
                  </h3>
                  <p className="text-charcoal/50 text-[10px]">توثيق صكوك الملكية بالبلوكتشين والموافقة عليها</p>
                </div>

                <div className="space-y-3">
                  {clearingList.map(c => (
                    <div key={c.id} className="border border-navy/8 rounded-xl p-3 bg-cream/10 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-navy font-bold text-xs">{c.transaction}</h4>
                          <p className="text-[9px] text-charcoal/40">العميل: {c.client} · الكاتب المتابع: {c.clerk} · الرسوم: {c.fees}</p>
                        </div>
                        <span className={`text-[8px] font-bold border rounded-full px-2 py-0.5 ${
                          c.status === 'مكتمل وموثق' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-amber-50 border-amber-200 text-amber-600'
                        }`}>{c.status}</span>
                      </div>
                      {c.status !== 'مكتمل وموثق' && (
                        <div className="flex justify-end pt-1 border-t border-navy/5">
                          <button
                            onClick={() => handleApproveClearing(c.id)}
                            className="bg-teal-600 hover:bg-teal-700 text-white text-[9px] font-bold px-2 py-1 rounded-lg"
                          >
                            الموافقة على النقل بالبلوكتشين
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Second Row: Studies & Jobs (الدراسات والتوظيف) */}
            <div className="grid md:grid-cols-2 gap-6">
              
              {/* 1. دراسات فنية وهندسية (Studies) */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-navy/10 gpu-transition space-y-4">
                <div>
                  <h3 className="text-navy font-black text-sm flex items-center gap-2">
                    <GraduationCap className="text-violet-500" size={16} />
                    الدراسات الهندسية والاستشارية (Studies)
                  </h3>
                  <p className="text-charcoal/50 text-[10px]">متابعة لجان فحص سلامة الأبنية في المناطق المحتاجة لإعادة الإعمار</p>
                </div>

                <div className="space-y-3">
                  {studiesList.map(s => (
                    <div key={s.id} className="border border-navy/8 rounded-xl p-3 bg-cream/10 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-navy font-bold text-xs">{s.title}</h4>
                          <p className="text-[9px] text-charcoal/40">نوع الدراسة: {s.type} · المهندس: {s.engineer}</p>
                        </div>
                        <span className={`text-[8px] font-bold border rounded-full px-2 py-0.5 ${
                          s.status === 'مكتمل ومصدق' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-amber-50 border-amber-200 text-amber-600'
                        }`}>{s.status}</span>
                      </div>
                      {s.status !== 'مكتمل ومصدق' && (
                        <div className="flex justify-end pt-1 border-t border-navy/5">
                          <button
                            onClick={() => handleApproveStudy(s.id)}
                            className="bg-violet-600 hover:bg-violet-700 text-white text-[9px] font-bold px-2 py-1 rounded-lg"
                          >
                            تصديق الدراسة هندسياً
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. التوظيف وفرص المقاولات (Jobs / RFQs) */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-navy/10 gpu-transition space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-navy font-black text-sm flex items-center gap-2">
                      <Briefcase className="text-brand" size={16} />
                      بوابة التوظيف وفرص العمل (Jobs & Careers)
                    </h3>
                    <p className="text-charcoal/50 text-[10px]">إدارة طلبات التوظيف والفرص المهنية للمهندسين والمشرفين</p>
                  </div>
                  <div className="relative w-36">
                    <Search className="absolute right-2 top-1/2 -translate-y-1/2 text-charcoal/40" size={10} />
                    <input
                      type="text"
                      placeholder="بحث..."
                      value={jobQuery}
                      onChange={e => setJobQuery(e.target.value)}
                      className="w-full pr-6 pl-2 py-1 text-[10px] border border-navy/12 rounded bg-cream/30 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {filteredJobs.map(j => (
                    <div key={j.id} className="border border-navy/8 rounded-xl p-3 bg-cream/10 flex items-center justify-between gap-3 text-xs">
                      <div>
                        <h4 className="text-navy font-bold text-[11px]">{j.title}</h4>
                        <p className="text-[9px] text-charcoal/40">{j.company} · {j.location} · {j.salary || 'راتب بناء على الاتفاق'}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteJob(j.id)}
                        className="w-6 h-6 rounded bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center border border-red-100 shrink-0"
                        title="أرشفة الوظيفة"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ── 5. Ads & Sponsorships Tab ── */}
        {activeTab === 'ads' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-navy/10 gpu-transition">
              <div className="flex justify-between items-center flex-wrap gap-3 mb-6">
                <div>
                  <h3 className="text-navy font-black text-sm flex items-center gap-2">
                    <Megaphone className="text-brand" size={16} />
                    إدارة الإعلانات والرعايات الأصلية الموجهة (Native Sponsorships)
                  </h3>
                  <p className="text-charcoal/50 text-[10px]">عرض ورعايات مخصصة تظهر ديناميكياً للمستخدمين في صفحات الحسابات والتقدير</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sponsorships.map(sp => {
                  const isEditing = editingSponsorId === sp.id;
                  return (
                    <div key={sp.id} className="border border-navy/8 rounded-2xl p-5 bg-cream/10 flex flex-col justify-between gap-4 relative overflow-hidden">
                      {/* Premium border decor */}
                      <div className="absolute top-0 right-0 w-20 h-1 pointer-events-none bg-brand" />
                      
                      {isEditing ? (
                        <div className="space-y-3 text-xs">
                          <div>
                            <label className="text-[10px] text-charcoal/50 font-bold block mb-1">اسم المموّل / الشركة الممثلة</label>
                            <input
                              type="text"
                              value={editForm.sponsor}
                              onChange={e => setEditForm({ ...editForm, sponsor: e.target.value })}
                              className="w-full bg-white border border-navy/12 rounded-lg px-2.5 py-1.5 font-bold outline-none focus:border-brand"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-charcoal/50 font-bold block mb-1">العنوان الترويجي الرئيس</label>
                            <input
                              type="text"
                              value={editForm.title}
                              onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                              className="w-full bg-white border border-navy/12 rounded-lg px-2.5 py-1.5 font-bold outline-none focus:border-brand"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-charcoal/50 font-bold block mb-1">الوصف والتفاصيل</label>
                            <textarea
                              rows={3}
                              value={editForm.desc}
                              onChange={e => setEditForm({ ...editForm, desc: e.target.value })}
                              className="w-full bg-white border border-navy/12 rounded-lg px-2.5 py-1.5 outline-none focus:border-brand resize-none"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] text-charcoal/50 font-bold block mb-1">فئة العرض</label>
                              <select
                                value={editForm.type}
                                onChange={e => setEditForm({ ...editForm, type: e.target.value })}
                                className="w-full bg-white border border-navy/12 rounded-lg px-2 py-1.5 outline-none focus:border-brand"
                              >
                                <option value="solar">طاقة شمسية (Solar)</option>
                                <option value="interior">إكساء داخلي (Interior)</option>
                                <option value="valuation">تقييم عقاري (Valuation)</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-[10px] text-charcoal/50 font-bold block mb-1">نص الزر (CTA)</label>
                              <input
                                type="text"
                                value={editForm.cta}
                                onChange={e => setEditForm({ ...editForm, cta: e.target.value })}
                                className="w-full bg-white border border-navy/12 rounded-lg px-2.5 py-1.5 outline-none focus:border-brand"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-[10px] text-charcoal/50 font-bold block mb-1">رابط التحويل (Link / WhatsApp)</label>
                            <input
                              type="text"
                              value={editForm.link}
                              onChange={e => setEditForm({ ...editForm, link: e.target.value })}
                              className="w-full bg-white border border-navy/12 rounded-lg px-2.5 py-1.5 font-mono outline-none focus:border-brand"
                            />
                          </div>
                          <div className="flex gap-2 pt-2">
                            <button
                              onClick={() => handleSaveSponsor(sp.id)}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white text-[10px] font-bold py-2 rounded-lg"
                            >
                              حفظ التغييرات
                            </button>
                            <button
                              onClick={() => setEditingSponsorId(null)}
                              className="px-3 bg-slate-100 hover:bg-slate-200 text-charcoal/70 text-[10px] font-bold py-2 rounded-lg"
                            >
                              إلغاء
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col justify-between h-full gap-4 text-xs">
                          <div className="space-y-2">
                            <div className="flex justify-between items-start gap-2">
                              <span className="bg-brand/10 text-brand border border-brand/20 px-2 py-0.5 rounded-full text-[9px] font-bold">
                                {sp.type === 'solar' ? 'طاقة شمسية' : sp.type === 'interior' ? 'إكساء وتشطيب' : 'تقييم عقاري'}
                              </span>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                                sp.active ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-600'
                              }`}>
                                <span className={`w-1 h-1 rounded-full ${sp.active ? 'bg-green-500' : 'bg-red-500'}`} />
                                {sp.active ? 'نشط' : 'معطل'}
                              </span>
                            </div>

                            <p className="text-charcoal/40 text-[9px] font-bold mb-0.5">برعاية: {sp.sponsor}</p>
                            <h4 className="text-navy font-bold text-[13px] leading-snug">{sp.title}</h4>
                            <p className="text-charcoal/60 text-[10px] leading-relaxed line-clamp-3">{sp.desc}</p>
                          </div>

                          <div className="border-t border-navy/5 pt-3 space-y-2.5">
                            {/* Analytics info */}
                            <div className="flex justify-between items-center bg-white/60 p-2 rounded-lg border border-navy/5">
                              <span className="text-[10px] text-charcoal/50">إجمالي النقرات:</span>
                              <span className="text-navy font-black text-[11px] flex items-center gap-1">
                                <TrendingUp size={11} className="text-green-500" />
                                {sp.clicks} نقرة
                              </span>
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={() => handleStartEditSponsor(sp)}
                                className="flex-1 bg-navy text-white hover:bg-brand text-[10px] font-bold py-2 rounded-lg transition-colors"
                              >
                                تعديل المحتوى
                              </button>
                              <button
                                onClick={() => toggleSponsorship(sp.id)}
                                className={`px-2.5 py-2 rounded-lg text-[10px] font-bold border transition-colors ${
                                  sp.active 
                                    ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100' 
                                    : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                                }`}
                              >
                                {sp.active ? 'تعطيل' : 'تفعيل'}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── 6. Settings Tab ── */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
          <div className="max-w-xl mx-auto bg-white rounded-2xl p-6 shadow-sm border border-navy/10 gpu-transition space-y-6">
            <div>
              <h3 className="text-navy font-black text-sm flex items-center gap-1.5">
                <Settings size={16} className="text-brand" /> إعدادات المنصة الأساسية
              </h3>
              <p className="text-charcoal/50 text-[11px] mt-0.5">تعديل قيم المعاملات والسياسات المالية ومزامنة الأسعار</p>
            </div>

            <div className="space-y-4">
              
              {/* Default exchange rate */}
              <div className="border-b border-navy/5 pb-4 space-y-2">
                <label className="text-xs font-bold text-navy block">سعر الصرف الافتراضي لليرة السورية (USD/SYP) *</label>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-navy/40 shrink-0">1$ =</span>
                  <input
                    type="number"
                    value={exchangeInput}
                    onChange={e => setExchangeInput(e.target.value)}
                    className="w-full bg-cream/30 border border-navy/12 rounded-xl px-3 py-2 text-sm font-bold text-navy outline-none focus:border-brand"
                  />
                  <span className="text-xs font-bold text-charcoal/50 shrink-0">ل.س</span>
                </div>
                <p className="text-[10px] text-charcoal/40">يتحكم هذا السعر تلقائياً بجميع الحاسبات التقديرية ودليل أسعار الإكساء وعروض أسعار العقارات المعروضة بالليرة السورية.</p>
                <button
                  onClick={handleSaveRate}
                  className="bg-brand hover:bg-navy text-white text-xs font-bold py-2 px-4 rounded-xl transition-colors shadow-sm"
                >
                  تحديث سعر الصرف العام
                </button>
              </div>

              {/* Fee rates */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-charcoal/50 text-[10px] font-bold block mb-1">عمولة حساب الضمان (Escrow Fee %)</label>
                    <input type="text" defaultValue="2.5%" disabled className="w-full bg-navy/5 border border-navy/8 px-3 py-2 rounded-xl outline-none font-bold" />
                  </div>
                  <div>
                    <label className="text-charcoal/50 text-[10px] font-bold block mb-1">ضريبة المبيعات المقدرة (VAT Rate %)</label>
                    <input type="text" defaultValue="11.0%" disabled className="w-full bg-navy/5 border border-navy/8 px-3 py-2 rounded-xl outline-none font-bold" />
                  </div>
                </div>
                <p className="text-[10px] text-charcoal/40">نسب العمولات والضرائب مقفلة حالياً في مرحلة العرض للتحكم فيها فقط في الجلسات اللاحقة.</p>
              </div>

            </div>
          </div>

          {/* City Price Baselines */}
          <div className="max-w-2xl mx-auto bg-white rounded-2xl p-6 shadow-sm border border-navy/10 space-y-4">
            <div>
              <h3 className="text-navy font-black text-sm flex items-center gap-1.5">
                <DollarSign size={16} className="text-brand" /> أسعار القاعدة للمدن ($/م²)
              </h3>
              <p className="text-charcoal/50 text-[11px] mt-0.5">يستخدمها خبراء التقييم كمرجع أساسي لحساب قيمة العقارات</p>
            </div>

            {cityPrices.length === 0 ? (
              <p className="text-charcoal/40 text-xs py-4 text-center">لا توجد بيانات — تأكد من تشغيل phase1_migration.sql في Supabase</p>
            ) : (
              <div className="divide-y divide-navy/5">
                {cityPrices.map(c => (
                  <div key={c.id} className="flex items-center justify-between py-2.5 gap-3">
                    <span className="text-navy font-bold text-sm w-28 shrink-0">{c.city}</span>
                    {editingCity === c.id ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="number"
                          value={cityPriceInput}
                          onChange={e => setCityPriceInput(e.target.value)}
                          className="w-28 bg-cream border border-brand/30 rounded-lg px-2.5 py-1.5 text-sm font-bold text-navy outline-none focus:border-brand"
                          autoFocus
                          onKeyDown={e => { if (e.key === 'Enter') handleSaveCityPrice(c.id); if (e.key === 'Escape') setEditingCity(null); }}
                        />
                        <span className="text-xs text-charcoal/40">$/م²</span>
                        <button onClick={() => handleSaveCityPrice(c.id)} className="text-xs font-bold text-green-600 hover:text-green-700 px-2 py-1 rounded-lg bg-green-50 border border-green-200">حفظ</button>
                        <button onClick={() => setEditingCity(null)} className="text-xs text-charcoal/40 hover:text-charcoal px-2 py-1">إلغاء</button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 flex-1 justify-between">
                        <span className="text-brand font-black text-base">${Number(c.base_price_usd).toLocaleString()}<span className="text-charcoal/40 text-[10px] font-normal mr-0.5">/م²</span></span>
                        <button
                          onClick={() => { setEditingCity(c.id); setCityPriceInput(String(c.base_price_usd)); }}
                          className="text-[11px] text-charcoal/40 hover:text-brand border border-navy/10 hover:border-brand/30 px-2.5 py-1 rounded-lg transition-all"
                        >تعديل</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          </div>
        )}

      </div>
    </div>
  );
}
