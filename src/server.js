import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { dbConnection } from './config/dbConnection.js';

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

dotenv.config();

const PORT = process.env.PORT || 5050;

const app = express();

app.use(cors());
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
app.use('/api/mouse-master/categories',  skillCategoryRouter);
app.use('/api/mouse-master/levels',      mouseLevelRouter);
app.use('/api/mouse-master/modes',       gameModeMouseRouter);
app.use('/api/mouse-master/sessions',    gameSessionMouseRouter);
app.use('/api/mouse-master/attempts',    challengeAttemptMouseRouter);
app.use('/api/mouse-master/progress',    userProgressMouseRouter);
app.use('/api/mouse-master/badges',      skillBadgeMouseRouter);
app.use('/api/mouse-master/leaderboards',leaderboardMouseRouter);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
dbConnection();
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});