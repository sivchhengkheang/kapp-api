import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import os from 'os';
import { dbConnection } from './config/dbConnection.js';
import { connectRedis } from './config/redisClient.js';

// ── Auth router ──────────────────────────────────────────────────────────────
import authRouter from './routers/auth/authRouter.js';

// ── Shared routers ────────────────────────────────────────────────────────────
import leaderboardRouter from './routers/shared/leaderboardRouter.js';
import userStatisticRouter from './routers/shared/userStatisticRouter.js';
import achievementRouter from './routers/shared/achievementRouter.js';

// ── Typing-Code routers ───────────────────────────────────────────────────────
import gameSessionCodeRouter from './routers/typing-code/gameSessionCodeRouter.js';
import challengeRouter from './routers/typing-code/challengeRouter.js';
import inventoryRouter from './routers/typing-code/inventoryRouter.js';

// ── Typing-Math routers ───────────────────────────────────────────────────────
import gameSessionMathRouter from './routers/typing-math/gameSessionMathRouter.js';
import mathProblemRouter from './routers/typing-math/mathProblemRouter.js';
import dailyChallengeRouter from './routers/typing-math/dailyChallengeRouter.js';
import problemAttemptRouter from './routers/typing-math/problemAttemptRouter.js';

// ── Robot Brainiac routers ────────────────────────────────────────────────────
import levelRouter from './routers/robot-brainiac/levelRouter.js';
import gameSessionRobotRouter from './routers/robot-brainiac/gameSessionRobotRouter.js';
import levelAttemptRouter from './routers/robot-brainiac/levelAttemptRouter.js';
import robotTypeRouter from './routers/robot-brainiac/robotTypeRouter.js';

// ── Dragon Drop routers ───────────────────────────────────────────────────────
import worldRouterDragon from './routers/dragon-drop/worldRouter.js';
import levelRouterDragon from './routers/dragon-drop/levelRouter.js';
import userRouterDragon from './routers/dragon-drop/userRouter.js';
import mapPieceRouterDragon from './routers/dragon-drop/mapPieceRouter.js';
import bossRouterDragon from './routers/dragon-drop/bossRouter.js';
import leaderboardRouterDragon from './routers/dragon-drop/leaderboardRouter.js';

// ── Mouse Master routers ──────────────────────────────────────────────────────
import skillCategoryRouter from './routers/mouse-master/skillCategoryRouter.js';
import mouseLevelRouter from './routers/mouse-master/mouseLevelRouter.js';
import gameModeMouseRouter from './routers/mouse-master/gameModeMouseRouter.js';
import gameSessionMouseRouter from './routers/mouse-master/gameSessionMouseRouter.js';
import challengeAttemptMouseRouter from './routers/mouse-master/challengeAttemptMouseRouter.js';
import userProgressMouseRouter from './routers/mouse-master/userProgressMouseRouter.js';
import skillBadgeMouseRouter from './routers/mouse-master/skillBadgeMouseRouter.js';
import leaderboardMouseRouter from './routers/mouse-master/leaderboardMouseRouter.js';

// ── Link Number routers ───────────────────────────────────────────────────────
import levelRouterLink from './routers/link-number/levelRouter.js';
import gameSaveRouterLink from './routers/link-number/gameSaveRouter.js';
import userProgressRouterLink from './routers/link-number/userProgressRouter.js';
import puzzleBoardRouter from './routers/link-number/puzzleBoardRouter.js';
import gameSessionLinkRouter from './routers/link-number/gameSessionLinkRouter.js';
import boardProgressRouter from './routers/link-number/boardProgressRouter.js';
import difficultyProgressionRouter from './routers/link-number/difficultyProgressionRouter.js';
import dailyChallengeRouterLink from './routers/link-number/dailyChallengeRouter.js';
import leaderboardLinkRouter from './routers/link-number/leaderboardLinkRouter.js';

// ── KOOMPI Typing routers ───────────────────────────────────────────────────
import typingUnitRouter from './routers/koompi-typing/typingUnitRouter.js';
import typingLessonRouter from './routers/koompi-typing/typingLessonRouter.js';
import lessonContentItemRouter from './routers/koompi-typing/lessonContentItemRouter.js';
import gameModeTypingRouter from './routers/koompi-typing/gameModeTypingRouter.js';
import gameSessionTypingRouter from './routers/koompi-typing/gameSessionTypingRouter.js';
import keystrokeEventRouter from './routers/koompi-typing/keystrokeEventRouter.js';
import userProgressTypingRouter from './routers/koompi-typing/userProgressTypingRouter.js';
import userStreakTypingRouter from './routers/koompi-typing/userStreakTypingRouter.js';
import keyboardHeatmapRouter from './routers/koompi-typing/keyboardHeatmapRouter.js';
import leaderboardTypingRouter from './routers/koompi-typing/leaderboardTypingRouter.js';

dotenv.config();

const PORT = process.env.PORT || 5050;

const app = express();

// ── CORS Configuration ────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
  process.env.CORS_ORIGIN,
].filter(Boolean);

// Matches localhost, 127.0.0.1, 192.168.x.x, 10.x.x.x, 172.16-31.x.x, and *.local on any port
const localNetworkPattern =
  /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}|[a-zA-Z0-9-]+\.local)(:\d+)?$/;

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, server-to-server, Postman)
    if (!origin) return callback(null, true);

    // Allow configured origins or any local network development origin
    if (
      allowedOrigins.includes(origin) ||
      localNetworkPattern.test(origin)
    ) {
      return callback(null, true);
    }

    return callback(new Error(`CORS error: Origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'x-user-id',
    'X-User-Id',
    'x-username',
    'X-Username',
    'x-device-type',
    'X-Device-Type',
    'x-device-name',
    'X-Device-Name',
    'x-refresh-token',
    'X-Refresh-Token',
    'x-requested-with',
    'Accept',
    'Origin',
  ],
};

app.use(cors(corsOptions));
app.use(express.json());

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({ success: true, message: 'Kapp Server is running 🚀' });
});

// ── Auth API routes ──────────────────────────────────────────────────────────
app.use('/api/auth', authRouter);

// ── Shared API routes ─────────────────────────────────────────────────────────
app.use('/api/shared/leaderboard', leaderboardRouter);
app.use('/api/shared/statistics', userStatisticRouter);
app.use('/api/shared/achievements', achievementRouter);

// ── Typing-Code API routes ────────────────────────────────────────────────────
app.use('/api/typing-code/sessions', gameSessionCodeRouter);
app.use('/api/typing-code/challenges', challengeRouter);
app.use('/api/typing-code/inventory', inventoryRouter);

// ── Typing-Math API routes ────────────────────────────────────────────────────
app.use('/api/typing-math/sessions', gameSessionMathRouter);
app.use('/api/typing-math/problems', mathProblemRouter);
app.use('/api/typing-math/daily-challenges', dailyChallengeRouter);
app.use('/api/typing-math/attempts', problemAttemptRouter);

// ── Robot Brainiac API routes ─────────────────────────────────────────────────
app.use('/api/robot-brainiac/levels', levelRouter);
app.use('/api/robot-brainiac/sessions', gameSessionRobotRouter);
app.use('/api/robot-brainiac/attempts', levelAttemptRouter);
app.use('/api/robot-brainiac/robots', robotTypeRouter);

// ── Dragon Drop API routes ────────────────────────────────────────────────────
app.use('/api/dragon-drop/worlds', worldRouterDragon);
app.use('/api/dragon-drop/levels', levelRouterDragon);
app.use('/api/dragon-drop/users', userRouterDragon);
app.use('/api/dragon-drop/map-pieces', mapPieceRouterDragon);
app.use('/api/dragon-drop/bosses', bossRouterDragon);
app.use('/api/dragon-drop/leaderboards', leaderboardRouterDragon);

// ── Mouse Master API routes ───────────────────────────────────────────────────
app.use('/api/mouse-master/categories', skillCategoryRouter);
app.use('/api/mouse-master/levels', mouseLevelRouter);
app.use('/api/mouse-master/modes', gameModeMouseRouter);
app.use('/api/mouse-master/sessions', gameSessionMouseRouter);
app.use('/api/mouse-master/attempts', challengeAttemptMouseRouter);
app.use('/api/mouse-master/progress', userProgressMouseRouter);
app.use('/api/mouse-master/badges', skillBadgeMouseRouter);
app.use('/api/mouse-master/leaderboards', leaderboardMouseRouter);

// ── Link Number API routes ────────────────────────────────────────────────────
app.use('/api/link-number/levels', levelRouterLink);
app.use('/api/link-number/save', gameSaveRouterLink);
app.use('/api/link-number/game/save', gameSaveRouterLink);
app.use('/api/link-number/progress', userProgressRouterLink);
app.use('/api/link-number/user/progress', userProgressRouterLink);
app.use('/api/link-number/leaderboards', leaderboardLinkRouter);
app.use('/api/link-number/leaderboard', leaderboardLinkRouter);

// SPEC API aliases (/api/user/progress, /api/levels, /api/game/save)
app.use('/api/levels', levelRouterLink);
app.use('/api/user/progress', userProgressRouterLink);
app.use('/api/game/save', gameSaveRouterLink);

// Legacy Link Number routes for backward compatibility
app.use('/api/link-number/puzzles', puzzleBoardRouter);
app.use('/api/link-number/sessions', gameSessionLinkRouter);
app.use('/api/link-number/board-progress', boardProgressRouter);
app.use('/api/link-number/difficulty', difficultyProgressionRouter);
app.use('/api/link-number/daily', dailyChallengeRouterLink);

// ── KOOMPI Typing API routes ──────────────────────────────────────────────────
app.use('/api/koompi-typing/units', typingUnitRouter);
app.use('/api/koompi-typing/lessons', typingLessonRouter);
app.use('/api/koompi-typing/content-items', lessonContentItemRouter);
app.use('/api/koompi-typing/modes', gameModeTypingRouter);
app.use('/api/koompi-typing/sessions', gameSessionTypingRouter);
app.use('/api/koompi-typing/keystrokes', keystrokeEventRouter);
app.use('/api/koompi-typing/progress', userProgressTypingRouter);
app.use('/api/koompi-typing/streaks', userStreakTypingRouter);
app.use('/api/koompi-typing/heatmap', keyboardHeatmapRouter);
app.use('/api/koompi-typing/leaderboards', leaderboardTypingRouter);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
// Initialise Redis (non-blocking — API starts even if Redis is unavailable)
connectRedis();

const HOST = process.env.HOST || '0.0.0.0';

function getLocalIpAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push(iface.address);
      }
    }
  }
  return addresses;
}

function logServerReady(isDbConnected = true) {
  const ips = getLocalIpAddresses();
  console.log(`\n🚀 Kapp API Server running on port ${PORT}${isDbConnected ? '' : ' (Database connection failed)'}:`);
  console.log(`   ➜  Local:   http://localhost:${PORT}`);
  ips.forEach((ip) => {
    console.log(`   ➜  Network: http://${ip}:${PORT}`);
  });
  console.log(`   ➜  Link Number API: http://localhost:${PORT}/api/link-number\n`);
}

dbConnection()
  .then(() => {
    app.listen(PORT, HOST, () => {
      logServerReady(true);
    });
  })
  .catch((err) => {
    // Even if DB fails, we still start the server as per previous behavior
    app.listen(PORT, HOST, () => {
      logServerReady(false);
    });
  });