import Leaderboard from '../../models/link-number/Leaderboard.js';
import UserProgress from '../../models/link-number/UserProgress.js';
import UserAccount from '../../models/shared/UserAccount.js';
import UserProfile from '../../models/shared/UserProfile.js';
import { getRequestUserId } from '../../utils/userHelper.js';
import { get, set, generateKey, TTL } from '../../utils/cache.js';

// ── GET /api/link-number/leaderboards/:levelId ────────────────────────────────
export const getLevelLeaderboard = async (req, res) => {
  try {
    const levelId = Number(req.params.levelId);
    if (isNaN(levelId)) {
      return res.status(400).json({ success: false, message: 'Invalid level ID.' });
    }

    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const currentUserId = req.query.userId || getRequestUserId(req);
    const cacheKey = generateKey('link', 'leaderboard', String(levelId), String(limit));

    let ranked = await get(cacheKey);
    if (!ranked) {
      const entries = await Leaderboard.find({ levelId })
        .sort({ bestTimeMs: 1 })
        .limit(limit)
        .lean();

      ranked = entries.map((entry, index) => ({
        rank: index + 1,
        userId: entry.userId,
        username: entry.username || 'Anonymous',
        bestTimeMs: entry.bestTimeMs,
        stars: entry.stars,
        achievedAt: entry.achievedAt
      }));

      await set(cacheKey, ranked, TTL.LEADERBOARD || 120);
    }

    // Attach requesting user's specific rank & best record if available
    let currentUserEntry = null;
    if (currentUserId) {
      const userDoc = await Leaderboard.findOne({ levelId, userId: currentUserId }).lean();
      if (userDoc) {
        const fasterCount = await Leaderboard.countDocuments({
          levelId,
          bestTimeMs: { $lt: userDoc.bestTimeMs }
        });
        currentUserEntry = {
          rank: fasterCount + 1,
          userId: userDoc.userId,
          username: userDoc.username || 'Player',
          bestTimeMs: userDoc.bestTimeMs,
          stars: userDoc.stars,
          achievedAt: userDoc.achievedAt
        };
      }
    }

    const list = Array.isArray(ranked) ? ranked : (ranked?.data || []);

    return res.status(200).json({
      success: true,
      levelId,
      count: list.length,
      data: list,
      currentUserEntry
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET /api/link-number/leaderboards/global ──────────────────────────────────
export const getGlobalLeaderboard = async (req, res) => {
  try {
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const currentUserId = req.query.userId || getRequestUserId(req);
    const cacheKey = generateKey('link', 'leaderboard', 'global', String(limit));

    let ranked = await get(cacheKey);
    if (!ranked) {
      const topProgress = await UserProgress.find({ totalStars: { $gt: 0 } })
        .sort({ totalStars: -1, highestUnlockedIndex: -1 })
        .limit(limit)
        .lean();

      const userIds = topProgress.map((p) => p.userId);
      const [accounts, profiles] = await Promise.all([
        UserAccount.find({ _id: { $in: userIds } }).select('_id username').lean(),
        UserProfile.find({ userAccountId: { $in: userIds } }).select('userAccountId displayName').lean()
      ]);

      const usernameMap = new Map();
      accounts.forEach((acc) => usernameMap.set(String(acc._id), acc.username));
      profiles.forEach((prof) => {
        if (prof.displayName) usernameMap.set(String(prof.userAccountId), prof.displayName);
      });

      ranked = topProgress.map((p, index) => ({
        rank: index + 1,
        userId: p.userId,
        username: usernameMap.get(String(p.userId)) || p.username || 'Player',
        totalStars: p.totalStars,
        totalCompleted: p.completedLevelIds?.length || 0,
        highestUnlockedIndex: p.highestUnlockedIndex
      }));

      await set(cacheKey, ranked, TTL.LEADERBOARD || 120);
    }

    // Attach requesting user's specific global ranking if available
    let currentUserEntry = null;
    if (currentUserId) {
      const userProgress = await UserProgress.findOne({ userId: currentUserId }).lean();
      if (userProgress && userProgress.totalStars > 0) {
        const higherStarsCount = await UserProgress.countDocuments({
          totalStars: { $gt: userProgress.totalStars }
        });
        currentUserEntry = {
          rank: higherStarsCount + 1,
          userId: userProgress.userId,
          username: userProgress.username || 'Player',
          totalStars: userProgress.totalStars,
          totalCompleted: userProgress.completedLevelIds?.length || 0,
          highestUnlockedIndex: userProgress.highestUnlockedIndex
        };
      }
    }

    const list = Array.isArray(ranked) ? ranked : (ranked?.data || []);

    return res.status(200).json({
      success: true,
      type: 'global',
      count: list.length,
      data: list,
      currentUserEntry
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
