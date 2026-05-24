import { useState, useEffect, useCallback } from 'react';
import { supabase, isConfigured } from '../lib/supabase';
import { INITIAL_NEWS, NEWS_LS_KEY, calcReadTime } from '../data/newsData';

// ── localStorage fallback helpers ─────────────────────────────────────────────
function lsLoad() {
  try { return JSON.parse(localStorage.getItem(NEWS_LS_KEY) || 'null') ?? INITIAL_NEWS; }
  catch { return INITIAL_NEWS; }
}
function lsSave(articles) {
  try { localStorage.setItem(NEWS_LS_KEY, JSON.stringify(articles)); } catch {}
}

// ── DB row → article object ────────────────────────────────────────────────────
function mapRow(row) {
  return {
    id:        row.id,
    cat:       row.category,
    urgency:   row.urgency  ?? 'info',
    source:    row.source   ?? 'resurgo',
    impacts:   row.impacts  ?? [],
    title:     row.title,
    summary:   row.summary   ?? '',
    body:      row.body      ?? '',
    image:     row.image     ?? '',
    author:    row.author    ?? 'فريق RESURGO',
    tags:      row.tags      ?? [],
    featured:  row.featured  ?? false,
    status:    row.status    ?? 'draft',
    readTime:  row.read_time ?? 3,
    date:      row.published_at ?? row.created_at?.slice(0, 10),
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
    updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : Date.now(),
  };
}

// ── article object → DB insert/update payload ─────────────────────────────────
function toRow(data) {
  return {
    title:        data.title,
    summary:      data.summary,
    body:         data.body,
    category:     data.cat,
    image:        data.image,
    author:       data.author,
    tags:         Array.isArray(data.tags) ? data.tags : [],
    featured:     data.featured  ?? false,
    status:       data.status    ?? 'draft',
    read_time:    calcReadTime(data.body),
    published_at: data.date || new Date().toISOString().slice(0, 10),
  };
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useNews() {
  const [articles, setArticles] = useState([]);
  const [loading,  setLoading]  = useState(true);

  // ── fetch ──────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    if (!isConfigured) {
      setArticles(lsLoad());
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('industry_news')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setArticles(data.map(mapRow));
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── localStorage updater (fallback mode) ───────────────────
  const lsUpdate = (updater) => {
    setArticles(prev => {
      const next = updater(prev);
      lsSave(next);
      return next;
    });
  };

  // ── addArticle ─────────────────────────────────────────────
  const addArticle = async (data) => {
    if (!isConfigured) {
      const article = { ...data, id: Date.now(), readTime: calcReadTime(data.body), createdAt: Date.now(), updatedAt: Date.now() };
      lsUpdate(prev => [article, ...prev]);
      return article;
    }
    const { data: row, error } = await supabase
      .from('industry_news')
      .insert([toRow(data)])
      .select()
      .single();
    if (error) throw error;
    const article = mapRow(row);
    setArticles(prev => [article, ...prev]);
    return article;
  };

  // ── updateArticle ──────────────────────────────────────────
  const updateArticle = async (id, data) => {
    if (!isConfigured) {
      lsUpdate(prev => prev.map(a =>
        a.id === id ? { ...a, ...data, readTime: calcReadTime(data.body ?? a.body), updatedAt: Date.now() } : a
      ));
      return;
    }
    const { data: row, error } = await supabase
      .from('industry_news')
      .update(toRow(data))
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    setArticles(prev => prev.map(a => a.id === id ? mapRow(row) : a));
  };

  // ── deleteArticle ──────────────────────────────────────────
  const deleteArticle = async (id) => {
    if (!isConfigured) {
      lsUpdate(prev => prev.filter(a => a.id !== id));
      return;
    }
    const { error } = await supabase.from('industry_news').delete().eq('id', id);
    if (error) throw error;
    setArticles(prev => prev.filter(a => a.id !== id));
  };

  // ── toggleStatus ───────────────────────────────────────────
  const toggleStatus = async (id) => {
    const article = articles.find(a => a.id === id);
    if (!article) return;
    const newStatus = article.status === 'published' ? 'draft' : 'published';

    if (!isConfigured) {
      lsUpdate(prev => prev.map(a =>
        a.id === id ? { ...a, status: newStatus, updatedAt: Date.now() } : a
      ));
      return;
    }
    const { data: row, error } = await supabase
      .from('industry_news')
      .update({ status: newStatus })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    setArticles(prev => prev.map(a => a.id === id ? mapRow(row) : a));
  };

  return { articles, loading, addArticle, updateArticle, deleteArticle, toggleStatus, refetch: fetchAll };
}
