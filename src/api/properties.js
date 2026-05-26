/**
 * Properties API — mock implementation
 * Future: replace fetch() calls pointing to /v1/properties
 */
import { ALL_PROPERTIES } from '../data/properties';

const ok = (data, meta = {}) => Promise.resolve({ data, meta, error: null });
const err = (message, code = 400) => Promise.resolve({ data: null, meta: {}, error: { message, code } });

export const propertiesApi = {
  /**
   * List properties with optional filters.
   * @param {Object} filters - { city, type, status, minPrice, maxPrice, verifiedOnly, page, limit }
   * @returns {Promise<{ data: Property[], meta: { total, page, limit } }>}
   */
  list(filters = {}) {
    let results = [...ALL_PROPERTIES];
    const { city, type, status, minPrice, maxPrice, verifiedOnly, property_class, page = 1, limit = 50 } = filters;

    if (city)          results = results.filter(p => p.city === city);
    if (type)          results = results.filter(p => p.type === type);
    if (status)        results = results.filter(p => p.status === status);
    if (minPrice)      results = results.filter(p => p.price >= minPrice);
    if (maxPrice)      results = results.filter(p => p.price <= maxPrice);
    if (verifiedOnly)  results = results.filter(p => p.verified);
    if (property_class) results = results.filter(p => p.property_class === property_class);

    const total = results.length;
    const start = (page - 1) * limit;
    const data  = results.slice(start, start + limit);
    return ok(data, { total, page, limit, pages: Math.ceil(total / limit) });
  },

  /**
   * Get a single property by uuid or numeric id.
   * @param {string|number} id
   */
  get(id) {
    const prop = ALL_PROPERTIES.find(p => p.uuid === id || p.id === Number(id));
    return prop ? ok(prop) : err('Property not found', 404);
  },

  /**
   * Get price_per_sqm statistics by city and type.
   * Used for Market Reports.
   */
  priceStats() {
    const byCityType = {};
    ALL_PROPERTIES
      .filter(p => p.price_per_sqm && p.status === 'للبيع')
      .forEach(p => {
        const key = `${p.city}::${p.type}`;
        if (!byCityType[key]) byCityType[key] = { city: p.city, type: p.type, values: [] };
        byCityType[key].values.push(p.price_per_sqm);
      });

    const stats = Object.values(byCityType).map(({ city, type, values }) => {
      const sorted = [...values].sort((a, b) => a - b);
      const avg    = Math.round(values.reduce((s, v) => s + v, 0) / values.length);
      const median = sorted[Math.floor(sorted.length / 2)];
      return { city, type, avg_price_sqm: avg, median_price_sqm: median, sample_size: values.length };
    });

    return ok(stats);
  },

  /**
   * Export all properties as a flat JSON array (for data licensing / API partners).
   * Strips owner contact info before returning.
   */
  export() {
    const safe = ALL_PROPERTIES.map(({ ownerName, ownerPhone, ...rest }) => rest);
    return ok(safe, { count: safe.length, format: 'json', schema_version: '1.0' });
  },
};
