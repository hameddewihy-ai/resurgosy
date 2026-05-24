const KEY   = 'resurgo-recently-viewed';
const LIMIT = 6;

export function addRecentlyViewed(property) {
  try {
    const prev = getRecentlyViewed();
    const next = [
      { id: property.id, title: property.title, city: property.city,
        priceDisplay: property.priceDisplay, status: property.status,
        image: property.images?.[0] ?? property.image, rating: property.rating },
      ...prev.filter(p => p.id !== property.id),
    ].slice(0, LIMIT);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch { /* silent */ }
}

export function getRecentlyViewed() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
  catch { return []; }
}
