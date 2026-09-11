import UserProgress from '../../models/link-number/UserProgress.js';
import { getRequestUserId } from '../../utils/userHelper.js';
import { get, set, del, generateKey, TTL } from '../../utils/cache.js';

// ── GET /api/link-number/progress ─────────────────────────────────────────────
export const getUserProgress = async (req, res) => {
  try {
    const userId = req.params.userId || getRequestUserId(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Provide Authorization Bearer token or userId.'
      });
    }

    const cacheKey = generateKey('link', 'progress', String(userId));
    const cached = await get(cacheKey);
    if (cached) return res.status(200).json(cached);

    let progress = await UserProgress.findOne({ userId }).lean();
    if (!progress) {
      // Return default initial progress without caching empty state in Redis
      return res.status(200).json({
        success: true,
        data: {
          userId,
          username: req.query?.username || 'Player',
          currentLevelIndex: 0,
          highestUnlockedIndex: 0,
          completedLevelIds: [],
          totalStars: 0,
          totalCompleted: 0
        }
      });
    }

    // Ensure all levels up to highestUnlockedIndex are included in completedLevelIds
    let completed = Array.isArray(progress.completedLevelIds)
      ? progress.completedLevelIds.map(Number).filter((n) => !isNaN(n) && n > 0)
      : [];
    const highest = Number(progress.highestUnlockedIndex || 0);
    if (highest > 0) {
      for (let i = 1; i <= highest; i++) {
        if (!completed.includes(i)) {
          completed.push(i);
        }
      }
    }
    const levelStarsObj = progress.levelStars
      ? (progress.levelStars instanceof Map ? Object.fromEntries(progress.levelStars) : progress.levelStars)
      : {};
    const totalStars = Number(progress.totalStars || 0);

    const response = {
      success: true,
      data: {
        userId: progress.userId,
        username: progress.username || 'Player',
        currentLevelIndex: progress.currentLevelIndex,
        highestUnlockedIndex: progress.highestUnlockedIndex,
        completedLevelIds: completed,
        totalStars,
        levelStars: levelStarsObj,
        totalCompleted: completed.length
      }
    };

    await set(cacheKey, response, TTL.USER_STATS || 300);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── PUT /api/link-number/progress ─────────────────────────────────────────────
export const updateUserProgress = async (req, res) => {
  try {
    const userId = getRequestUserId(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Provide Authorization Bearer token or userId.'
      });
    }

    const { currentLevelIndex, highestUnlockedIndex, username, completedLevelIds, totalStars, levelStars } = req.body;
    const mongoUpdate = {};
    const setFields = {};

    if (username && typeof username === 'string') {
      setFields.username = username.trim();
    }
    if (currentLevelIndex !== undefined) {
      setFields.currentLevelIndex = Math.max(0, Number(currentLevelIndex));
    }
    const resolvedHighest = highestUnlockedIndex !== undefined ? Math.max(0, Number(highestUnlockedIndex)) : undefined;
    if (resolvedHighest !== undefined) {
      setFields.highestUnlockedIndex = resolvedHighest;
    }

    if (Object.keys(setFields).length > 0) {
      mongoUpdate.$set = setFields;
    }

    if (levelStars && typeof levelStars === 'object') {
      for (const [lvl, s] of Object.entries(levelStars)) {
        const starVal = Number(s);
        if (!isNaN(starVal) && starVal >= 1 && starVal <= 3) {
          mongoUpdate[`levelStars.${lvl}`] = starVal;
        }
      }
    }

    let allCompleted = Array.isArray(completedLevelIds)
      ? completedLevelIds.map(Number).filter((n) => !isNaN(n) && n > 0)
      : [];

    if (resolvedHighest !== undefined && resolvedHighest > 0) {
      for (let i = 1; i <= resolvedHighest; i++) {
        if (!allCompleted.includes(i)) {
          allCompleted.push(i);
        }
      }
    }

    if (allCompleted.length > 0) {
      mongoUpdate.$addToSet = { completedLevelIds: { $each: allCompleted } };
    }

    const resolvedStars = totalStars !== undefined && !isNaN(Number(totalStars)) ? Math.max(0, Number(totalStars)) : 0;
    if (resolvedStars > 0) {
      mongoUpdate.$max = { totalStars: resolvedStars };
    }

    const progress = await UserProgress.findOneAndUpdate(
      { userId },
      mongoUpdate,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const finalCompleted = Array.isArray(progress.completedLevelIds)
      ? progress.completedLevelIds.map(Number).filter((n) => !isNaN(n) && n > 0)
      : [];
    if (progress.highestUnlockedIndex > 0) {
      for (let i = 1; i <= progress.highestUnlockedIndex; i++) {
        if (!finalCompleted.includes(i)) {
          finalCompleted.push(i);
        }
      }
    }
    const finalStars = Number(progress.totalStars || 0);
    const levelStarsObj = progress.levelStars
      ? (progress.levelStars instanceof Map ? Object.fromEntries(progress.levelStars) : progress.levelStars)
      : {};

    const cacheKey = generateKey('link', 'progress', String(userId));
    const response = {
      success: true,
      message: 'Progress updated successfully.',
      data: {
        userId: progress.userId,
        username: progress.username || 'Player',
        currentLevelIndex: progress.currentLevelIndex,
        highestUnlockedIndex: progress.highestUnlockedIndex,
        completedLevelIds: finalCompleted,
        totalStars: finalStars,
        levelStars: levelStarsObj,
        totalCompleted: finalCompleted.length
      }
    };

    await del(cacheKey);
    await set(cacheKey, response, TTL.USER_STATS || 300);

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
