import { Router } from 'express';
import {
  getMyLinkProfile,
  getLinkProfileByUserId,
  updateLinkProfile,
  updateLinkAvatar,
} from '../../controllers/link-number/userProfileController.js';
import { protect } from '../../middleware/authMiddleware.js';

const router = Router();

// GET  /api/link-number/profile/me      — Current user's full Link Number profile
router.get('/me', protect, getMyLinkProfile);

// GET  /api/link-number/profile         — Current user's full Link Number profile (fallback)
router.get('/', protect, getMyLinkProfile);

// PATCH /api/link-number/profile/avatar — Select and lock avatar
router.patch('/avatar', protect, updateLinkAvatar);

// PATCH /api/link-number/profile        — Update profile display/preferences
router.patch('/', protect, updateLinkProfile);
router.put('/', protect, updateLinkProfile);

// GET  /api/link-number/profile/:userId — Public profile by user ID
router.get('/:userId', getLinkProfileByUserId);

export default router;
