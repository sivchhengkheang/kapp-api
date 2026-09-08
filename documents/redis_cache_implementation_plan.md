# Redis Cache Implementation Plan — kapp-api

> **Updated based on your feedback** — local Redis first, longer TTLs, 30-min auth cache, game sessions cached.

## Background

**kapp-api** is a Node.js/Express REST API (ESM modules) backed by MongoDB/Mongoose. It serves **7 game domains**:

| Domain | Key Resources |
|--------|--------------|
| Auth | UserAccount, AuthSession, LoginHistory |
| Shared | Leaderboard, UserStatistic, Achievement |
| Koompi Typing | TypingUnit, TypingLesson, LessonContentItem, GameSession, Leaderboard, Progress, Streak, Heatmap |
| Mouse Master | SkillCategory, MouseLevel, GameMode, GameSession, Progress, Badge, Leaderboard |
| Dragon Drop | World, Level, MapPiece, Boss, GameSession, Leaderboard |
| Link Number | PuzzleBoard, GameSession, BoardProgress, DailyChallenge, Leaderboard |
| Robot Brainiac | Level, GameSession, LevelAttempt, RobotType |
| Typing Math | MathProblem, GameSession, DailyChallenge, ProblemAttempt |
| Typing Code | Challenge, GameSession, Inventory |

**Current stack:** Express 5, Mongoose 9, Node 18+, ESM (`"type": "module"`), dotenvx.

---

## Proposed Changes

### Architecture Overview

```
Client → Express Route → Cache Middleware (Redis)
                               ↓ MISS
                          Controller → MongoDB
                               ↓
                          Store in Redis (TTL)
                               ↓
                          Return Response
```

On **write/mutation** (POST/PUT/PATCH/DELETE): invalidate related Redis keys.

---

### Phase 1 — Foundation

#### [NEW] `src/config/redisClient.js`
Singleton `ioredis` client with:
- Connection using `REDIS_URL` env var (fallback to `localhost:6379`)
- Graceful error handling (log error, **don't crash** — Redis being unavailable should not kill the API)
- `connect`, `disconnect`, `isReady` helper exports

#### [MODIFY] `.env`
Add:
```
# Local Redis (default). Swap to Upstash URL when ready to deploy.
REDIS_URL=redis://localhost:6379
REDIS_CACHE_TTL=3600
```

> **Migration path to Upstash:** When ready, simply change `REDIS_URL` to your Upstash connection string (`rediss://:password@host:port`). No code changes needed.

#### [MODIFY] `package.json`
Add `ioredis` dependency:
```json
"ioredis": "^5.x"
```

#### [MODIFY] `src/server.js`
Import and initialize Redis client on startup, log connection status alongside MongoDB.

---

### Phase 2 — Cache Utility Layer

#### [NEW] `src/utils/cache.js`
A clean utility module wrapping `ioredis`:

```js
// get(key)           → parsed JSON or null
// set(key, value, ttl)  → stores JSON, default TTL from env
// del(key | key[])   → deletes one or many keys
// delPattern(pattern) → scans and deletes keys matching glob pattern (e.g. "leaderboard:*")
// generateKey(...parts) → joins parts with ":" to form a namespaced key
```

---

### Phase 3 — Cache Middleware

#### [NEW] `src/middleware/cacheMiddleware.js`
A reusable Express middleware factory:

```js
export const cache = (keyFn, ttl) => async (req, res, next) => {
  const key = keyFn(req);
  const cached = await cacheUtil.get(key);
  if (cached) return res.json(cached);
  // Intercept res.json to store response in Redis before sending
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    if (res.statusCode === 200) cacheUtil.set(key, body, ttl);
    return originalJson(body);
  };
  next();
};
```

Usage on a router:
```js
router.get('/', cache(req => `units:${req.query.language || 'all'}`, 600), getAllUnits);
```

---

### Phase 4 — Apply Cache to High-Value Endpoints

Apply Redis caching **only to GET (read) endpoints** that are:
- Frequently accessed
- Expensive to compute (aggregations, JOINs)
- Relatively stable data (not real-time critical)

#### Priority 1 — Static/Slow-changing Content

These resources rarely change (game design data). Long TTLs are safe — cache is busted on any admin update.

| Route | Cache Key | TTL |
|-------|-----------|-----|
| `GET /api/koompi-typing/units` | `typing:units:<language>` | **1 hour** |
| `GET /api/koompi-typing/units/:id` | `typing:unit:<id>` | **1 hour** |
| `GET /api/koompi-typing/lessons` | `typing:lessons:<unitId>` | **1 hour** |
| `GET /api/koompi-typing/content-items` | `typing:content:<lessonId>` | **1 hour** |
| `GET /api/koompi-typing/modes` | `typing:modes` | **2 hours** |
| `GET /api/mouse-master/categories` | `mouse:categories` | **2 hours** |
| `GET /api/mouse-master/levels` | `mouse:levels:<categoryId>` | **1 hour** |
| `GET /api/mouse-master/modes` | `mouse:modes` | **2 hours** |
| `GET /api/dragon-drop/worlds` | `dragon:worlds` | **2 hours** |
| `GET /api/dragon-drop/levels/:n` | `dragon:level:<n>` | **1 hour** |
| `GET /api/robot-brainiac/levels` | `robot:levels` | **1 hour** |
| `GET /api/robot-brainiac/robots` | `robot:types` | **2 hours** |
| `GET /api/link-number/puzzles` | `link:puzzles:<difficulty>` | **1 hour** |
| `GET /api/typing-code/challenges` | `typingcode:challenges` | **1 hour** |

#### Priority 2 — Leaderboards (computed, refreshed periodically)

| Route | Cache Key | TTL |
|-------|-----------|-----|
| `GET /api/shared/leaderboard` | `shared:leaderboard:<boardType>:<period>` | **15 min** |
| `GET /api/koompi-typing/leaderboards` | `typing:leaderboard:<boardType>:<lang>` | **15 min** |
| `GET /api/mouse-master/leaderboards` | `mouse:leaderboard:<boardType>` | **15 min** |
| `GET /api/dragon-drop/leaderboards` | `dragon:leaderboard` | **15 min** |
| `GET /api/link-number/leaderboards` | `link:leaderboard:<boardType>` | **15 min** |

#### Priority 3 — User Profile / Stats (per-user)

Users can play for hours, so TTLs are extended to reduce DB load throughout a session.

| Route | Cache Key | TTL |
|-------|-----------|-----|
| `GET /api/auth/me` | `user:me:<userId>` | **30 min** |
| `GET /api/shared/statistics/:userId` | `shared:stats:<userId>` | **20 min** |
| `GET /api/koompi-typing/progress` | `typing:progress:<userId>` | **20 min** |
| `GET /api/koompi-typing/streaks` | `typing:streak:<userId>` | **20 min** |
| `GET /api/koompi-typing/heatmap` | `typing:heatmap:<userId>` | **20 min** |
| `GET /api/mouse-master/progress` | `mouse:progress:<userId>` | **20 min** |
| `GET /api/link-number/progress` | `link:progress:<userId>` | **20 min** |

#### Priority 4 — Game Sessions (active)

Game sessions are cached for the duration of a play session. Cache is invalidated immediately when the session is completed or updated.

| Route | Cache Key | TTL |
|-------|-----------|-----|
| `GET /api/*/sessions/:id` | `session:<domain>:<sessionId>` | **30 min** |
| `GET /api/koompi-typing/sessions/:id` | `session:typing:<sessionId>` | **30 min** |
| `GET /api/mouse-master/sessions/:id` | `session:mouse:<sessionId>` | **30 min** |
| `GET /api/dragon-drop/sessions/:id` | `session:dragon:<sessionId>` | **30 min** |
| `GET /api/link-number/sessions/:id` | `session:link:<sessionId>` | **30 min** |
| `GET /api/robot-brainiac/sessions/:id` | `session:robot:<sessionId>` | **30 min** |

> Cache is **immediately busted** on `PATCH`/`PUT` (session update) and when session status changes to `completed`.

#### Endpoints NOT cached (mutations / auth flows)
- All `POST`, `PUT`, `PATCH`, `DELETE`
- Auth endpoints (login, logout, refresh, forgot-password)
- Keystroke events (write-heavy, real-time streaming data)

---

### Phase 5 — Cache Invalidation Strategy

When a **write** occurs, invalidate the relevant cache keys.

| Trigger | Keys to Invalidate |
|---------|-------------------|
| Unit/Lesson created or updated | `typing:units:*`, `typing:unit:<id>`, `typing:lessons:<unitId>` |
| Leaderboard recomputed | `typing:leaderboard:*`, `mouse:leaderboard:*`, etc. |
| User stats updated | `shared:stats:<userId>` |
| User profile updated | `user:me:<userId>` |
| Dragon world/level updated | `dragon:worlds`, `dragon:level:<n>` |

Implemented by calling `cache.del(key)` or `cache.delPattern(pattern)` at the end of mutation controllers.

---

### Phase 6 — Auth Middleware Optimization (optional bonus)

The `protect` middleware currently does a **MongoDB query on every authenticated request** to verify user status. We can cache the user object short-term:

**[MODIFY] `src/middleware/authMiddleware.js`**
- On first lookup: fetch from MongoDB → store in `user:auth:<userId>` with TTL = **30 min**
- On subsequent requests within 30 min: serve user object from Redis (zero DB queries)
- On logout, ban, or password change: **immediately delete** `user:auth:<userId>` from Redis

> [!NOTE]
> 30-minute TTL is intentional — users can play for 1+ hour sessions. The cache is force-cleared on logout/ban, so security is maintained. Normal gameplay avoids repeated DB hits entirely.

---

## File Summary

| File | Action | Purpose |
|------|--------|---------|
| `src/config/redisClient.js` | **NEW** | ioredis singleton client |
| `src/utils/cache.js` | **NEW** | get/set/del/delPattern helpers |
| `src/middleware/cacheMiddleware.js` | **NEW** | Reusable route-level cache middleware |
| `src/server.js` | **MODIFY** | Initialize Redis on startup |
| `.env` | **MODIFY** | Add `REDIS_URL`, `REDIS_CACHE_TTL` |
| `package.json` | **MODIFY** | Add `ioredis` dependency |
| `src/controllers/koompi-typing/*.js` | **MODIFY** | Add cache + invalidation |
| `src/controllers/mouse-master/*.js` | **MODIFY** | Add cache + invalidation |
| `src/controllers/dragon-drop/*.js` | **MODIFY** | Add cache + invalidation |
| `src/controllers/link-number/*.js` | **MODIFY** | Add cache + invalidation |
| `src/controllers/robot-brainiac/*.js` | **MODIFY** | Add cache + invalidation |
| `src/controllers/shared/*.js` | **MODIFY** | Add cache + invalidation |
| `src/middleware/authMiddleware.js` | **MODIFY** | Cache user auth lookup (optional) |
| `src/routers/**/*.js` | **MODIFY** | Attach cache middleware to GET routes |

---

## Decisions Made (from your feedback)

| # | Question | Decision |
|---|----------|----------|
| 1 | Redis instance | **Local Redis first** (`localhost:6379`). Swap to Upstash URL later — zero code change needed |
| 2 | Auth cache duration | **30 minutes** — covers full play sessions; cache busted immediately on logout/ban |
| 3 | TTL preferences | **Increased significantly** — static: 1-2 hrs, leaderboard: 15 min, user: 20-30 min |
| 4 | Game sessions | **Always cache** — 30-min TTL, busted on session update/completion |

---

## Verification Plan

### Automated
```bash
# Install and verify ioredis
npm install ioredis

# Start Redis (if local)
redis-server

# Start API
npm run dev

# Test cache hit/miss
curl http://localhost:3000/api/koompi-typing/units  # miss → MongoDB
curl http://localhost:3000/api/koompi-typing/units  # hit  → Redis (faster)

# Monitor Redis keys
redis-cli KEYS "*"
redis-cli TTL "typing:units:all"
```

### Manual Verification
- Check response time difference between first (cache miss) and second (cache hit) request using browser DevTools / Postman
- Verify that after a POST/PUT/DELETE, the next GET fetches fresh data (cache invalidated)
- Confirm that Redis being down does NOT crash the API (graceful degradation)
