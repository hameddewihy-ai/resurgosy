import { useState, useEffect } from 'react';

const KEY = 'resurgo-compare';
const MAX = 3;

function load() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}

export function useCompare() {
  const [items, setItems] = useState(load);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  const toggle = (property) => {
    setItems((prev) => {
      const exists = prev.find((p) => p.id === property.id);
      if (exists) return prev.filter((p) => p.id !== property.id);
      if (prev.length >= MAX) return prev;
      return [...prev, property];
    });
  };

  const remove = (id) => setItems((prev) => prev.filter((p) => p.id !== id));
  const clear  = ()   => setItems([]);
  const has    = (id) => items.some((p) => p.id === id);

  return { items, toggle, remove, clear, has, count: items.length, maxed: items.length >= MAX };
}
