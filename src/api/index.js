/**
 * RESURGO API Layer — v1.0
 *
 * All data access goes through these functions.
 * Today they return mock data synchronously wrapped in resolved promises.
 * When a real backend is ready, swap the body of each function — callers
 * don't change because the contract (function name + return shape) stays the same.
 *
 * URL contract (for future backend):
 *   Base URL  →  https://api.resurgosy.com/v1
 *   Auth      →  Bearer token in Authorization header
 *   Format    →  JSON, application/json
 */

export { propertiesApi } from './properties';
export { engineersApi }  from './engineers';
export { marketApi }     from './market';
export { jobsApi }       from './jobs';
export { developersApi } from './developers';
