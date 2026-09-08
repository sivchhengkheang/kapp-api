import { get, set } from '../utils/cache.js';

/**
 * Route-level cache middleware factory.
 *
 * Usage:
 *   router.get('/path', cache(req => `mykey:${req.params.id}`, TTL.STATIC), controller);
 *
 * @param {(req: import('express').Request) => string} keyFn
 *   A function that receives the request and returns the Redis cache key.
 * @param {number} ttl  TTL in seconds.
 */
export const cache = (keyFn, ttl) => async (req, res, next) => {
  const key = keyFn(req);

  // ── Cache HIT ─────────────────────────────────────────────────────────────
  const cached = await get(key);
  if (cached !== null) {
    // Attach a header so you can confirm cache hits during development/testing
    res.setHeader('X-Cache', 'HIT');
    return res.json(cached);
  }

  // ── Cache MISS — intercept res.json to store the response ─────────────────
  res.setHeader('X-Cache', 'MISS');
  const originalJson = res.json.bind(res);

  res.json = (body) => {
    // Only cache successful responses
    if (res.statusCode >= 200 && res.statusCode < 300) {
      set(key, body, ttl).catch(() => {}); // fire-and-forget; don't block response
    }
    return originalJson(body);
  };

  next();
};
