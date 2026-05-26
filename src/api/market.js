/**
 * Market Intelligence API — mock implementation
 * Future: replace with fetch() to /v1/market
 */
import {
  QUARTERLY_INDEX,
  LATEST_BY_CITY,
  RESIDENTIAL_TREND,
  COMPOSITE_INDEX,
  DAYS_ON_MARKET,
  RENTAL_YIELDS,
  REPORT_META,
} from '../data/marketIndex';

const ok  = (data, meta = {}) => Promise.resolve({ data, meta, error: null });

export const marketApi = {
  /** Full quarterly index (all cities, all types) */
  index(filters = {}) {
    let results = [...QUARTERLY_INDEX];
    const { city, type, fromPeriod } = filters;
    if (city)       results = results.filter(r => r.city === city);
    if (type)       results = results.filter(r => r.type === type);
    if (fromPeriod) results = results.filter(r => r.period >= fromPeriod);
    return ok(results, { total: results.length, ...REPORT_META });
  },

  /** Latest snapshot per city — for dashboard tiles */
  latest(filters = {}) {
    let results = [...LATEST_BY_CITY];
    if (filters.type) results = results.filter(r => r.type === filters.type);
    return ok(results, { count: results.length });
  },

  /** RESURGO composite price index (weighted residential) */
  compositeIndex() {
    return ok(COMPOSITE_INDEX, { description: 'مؤشر مركّب مرجّح للمناطق الرئيسية' });
  },

  /** Residential price trend for a specific city */
  trend(city) {
    const data = RESIDENTIAL_TREND.filter(r => r.city === city);
    return ok(data, { city });
  },

  /** Days on market estimates */
  daysOnMarket() {
    return ok(DAYS_ON_MARKET);
  },

  /** Rental yield estimates by city + type */
  rentalYields(filters = {}) {
    let results = [...RENTAL_YIELDS];
    if (filters.city) results = results.filter(r => r.city === filters.city);
    return ok(results);
  },

  /** Report metadata — used in PDF export header */
  reportMeta() {
    return ok(REPORT_META);
  },

  /**
   * Export full dataset as JSON (data licensing endpoint).
   * Future: requires API key in Authorization header.
   */
  exportDataset() {
    return ok({
      index:          QUARTERLY_INDEX,
      composite:      COMPOSITE_INDEX,
      days_on_market: DAYS_ON_MARKET,
      rental_yields:  RENTAL_YIELDS,
      meta:           REPORT_META,
    }, { format: 'json', schema_version: '1.0', records: QUARTERLY_INDEX.length });
  },
};
