import UserProfile from '../../models/shared/UserProfile.js';
import {
  charToBucket,
  pickAvatarForLetter,
  buildAvatarUrl,
  resolveAvatarForLetter,
  normalizeGender,
  MALE_AVATAR_COUNT,
  FEMALE_AVATAR_COUNT,
  GENDER_AVATAR_COUNTS,
  GENDER_BUCKET_MAP,
  AVATAR_COUNT,
} from '../../utils/avatarHelper.js';

// ── GET /api/avatars/random?letter=A&gender=male ─────────────────────────────
/**
 * Public endpoint — no DB hit.
 * Returns a preview avatar URL for a given starting letter and optional gender.
 * Useful for "preview before you commit" UX on the client.
 */
export const getRandomAvatar = (req, res) => {
  const letter = String(req.query.letter || '').trim()[0] || '';
  const rawGender = String(req.query.gender || '').trim().toLowerCase();
  const gender = normalizeGender(rawGender);

  const effectiveLetter = letter || String.fromCharCode(65 + Math.floor(Math.random() * 26));
  const { url, index, gender: resolvedGender, bucket } = resolveAvatarForLetter(effectiveLetter, gender);

  const bucketSize = GENDER_BUCKET_MAP[resolvedGender]?.[bucket]?.length || 3;

  return res.status(200).json({
    success: true,
    data: {
      avatarUrl:         url,
      letter:            letter.toUpperCase() || null,
      gender:            resolvedGender,
      avatarIndex:       index,
      bucket,
      bucketAvatarCount: bucketSize,
    },
  });
};

// ── GET /api/avatars/me ───────────────────────────────────────────────────────
/**
 * Protected — reads the current user's persisted avatar and gender from UserProfile.
 */
export const getMyAvatar = async (req, res) => {
  try {
    const profile = await UserProfile.findOne(
      { userAccountId: req.user._id },
      'avatar displayName gender'
    );

    if (!profile) {
      return res.status(404).json({ success: false, message: 'User profile not found.' });
    }

    return res.status(200).json({
      success: true,
      data: {
        avatarUrl:    profile.avatar?.url        || null,
        gender:       profile.gender             || null,
        source:       profile.avatar?.source     || 'auto',
        avatarLocked: profile.avatar?.avatarLocked ?? false,
        lockedAt:     profile.avatar?.lockedAt   || null,
        uploadedAt:   profile.avatar?.uploadedAt || null,
        displayName:  profile.displayName        || null,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── PATCH /api/avatars/me ─────────────────────────────────────────────────────
/**
 * Protected — ONE-TIME avatar selection.
 *
 * The user picks an avatar index and optional gender:
 * - male: 1–18
 * - female: 1–12
 * (Or original sprite sheet index 1–30, automatically mapped to the right gender & file).
 *
 * Body: { avatarIndex: <number>, gender?: 'male' | 'female' }
 */
export const selectMyAvatar = async (req, res) => {
  try {
    const { avatarIndex, gender } = req.body;

    // ── Load profile ──────────────────────────────────────────────────────────
    const profile = await UserProfile.findOne({ userAccountId: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'User profile not found.' });
    }

    // ── Enforce one-time rule ─────────────────────────────────────────────────
    if (profile.avatar?.avatarLocked) {
      return res.status(403).json({
        success: false,
        message: 'Avatar has already been selected and cannot be changed.',
        data: {
          avatarUrl: profile.avatar.url,
          lockedAt:  profile.avatar.lockedAt,
        },
      });
    }

    // ── Validate input ────────────────────────────────────────────────────────
    const index = parseInt(avatarIndex, 10);
    if (!avatarIndex || isNaN(index) || index < 1 || index > AVATAR_COUNT) {
      return res.status(400).json({
        success: false,
        message: `avatarIndex must be a number between 1 and ${MALE_AVATAR_COUNT} for male, or 1 and ${FEMALE_AVATAR_COUNT} for female.`,
      });
    }

    let targetGender = normalizeGender(gender);
    let finalIndex = index;

    if (!targetGender) {
      // If user passed original sprite indices 1..30:
      if (index >= 13 && index <= 24) {
        targetGender = 'female';
        finalIndex = index - 12; // 13..24 -> 1..12
      } else if (index >= 25 && index <= 30) {
        targetGender = 'male';
        finalIndex = 13 + (index - 25); // 25..30 -> 13..18
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

    // ── Commit the selection and lock it ──────────────────────────────────────
    const newUrl   = buildAvatarUrl(finalIndex, targetGender);
    const lockedAt = new Date();

    profile.avatar = {
      url:          newUrl,
      uploadedAt:   lockedAt,
      source:       'selected',
      avatarLocked: true,   // 🔒 one-time lock engaged
      lockedAt,
    };
    if (targetGender && !profile.gender) {
      profile.gender = targetGender;
    }
    await profile.save();

    return res.status(200).json({
      success: true,
      message: 'Avatar selected and locked successfully.',
      data: {
        avatarUrl:    newUrl,
        gender:       targetGender,
        avatarIndex:  finalIndex,
        source:       'selected',
        avatarLocked: true,
        lockedAt,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── POST /api/avatars/me/refresh ──────────────────────────────────────────────
/**
 * Protected — re-roll avatar within the same letter bucket and gender.
 * Only allowed BEFORE the user has made their permanent one-time selection.
 * Once avatarLocked is true, this returns 403.
 */
export const refreshMyAvatar = async (req, res) => {
  try {
    const profile = await UserProfile.findOne({ userAccountId: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'User profile not found.' });
    }

    // Block re-rolls after the permanent selection has been made
    if (profile.avatar?.avatarLocked) {
      return res.status(403).json({
        success: false,
        message: 'Avatar is locked. You have already made your permanent selection.',
        data: {
          avatarUrl: profile.avatar.url,
          lockedAt:  profile.avatar.lockedAt,
        },
      });
    }

    // Re-roll within the same letter bucket and gender
    const firstLetter = req.user.username?.[0] || '';
    let gender = profile.gender;
    if (!gender) {
      if (profile.avatar?.url?.includes('/female/')) gender = 'female';
      else if (profile.avatar?.url?.includes('/male/')) gender = 'male';
      else gender = 'male';
    }

    const { url: newUrl, index } = resolveAvatarForLetter(firstLetter, gender);

    profile.avatar = {
      url:          newUrl,
      uploadedAt:   new Date(),
      source:       'auto',
      avatarLocked: false, // still unlocked — user hasn't committed yet
    };
    await profile.save();

    return res.status(200).json({
      success: true,
      message: 'Avatar re-rolled. Use PATCH /api/avatars/me to lock your final choice.',
      data: {
        avatarUrl:    newUrl,
        gender,
        avatarIndex:  index,
        source:       'auto',
        avatarLocked: false,
        uploadedAt:   profile.avatar.uploadedAt,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};



