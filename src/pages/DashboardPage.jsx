import { useState, useEffect } from 'react';
import { supabase, isConfigured } from '../lib/supabase';
import ChatBox from '../components/messaging/ChatBox';
import { Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Building2, Heart, Scale, Briefcase,
  TrendingUp, Bell, Settings, ChevronRight, MapPin,
  BadgeCheck, Clock, Star, LogOut, MessageCircle,
  User, Phone, Mail, Edit3, CheckCircle, Package,
  FolderKanban, FileText, X, Pencil, Folder, FolderPlus,
  FolderOpen, Trash2, Inbox, Globe, Shield, Wrench,
} from 'lucide-react';
import { useAuth, ROLES } from '../context/AuthContext';
import { useGlobalData } from '../context/GlobalContext';
import {
  getSavedIds, getSavedNotes, getSavedFolders, getSavedFolderMap,
  setSavedNote, addSavedFolder, deleteSavedFolder, assignFolder,
} from '../utils/savedProps';
import { getRecentlyViewed } from '../utils/recentlyViewed';
import { formatDate } from '../utils/formatDate';
import { useRealtimeInquiries } from '../hooks/useRealtimeInquiries';
import toast from 'react-hot-toast';
import ContractModal from '../components/contracts/ContractModal';
import HandoverProtocolModal from '../components/contracts/HandoverProtocolModal';
import StudyWorkspaceModal from '../components/studies/StudyWorkspaceModal';
import InvestorPortfolio from '../components/invest/InvestorPortfolio';
import { addNotification } from '../components/NotificationsPanel';
import DocumentManager from '../components/properties/DocumentManager';
import AlertManager from '../components/properties/AlertManager';

const INQ_KEY       = 'resurgo-inquiries';
const OWNER_INQ_KEY = 'resurgo-received-inquiries';
const APPS_KEY      = 'resurgo-job-apps';
const LIST_KEY      = 'resurgo-my-listings';

const lsLoad = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; }
  catch { return fallback; }
};


const TABS = [
  { id: 'overview',  label: 'نظرة عامة',          icon: LayoutDashboard },
  { id: 'portfolio', label: 'المحفظة الاستثمارية', icon: TrendingUp },
  { id: 'saved',     label: 'المحفوظات',           icon: Heart },
  { id: 'messages',  label: 'رسائلي',              icon: MessageCircle },
  { id: 'inbox',     label: 'الواردة',             icon: Inbox },
  { id: 'myprops',   label: 'عقاراتي',             icon: Building2 },
  { id: 'clearing',  label: 'معاملاتي',            icon: Scale },
  { id: 'valuations',label: 'طلبات التقييم',       icon: BadgeCheck },
  { id: 'jobs',      label: 'طلباتي',              icon: Briefcase },
  { id: 'profile',   label: 'الملف الشخصي',        icon: User },
];


function MessagesTab({ user, inquiries }) {
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);

  useEffect(() => {
    if (!isConfigured || !user) return;
    supabase
      .from('conversations')
      .select('id, property_id, properties(title), buyer_id, owner_id')
      .or(`buyer_id.eq.${user.id},owner_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
      .then(({ data }) => setConversations(data || []));
  }, [user]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {conversations.length > 0 && (
        <div>
          <p className="text-navy font-bold text-sm mb-3">المحادثات المباشرة</p>
          <div className="grid gap-3">
            {conversations.map(conv => {
              const isMe = conv.buyer_id === user.id;
              const otherLabel = isMe ? 'المالك' : 'المشتري';
              const propTitle = conv.properties?.title || 'عقار';
              return (
                <div key={conv.id}
                  onClick={() => setActiveConv(activeConv?.id === conv.id ? null : conv)}
                  className="bg-white border border-navy/10 rounded-xl p-4 cursor-pointer hover:border-brand/40 transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-navy font-bold text-sm">{propTitle}</p>
                      <p className="text-charcoal/50 text-xs mt-0.5">{otherLabel}</p>
                    </div>
                    <MessageCircle size={18} className="text-brand" />
                  </div>
                  {activeConv?.id === conv.id && (
                    <div className="mt-3 h-72 bg-[#1f2a38] rounded-xl overflow-hidden">
                      <ChatBox
                        conversationId={conv.id}
                        currentUserId={user.id}
                        otherName={otherLabel}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <p className="text-charcoal/60 text-xs mb-2">
          <span className="text-navy font-bold">{inquiries.length}</span> استفسار مُرسَل
        </p>
        {inquiries.length === 0 ? (
          <div className="bg-white p-10 text-center shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
            <MessageCircle size={36} className="mx-auto text-navy/20 mb-3" />
            <p className="text-charcoal/50 text-sm">لم ترسل أي استفسار بعد</p>
            <Link to="/properties" className="text-brand text-xs hover:underline mt-2 inline-block">
              تصفّح العقارات وتواصل مع الملاك
            </Link>
          </div>
        ) : (
          inquiries.map((inq, i) => (
            <motion.div key={inq.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
              className="bg-white p-4 flex gap-4 shadow-[0_2px_8px_rgba(31,42,56,0.06)] hover:shadow-[0_8px_24px_rgba(31,42,56,0.10)] transition-all"
              style={{ borderRadius: '8px' }}>
              {inq.propertyImg && (
                <img src={inq.propertyImg} alt="" className="w-16 h-14 rounded-xl object-cover shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-navy font-bold text-sm truncate">{inq.propertyTitle}</p>
                <p className="text-charcoal/55 text-xs mt-0.5 truncate">إلى: {inq.ownerName}</p>
                <p className="text-charcoal/60 text-xs mt-1.5 line-clamp-2 leading-relaxed">{inq.message}</p>
              </div>
              <div className="shrink-0 text-right">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand/10 text-brand border border-brand/20">
                  {inq.status}
                </span>
                <p className="text-charcoal/35 text-[10px] mt-1.5">{inq.date}</p>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}

function StatCard({ icon: Icon, value, label, color }) {
  return (
    <div className="bg-white p-5 flex items-center gap-4 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
      <div className={`w-11 h-11 rounded-2xl ${color} flex items-center justify-center shrink-0`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="text-navy font-black text-2xl leading-none">{value}</p>
        <p className="text-charcoal/60 text-xs mt-0.5">{label}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [tab, setTab]   = useState('overview');
  const [showNotifications, setShowNotifications] = useState(false);
  const [newCount, setNewCount] = useState(0);

  // ── Realtime: new inquiries for property owners ──────────────
  useRealtimeInquiries(user?.id, (inq) => {
    setReceivedInqs(prev => [inq, ...prev]);
    setNewCount(n => n + 1);
    toast.success(`استفسار جديد على: ${inq.propertyTitle}`, { duration: 5000 });
  });

  // Profile edit state (dashboard inline)
  const [editMode,   setEditMode]   = useState(false);
  const [draftName,  setDraftName]  = useState('');
  const [draftPhone, setDraftPhone] = useState('');
  const [profSaving, setProfSaving] = useState(false);

  // Contract Modal state
  const [isContractOpen, setIsContractOpen] = useState(false);
  const [isHandoverOpen, setIsHandoverOpen] = useState(false);
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);

  // Data
  const [inquiries,    setInquiries]   = useState(() => isConfigured ? [] : lsLoad(INQ_KEY, []));
  const [receivedInqs, setReceivedInqs] = useState(() => isConfigured ? [] : lsLoad(OWNER_INQ_KEY, []));
  const [jobApps, setJobApps] = useState(() => lsLoad(APPS_KEY, []));
  const [myListings, setMyListings]             = useState(() => isConfigured ? [] : lsLoad(LIST_KEY, []));
  const [viewCounts, setViewCounts] = useState({});
  const [expandedDocs, setExpandedDocs] = useState(null); // propertyId with docs panel open
  const [myValuations, setMyValuations] = useState([]);

  // Saved properties — folders & notes
  const [savedFolder,    setSavedFolder]    = useState('all');
  const [savedFolders,   setSavedFolders]   = useState(() => getSavedFolders());
  const [savedNotes,     setSavedNotes]     = useState(() => getSavedNotes());
  const [savedFolderMap, setSavedFolderMap] = useState(() => getSavedFolderMap());
  const [newFolderInput, setNewFolderInput] = useState('');
  const [showNewFolder,  setShowNewFolder]  = useState(false);
  const [editingNote,    setEditingNote]    = useState(null); // propId being edited
  const [noteDraft,      setNoteDraft]      = useState('');

  // Fetch owner's properties from Supabase
  const fetchMyListings = () => {
    if (!isConfigured || !user) return;
    supabase
      .from('properties')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (!data?.length) { setMyListings([]); return; }
        const normalized = data.map(p => ({
          id:            p.id,
          title:         p.title,
          city:          p.city || p.province,
          district:      p.province,
          status:        p.listing_type === 'rent' ? 'للإيجار' : 'للبيع',
          listingStatus: p.status,
          priceDisplay:  p.listing_type === 'rent'
            ? (p.rent_price    ? `$${Number(p.rent_price).toLocaleString()}/شهر` : '—')
            : (p.price_estimate ? `$${Number(p.price_estimate).toLocaleString()}` : '—'),
          images:        p.images || [],
          area:          p.area,
          bedrooms:      p.bedrooms,
          bathrooms:     p.bathrooms,
          fromSupabase:  true,
        }));
        setMyListings(normalized);

        // Fetch view counts for all owned properties in one query
        const ids = normalized.map(p => String(p.id));
        supabase
          .from('property_views')
          .select('property_id')
          .in('property_id', ids)
          .then(({ data: views }) => {
            if (!views) return;
            const counts = {};
            views.forEach(v => {
              counts[v.property_id] = (counts[v.property_id] || 0) + 1;
            });
            setViewCounts(counts);
          });
      });
  };
  useEffect(() => { fetchMyListings(); }, [user]); // eslint-disable-line react-hooks/exhaustive-deps
  // Re-fetch when returning from AddPropertyPage
  useEffect(() => { if (location.state?.propertyAdded) fetchMyListings(); }, [location.state]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch sent inquiries from Supabase
  useEffect(() => {
    if (!isConfigured || !user) return;
    supabase
      .from('inquiries')
      .select('*')
      .eq('sender_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (!data) return;
        setInquiries(data.map(q => ({
          id:            q.id,
          propertyId:    q.property_id,
          propertyTitle: q.property_title,
          propertyImg:   q.property_img,
          ownerName:     q.owner_name,
          message:       q.message,
          date:          formatDate(q.created_at),
          status:        q.status,
        })));
      });
  }, [user]);

  // Fetch job applications from Supabase
  useEffect(() => {
    if (!isConfigured || !user) return;
    supabase
      .from('job_applications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (!data?.length) return;
        setJobApps(data.map(a => ({
          id:      a.job_id  || a.id,
          title:   a.title,
          company: a.company,
          status:  a.status,
          date:    a.created_at?.slice(0, 10),
        })));
      });
  }, [user]);

  // Fetch received inquiries from Supabase (for property owners)
  useEffect(() => {
    if (!isConfigured || !user) return;
    supabase
      .from('inquiries')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (!data) return;
        setReceivedInqs(data.map(q => ({
          id:            q.id,
          senderId:      q.sender_id || null,
          senderName:    q.sender_name || 'زائر',
          senderPhone:   q.sender_phone || '',
          propertyTitle: q.property_title,
          propertyId:    q.property_id,
          message:       q.message,
          date:          formatDate(q.created_at),
          status:        q.status,
        })));
      });
  }, [user]);

  // Fetch client's valuation requests from Supabase
  useEffect(() => {
    if (!isConfigured || !user) return;
    supabase
      .from('valuation_requests')
      .select('*, valuation_reports(id, final_value, final_low, final_high, currency, issued_at)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (!data) return;
        setMyValuations(data.map(r => ({
          id:           r.id,
          clientName:   r.client_name,
          propertyType: r.property_type,
          tier:         r.tier,
          city:         r.city || r.province,
          area:         r.area,
          status:       r.status,
          submittedAt:  r.submitted_at || r.created_at?.slice(0, 10),
          report:       r.valuation_reports?.[0] || null,
        })));
      });
  }, [user]);

  const { properties, investments, clearingList }  = useGlobalData();

  async function updateInquiryStatus(inq, newStatus) {
    setReceivedInqs(prev =>
      prev.map(q => q.id === inq.id ? { ...q, status: newStatus } : q)
    );
    if (isConfigured) {
      supabase.from('inquiries').update({ status: newStatus }).eq('id', inq.id).catch(() => {});
    }
    if (inq.senderId) {
      const msgMap = { 'تم التواصل': 'تم التواصل معك بشأن استفسارك', 'مغلق': 'تم إغلاق استفسارك' };
      addNotification({
        user_id: inq.senderId,
        type:    'property',
        title:   msgMap[newStatus] || 'تحديث على استفسارك',
        body:    `عقار: ${inq.propertyTitle}`,
        link:    '/dashboard',
      });
    }
  }

  if (!user) return <Navigate to="/auth" replace />;

  const role           = ROLES[user.role];
  const savedIds       = getSavedIds();
  const savedProps     = properties.filter(p => savedIds.includes(String(p.id)));
  const recentlyViewed = getRecentlyViewed();

  const displayName   = user.full_name || '—';
  const displayPhone  = user.phone     || '—';
  const userClearings = clearingList.filter(c =>
    c.userId === user.id || c.clientId === user.id || c.user_id === user.id
  );

  // Merge GlobalContext mock properties only when Supabase is not configured
  const ownedMockProps = isConfigured ? [] : properties
    .filter(p => p.ownerName && user.full_name && p.ownerName === user.full_name)
    .map(p => ({ ...p, isMock: true }));
  const localIds = new Set(myListings.map(l => String(l.id)));
  const combinedListings = [
    ...myListings,
    ...ownedMockProps.filter(p => !localIds.has(String(p.id))),
  ];

  const handleDeleteListing = (id) => {
    toast((t) => (
      <div dir="rtl" className="flex flex-col gap-3 min-w-[220px]">
        <p className="text-sm font-bold">هل تريد حذف هذا العقار؟</p>
        <p className="text-xs text-white/60">لا يمكن التراجع عن هذا الإجراء</p>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              if (isConfigured) {
                await supabase.from('properties').delete().eq('id', id).eq('owner_id', user.id);
              }
              const updated = myListings.filter(l => String(l.id) !== String(id));
              setMyListings(updated);
              localStorage.setItem(LIST_KEY, JSON.stringify(updated));
              toast.dismiss(t.id);
              toast('تم حذف العقار');
            }}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-1.5 rounded-lg transition-colors">
            نعم، احذف
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="flex-1 bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-1.5 rounded-lg transition-colors">
            إلغاء
          </button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  const handleStatusUpdate = async (id, newStatus) => {
    if (isConfigured) {
      await supabase.from('properties').update({ status: newStatus }).eq('id', id).eq('owner_id', user.id);
    }
    setMyListings(prev => prev.map(p => String(p.id) === String(id) ? { ...p, listingStatus: newStatus } : p));
    const labels = { listed: 'تم نشر العقار', archived: 'تم تعليق العقار', sold: 'تم تمييز العقار كمباع' };
    toast.success(labels[newStatus] || 'تم تحديث الحالة');
  };

  const startEdit = () => {
    setDraftName(user.full_name || '');
    setDraftPhone(user.phone || '');
    setEditMode(true);
  };
  const saveEdit = async () => {
    setProfSaving(true);
    try {
      await updateProfile({ full_name: draftName.trim(), phone: draftPhone.trim() });
      setEditMode(false);
    } finally {
      setProfSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream pt-16" dir="rtl">

      {/* Profile header */}
      <div className="border-b border-navy/10 bg-white px-4 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center text-2xl font-black text-brand shrink-0">
              {user.full_name?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-navy font-black text-lg">{displayName}</p>
                <BadgeCheck size={16} className="text-brand" />
              </div>
              <div className="flex items-center gap-2 text-xs text-charcoal/60">
                <span>{role?.icon} {role?.label}</span>
                <span className="text-navy/20">·</span>
                <span>{user.email}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setTab('profile')}
              className="w-9 h-9 bg-white shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg flex items-center justify-center text-charcoal/50 hover:text-navy transition-colors"
              title="إعدادات الحساب">
              <Settings size={16} />
            </button>
            <div className="relative">
              <button
                onClick={() => { setShowNotifications(v => !v); setNewCount(0); }}
                className={`w-9 h-9 bg-white shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg flex items-center justify-center transition-colors relative ${showNotifications ? 'text-brand' : 'text-charcoal/50 hover:text-navy'}`}
                title="الإشعارات">
                <Bell size={16} />
                {newCount > 0 ? (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-cta text-white text-[9px] font-black rounded-full flex items-center justify-center px-1 animate-pulse">
                    {newCount > 9 ? '9+' : newCount}
                  </span>
                ) : (inquiries.length > 0 || jobApps.length > 0) ? (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-cta rounded-full" />
                ) : null}
              </button>
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 top-full mt-2 w-80 bg-white py-2 z-50 shadow-xl rounded-lg"
                    dir="rtl">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-navy/[0.07]">
                      <p className="text-navy font-bold text-sm">الإشعارات</p>
                      <button onClick={() => setShowNotifications(false)} className="text-charcoal/40 hover:text-navy">
                        <X size={14} />
                      </button>
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {inquiries.length === 0 && jobApps.length === 0 ? (
                        <p className="text-charcoal/50 text-xs text-center py-6">لا توجد إشعارات جديدة</p>
                      ) : (
                        <>
                          {inquiries.slice(0, 3).map((inq) => (
                            <button key={inq.id} onClick={() => { setTab('messages'); setShowNotifications(false); }}
                              className="w-full flex items-start gap-3 px-4 py-3 hover:bg-cream transition-colors text-right">
                              <MessageCircle size={14} className="text-brand shrink-0 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <p className="text-navy text-xs font-semibold truncate">استفسار: {inq.propertyTitle}</p>
                                <p className="text-charcoal/50 text-[11px] mt-0.5">{inq.date}</p>
                              </div>
                            </button>
                          ))}
                          {jobApps.slice(0, 2).map((app) => (
                            <button key={app.id} onClick={() => { setTab('jobs'); setShowNotifications(false); }}
                              className="w-full flex items-start gap-3 px-4 py-3 hover:bg-cream transition-colors text-right">
                              <Briefcase size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <p className="text-navy text-xs font-semibold truncate">{app.title}</p>
                                <p className="text-charcoal/50 text-[11px] mt-0.5">{app.status}</p>
                              </div>
                            </button>
                          ))}
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button onClick={logout}
              className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 border border-red-200 hover:border-red-300 px-3 py-2 rounded-xl transition-all">
              <LogOut size={14} /> خروج
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-7 overflow-x-auto scrollbar-none pb-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all shrink-0 ${tab === id ? 'bg-brand border-brand text-white' : 'border-navy/15 text-charcoal/60 hover:border-brand/40 hover:text-navy bg-white'}`}>
              <Icon size={15} />{label}
            </button>
          ))}
        </div>

        {/* ── Overview / Project Hub ── */}
        {tab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            
            {/* Project Hub Section */}
            <div className="bg-white p-6 border-t-4 border-t-brand shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-black text-navy flex items-center gap-2">
                    <FolderKanban className="text-brand" /> مركز إدارة المشاريع
                  </h2>
                  <p className="text-xs text-charcoal/60 mt-1">
                    أدر دورة حياة مشروعك بالكامل من التمويل وحتى البيع عبر نظام Resurgo الموحد.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button onClick={() => setIsWorkspaceOpen(true)} className="bg-violet-500/10 text-violet-700 hover:bg-violet-500/20 font-bold py-2 px-4 text-xs rounded-xl transition-colors border border-violet-500/20 flex items-center gap-1.5">
                    <FolderKanban size={14} /> مساحة العمل (الدراسات)
                  </button>
                  <button onClick={() => setIsHandoverOpen(true)} className="bg-green-500/10 text-green-700 hover:bg-green-500/20 font-bold py-2 px-4 text-xs rounded-xl transition-colors border border-green-500/20 flex items-center gap-1.5">
                    <CheckCircle size={14} /> استلام وتسليم (Escrow)
                  </button>
                  <button onClick={() => setIsContractOpen(true)} className="bg-navy/5 text-navy hover:bg-navy/10 font-bold py-2 px-4 text-xs rounded-xl transition-colors border border-navy/10 flex items-center gap-1.5">
                    <FileText size={14} /> إبرام عقد رقمي
                  </button>
                  <Link to="/owner/add-property" className="btn-primary py-2 px-4 text-xs">+ مشروع جديد</Link>
                </div>
              </div>

              {/* Project lifecycle — empty state for new users */}
              <div className="bg-navy/5 rounded-2xl p-8 border border-navy/10 text-center">
                <FolderKanban size={36} className="mx-auto text-navy/20 mb-3" />
                <p className="text-navy font-bold text-sm mb-1">لا توجد مشاريع نشطة بعد</p>
                <p className="text-charcoal/50 text-xs mb-5 max-w-sm mx-auto">
                  أنشئ مشروعك الأول وأدر دورة حياته كاملة — من التمويل والدراسات وحتى البيع.
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <Link to="/invest" className="text-[11px] bg-white text-navy border border-navy/15 hover:border-brand/40 hover:text-brand px-4 py-2 rounded-xl font-bold transition-colors flex items-center gap-1.5">
                    <TrendingUp size={13} /> استثمر في مشروع
                  </Link>
                  <Link to="/owner/add-property" className="text-[11px] btn-cta px-4 py-2 flex items-center gap-1.5">
                    <Building2 size={13} /> أضف عقارك
                  </Link>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={Heart}     value={savedIds.length}          label="عقار محفوظ"   color="bg-red-500" />
              <StatCard icon={Scale}     value={userClearings.length}      label="معاملة نشطة" color="bg-brand" />
              <StatCard icon={Briefcase} value={jobApps.length}           label="طلب توظيف"   color="bg-emerald-500" />
              <StatCard icon={TrendingUp}value={investments.length}       label="استثمار نشط"  color="bg-amber-500" />
            </div>

          </motion.div>
        )}

        {/* ── Saved properties ── */}
        {tab === 'saved' && (() => {
          const filteredSaved = savedFolder === 'all'
            ? savedProps
            : savedProps.filter(p => savedFolderMap[String(p.id)] === savedFolder);

          const handleCreateFolder = () => {
            if (!newFolderInput.trim()) return;
            const next = addSavedFolder(newFolderInput);
            setSavedFolders(next);
            setSavedFolder(newFolderInput.trim());
            setNewFolderInput('');
            setShowNewFolder(false);
          };

          const handleDeleteFolder = (name) => {
            const next = deleteSavedFolder(name);
            setSavedFolders(next);
            setSavedFolderMap(getSavedFolderMap());
            if (savedFolder === name) setSavedFolder('all');
          };

          const handleAssignFolder = (propId, folderName) => {
            assignFolder(propId, folderName);
            setSavedFolderMap(getSavedFolderMap());
          };

          const handleSaveNote = (propId) => {
            setSavedNote(propId, noteDraft);
            setSavedNotes(getSavedNotes());
            setEditingNote(null);
          };

          return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* ── Folder bar ── */}
              <div className="mb-5">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                  {/* All tab */}
                  <button
                    onClick={() => setSavedFolder('all')}
                    className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${
                      savedFolder === 'all'
                        ? 'bg-navy text-cream border-navy'
                        : 'bg-white text-charcoal/60 border-navy/15 hover:border-navy/30'
                    }`}
                  >
                    <Heart size={11} />
                    الكل
                    <span className="opacity-60">({savedProps.length})</span>
                  </button>

                  {/* Custom folders */}
                  {savedFolders.map(folder => (
                    <div key={folder} className="shrink-0 flex items-center gap-0.5">
                      <button
                        onClick={() => setSavedFolder(folder)}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${
                          savedFolder === folder
                            ? 'bg-brand text-white border-brand'
                            : 'bg-white text-charcoal/60 border-navy/15 hover:border-brand/40'
                        }`}
                      >
                        {savedFolder === folder ? <FolderOpen size={11} /> : <Folder size={11} />}
                        {folder}
                        <span className="opacity-60">({savedProps.filter(p => savedFolderMap[String(p.id)] === folder).length})</span>
                      </button>
                      <button
                        onClick={() => handleDeleteFolder(folder)}
                        className="p-1 text-charcoal/30 hover:text-red-400 transition-colors"
                        title="حذف المجلد"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}

                  {/* New folder */}
                  {showNewFolder ? (
                    <div className="shrink-0 flex items-center gap-1">
                      <input
                        autoFocus
                        value={newFolderInput}
                        onChange={e => setNewFolderInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleCreateFolder(); if (e.key === 'Escape') setShowNewFolder(false); }}
                        placeholder="اسم المجلد"
                        className="w-28 px-2.5 py-1.5 text-xs border border-brand/40 rounded-full outline-none focus:ring-2 focus:ring-brand/20"
                        dir="rtl"
                      />
                      <button onClick={handleCreateFolder} className="text-brand hover:text-navy transition-colors text-xs font-bold px-2">حفظ</button>
                      <button onClick={() => setShowNewFolder(false)} className="text-charcoal/40 hover:text-charcoal/70 transition-colors"><X size={12} /></button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowNewFolder(true)}
                      className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border border-dashed border-navy/20 text-charcoal/40 hover:border-brand/40 hover:text-brand transition-all"
                    >
                      <FolderPlus size={11} /> مجلد جديد
                    </button>
                  )}
                </div>
              </div>

              {/* ── Recently viewed strip ── */}
              {recentlyViewed.length > 0 && savedFolder === 'all' && (
                <div className="mb-7">
                  <p className="text-charcoal/50 text-[11px] font-bold uppercase tracking-widest mb-3">شاهدتها مؤخراً</p>
                  <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                    {recentlyViewed.map(p => (
                      <Link key={p.id} to={`/properties/${p.id}`}
                        className="bg-white shrink-0 w-44 overflow-hidden shadow-[0_2px_8px_rgba(31,42,56,0.06)] hover:shadow-[0_8px_24px_rgba(31,42,56,0.10)] hover:-translate-y-0.5 transition-all rounded-lg">
                        <div className="h-24 overflow-hidden relative">
                          <img src={p.image} alt={p.title} className="w-full h-full object-cover" loading="lazy" />
                          <div className="absolute inset-0 bg-gradient-to-t from-navy/50 to-transparent" />
                          <span className={`absolute top-2 right-2 text-[9px] px-1.5 py-0.5 rounded-full font-bold ${p.status === 'للبيع' ? 'bg-cta text-white' : 'bg-brand text-white'}`}>{p.status}</span>
                        </div>
                        <div className="p-2.5">
                          <p className="text-navy text-[11px] font-bold truncate">{p.title}</p>
                          <p className="text-charcoal/50 text-[10px]">{p.city}</p>
                          <p className="text-navy font-black text-xs mt-1">{p.priceDisplay}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Cards ── */}
              {filteredSaved.length === 0 ? (
                <div className="bg-white p-12 text-center shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
                  <Heart size={40} className="mx-auto text-navy/15 mb-4" />
                  {savedFolder === 'all' ? (
                    <>
                      <p className="text-navy font-bold text-base mb-1">لم تحفظ أي عقار بعد</p>
                      <p className="text-charcoal/45 text-sm mb-5">اضغط على ❤️ على أي عقار لحفظه هنا</p>
                      <Link to="/properties" className="btn-cta text-sm px-6 py-2.5 inline-flex items-center gap-2">
                        <Building2 size={15} /> تصفّح العقارات
                      </Link>
                    </>
                  ) : (
                    <>
                      <p className="text-navy font-bold text-base mb-1">هذا المجلد فارغ</p>
                      <p className="text-charcoal/45 text-sm">افتح بطاقة عقار واضغط "نقل إلى مجلد" لإضافته هنا</p>
                    </>
                  )}
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredSaved.map((p, i) => {
                    const propId      = String(p.id);
                    const currentNote = savedNotes[propId] || '';
                    const assignedFld = savedFolderMap[propId] || '';
                    const isEditingThisNote = editingNote === propId;

                    return (
                      <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                        <div className="bg-white overflow-hidden shadow-[0_2px_8px_rgba(31,42,56,0.06)] hover:shadow-[0_16px_48px_rgba(31,42,56,0.13)] transition-all rounded-lg">
                          {/* Image */}
                          <Link to={`/properties/${p.id}`} className="block group">
                            <div className="relative h-44 overflow-hidden">
                              <img src={p.images?.[0] || p.image} alt={p.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              <div className="absolute inset-0 bg-gradient-to-t from-navy/60 to-transparent" />
                              <span className={`absolute top-3 right-3 text-xs px-2.5 py-1 rounded-full font-bold ${p.status === 'للبيع' ? 'bg-cta text-white' : 'bg-brand text-white'}`}>{p.status}</span>
                              {assignedFld && (
                                <span className="absolute bottom-2 right-3 flex items-center gap-1 bg-black/40 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full">
                                  <Folder size={9} /> {assignedFld}
                                </span>
                              )}
                            </div>
                          </Link>

                          {/* Info */}
                          <div className="p-4 pb-3">
                            <p className="text-navy font-bold text-sm mb-1 truncate">{p.title}</p>
                            <p className="text-charcoal/60 text-xs flex items-center gap-1 mb-2"><MapPin size={11} />{p.city} · {p.district}</p>
                            <div className="flex items-center justify-between">
                              <p className="text-navy font-black">{p.priceDisplay}</p>
                              <div className="flex gap-0.5">
                                {[...Array(5)].map((_, si) => <Star key={si} size={11} className={si < p.rating ? 'text-yellow-400 fill-yellow-400' : 'text-navy/20'} />)}
                              </div>
                            </div>
                          </div>

                          {/* Note area */}
                          {isEditingThisNote ? (
                            <div className="px-4 pb-3">
                              <textarea
                                autoFocus
                                value={noteDraft}
                                onChange={e => setNoteDraft(e.target.value)}
                                placeholder="أضف ملاحظتك..."
                                rows={2}
                                className="w-full text-xs border border-brand/30 rounded-lg px-2.5 py-2 outline-none focus:ring-2 focus:ring-brand/20 resize-none"
                                dir="rtl"
                              />
                              <div className="flex gap-2 mt-1.5">
                                <button onClick={() => handleSaveNote(propId)} className="text-xs font-bold text-brand hover:text-navy transition-colors">حفظ</button>
                                <button onClick={() => setEditingNote(null)} className="text-xs text-charcoal/40 hover:text-charcoal/70 transition-colors">إلغاء</button>
                              </div>
                            </div>
                          ) : currentNote ? (
                            <div className="px-4 pb-3">
                              <div className="flex items-start gap-1.5 bg-amber-50 border border-amber-100 rounded-lg px-2.5 py-2">
                                <FileText size={11} className="text-amber-500 mt-0.5 shrink-0" />
                                <p className="text-[11px] text-charcoal/70 flex-1 leading-relaxed">{currentNote}</p>
                                <button onClick={() => { setEditingNote(propId); setNoteDraft(currentNote); }} className="text-charcoal/30 hover:text-brand transition-colors shrink-0">
                                  <Pencil size={10} />
                                </button>
                              </div>
                            </div>
                          ) : null}

                          {/* Action bar */}
                          <div className="px-4 pb-3 flex items-center gap-3 border-t border-navy/[0.05] pt-2.5">
                            {/* Add note button */}
                            <button
                              onClick={() => { setEditingNote(propId); setNoteDraft(currentNote); }}
                              className="flex items-center gap-1 text-[11px] text-charcoal/45 hover:text-brand transition-colors"
                            >
                              <Pencil size={11} />
                              {currentNote ? 'تعديل الملاحظة' : 'إضافة ملاحظة'}
                            </button>

                            {/* Folder picker */}
                            <div className="mr-auto relative group/folder">
                              <button className="flex items-center gap-1 text-[11px] text-charcoal/45 hover:text-brand transition-colors">
                                <Folder size={11} />
                                {assignedFld || 'نقل لمجلد'}
                              </button>
                              {/* Dropdown */}
                              <div className="absolute bottom-full left-0 mb-1 bg-white border border-navy/10 rounded-xl shadow-xl py-1.5 min-w-[140px] z-20 opacity-0 pointer-events-none group-hover/folder:opacity-100 group-hover/folder:pointer-events-auto transition-all">
                                <button
                                  onClick={() => handleAssignFolder(propId, '')}
                                  className={`w-full text-right px-3 py-1.5 text-xs hover:bg-navy/5 transition-colors ${!assignedFld ? 'text-navy font-bold' : 'text-charcoal/60'}`}
                                >
                                  بدون مجلد
                                </button>
                                {savedFolders.map(f => (
                                  <button
                                    key={f}
                                    onClick={() => handleAssignFolder(propId, f)}
                                    className={`w-full text-right px-3 py-1.5 text-xs hover:bg-navy/5 transition-colors flex items-center gap-1.5 ${assignedFld === f ? 'text-brand font-bold' : 'text-charcoal/60'}`}
                                  >
                                    <Folder size={10} /> {f}
                                  </button>
                                ))}
                                {savedFolders.length === 0 && (
                                  <p className="px-3 py-1.5 text-[11px] text-charcoal/40">لا توجد مجلدات بعد</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          );
        })()}

        {/* ── Property Alerts ── */}
        {tab === 'saved' && (
          <div className="mt-6 border-t border-navy/10 pt-6">
            <AlertManager />
          </div>
        )}

        {/* ── Transactions ── */}
        {tab === 'clearing' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-charcoal/60 text-xs"><span className="text-navy font-bold">{userClearings.length}</span> معاملة</p>
              <Link to="/clearing/dashboard" className="text-xs text-brand hover:underline flex items-center gap-1">
                إدارة المعاملات <ChevronRight size={12} />
              </Link>
            </div>
            <div className="bg-white p-10 text-center shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
              <Scale size={36} className="mx-auto text-navy/15 mb-4" />
              <p className="text-navy font-bold text-base mb-1">لا توجد معاملات بعد</p>
              <p className="text-charcoal/45 text-sm mb-5">ابدأ معاملة قانونية جديدة عبر نظام التخليص</p>
              <Link to="/clearing" className="btn-cta text-sm px-6 py-2.5 inline-flex items-center gap-2">
                <Scale size={15} /> تصفّح الخدمات القانونية
              </Link>
            </div>
          </motion.div>
        )}

        {/* ── My listings ── */}
        {tab === 'myprops' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-charcoal/60 text-xs">
                <span className="text-navy font-bold">{combinedListings.length}</span> عقار
                {ownedMockProps.length > 0 && (
                  <span className="text-charcoal/40 mr-1">({ownedMockProps.length} من المنصة)</span>
                )}
              </p>
              <Link to="/owner/add-property" className="btn-cta text-xs px-4 py-2">+ إضافة عقار</Link>
            </div>

            {combinedListings.length === 0 ? (
              <div className="bg-white p-10 text-center shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
                <Building2 size={36} className="mx-auto text-navy/20 mb-3" />
                <p className="text-charcoal/50 text-sm">لم تُضف أي عقار بعد</p>
                <Link to="/owner/add-property" className="text-brand text-xs hover:underline mt-2 inline-block">
                  أضف عقارك الأول الآن
                </Link>
              </div>
            ) : (
              combinedListings.map((p, i) => {
                return (
                  <motion.div key={p.id || i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }} className="bg-white overflow-hidden shadow-[0_2px_8px_rgba(31,42,56,0.06)] hover:shadow-[0_8px_24px_rgba(31,42,56,0.10)] transition-all"
                    style={{ borderRadius: '8px' }}>

                    {/* Main row */}
                    <div className="p-4 flex items-center gap-4">
                      {(p.images?.[0] || p.image) && (
                        <img src={p.images?.[0] ?? p.image} alt=""
                          className="w-16 h-14 rounded-xl object-cover shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-navy font-bold text-sm truncate">{p.title}</p>
                          {p.isMock && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-navy/8 text-charcoal/50 shrink-0">
                              من المنصة
                            </span>
                          )}
                        </div>
                        <p className="text-charcoal/60 text-xs flex items-center gap-1">
                          <MapPin size={11} />{p.city}{p.district ? ` · ${p.district}` : ''}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        {/* Listing type badge */}
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${p.status === 'للبيع' ? 'bg-cta/10 text-cta border-cta/20' : 'bg-brand/10 text-brand border-brand/20'}`}>
                          {p.status}
                        </span>
                        {/* Listing status badge */}
                        {p.listingStatus && (() => {
                          const cfg = {
                            pending_review: { label: 'قيد المراجعة', cls: 'bg-amber-50 text-amber-600 border-amber-200' },
                            listed:         { label: 'منشور ✓',      cls: 'bg-green-50 text-green-600 border-green-200' },
                            rejected:       { label: 'مرفوض',        cls: 'bg-red-50 text-red-500 border-red-200'       },
                            sold:           { label: 'مباع',         cls: 'bg-navy/8 text-charcoal/60 border-navy/15'   },
                            archived:       { label: 'معلق',         cls: 'bg-slate-50 text-slate-500 border-slate-200' },
                          }[p.listingStatus];
                          return cfg ? (
                            <span className={`block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cfg.cls}`}>
                              {cfg.label}
                            </span>
                          ) : null;
                        })()}
                        <p className="text-navy font-black text-sm mt-1">{p.priceDisplay}</p>
                      </div>
                      {/* Actions */}
                      {!p.isMock && (
                        <div className="flex flex-col gap-1 shrink-0">
                          <div className="flex gap-1.5">
                            <button onClick={() => navigate(`/owner/edit-property/${p.id}`)}
                              className="w-8 h-8 rounded-lg bg-cream flex items-center justify-center text-charcoal/40 hover:text-brand hover:bg-brand/8 transition-colors"
                              title="تعديل">
                              <Edit3 size={13} />
                            </button>
                            <button onClick={() => handleDeleteListing(p.id)}
                              className="w-8 h-8 rounded-lg bg-cream flex items-center justify-center text-charcoal/40 hover:text-red-500 hover:bg-red-50 transition-colors"
                              title="حذف">
                              <Trash2 size={13} />
                            </button>
                          </div>
                          {/* Status quick actions for Supabase listings */}
                          {p.fromSupabase && p.listingStatus === 'listed' && (
                            <div className="flex gap-1.5">
                              <button onClick={() => handleStatusUpdate(p.id, 'sold')}
                                title="تمييز كمباع"
                                className="flex-1 text-[9px] font-bold bg-navy/5 hover:bg-navy/10 text-charcoal/60 rounded px-1.5 py-1 transition-colors">
                                مباع
                              </button>
                              <button onClick={() => handleStatusUpdate(p.id, 'archived')}
                                title="تعليق الإعلان"
                                className="flex-1 text-[9px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-600 rounded px-1.5 py-1 transition-colors">
                                تعليق
                              </button>
                            </div>
                          )}
                          {p.fromSupabase && (p.listingStatus === 'archived' || p.listingStatus === 'sold') && (
                            <button onClick={() => handleStatusUpdate(p.id, 'listed')}
                              className="text-[9px] font-bold bg-green-50 hover:bg-green-100 text-green-600 rounded px-1.5 py-1 transition-colors">
                              إعادة نشر
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Verification timeline — Supabase listings only */}
                    {p.fromSupabase && p.listingStatus && !['sold','archived'].includes(p.listingStatus) && (
                      <div className="px-4 pb-3 pt-2 border-t border-navy/[0.05]">
                        {(() => {
                          const steps = [
                            { key: 'submitted',  label: 'تقديم العقار' },
                            { key: 'reviewing',  label: 'مراجعة RESURGO' },
                            { key: 'published',  label: p.listingStatus === 'rejected' ? 'مرفوض' : 'نشر في الدليل' },
                          ];
                          const activeIdx = p.listingStatus === 'pending_review' ? 1
                            : p.listingStatus === 'listed'   ? 2
                            : p.listingStatus === 'rejected' ? 2 : 0;
                          const isRejected = p.listingStatus === 'rejected';
                          return (
                            <div className="flex items-center gap-0">
                              {steps.map((s, idx) => {
                                const done    = idx < activeIdx;
                                const current = idx === activeIdx;
                                const reject  = isRejected && idx === 2;
                                return (
                                  <div key={s.key} className="flex items-center flex-1 min-w-0">
                                    <div className="flex flex-col items-center shrink-0">
                                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black transition-colors ${
                                        reject  ? 'bg-red-500 text-white' :
                                        done    ? 'bg-green-500 text-white' :
                                        current ? 'bg-brand text-white ring-2 ring-brand/30' :
                                                  'bg-navy/10 text-charcoal/40'
                                      }`}>
                                        {reject ? '✕' : done ? '✓' : idx + 1}
                                      </div>
                                      <span className={`text-[9px] mt-0.5 whitespace-nowrap font-medium ${
                                        reject  ? 'text-red-500' :
                                        done    ? 'text-green-600' :
                                        current ? 'text-brand' : 'text-charcoal/35'
                                      }`}>{s.label}</span>
                                    </div>
                                    {idx < steps.length - 1 && (
                                      <div className={`flex-1 h-px mx-1 mb-3 ${done ? 'bg-green-400' : 'bg-navy/10'}`} />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {/* KPI stats row */}
                    {(p.isMock && (p.views || p.inquiries || p.savedCount)) || p.fromSupabase ? (
                      <div className="px-4 pb-3 flex items-center gap-5 border-t border-navy/[0.05] pt-2.5">
                        <span className="flex items-center gap-1.5 text-[11px] text-charcoal/50">
                          <span className="text-navy/40">👁</span>
                          <span className="font-semibold text-charcoal/70">
                            {p.fromSupabase
                              ? (viewCounts[String(p.id)] || 0).toLocaleString()
                              : p.views?.toLocaleString()}
                          </span> مشاهدة
                        </span>
                        <span className="flex items-center gap-1.5 text-[11px] text-charcoal/50">
                          <span className="text-navy/40">📩</span>
                          <span className="font-semibold text-charcoal/70">
                            {p.fromSupabase
                              ? receivedInqs.filter(r => String(r.propertyId) === String(p.id)).length
                              : p.inquiries}
                          </span> استفسار
                        </span>
                        {p.isMock && p.savedCount != null && (
                          <span className="flex items-center gap-1.5 text-[11px] text-charcoal/50">
                            <span className="text-navy/40">❤️</span>
                            <span className="font-semibold text-charcoal/70">{p.savedCount}</span> حفظ
                          </span>
                        )}
                        {/* Documents toggle — Supabase listings only */}
                        {p.fromSupabase && (
                          <button
                            onClick={() => setExpandedDocs(expandedDocs === p.id ? null : p.id)}
                            className="mr-auto flex items-center gap-1 text-[11px] text-charcoal/40 hover:text-brand transition-colors"
                          >
                            <FileText size={11} />
                            الوثائق
                            <ChevronRight size={10} className={`transition-transform ${expandedDocs === p.id ? 'rotate-90' : ''}`} />
                          </button>
                        )}
                      </div>
                    ) : null}

                    {/* Documents panel */}
                    {p.fromSupabase && expandedDocs === p.id && (
                      <DocumentManager propertyId={p.id} ownerId={user.id} />
                    )}

                  </motion.div>
                );
              })
            )}
          </motion.div>
        )}

        {/* ── Valuation requests ── */}
        {tab === 'valuations' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-charcoal/60 text-xs">
                <span className="text-navy font-bold">{myValuations.length}</span> طلب تقييم
              </p>
              <Link to="/valuation-request" className="btn-cta text-xs px-4 py-2">+ طلب تقييم جديد</Link>
            </div>

            {myValuations.length === 0 ? (
              <div className="bg-white p-10 text-center shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
                <BadgeCheck size={36} className="mx-auto text-navy/20 mb-3" />
                <p className="text-charcoal/50 text-sm">لم تطلب تقييماً بعد</p>
                <Link to="/valuation-request" className="text-brand text-xs hover:underline mt-2 inline-block">
                  اطلب تقييماً عقارياً معتمداً
                </Link>
              </div>
            ) : myValuations.map((v, i) => {
              const STATUS_CFG = {
                pending:    { label: 'معلّق — بانتظار المراجعة', dot: 'bg-amber-400',  bar: 'w-1/4',  barClr: 'bg-amber-400'  },
                in_review:  { label: 'قيد الدراسة',              dot: 'bg-brand',      bar: 'w-2/4',  barClr: 'bg-brand'      },
                certified:  { label: 'معتمد — التقرير جاهز',     dot: 'bg-green-500',  bar: 'w-full', barClr: 'bg-green-500'  },
                rejected:   { label: 'مرفوض',                    dot: 'bg-red-400',    bar: 'w-full', barClr: 'bg-red-400'    },
              };
              const TIER_LBL = { desktop: 'مكتبي', field: 'ميداني', legal: 'قانوني', portfolio: 'محفظة' };
              const cfg = STATUS_CFG[v.status] || STATUS_CFG.pending;
              return (
                <motion.div key={v.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="bg-white overflow-hidden shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <p className="text-navy font-bold text-sm">
                          {v.propertyType === 'apartment' ? 'شقة' : v.propertyType === 'villa' ? 'فيلا' : v.propertyType === 'commercial' ? 'تجاري' : 'عقار'}
                          {v.area ? ` · ${v.area} م²` : ''}
                        </p>
                        <p className="text-charcoal/55 text-xs mt-0.5 flex items-center gap-1">
                          <MapPin size={10} /> {v.city || '—'}
                          <span className="mr-2 bg-navy/8 text-charcoal/50 text-[9px] font-bold px-1.5 py-0.5 rounded">
                            {TIER_LBL[v.tier] || v.tier}
                          </span>
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        <span className="text-xs text-charcoal/60 font-medium">{cfg.label}</span>
                      </div>
                    </div>

                    {/* Progress timeline */}
                    <div className="mb-3">
                      <div className="flex justify-between text-[9px] text-charcoal/40 mb-1">
                        {['تقديم الطلب', 'قيد الدراسة', 'إصدار التقرير'].map(s => (
                          <span key={s}>{s}</span>
                        ))}
                      </div>
                      <div className="h-1.5 rounded-full bg-navy/8 overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-700 ${cfg.bar} ${cfg.barClr}`} />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-charcoal/40 text-[10px]">{v.submittedAt}</span>
                      {v.status === 'certified' && v.report && (
                        <div className="text-right">
                          <p className="text-xs text-charcoal/50">القيمة التقديرية</p>
                          <p className="text-navy font-black text-sm">
                            {v.report.currency === 'USD'
                              ? `$${Number(v.report.final_value).toLocaleString()}`
                              : `${Number(v.report.final_value).toLocaleString()} ل.س`}
                          </p>
                          <p className="text-charcoal/35 text-[10px]">
                            نطاق: ${Number(v.report.final_low).toLocaleString()} — ${Number(v.report.final_high).toLocaleString()}
                          </p>
                        </div>
                      )}
                      {v.status === 'rejected' && (
                        <Link to="/valuation-request" className="text-xs text-brand hover:underline font-semibold">
                          إعادة التقديم
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* ── Job applications ── */}
        {tab === 'jobs' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <p className="text-charcoal/60 text-xs mb-2"><span className="text-navy font-bold">{jobApps.length}</span> طلب توظيف</p>
            {jobApps.length === 0 ? (
              <div className="bg-white p-12 text-center shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
                <Briefcase size={40} className="mx-auto text-navy/15 mb-4" />
                <p className="text-navy font-bold text-base mb-1">لم تتقدم لأي وظيفة بعد</p>
                <p className="text-charcoal/45 text-sm mb-5">تصفّح الوظائف المتاحة وتقدّم بنقرة واحدة</p>
                <Link to="/jobs" className="btn-cta text-sm px-6 py-2.5 inline-flex items-center gap-2">
                  <Briefcase size={15} /> تصفّح الوظائف
                </Link>
              </div>
            ) : jobApps.map((a, i) => (
              <motion.div key={a.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                className="bg-white p-4 flex items-center gap-4 shadow-[0_2px_8px_rgba(31,42,56,0.06)] hover:shadow-[0_8px_24px_rgba(31,42,56,0.10)] transition-all"
                style={{ borderRadius: '8px' }}>
                <Briefcase size={16} className="text-emerald-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-navy font-bold text-sm">{a.title}</p>
                  <p className="text-charcoal/60 text-xs">{a.company}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${a.status === 'مقبول للمقابلة' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                    {a.status}
                  </span>
                  <p className="text-charcoal/40 text-[10px] mt-1">{a.date}</p>
                </div>
              </motion.div>
            ))}
            <Link to="/jobs" className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-navy/20 text-charcoal/50 hover:border-emerald-400/40 hover:text-emerald-600 rounded-xl text-sm transition-all">
              + تصفّح المزيد من الوظائف
            </Link>
          </motion.div>
        )}

        {/* ── Portfolio (Crowdfunding) ── */}
        {tab === 'portfolio' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <InvestorPortfolio />
          </motion.div>
        )}

        {/* ── Messages ── */}
        {tab === 'messages' && (
          <MessagesTab user={user} inquiries={inquiries} />
        )}


        {/* ── Owner Inbox (Received Inquiries) ── */}
        {tab === 'inbox' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-charcoal/60 text-xs">
                <span className="text-navy font-bold">{receivedInqs.length}</span> استفسار وارد
              </p>
              {receivedInqs.filter(r => r.status === 'جديد').length > 0 && (
                <span className="text-[11px] font-bold bg-cta/10 text-cta border border-cta/20 px-2.5 py-1 rounded-full">
                  {receivedInqs.filter(r => r.status === 'جديد').length} جديد
                </span>
              )}
            </div>
            {receivedInqs.length === 0 ? (
              <div className="bg-white p-10 text-center shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
                <Inbox size={36} className="mx-auto text-navy/20 mb-3" />
                <p className="text-charcoal/50 text-sm">لا توجد استفسارات واردة بعد</p>
                <p className="text-charcoal/40 text-xs mt-1">ستظهر هنا استفسارات المهتمين بعقاراتك</p>
              </div>
            ) : (
              receivedInqs.map((inq, i) => (
                <motion.div key={inq.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-white p-4 flex gap-4 shadow-[0_2px_8px_rgba(31,42,56,0.06)] hover:shadow-[0_8px_24px_rgba(31,42,56,0.10)] transition-all"
                  style={{ borderRadius: '8px' }}>
                  <div className="w-10 h-10 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center shrink-0 text-brand font-black text-base">
                    {inq.senderName?.[0] || '؟'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-navy font-bold text-sm truncate">{inq.senderName}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${inq.status === 'جديد' ? 'bg-cta/10 text-cta border-cta/20' : 'bg-green-50 text-green-600 border-green-200'}`}>
                        {inq.status}
                      </span>
                    </div>
                    <p className="text-charcoal/55 text-xs flex items-center gap-1 mb-2">
                      <Building2 size={11} className="shrink-0" />
                      <span className="truncate">{inq.propertyTitle}</span>
                    </p>
                    <p className="text-charcoal/65 text-xs leading-relaxed line-clamp-2">{inq.message}</p>
                  </div>
                  <div className="shrink-0 flex flex-col items-end justify-between gap-2">
                    <p className="text-charcoal/35 text-[10px]">{inq.date}</p>
                    <a href={`https://wa.me/${inq.senderPhone?.replace(/[\s+\-()]/g, '')}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-[11px] font-bold text-green-600 hover:text-green-700 border border-green-200 hover:border-green-300 bg-green-50 hover:bg-green-100 px-2.5 py-1.5 rounded-xl transition-all">
                      <MessageCircle size={12} /> رد واتساب
                    </a>
                    {inq.status === 'جديد' && (
                      <button
                        onClick={() => updateInquiryStatus(inq, 'تم التواصل')}
                        className="flex items-center gap-1 text-[10px] font-bold text-brand hover:text-navy border border-brand/25 hover:border-brand/50 bg-brand/5 hover:bg-brand/10 px-2 py-1 rounded-lg transition-all">
                        <CheckCircle size={10} /> تم التواصل
                      </button>
                    )}
                    {inq.status !== 'مغلق' && (
                      <button
                        onClick={() => updateInquiryStatus(inq, 'مغلق')}
                        className="flex items-center gap-1 text-[10px] text-charcoal/40 hover:text-red-500 border border-charcoal/15 hover:border-red-200 hover:bg-red-50 px-2 py-1 rounded-lg transition-all">
                        <X size={10} /> إغلاق
                      </button>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}

        {/* ── Profile ── */}
        {tab === 'profile' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-xl space-y-5">

            {/* Avatar + name */}
            <div className="bg-white p-6 flex items-center gap-5 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
              <div className="w-16 h-16 rounded-2xl bg-brand/10 border-2 border-brand/20 flex items-center justify-center text-2xl font-black text-brand shrink-0">
                {displayName[0]?.toUpperCase() || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-navy font-black text-lg truncate">{displayName}</p>
                <p className="text-charcoal/55 text-xs flex items-center gap-1.5 mt-0.5">
                  {role?.icon} <span>{role?.label}</span>
                  <BadgeCheck size={13} className="text-brand mr-1" />
                </p>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                {!editMode && (
                  <button onClick={startEdit}
                    className="flex items-center gap-1.5 text-xs border border-navy/15 hover:border-brand/40 text-charcoal/60 hover:text-brand px-3 py-2 rounded-xl transition-all">
                    <Edit3 size={13} /> تعديل سريع
                  </button>
                )}
                <button onClick={() => navigate('/profile')}
                  className="flex items-center gap-1.5 text-xs border border-brand/25 text-brand hover:bg-brand/5 px-3 py-2 rounded-xl transition-all">
                  <User size={13} /> الملف الكامل
                </button>
              </div>
            </div>

            {/* Edit form */}
            <AnimatePresence>
              {editMode && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="bg-white p-5 space-y-4 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
                    <p className="text-navy font-bold text-sm">تعديل البيانات الشخصية</p>
                    <div>
                      <label className="text-charcoal/50 text-xs font-semibold mb-1.5 block uppercase tracking-wider">الاسم الكامل</label>
                      <input value={draftName} onChange={e => setDraftName(e.target.value)}
                        className="w-full input-field text-sm py-2.5" dir="rtl" placeholder="أدخل اسمك الكامل" />
                    </div>
                    <div>
                      <label className="text-charcoal/50 text-xs font-semibold mb-1.5 block uppercase tracking-wider">رقم الهاتف</label>
                      <input value={draftPhone} onChange={e => setDraftPhone(e.target.value)}
                        className="w-full input-field text-sm py-2.5" dir="ltr" placeholder="+963 XX XXX XXXX" />
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button onClick={saveEdit} disabled={profSaving}
                        className="btn-cta flex-1 flex items-center justify-center gap-2 text-sm disabled:opacity-60">
                        {profSaving
                          ? <Clock size={15} className="animate-spin" />
                          : <CheckCircle size={15} />}
                        {profSaving ? 'جارٍ الحفظ…' : 'حفظ التغييرات'}
                      </button>
                      <button onClick={() => setEditMode(false)}
                        className="px-4 border border-navy/15 text-charcoal/60 rounded-xl hover:text-navy transition-colors text-sm">
                        إلغاء
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Info cards */}
            <div className="bg-white divide-y divide-navy/[0.07] shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
              {[
                { icon: User,    label: 'الاسم الكامل',       value: displayName },
                { icon: Mail,    label: 'البريد الإلكتروني',  value: user.email },
                { icon: Phone,   label: 'رقم الهاتف',         value: displayPhone },
                { icon: Package, label: 'نوع الحساب',         value: role?.label || '—' },
                { icon: Globe,   label: 'المحافظة',           value: user.province || '—' },
                user.national_id    ? { icon: Shield, label: 'رقم الهوية الوطنية', value: user.national_id }    : null,
                user.specialization ? { icon: Wrench, label: 'التخصص / المهنة',   value: user.specialization } : null,
                user.company_name   ? { icon: Briefcase, label: 'اسم الشركة',      value: user.company_name }   : null,
                { icon: Clock,   label: 'تاريخ التسجيل',     value: formatDate(user.created_at) },
              ].filter(Boolean).map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-4 px-5 py-3.5">
                  <div className="w-8 h-8 rounded-xl bg-brand/8 flex items-center justify-center shrink-0">
                    <Icon size={14} className="text-brand" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-charcoal/45 text-[11px] uppercase tracking-wider">{label}</p>
                    <p className="text-navy font-semibold text-sm truncate mt-0.5">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Danger zone */}
            <div className="bg-white p-5 border border-red-200/50 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
              <p className="text-charcoal/50 text-xs font-semibold uppercase tracking-wider mb-3">منطقة الخطر</p>
              <button onClick={() => { logout(); toast('تم تسجيل الخروج'); }}
                className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 border border-red-200 hover:border-red-300 px-4 py-2.5 rounded-xl transition-all">
                <LogOut size={14} /> تسجيل الخروج من جميع الأجهزة
              </button>
            </div>
          </motion.div>
        )}

      </div>
      
      <ContractModal 
        isOpen={isContractOpen} 
        onClose={() => setIsContractOpen(false)} 
        defaultParty1={displayName}
      />

      <HandoverProtocolModal 
        isOpen={isHandoverOpen} 
        onClose={() => setIsHandoverOpen(false)} 
        projectName="مشروعي"
      />

      <StudyWorkspaceModal
        isOpen={isWorkspaceOpen}
        onClose={() => setIsWorkspaceOpen(false)}
        projectName="مشروعي"
        onHandover={() => {
          setIsWorkspaceOpen(false);
          setIsHandoverOpen(true);
        }}
      />
    </div>
  );
}
