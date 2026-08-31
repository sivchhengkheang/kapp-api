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

dotenv.config();

const PORT = process.env.PORT || 3000;

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

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
dbConnection();
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});