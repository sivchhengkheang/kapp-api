import Redis from 'ioredis';

// ── Redis Singleton ───────────────────────────────────────────────────────────
// Graceful: if Redis is unavailable the API continues to work without caching.

let client = null;
let _isReady = false;

export const connectRedis = () => {
  if (client) return client;

  client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    // Reconnect with increasing delays, up to 10 s
    retryStrategy: (times) => Math.min(times * 200, 10_000),
    // Don't throw on command errors when Redis is down
    enableOfflineQueue: false,
    maxRetriesPerRequest: 1,
    lazyConnect: true,
  });

  client.on('connect', () => {
    _isReady = true;
    console.log('✅ Connected to Redis');
  });

  client.on('ready', () => {
    _isReady = true;
  });

  client.on('error', (err) => {
    _isReady = false;
    // Log but don't crash — the API degrades gracefully without Redis
    console.error(`⚠️  Redis error: ${err.message}`);
  });

  client.on('close', () => {
    _isReady = false;
  });

  client.connect().catch((err) => {
    console.error(`⚠️  Redis initial connection failed: ${err.message} — continuing without cache`);
  });

  return client;
};

export const getRedisClient = () => client;

export const isRedisReady = () => _isReady;

export const disconnectRedis = async () => {
  if (client) {
    await client.quit();
    client = null;
    _isReady = false;
  }
};
