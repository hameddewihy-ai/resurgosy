/**
 * Developers API — mock implementation
 * Future: replace with fetch() to /v1/developers
 */
import { INITIAL_DEVELOPERS, INITIAL_PROJECTS, enrichRecords } from '../data/mockDatabase';

const DEVELOPERS = enrichRecords('dev', INITIAL_DEVELOPERS);
const PROJECTS   = enrichRecords('proj', INITIAL_PROJECTS);
const ok  = (data, meta = {}) => Promise.resolve({ data, meta, error: null });
const err = (message, code = 400) => Promise.resolve({ data: null, meta: {}, error: { message, code } });

export const developersApi = {
  list(filters = {}) {
    let results = [...DEVELOPERS];
    const { city, verifiedOnly, specialty } = filters;
    if (city)        results = results.filter(d => d.city === city);
    if (verifiedOnly) results = results.filter(d => d.verified);
    if (specialty)   results = results.filter(d => d.specialty?.includes(specialty));
    return ok(results, { total: results.length });
  },

  get(id) {
    const dev = DEVELOPERS.find(d => d.uuid === id || d.id === Number(id));
    if (!dev) return err('Developer not found', 404);
    const projects = PROJECTS.filter(p => p.developerId === dev.id);
    return ok({ ...dev, projects });
  },

  projects(filters = {}) {
    let results = [...PROJECTS];
    const { city, type, status } = filters;
    if (city)   results = results.filter(p => p.city === city);
    if (type)   results = results.filter(p => p.type === type);
    if (status) results = results.filter(p => p.status === status);
    return ok(results, { total: results.length });
  },
};
