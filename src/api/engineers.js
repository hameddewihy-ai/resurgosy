/**
 * Engineers / Appraisers API — mock implementation
 * Future: replace with fetch() to /v1/engineers
 */
import { INITIAL_ENGINEERS } from '../data/mockDatabase';
import { enrichRecords } from '../data/mockDatabase';

const ENGINEERS = enrichRecords('eng', INITIAL_ENGINEERS);
const ok = (data, meta = {}) => Promise.resolve({ data, meta, error: null });
const err = (message, code = 400) => Promise.resolve({ data: null, meta: {}, error: { message, code } });

export const engineersApi = {
  /**
   * List engineers with optional filters.
   * @param {Object} filters - { spec, city, verifiedOnly, availableOnly }
   */
  list(filters = {}) {
    let results = [...ENGINEERS];
    const { spec, city, verifiedOnly, availableOnly } = filters;
    if (spec)          results = results.filter(e => e.spec === spec);
    if (city)          results = results.filter(e => e.city === city);
    if (verifiedOnly)  results = results.filter(e => e.verified);
    if (availableOnly) results = results.filter(e => e.available);
    return ok(results, { total: results.length });
  },

  /**
   * Get a single engineer by uuid or legacy id (e001, etc).
   */
  get(id) {
    const eng = ENGINEERS.find(e => e.uuid === id || e.id === id);
    return eng ? ok(eng) : err('Engineer not found', 404);
  },

  /**
   * Verify an engineer's credentials (stub — real impl calls niqaba API).
   * @param {string} license_no
   */
  verifyLicense(license_no) {
    const eng = ENGINEERS.find(e => e.license_no === license_no);
    if (eng) return ok({ verified: true, engineer: eng });
    return ok({ verified: false, engineer: null });
  },
};
