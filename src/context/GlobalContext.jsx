import React, { createContext, useContext, useState, useEffect } from 'react';

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
  INITIAL_VALUATIONS_SEED
} from '../data/mockDatabase';

// ── Context Setup ─────────────────────────────────────────────────────────────

const GlobalContext = createContext();


function lsGet(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}

export function GlobalProvider({ children }) {
  const [developers] = useState(INITIAL_DEVELOPERS);
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [jobs, setJobs] = useState(INITIAL_JOBS);
  const [engineers] = useState(INITIAL_ENGINEERS);
  const [tenders, setTenders] = useState(INITIAL_TENDERS);
  const [crmLeads, setCrmLeads] = useState(INITIAL_CRM_LEADS);
  const [properties, setProperties] = useState(INITIAL_PROPERTIES);
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

  useEffect(() => {
    if (lowBandwidthMode) {
      document.body.classList.add('low-bandwidth');
    } else {
      document.body.classList.remove('low-bandwidth');
    }
  }, [lowBandwidthMode]);

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
    const trx = {
      id: 'TRX-' + Date.now(),
      type: 'deposit',
      title: `إيداع — ${method}`,
      category: 'funding',
      projectId: null,
      amount: Math.abs(amount),
      status: 'completed',
      date: new Date().toLocaleDateString('ar-SY', { day: '2-digit', month: 'long', year: 'numeric' }),
      timestamp: Date.now(),
    };
    setWallet(prev => ({
      ...prev,
      totalBalance: prev.totalBalance + Math.abs(amount),
      transactions: [trx, ...prev.transactions],
    }));
  };

  const withdrawFromWallet = (amount, method, details) => {
    const trx = {
      id: 'TRX-' + Date.now(),
      type: 'withdrawal',
      title: `سحب — ${method}`,
      category: 'funding',
      projectId: null,
      amount: -Math.abs(amount),
      status: 'completed',
      date: new Date().toLocaleDateString('ar-SY', { day: '2-digit', month: 'long', year: 'numeric' }),
      timestamp: Date.now(),
      details
    };
    setWallet(prev => ({
      ...prev,
      totalBalance: prev.totalBalance - Math.abs(amount),
      transactions: [trx, ...prev.transactions],
    }));
  };

  const investInProject = (projectId, amount) => {
    const proj = investmentProjects.find(p => p.id === projectId);
    const sharePrice = proj?.minInvest || 1000;
    const shares = amount / sharePrice;
    const now = Date.now();
    const dateStr = new Date().toLocaleDateString('ar-SY', { day: '2-digit', month: 'long', year: 'numeric' });

    const trx = {
      id: 'TRX-' + now,
      type: 'escrow_hold',
      title: `حجز أموال - ${proj?.title || 'مشروع'}`,
      category: 'real_estate',
      projectId,
      amount: -Math.abs(amount),
      status: 'pending',
      date: dateStr,
      timestamp: now,
    };
    setWallet(prev => ({
      ...prev,
      escrowBalance: prev.escrowBalance + Math.abs(amount),
      transactions: [trx, ...prev.transactions],
    }));
    setInvestmentProjects(prev =>
      prev.map(p => p.id === projectId ? { ...p, raised: p.raised + Math.abs(amount) } : p)
    );
    setInvestments(prev => [{
      id: 'inv-rec-' + now,
      projectId,
      amount: Math.abs(amount),
      shares,
      sharePrice,
      date: dateStr,
      timestamp: now,
      status: 'escrow',
      locked: true,
    }, ...prev]);
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
  };

  // Finishing actions
  const addFinishingRFQ = (rfq) => {
    setFinishingRFQs(prev => [{ ...rfq, id: Date.now() }, ...prev]);
  };

  const addFinishingBid = (bid) => {
    const bidId = 'bid-' + Date.now();
    setFinishingBids(prev => [...prev, { ...bid, id: bidId, date: 'الآن' }]);
    setFinishingRFQs(prev => prev.map(r => r.id === bid.rfqId ? { ...r, status: 'تم الرد' } : r));
  };

  const updateFinishingRFQStatus = (rfqId, status) => {
    setFinishingRFQs(prev => prev.map(r => r.id === rfqId ? { ...r, status } : r));
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

  return (
    <GlobalContext.Provider value={{
      developers, projects, jobs, engineers, tenders, crmLeads, properties,
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
