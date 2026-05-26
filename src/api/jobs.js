/**
 * Jobs API — mock implementation
 * Future: replace with fetch() to /v1/jobs
 */
import { INITIAL_JOBS } from '../data/mockDatabase';
import { enrichRecords } from '../data/mockDatabase';

const JOBS = enrichRecords('job', INITIAL_JOBS);
const ok = (data, meta = {}) => Promise.resolve({ data, meta, error: null });
const err = (message, code = 400) => Promise.resolve({ data: null, meta: {}, error: { message, code } });

export const jobsApi = {
  /**
   * List jobs with optional filters.
   * @param {Object} filters - { spec, city, type, urgentOnly, page, limit }
   */
  list(filters = {}) {
    let results = [...JOBS];
    const { spec, city, type, urgentOnly, page = 1, limit = 20 } = filters;
    if (spec)       results = results.filter(j => j.spec === spec);
    if (city)       results = results.filter(j => j.city === city);
    if (type)       results = results.filter(j => j.type === type);
    if (urgentOnly) results = results.filter(j => j.urgent);

    const total = results.length;
    const start = (page - 1) * limit;
    return ok(results.slice(start, start + limit), { total, page, limit });
  },

  get(id) {
    const job = JOBS.find(j => j.uuid === id || j.id === id);
    return job ? ok(job) : err('Job not found', 404);
  },

  /**
   * Stats for market intelligence (spec demand, avg salary by city).
   */
  stats() {
    const bySpec = {};
    JOBS.forEach(j => {
      if (!bySpec[j.spec]) bySpec[j.spec] = { spec: j.spec, count: 0, urgent: 0 };
      bySpec[j.spec].count++;
      if (j.urgent) bySpec[j.spec].urgent++;
    });
    return ok(Object.values(bySpec).sort((a, b) => b.count - a.count));
  },
};
