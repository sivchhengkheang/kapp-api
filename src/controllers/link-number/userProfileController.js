import UserProfile from '../../models/shared/UserProfile.js';
import UserAccount from '../../models/shared/UserAccount.js';
import UserProgress from '../../models/link-number/UserProgress.js';
import { getRequestUserId } from '../../utils/userHelper.js';
import {
  buildAvatarUrl,
  normalizeGender,
  MALE_AVATAR_COUNT,
  FEMALE_AVATAR_COUNT,
  GENDER_AVATAR_COUNTS,
  AVATAR_COUNT,
} from '../../utils/avatarHelper.js';

// ── GET /api/link-number/profile/me ───────────────────────────────────────────
// Also supports GET /api/link-number/profile
/**
 * Retrieve current user's profile with game progress and avatar info.
 */
export const getMyLinkProfile = async (req, res) => {
  try {
    const userId = req.user?._id || getRequestUserId(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Provide Authorization Bearer token or userId.',
      });
    }

    const [account, profile, progress] = await Promise.all([
      UserAccount.findById(userId).select('username email accountStatus createdAt').lean(),
      UserProfile.findOne({ userAccountId: userId }).lean(),
      UserProgress.findOne({ userId }).lean(),
    ]);

    if (!account) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    const completed = Array.isArray(progress?.completedLevelIds)
      ? progress.completedLevelIds.map(Number).filter((n) => !isNaN(n) && n > 0)
      : [];

    const responseData = {
      userId: account._id,
      username: account.username,
      displayName: profile?.displayName || account.username,
      gender: profile?.gender || null,
      bio: profile?.bio || '',
      avatar: {
        url: profile?.avatar?.url || null,
        avatarLocked: profile?.avatar?.avatarLocked ?? false,
        source: profile?.avatar?.source || 'auto',
        lockedAt: profile?.avatar?.lockedAt || null,
        uploadedAt: profile?.avatar?.uploadedAt || null,
      },
      preferences: {
        language: profile?.preferences?.language || 'en',
        theme: profile?.preferences?.theme || 'light',
        soundEnabled: profile?.preferences?.soundEnabled ?? true,
        musicEnabled: profile?.preferences?.musicEnabled ?? true,
        animationsEnabled: profile?.preferences?.animationsEnabled ?? true,
        showHints: profile?.preferences?.showHints ?? true,
        gridSize: profile?.preferences?.gridSize || 'medium',
      },
      privacy: {
        profilePublic: profile?.privacy?.profilePublic ?? true,
        showOnLeaderboard: profile?.privacy?.showOnLeaderboard ?? true,
        allowFriendRequests: profile?.privacy?.allowFriendRequests ?? true,
      },
      gameProgress: {
        currentLevelIndex: progress?.currentLevelIndex || 0,
        highestUnlockedIndex: progress?.highestUnlockedIndex || 0,
        completedLevelIds: completed,
        totalStars: Number(progress?.totalStars || 0),
        totalCompleted: completed.length,
      },
    };

    return res.status(200).json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET /api/link-number/profile/:userId ──────────────────────────────────────
/**
 * Retrieve public link-number profile of any user.
 */
export const getLinkProfileByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required.' });
    }

    const [account, profile, progress] = await Promise.all([
      UserAccount.findById(userId).select('username createdAt').lean(),
      UserProfile.findOne({ userAccountId: userId }).lean(),
      UserProgress.findOne({ userId }).lean(),
    ]);

    if (!account) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Check privacy
    if (profile?.privacy?.profilePublic === false) {
      return res.status(403).json({
        success: false,
        message: 'This user profile is private.',
      });
    }

    const completed = Array.isArray(progress?.completedLevelIds)
      ? progress.completedLevelIds.map(Number).filter((n) => !isNaN(n) && n > 0)
      : [];

    return res.status(200).json({
      success: true,
      data: {
        userId: account._id,
        username: account.username,
        displayName: profile?.displayName || account.username,
        gender: profile?.gender || null,
        bio: profile?.bio || '',
        avatarUrl: profile?.avatar?.url || null,
        gameProgress: {
          highestUnlockedIndex: progress?.highestUnlockedIndex || 0,
          totalStars: Number(progress?.totalStars || 0),
          totalCompleted: completed.length,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── PUT/PATCH /api/link-number/profile ────────────────────────────────────────
/**
 * Update current user's profile and preferences.
 */
export const updateLinkProfile = async (req, res) => {
  try {
    const userId = req.user?._id || getRequestUserId(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Provide Authorization Bearer token or userId.',
      });
    }

    const { displayName, bio, gender, preferences, privacy } = req.body;

    let profile = await UserProfile.findOne({ userAccountId: userId });
    if (!profile) {
      profile = new UserProfile({ userAccountId: userId });
    }

    if (displayName !== undefined && typeof displayName === 'string') {
      profile.displayName = displayName.trim();
    }
    if (bio !== undefined && typeof bio === 'string') {
      profile.bio = bio.trim();
    }
    if (gender !== undefined) {
      const g = normalizeGender(gender);
      if (g) profile.gender = g;
    }

    if (preferences && typeof preferences === 'object') {
      if (!profile.preferences) profile.preferences = {};
      if (preferences.language) profile.preferences.language = preferences.language;
      if (preferences.theme) profile.preferences.theme = preferences.theme;
      if (preferences.soundEnabled !== undefined) profile.preferences.soundEnabled = Boolean(preferences.soundEnabled);
      if (preferences.musicEnabled !== undefined) profile.preferences.musicEnabled = Boolean(preferences.musicEnabled);
      if (preferences.animationsEnabled !== undefined) profile.preferences.animationsEnabled = Boolean(preferences.animationsEnabled);
      if (preferences.showHints !== undefined) profile.preferences.showHints = Boolean(preferences.showHints);
      if (preferences.gridSize) profile.preferences.gridSize = preferences.gridSize;
    }

    if (privacy && typeof privacy === 'object') {
      if (!profile.privacy) profile.privacy = {};
      if (privacy.profilePublic !== undefined) profile.privacy.profilePublic = Boolean(privacy.profilePublic);
      if (privacy.showOnLeaderboard !== undefined) profile.privacy.showOnLeaderboard = Boolean(privacy.showOnLeaderboard);
      if (privacy.allowFriendRequests !== undefined) profile.privacy.allowFriendRequests = Boolean(privacy.allowFriendRequests);
    }

    await profile.save();

    return res.status(200).json({
      success: true,
      message: 'Link Number profile updated successfully.',
      data: {
        userId,
        displayName: profile.displayName,
        gender: profile.gender,
        bio: profile.bio,
        avatar: profile.avatar,
        preferences: profile.preferences,
        privacy: profile.privacy,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── PATCH /api/link-number/profile/avatar ─────────────────────────────────────
/**
 * One-time avatar selection for Link Number game profile.
 * Body: { avatarIndex: <number>, gender?: 'male' | 'female' }
 */
export const updateLinkAvatar = async (req, res) => {
  try {
    const userId = req.user?._id || getRequestUserId(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Provide Authorization Bearer token.',
      });
    }

    const { avatarIndex, gender } = req.body;

    const profile = await UserProfile.findOne({ userAccountId: userId });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'User profile not found.' });
    }

    if (profile.avatar?.avatarLocked) {
      return res.status(403).json({
        success: false,
        message: 'Avatar has already been selected and locked.',
        data: {
          avatarUrl: profile.avatar.url,
          lockedAt: profile.avatar.lockedAt,
        },
      });
    }

    const index = parseInt(avatarIndex, 10);
    if (!avatarIndex || isNaN(index) || index < 1 || index > AVATAR_COUNT) {
      return res.status(400).json({
        success: false,
        message: `avatarIndex must be between 1 and ${MALE_AVATAR_COUNT} for male, or 1 and ${FEMALE_AVATAR_COUNT} for female.`,
      });
    }

    let targetGender = normalizeGender(gender);
    let finalIndex = index;

    if (!targetGender) {
      if (index >= 13 && index <= 24) {
        targetGender = 'female';
        finalIndex = index - 12;
      } else if (index >= 25 && index <= 30) {
        targetGender = 'male';
        finalIndex = 13 + (index - 25);
      } else {
        targetGender = profile.gender || 'male';
        finalIndex = index;
      }
    }

    const maxCount = GENDER_AVATAR_COUNTS[targetGender];
    if (finalIndex < 1 || finalIndex > maxCount) {
      return res.status(400).json({
        success: false,
        message: `avatarIndex must be between 1 and ${maxCount} for ${targetGender}.`,
      });
    }

    const newUrl = buildAvatarUrl(finalIndex, targetGender);
    const lockedAt = new Date();

    profile.avatar = {
      url: newUrl,
      uploadedAt: lockedAt,
      source: 'selected',
      avatarLocked: true,
      lockedAt,
    };
    if (targetGender && !profile.gender) {
      profile.gender = targetGender;
    }
    await profile.save();

    return res.status(200).json({
      success: true,
      message: 'Avatar selected and locked successfully for Link Number.',
      data: {
        avatarUrl: newUrl,
        gender: targetGender,
        avatarIndex: finalIndex,
        avatarLocked: true,
        lockedAt,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
