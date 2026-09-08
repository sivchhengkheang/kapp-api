# Kapp API

Kapp API is the unified backend service powering a suite of educational and puzzle games, including:

- **KOOMPI Typing**: A touch-typing learning platform featuring units, lessons, keyboard heatmaps, streaks, and speed leaderboards.
- **Mouse Master**: A game designed to build precision mouse control skills across categories, levels, and modes.
- **Dragon Drop**: A drag-and-drop adventure puzzle game with worlds, levels, boss battles, and collectable map pieces.
- **Link Number**: A numerical logic puzzle game with board progress, difficulty tiers, and daily challenges.
- **Robot Brainiac**: A puzzle game where players input command sequences to navigate a robot through complex mazes.
- **Typing Math Game**: A fast-paced math game where players solve arithmetic problems and race against the clock.
- **Typing Code Game**: A game where players type code snippets as fast and accurately as possible to earn score multipliers and power-ups.

## Features

- **Unified Authentication & Profiles**: A shared infrastructure allowing users to log in once and access all games seamlessly.
- **Redis High-Performance Caching**: Intelligent cache-aside caching layer (via `ioredis`) for zero-latency GET responses across static content, leaderboards, user profiles, and game progress.
- **Non-blocking Resilient Architecture**: Graceful fallback ensuring full API availability from MongoDB even if Redis is offline.
- **Global & Game Leaderboards**: Cross-game and game-specific leaderboards tracking speed, accuracy, efficiency, and overall mastery.
- **Comprehensive Statistics**: Detailed tracking of user performance, problem attempt histories, wpm/ppm rates, and win streaks.
- **Robust Schema**: Built using Node.js, Express (ESM), MongoDB (via Mongoose), and Redis.

---

## Redis Caching Layer

The API uses **Redis** to dramatically reduce database read queries and boost response times (from ~100ms down to ~1-5ms):

### Cache Strategy & Preset TTLs
- **Static Content (1 - 2 Hours)**: Lessons, units, game modes, robot types, puzzle boards, and challenges.
- **User Profiles & Auth (30 Minutes)**: Token validation and account profiles cached in memory to bypass MongoDB lookups on protected routes.
- **User Progress & Statistics (20 Minutes)**: User progress, streaks, heatmaps, and stats snapshots.
- **Leaderboards (15 Minutes)**: Computed rankings for global, speed, accuracy, and difficulty leaderboards.

### Cache Invalidation
Whenever data is created, modified, or deleted (`POST`, `PUT`, `PATCH`, `DELETE`), related cache keys are automatically invalidated (`del` / `delPattern`), ensuring clients always receive up-to-date data.

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB connection string
- Redis (Local Redis server on `redis://localhost:6379` or Upstash Redis URL)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/sivchhengkheang/kapp-api.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables by creating a `.env` file in the root directory:
   ```env
   PORT=3000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret

   # Redis Configuration
   REDIS_URL=redis://localhost:6379
   REDIS_CACHE_TTL=3600
   ```
4. Start the server:
   ```bash
   npm run start
   ```
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

---

## Architecture
The repository follows a clean, domain-driven structure:
- `/src/models`: Mongoose schemas grouped by game domains (`shared`, `koompi-typing`, `mouse-master`, `dragon-drop`, `link-number`, `robot-brainiac`, `typing-math`, `typing-code`).
- `/src/controllers`: Request handlers with integrated Redis cache get/set and invalidation logic.
- `/src/routers`: Express routers for organized API endpoint management.
- `/src/middleware`: Express middleware (`authMiddleware.js` token cache, `cacheMiddleware.js`).
- `/src/utils`: Reusable cache utility functions (`cache.js`).
- `/src/config`: Database connection (`dbConnection.js`) and Redis client (`redisClient.js`).
