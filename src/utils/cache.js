import { getRedisClient, isRedisReady } from '../config/redisClient.js';

// ── Default TTL (seconds) ─────────────────────────────────────────────────────
const DEFAULT_TTL = parseInt(process.env.REDIS_CACHE_TTL || '3600', 10);

// ── TTL presets (seconds) ─────────────────────────────────────────────────────
export const TTL = {
  STATIC: 3600,       // 1 hour  — game content (levels, units, modes)
  LONG_STATIC: 7200,  // 2 hours — rarely-changing master data (categories, robot types)
  LEADERBOARD: 900,   // 15 min  — leaderboard snapshots
  USER: 1800,         // 30 min  — user profile / auth lookup
  USER_STATS: 1200,   // 20 min  — user stats, progress, streaks, heatmap
  USER_DATA: 1800,    // 30 min  — user inventory, settings
  DYNAMIC: 600,       // 10 min  — dynamic lists
  SESSION: 1800,      // 30 min  — active game sessions
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Build a namespaced Redis key.
 * Safely handles primitives, null/undefined, and plain objects (e.g. req.query).
 * @example generateKey('typing', 'units', { lang: 'en' }) → "typing:units:lang=en"
 */
export const generateKey = (...parts) =>
  parts
    .filter((p) => p !== undefined && p !== null && p !== '')
    .map((p) => {
      if (typeof p === 'object') {
        const keys = Object.keys(p).sort();
        if (keys.length === 0) return '';
        return keys.map((k) => `${k}=${p[k]}`).join('&');
      }
      return String(p);
    })
    .filter(Boolean)
    .join(':');

/**
 * Get a cached value.
 * @returns {Promise<any|null>} Parsed JSON value, or null on miss/error.
 */
export const get = async (key) => {
  if (!isRedisReady()) return null;
  try {
    const raw = await getRedisClient().get(key);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error(`[cache] get error (${key}): ${err.message}`);
    return null;
  }
};

/**
 * Store a value in Redis.
 * @param {string} key
 * @param {any} value  — will be JSON-serialised
 * @param {number} [ttl] — TTL in seconds (defaults to REDIS_CACHE_TTL env or 1 hour)
 */
export const set = async (key, value, ttl = DEFAULT_TTL) => {
  if (!isRedisReady()) return;
  try {
    await getRedisClient().setex(key, ttl, JSON.stringify(value));
  } catch (err) {
    console.error(`[cache] set error (${key}): ${err.message}`);
  }
};

/**
 * Delete one or more exact keys.
 * @param {string|string[]} keys
 */
export const del = async (keys) => {
  if (!isRedisReady()) return;
  try {
    const list = Array.isArray(keys) ? keys : [keys];
    if (list.length) await getRedisClient().del(...list);
  } catch (err) {
    console.error(`[cache] del error: ${err.message}`);
  }
};

/**
 * Delete all keys matching a glob pattern using SCAN (non-blocking).
 * @example delPattern('typing:units:*')
 */
export const delPattern = async (pattern) => {
  if (!isRedisReady()) return;
  try {
    const redis = getRedisClient();
    let cursor = '0';
    do {
      const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = nextCursor;
      if (keys.length) await redis.del(...keys);
    } while (cursor !== '0');
  } catch (err) {
    console.error(`[cache] delPattern error (${pattern}): ${err.message}`);
  }
};

export default { get, set, del, delPattern, generateKey, TTL };
