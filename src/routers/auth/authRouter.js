import { Router } from 'express';
import {
  register,
  login,
  googleAuth,
  refreshToken,
  logout,
  getMe,
  changePassword,
  forgotPassword,
  resetPassword,
  getActiveSessions,
  revokeSession,
} from '../../controllers/auth/authController.js';
import { protect } from '../../middleware/authMiddleware.js';

const router = Router();

// ── Public routes (no token required) ────────────────────────────────────────

// POST /api/auth/register         — Email + password registration
router.post('/register', register);

// POST /api/auth/login            — Email/username + password login
router.post('/login', login);

// POST /api/auth/google           — Google OAuth (client sends Google id_token)
router.post('/google', googleAuth);

// POST /api/auth/refresh          — Issue new access + refresh token (rotation)
router.post('/refresh', refreshToken);

// POST /api/auth/forgot-password  — Request password reset email
router.post('/forgot-password', forgotPassword);

// POST /api/auth/reset-password   — Reset password using the token from email
router.post('/reset-password', resetPassword);

// ── Protected routes (Bearer token required) ──────────────────────────────────

// GET  /api/auth/me                      — Get current user profile
router.get('/me', protect, getMe);

// POST /api/auth/logout                  — Logout (revoke current or all sessions)
router.post('/logout', protect, logout);

// PATCH /api/auth/change-password        — Change password (must know current)
router.patch('/change-password', protect, changePassword);

// GET    /api/auth/sessions              — List all active sessions for current user
router.get('/sessions', protect, getActiveSessions);

// DELETE /api/auth/sessions/:sessionId   — Revoke a specific session
router.delete('/sessions/:sessionId', protect, revokeSession);

export default router;
