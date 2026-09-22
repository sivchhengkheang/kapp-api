import { Router } from 'express';
import {
  getRandomAvatar,
  getMyAvatar,
  selectMyAvatar,
  refreshMyAvatar,
} from '../../controllers/shared/avatarController.js';
import { protect } from '../../middleware/authMiddleware.js';

const router = Router();

// ── Public routes ─────────────────────────────────────────────────────────────

// GET  /api/avatars/random?letter=A
// Preview any avatar for a given starting letter — no DB hit, no token needed
router.get('/random', getRandomAvatar);

// ── Protected routes ──────────────────────────────────────────────────────────

// GET   /api/avatars/me
// Return the current user's persisted avatar and lock status from UserProfile
router.get('/me', protect, getMyAvatar);

// PATCH /api/avatars/me        { avatarIndex: 7 }
// ONE-TIME permanent avatar selection (1–30). Sets avatarLocked: true in DB.
// Returns 403 if the user has already made their choice.
router.patch('/me', protect, selectMyAvatar);

// POST  /api/avatars/me/refresh
// Re-roll within the same letter bucket — only allowed BEFORE the lock.
// After PATCH /me is called, this also returns 403.
router.post('/me/refresh', protect, refreshMyAvatar);

export default router;
