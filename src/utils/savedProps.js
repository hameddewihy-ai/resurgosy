const KEY = 'resurgo-saved-props';

export const getSavedIds = () => {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
  catch { return []; }
};

export const isSavedProp = (id) => getSavedIds().includes(id);

export const toggleSavedProp = (id) => {
  const ids = getSavedIds();
  const next = ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id];
  localStorage.setItem(KEY, JSON.stringify(next));
  return { ids: next, added: !ids.includes(id) };
};
