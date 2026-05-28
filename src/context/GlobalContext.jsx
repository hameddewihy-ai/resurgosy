import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isConfigured } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { formatDate } from '../utils/formatDate';
import toast from 'react-hot-toast';

import { setSavedPropsUser, loadSavedFromSupabase } from '../utils/savedProps';

import {
  INITIAL_DEVELOPERS,
  INITIAL_PROJECTS,
  INITIAL_PROPERTIES,
  INITIAL_JOBS,
  INITIAL_ENGINEERS,
  INITIAL_TENDERS,
  MARKET_DATA,
  INITIAL_CRM_LEADS,
  INITIAL_INVESTMENT_PROJECTS,
  INITIAL_WALLET,
  INITIAL_INVESTMENTS,
  INITIAL_GANTT_TASKS,
  INITIAL_FINISHING_RFQS,
  INITIAL_FINISHING_BIDS,
  INITIAL_FINISHING_PROJECTS,
  COMPANIES,
  INITIAL_SPONSORSHIPS,
  INITIAL_USERS_SEED,
  INITIAL_MACHINERY_SEED,
  INITIAL_STUDIES_SEED,
  INITIAL_CLEARING_SEED,
  INITIAL_VALUATIONS_SEED,
  enrichRecords,
} from '../data/mockDatabase';

// ── Context Setup ─────────────────────────────────────────────────────────────

const GlobalContext = createContext();


function lsGet(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}

export function GlobalProvider({ children }) {
  const { user } = useAuth();
  const [developers, setDevelopers] = useState(() => enrichRecords('dev', INITIAL_DEVELOPERS, '2025-01-01T00:00:00Z'));
  const [projects, setProjects] = useState(() => enrichRecords('proj', INITIAL_PROJECTS, '2025-01-01T00:00:00Z'));
  const [jobs, setJobs] = useState(() => enrichRecords('job', INITIAL_JOBS, '2025-01-01T00:00:00Z'));
  const [engineers] = useState(() => enrichRecords('eng', INITIAL_ENGINEERS, '2025-01-01T00:00:00Z'));
  const [tenders, setTenders] = useState(INITIAL_TENDERS);
  const [crmLeads, setCrmLeads] = useState(INITIAL_CRM_LEADS);
  const [properties, setProperties] = useState(INITIAL_PROPERTIES);
  const [propertiesLoading, setPropertiesLoading] = useState(isConfigured);
  const [investmentProjects, setInvestmentProjects] = useState(() => lsGet('resurgo-inv-projects', INITIAL_INVESTMENT_PROJECTS));
  const [wallet, setWallet] = useState(() => lsGet('resurgo-wallet', INITIAL_WALLET));
  const [investments, setInvestments] = useState(() => lsGet('resurgo-investments', INITIAL_INVESTMENTS));
  const [ganttTasks, setGanttTasks] = useState(INITIAL_GANTT_TASKS);
  const [crossHint, setCrossHint] = useState(null);

  // Finishing states
  const [finishingRFQs, setFinishingRFQs] = useState(() => lsGet('resurgo-finishing-rfqs', INITIAL_FINISHING_RFQS));
  const [finishingBids, setFinishingBids] = useState(() => lsGet('resurgo-finishing-bids', INITIAL_FINISHING_BIDS));
  const [finishingProjects, setFinishingProjects] = useState(() => lsGet('resurgo-finishing-projects', INITIAL_FINISHING_PROJECTS));
  const [sypExchangeRate, setSypExchangeRate] = useState(() => lsGet('resurgo-syp-exchange-rate', 13000));
  const [finishingCompanies, setFinishingCompanies] = useState(() => lsGet('resurgo-finishing-companies', COMPANIES));
  
  // Sponsorships / Ads state
  const [sponsorships, setSponsorships] = useState(() => lsGet('resurgo-sponsorships', INITIAL_SPONSORSHIPS));

  // Administrative Shared States
  const [users, setUsers] = useState(() => lsGet('resurgo-users', INITIAL_USERS_SEED));
  const [machineryList, setMachineryList] = useState(() => lsGet('resurgo-machinery', INITIAL_MACHINERY_SEED));
  const [studiesList, setStudiesList] = useState(() => lsGet('resurgo-studies', INITIAL_STUDIES_SEED));
  const [clearingList, setClearingList] = useState(() => lsGet('resurgo-clearing', INITIAL_CLEARING_SEED));
  const [valuationsList, setValuationsList] = useState(() => lsGet('resurgo-valuations', INITIAL_VALUATIONS_SEED));

  // Low-Bandwidth state
  const [lowBandwidthMode, setLowBandwidthMode] = useState(() => lsGet('resurgo-low-bandwidth', false));

  useEffect(() => { try { localStorage.setItem('resurgo-wallet', JSON.stringify(wallet)); } catch {} }, [wallet]);
  useEffect(() => { try { localStorage.setItem('resurgo-inv-projects', JSON.stringify(investmentProjects)); } catch {} }, [investmentProjects]);
  useEffect(() => { try { localStorage.setItem('resurgo-investments', JSON.stringify(investments)); } catch {} }, [investments]);
  useEffect(() => { try { localStorage.setItem('resurgo-finishing-rfqs', JSON.stringify(finishingRFQs)); } catch {} }, [finishingRFQs]);
  useEffect(() => { try { localStorage.setItem('resurgo-finishing-bids', JSON.stringify(finishingBids)); } catch {} }, [finishingBids]);
  useEffect(() => { try { localStorage.setItem('resurgo-finishing-projects', JSON.stringify(finishingProjects)); } catch {} }, [finishingProjects]);
  useEffect(() => { try { localStorage.setItem('resurgo-syp-exchange-rate', JSON.stringify(sypExchangeRate)); } catch {} }, [sypExchangeRate]);
  useEffect(() => { try { localStorage.setItem('resurgo-finishing-companies', JSON.stringify(finishingCompanies)); } catch {} }, [finishingCompanies]);
  useEffect(() => { try { localStorage.setItem('resurgo-sponsorships', JSON.stringify(sponsorships)); } catch {} }, [sponsorships]);
  useEffect(() => { try { localStorage.setItem('resurgo-users', JSON.stringify(users)); } catch {} }, [users]);
  useEffect(() => { try { localStorage.setItem('resurgo-machinery', JSON.stringify(machineryList)); } catch {} }, [machineryList]);
  useEffect(() => { try { localStorage.setItem('resurgo-studies', JSON.stringify(studiesList)); } catch {} }, [studiesList]);
  useEffect(() => { try { localStorage.setItem('resurgo-clearing', JSON.stringify(clearingList)); } catch {} }, [clearingList]);
  useEffect(() => { try { localStorage.setItem('resurgo-valuations', JSON.stringify(valuationsList)); } catch {} }, [valuationsList]);
  useEffect(() => { try { localStorage.setItem('resurgo-low-bandwidth', JSON.stringify(lowBandwidthMode)); } catch {} }, [lowBandwidthMode]);

  // Fetch real properties from Supabase and prepend to mock data
  useEffect(() => {
    if (!isConfigured) return;
    const TYPE_MAP = { residential: 'سكني', commercial: 'تجاري', industrial: 'صناعي', land: 'أرض' };
    supabase
      .from('properties')
      .select('*')
      .eq('status', 'listed')
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data, error }) => {
        if (error) { console.error('[GlobalContext] properties fetch:', error.message); }
        if (!data?.length) { setPropertiesLoading(false); return; }
        const normalized = data.map(p => ({
          id:           p.id,
          uuid:         p.id,
          owner_id:     p.owner_id,
          title:        p.title,
          desc:         p.description || '',
          city:         p.province || '',
          district:     p.city || '',
          type:         TYPE_MAP[p.property_type] || p.property_type || 'سكني',
          status:       p.listing_type === 'rent' ? 'للإيجار' : 'للبيع',
          currency:     'USD',
          price:        p.price_estimate || p.rent_price || 0,
          priceDisplay: p.listing_type === 'rent'
            ? (p.rent_price    ? `$${Number(p.rent_price).toLocaleString()}/شهر` : '—')
            : (p.price_estimate ? `$${Number(p.price_estimate).toLocaleString()}` : '—'),
          area:         p.area || 0,
          rooms:        p.bedrooms || 0,
          baths:        p.bathrooms || 0,
          floor:        p.floor || 0,
          lat:          p.lat,
          lng:          p.lng,
          images:       p.images?.length ? p.images : [],
          tags:         p.amenities || [],
          verified:     p.verified || false,
          created_at:   p.created_at,
          date:         formatDate(p.created_at),
          ownerName:    'مالك خاص',
          fromSupabase: true,
        }));
        setProperties(normalized);
        setPropertiesLoading(false);
      })
      .catch(err => { console.error('[GlobalContext] properties fetch:', err); setPropertiesLoading(false); });
  }, []);

  useEffect(() => {
    if (lowBandwidthMode) {
      document.body.classList.add('low-bandwidth');
    } else {
      document.body.classList.remove('low-bandwidth');
    }
  }, [lowBandwidthMode]);

  // ── Sync saved properties user id + hydrate from Supabase ───────────────────
  useEffect(() => {
    setSavedPropsUser(user?.id ?? null);
    if (user?.id) loadSavedFromSupabase(user.id);
  }, [user?.id]);

  // ── Supabase: load wallet transactions + Realtime ──────────────────────────
  useEffect(() => {
    if (!isConfigured || !user) return;

    const normalizeRow = (t) => ({
      id:        t.id,
      type:      t.type,
      title:     t.title,
      category:  t.category,
      projectId: t.project_id,
      amount:    Number(t.amount),
      status:    t.status,
      date:      formatDate(t.created_at),
      timestamp: new Date(t.created_at).getTime(),
      details:   t.details,
    });

    supabase
      .from('wallet_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) { console.error('[GlobalContext] wallet fetch:', error.message); return; }
        if (!data) return;
        const escrowBalance = data
          .filter(t => t.type === 'escrow_hold' && t.status === 'pending')
          .reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
        const totalBalance = data
          .filter(t => !(t.type === 'escrow_hold' && t.status === 'pending'))
          .reduce((s, t) => s + Number(t.amount), 0);
        setWallet({
          totalBalance:  Math.max(0, totalBalance),
          escrowBalance,
          transactions: data.map(normalizeRow),
        });
      });

    // Realtime: live balance updates (e.g., admin credit, escrow release from another session)
    const channel = supabase
      .channel(`wallet-txn-${user.id}`)
      .on('postgres_changes', {
        event:  'INSERT',
        schema: 'public',
        table:  'wallet_transactions',
        filter: `user_id=eq.${user.id}`,
      }, ({ new: t }) => {
        const trx = normalizeRow(t);
        setWallet(prev => {
          if (prev.transactions.some(x => x.id === t.id)) return prev; // dedup optimistic
          const isEscrow  = t.type === 'escrow_hold' && t.status === 'pending';
          return {
            totalBalance:  Math.max(0, prev.totalBalance  + (isEscrow ? 0 : Number(t.amount))),
            escrowBalance: prev.escrowBalance + (isEscrow ? Math.abs(Number(t.amount)) : 0),
            transactions:  [trx, ...prev.transactions],
          };
        });
        if (Number(t.amount) > 0) {
          toast.success(`وردت ${Number(t.amount).toLocaleString()} $ على محفظتك 💰`, { duration: 6000 });
        }
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user]);

  // ── Supabase: load investments ──────────────────────────────────────────────
  useEffect(() => {
    if (!isConfigured || !user) return;
    supabase
      .from('investments')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (!data?.length) return;
        setInvestments(data.map(inv => ({
          id:         inv.id,
          projectId:  inv.project_id,
          amount:     Number(inv.amount),
          shares:     Number(inv.shares),
          sharePrice: Number(inv.share_price),
          date:       formatDate(inv.created_at),
          timestamp:  new Date(inv.created_at).getTime(),
          status:     inv.status,
          locked:     inv.locked,
        })));
      })
      .catch(err => console.error('[GlobalContext] investments fetch:', err));
  }, [user]);

  // ── Supabase: load finishing RFQs (open ones visible to all companies) ──────
  useEffect(() => {
    if (!isConfigured) return;
    supabase
      .from('finishing_rfqs')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (!data?.length) return;
        setFinishingRFQs(data.map(r => ({
          id:            r.id,
          client:        r.client_name,
          city:          r.city,
          district:      r.district,
          area:          r.area,
          services:      r.services || [],
          budget:        r.budget,
          date:          formatDate(r.created_at),
          status:        r.status,
          urgent:        r.urgent,
          description:   r.description,
          propertyState: r.property_state,
        })));
      })
      .catch(err => console.error('[GlobalContext] finishing_rfqs fetch:', err));
  }, []);

  // ── Supabase: Realtime — notify finishing_co users of new RFQs ─────────────
  useEffect(() => {
    if (!isConfigured) return;

    const normalizeRFQ = (r) => ({
      id:            r.id,
      client:        r.client_name,
      city:          r.city,
      district:      r.district,
      area:          r.area,
      services:      r.services || [],
      budget:        r.budget,
      date:          formatDate(r.created_at),
      status:        r.status,
      urgent:        r.urgent,
      description:   r.description,
      propertyState: r.property_state,
    });

    const channel = supabase
      .channel('finishing-rfqs-realtime')
      .on('postgres_changes', {
        event:  'INSERT',
        schema: 'public',
        table:  'finishing_rfqs',
      }, ({ new: r }) => {
        setFinishingRFQs(prev => {
          if (prev.some(x => x.id === r.id)) return prev; // dedup client's own submission
          return [normalizeRFQ(r), ...prev];
        });
        // Only notify finishing company users about others' requests
        if (user?.role === 'finishing_co' && r.client_id !== user?.id) {
          toast(
            r.urgent
              ? `طلب عرض سعر عاجل 🚨 — ${r.city} (${r.area} م²)`
              : `طلب عرض سعر جديد — ${r.city}`,
            { icon: '📋', duration: r.urgent ? 8000 : 5000 }
          );
        }
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user]);

  // ── Supabase: load finishing bids for this company ──────────────────────────
  useEffect(() => {
    if (!isConfigured || !user) return;
    supabase
      .from('finishing_bids')
      .select('*')
      .eq('company_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (!data?.length) return;
        setFinishingBids(data.map(b => ({
          id:            b.id,
          rfqId:         b.rfq_id,
          companyId:     b.company_id,
          companyName:   b.company_name,
          price:         Number(b.price),
          durationWeeks: b.duration_weeks,
          notes:         b.notes,
          date:          formatDate(b.created_at),
        })));
      });
  }, [user]);

  // ── Supabase: load finishing companies ──────────────────────────────────────
  useEffect(() => {
    if (!isConfigured) return;
    supabase.from('companies').select('*').eq('is_active', true)
      .then(({ data, error }) => {
        if (error) { console.error('[GlobalContext] companies fetch:', error.message); return; }
        if (!data?.length) return;
        setFinishingCompanies(data.map(c => ({
          id:          c.id,
          name:        c.name,
          city:        c.city || '',
          badge:       c.badge || 'قيد التحقق',
          specs:       c.specializations || [],
          description: c.description || '',
          phone:       c.phone || '',
          email:       c.email || '',
          website:     c.website || '',
          priceRange:  { tier: c.price_range_tier || 'mid' },
          rating:      c.rating || 0,
          projects:    c.projects_count || 0,
          logo:        c.logo_url || null,
        })));
      })
      .catch(err => console.error('[GlobalContext] companies fetch:', err));
  }, []);

  // ── Supabase: load studies ───────────────────────────────────────────────────
  useEffect(() => {
    if (!isConfigured) return;
    supabase.from('studies').select('*').eq('is_published', true).order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) { console.error('[GlobalContext] studies fetch:', error.message); return; }
        if (!data?.length) return;
        setStudiesList(data.map(s => ({
          id:       s.id,
          title:    s.title,
          city:     s.city || '',
          type:     s.type || '',
          author:   s.author || '',
          summary:  s.summary || '',
          content:  s.content || '',
          category: s.category || 'دراسة جدوى',
          date:     s.created_at ? s.created_at.slice(0, 10) : '',
        })));
      })
      .catch(err => console.error('[GlobalContext] studies fetch:', err));
  }, []);

  // ── Supabase: load developers ────────────────────────────────────────────────
  useEffect(() => {
    if (!isConfigured) return;
    supabase.from('developers').select('*').eq('is_active', true)
      .then(({ data, error }) => {
        if (error) { console.error('[GlobalContext] developers fetch:', error.message); return; }
        if (!data?.length) return;
        setDevelopers(data.map(d => ({
          id:             d.id,
          name:           d.name,
          city:           d.city || '',
          type:           d.type || '',
          status:         d.status || '',
          founded:        d.founded_year || '',
          description:    d.description || '',
          phone:          d.phone || '',
          email:          d.email || '',
          logo:           d.logo_url || null,
          completedCount: d.projects_completed || 0,
          verified:       true,
        })));
      })
      .catch(err => console.error('[GlobalContext] developers fetch:', err));
  }, []);

  // ── Supabase: load investor_projects ────────────────────────────────────────
  useEffect(() => {
    if (!isConfigured) return;
    supabase.from('investor_projects').select('*')
      .then(({ data, error }) => {
        if (error) { console.error('[GlobalContext] investor_projects fetch:', error.message); return; }
        if (!data?.length) return;
        setInvestmentProjects(data.map(p => ({
          id:          p.id,
          title:       p.name || p.title,
          name:        p.name || p.title,
          city:        p.city || '',
          type:        p.type || '',
          status:      p.status || 'active',
          irr:         p.irr != null ? Number(p.irr) : null,
          roi:         p.roi != null ? Number(p.roi) : null,
          tier:        p.tier || 'Gold',
          vip:         p.vip ?? true,
          size:        p.size || '',
          tags:        p.tags || [],
          locked:      p.locked ?? false,
          description: p.description || '',
        })));
      })
      .catch(err => console.error('[GlobalContext] investor_projects fetch:', err));
  }, []);

  const pushCrossHint = (hint) => {
    setCrossHint(hint);
    setTimeout(() => setCrossHint(null), 9000);
  };
  const clearCrossHint = () => setCrossHint(null);

  // Sponsorship Actions
  const toggleSponsorship = (id) => {
    setSponsorships(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  const incrementSponsorshipClicks = (id) => {
    setSponsorships(prev => prev.map(s => s.id === id ? { ...s, clicks: s.clicks + 1 } : s));
  };

  const updateSponsorship = (id, updatedFields) => {
    setSponsorships(prev => prev.map(s => s.id === id ? { ...s, ...updatedFields } : s));
  };

  // Existing Actions
  const addTender = (tender) => setTenders(prev => [{ ...tender, id: Date.now() }, ...prev]);
  const updateProjectProgress = (id, progress) => setProjects(prev => prev.map(p => p.id === id ? { ...p, progress } : p));
  const addJob = (job) => setJobs(prev => [{ ...job, id: 'j' + Date.now() }, ...prev]);
  const updateLeadStatus = (id, status) => setCrmLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
  const addProperty = (prop) => setProperties(prev => [{ ...prop, id: Date.now() }, ...prev]);
  const updatePropertyStatus = (id, status) => setProperties(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  const updateTaskProgress = (taskId, progress, status) =>
    setGanttTasks(prev => prev.map(t => t.id === taskId ? { ...t, progress, status } : t));

  // Wallet Actions
  const depositToWallet = (amount, method) => {
    const absAmt = Math.abs(amount);
    const dateStr = new Date().toLocaleDateString('ar-SY', { day: '2-digit', month: 'long', year: 'numeric' });
    const trx = {
      id: 'TRX-' + Date.now(), type: 'deposit',
      title: `إيداع بانتظار التأكيد — ${method}`, category: 'funding',
      projectId: null, amount: absAmt, status: 'pending',
      date: dateStr, timestamp: Date.now(),
    };
    setWallet(prev => ({ ...prev, transactions: [trx, ...prev.transactions] }));
    if (isConfigured && user) {
      supabase.from('wallet_transactions').insert({
        user_id: user.id, type: 'deposit', title: trx.title,
        category: 'funding', amount: absAmt, status: 'pending',
      }).catch(err => console.error('[depositToWallet]', err));
    }
  };

  const withdrawFromWallet = (amount, method, details) => {
    const absAmt = Math.abs(amount);
    const dateStr = new Date().toLocaleDateString('ar-SY', { day: '2-digit', month: 'long', year: 'numeric' });
    const trx = {
      id: 'TRX-' + Date.now(), type: 'withdrawal',
      title: `سحب — ${method}`, category: 'funding',
      projectId: null, amount: -absAmt, status: 'completed',
      date: dateStr, timestamp: Date.now(), details,
    };
    setWallet(prev => ({ ...prev, totalBalance: prev.totalBalance - absAmt, transactions: [trx, ...prev.transactions] }));
    if (isConfigured && user) {
      supabase.from('wallet_transactions').insert({
        user_id: user.id, type: 'withdrawal', title: trx.title,
        category: 'funding', amount: -absAmt, status: 'completed',
        details: details ? JSON.stringify(details) : null,
      });
    }
  };

  const investInProject = (projectId, amount) => {
    const proj = investmentProjects.find(p => p.id === projectId);
    const sharePrice = proj?.minInvest || 1000;
    const shares = amount / sharePrice;
    const absAmt = Math.abs(amount);
    const now = Date.now();
    const dateStr = new Date().toLocaleDateString('ar-SY', { day: '2-digit', month: 'long', year: 'numeric' });

    const trx = {
      id: 'TRX-' + now, type: 'escrow_hold',
      title: `حجز أموال - ${proj?.title || 'مشروع'}`, category: 'real_estate',
      projectId, amount: -absAmt, status: 'pending', date: dateStr, timestamp: now,
    };
    setWallet(prev => ({ ...prev, escrowBalance: prev.escrowBalance + absAmt, transactions: [trx, ...prev.transactions] }));
    setInvestmentProjects(prev => prev.map(p => p.id === projectId ? { ...p, raised: p.raised + absAmt } : p));
    setInvestments(prev => [{
      id: 'inv-rec-' + now, projectId, amount: absAmt,
      shares, sharePrice, date: dateStr, timestamp: now, status: 'escrow', locked: true,
    }, ...prev]);
    if (isConfigured && user) {
      supabase.from('wallet_transactions').insert({
        user_id: user.id, type: 'escrow_hold', title: trx.title,
        category: 'real_estate', project_id: String(projectId), amount: -absAmt, status: 'pending',
      });
      supabase.from('investments').insert({
        user_id: user.id, project_id: String(projectId),
        amount: absAmt, shares, share_price: sharePrice, status: 'escrow', locked: true,
      });
    }
  };

  const updateTransactionStatus = (txId, status) => {
    setWallet(prev => {
      const trx = prev.transactions.find(t => t.id === txId);
      const released = trx && status === 'completed' ? Math.abs(trx.amount) : 0;
      return {
        ...prev,
        escrowBalance: Math.max(0, prev.escrowBalance - released),
        transactions: prev.transactions.map(t => t.id === txId ? { ...t, status } : t),
      };
    });
    if (isConfigured && user) {
      supabase.from('wallet_transactions').update({ status }).eq('id', txId).eq('user_id', user.id);
    }
  };

  // Finishing actions
  const addFinishingRFQ = async (rfq) => {
    if (isConfigured && user) {
      const { data, error } = await supabase.from('finishing_rfqs').insert({
        client_id: user.id, client_name: rfq.client || user.full_name,
        city: rfq.city, district: rfq.district, area: rfq.area,
        services: rfq.services, budget: rfq.budget,
        property_state: rfq.propertyState, description: rfq.description,
        urgent: rfq.urgent || false, status: 'جديد',
      }).select().single();
      if (!error && data) {
        setFinishingRFQs(prev => [{ ...rfq, id: data.id, date: 'الآن', status: 'جديد' }, ...prev]);
        return;
      }
    }
    setFinishingRFQs(prev => [{ ...rfq, id: Date.now() }, ...prev]);
  };

  const addFinishingBid = async (bid) => {
    const bidId = isConfigured ? null : 'bid-' + Date.now();
    if (isConfigured && user) {
      const { data } = await supabase.from('finishing_bids').insert({
        rfq_id: bid.rfqId, company_id: user.id,
        company_name: bid.companyName || user.full_name,
        price: bid.price, duration_weeks: bid.durationWeeks,
        notes: bid.notes, status: 'pending',
      }).select().single();
      if (data) {
        setFinishingBids(prev => [...prev, { ...bid, id: data.id, date: 'الآن' }]);
        await supabase.from('finishing_rfqs').update({ status: 'تم الرد' }).eq('id', bid.rfqId);
        setFinishingRFQs(prev => prev.map(r => r.id === bid.rfqId ? { ...r, status: 'تم الرد' } : r));
        return;
      }
    }
    setFinishingBids(prev => [...prev, { ...bid, id: bidId, date: 'الآن' }]);
    setFinishingRFQs(prev => prev.map(r => r.id === bid.rfqId ? { ...r, status: 'تم الرد' } : r));
  };

  const updateFinishingRFQStatus = (rfqId, status) => {
    setFinishingRFQs(prev => prev.map(r => r.id === rfqId ? { ...r, status } : r));
    if (isConfigured) {
      supabase.from('finishing_rfqs').update({ status }).eq('id', rfqId);
    }
  };

  const addFinishingProject = (project) => {
    setFinishingProjects(prev => [{ ...project, id: Date.now() }, ...prev]);
  };

  const updateFinishingProjectMilestone = (projectId, milestoneId, updates) => {
    setFinishingProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      const updatedMilestones = p.milestones.map(m => m.id === milestoneId ? { ...m, ...updates } : m);
      const totalProgress = updatedMilestones.reduce((acc, m) => acc + m.progress, 0);
      const avgProgress = Math.round(totalProgress / updatedMilestones.length);
      return { ...p, milestones: updatedMilestones, progress: avgProgress };
    }));
  };

  const addFinishingProjectMedia = (projectId, mediaItem) => {
    setFinishingProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      const newItem = { ...mediaItem, id: Date.now(), date: new Date().toISOString().slice(0, 10) };
      return { ...p, media: [newItem, ...p.media] };
    }));
  };

  const addFinishingProjectMessage = (projectId, msg) => {
    setFinishingProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      const newMsg = {
        id: Date.now(),
        date: new Date().toISOString().slice(0, 10),
        time: new Date().toTimeString().slice(0, 5),
        ...msg
      };
      return { ...p, messages: [newMsg, ...p.messages] };
    }));
  };

  // ── Admin: add developer ────────────────────────────────────────────────────
  const addDeveloper = async (data) => {
    if (!isConfigured) return;
    const { data: row, error } = await supabase.from('developers').insert({
      name: data.name, city: data.city, type: data.type,
      founded_year: data.founded ? Number(data.founded) : null,
      description: data.description, phone: data.phone, email: data.email,
      logo_url: data.logo || null, projects_completed: 0, is_active: true,
    }).select().single();
    if (error) throw error;
    setDevelopers(prev => [{ ...data, id: row.id, verified: true, completedCount: 0 }, ...prev]);
    return row;
  };

  // ── Admin: add company ──────────────────────────────────────────────────────
  const addCompany = async (data) => {
    if (!isConfigured) return;
    const { data: row, error } = await supabase.from('companies').insert({
      name: data.name, city: data.city, description: data.description,
      phone: data.phone, email: data.email, website: data.website || null,
      specializations: data.specializations || [], badge: 'قيد التحقق',
      rating: 0, projects_count: 0, is_active: true,
    }).select().single();
    if (error) throw error;
    setFinishingCompanies(prev => [{ ...data, id: row.id, badge: 'قيد التحقق', rating: 0 }, ...prev]);
    return row;
  };

  // ── Admin: add study ─────────────────────────────────────────────────────────
  const addStudy = async (data) => {
    if (!isConfigured) return;
    const { data: row, error } = await supabase.from('studies').insert({
      title: data.title, city: data.city, type: data.type,
      author: data.author, summary: data.summary, content: data.content || '',
      category: data.category || 'دراسة جدوى', is_published: true,
    }).select().single();
    if (error) throw error;
    setStudiesList(prev => [{ ...data, id: row.id, date: new Date().toISOString().slice(0, 10) }, ...prev]);
    return row;
  };

  return (
    <GlobalContext.Provider value={{
      developers, projects, jobs, engineers, tenders, crmLeads, properties, propertiesLoading,
      investmentProjects, wallet, investments, ganttTasks,
      marketData: MARKET_DATA,
      addTender, updateProjectProgress, addJob, updateLeadStatus, addProperty, updatePropertyStatus,
      depositToWallet, withdrawFromWallet, investInProject, updateTransactionStatus, updateTaskProgress,
      crossHint, pushCrossHint, clearCrossHint,
      finishingRFQs, finishingBids, finishingProjects, sypExchangeRate,
      addFinishingRFQ, addFinishingBid, updateFinishingRFQStatus, addFinishingProject,
      updateFinishingProjectMilestone, addFinishingProjectMedia, addFinishingProjectMessage,
      setSypExchangeRate,
      finishingCompanies, setFinishingCompanies,
      addDeveloper, addCompany, addStudy,
      lowBandwidthMode, setLowBandwidthMode,
      sponsorships, toggleSponsorship, incrementSponsorshipClicks, updateSponsorship,
      users, setUsers,
      machineryList, setMachineryList,
      studiesList, setStudiesList,
      clearingList, setClearingList,
      valuationsList, setValuationsList,
    }}>
      {children}
    </GlobalContext.Provider>
  );
}

export function useGlobalData() {
  return useContext(GlobalContext);
}
