import Level from '../../models/link-number/Level.js';
import UserProgress from '../../models/link-number/UserProgress.js';
import LevelCompletion from '../../models/link-number/LevelCompletion.js';
import GameSave from '../../models/link-number/GameSave.js';
import Leaderboard from '../../models/link-number/Leaderboard.js';
import UserAccount from '../../models/shared/UserAccount.js';
import UserProfile from '../../models/shared/UserProfile.js';
import { getRequestUserId } from '../../utils/userHelper.js';
import { get, set, del, generateKey, TTL } from '../../utils/cache.js';

// ── GET /api/link-number/levels ───────────────────────────────────────────────
export const getAllLevels = async (req, res) => {
  try {
    const { category, difficulty, size, limit = 100, page = 1 } = req.query;
    const filter = { isActive: true };

    if (category) filter.category = category;
    if (difficulty) filter.difficulty = new RegExp(`^${difficulty}$`, 'i');
    if (size) filter.size = Number(size);

    const cacheKey = generateKey(
      'link',
      'levels',
      category || 'all',
      difficulty || 'all',
      size ? String(size) : 'all',
      String(page),
      String(limit)
    );

    const cached = await get(cacheKey);
    if (cached) return res.status(200).json(cached);

    const skip = (Number(page) - 1) * Number(limit);
    const [levels, total] = await Promise.all([
      Level.find(filter)
        .sort({ order: 1, id: 1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Level.countDocuments(filter)
    ]);

    const response = {
      success: true,
      count: levels.length,
      total,
      page: Number(page),
      data: levels
    };

    await set(cacheKey, response, TTL.PUZZLE_LIST || 300);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET /api/link-number/levels/:id ───────────────────────────────────────────
export const getLevelById = async (req, res) => {
  try {
    const levelId = Number(req.params.id);
    if (isNaN(levelId)) {
      return res.status(400).json({ success: false, message: 'Invalid level ID.' });
    }

    const cacheKey = generateKey('link', 'level', String(levelId));
    const cached = await get(cacheKey);
    if (cached) return res.status(200).json(cached);

    const level = await Level.findOne({ id: levelId, isActive: true }).lean();
    if (!level) {
      return res.status(404).json({ success: false, message: `Level ${levelId} not found.` });
    }

    const response = { success: true, data: level };
    await set(cacheKey, response, TTL.PUZZLE_DETAIL || 600);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── POST /api/link-number/levels/:id/complete ─────────────────────────────────
export const completeLevel = async (req, res) => {
  try {
    const levelId = Number(req.params.id);
    if (isNaN(levelId)) {
      return res.status(400).json({ success: false, message: 'Invalid level ID.' });
    }

    const userId = getRequestUserId(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Provide Authorization Bearer token or userId.'
      });
    }

    const {
      stars = 3,
      timeTakenMs = 0,
      movesCount = 0,
      mistakesCount = 0,
      resetsCount = 0
    } = req.body;

    const validatedStars = Math.max(1, Math.min(3, Number(stars) || 3));
    const validatedTimeMs = Math.max(0, Number(timeTakenMs) || 0);

    // 1. Fetch level to verify existence
    const level = await Level.findOne({ id: levelId, isActive: true }).lean();
    if (!level) {
      return res.status(404).json({ success: false, message: `Level ${levelId} not found.` });
    }

    // 2. Process Level Completion record
    let completion = await LevelCompletion.findOne({ userId, levelId });
    let isNewBest = false;
    let newStars = validatedStars;

    if (!completion) {
      isNewBest = true;
      completion = await LevelCompletion.create({
        userId,
        levelId,
        stars: validatedStars,
        timeTakenMs: validatedTimeMs,
        movesCount: Number(movesCount) || 0,
        mistakesCount: Number(mistakesCount) || 0,
        resetsCount: Number(resetsCount) || 0,
        completedAt: new Date()
      });
    } else {
      const priorBestTime = completion.timeTakenMs;
      const priorBestStars = completion.stars;

      newStars = Math.max(0, validatedStars - priorBestStars);

      if (validatedTimeMs < priorBestTime || validatedStars > priorBestStars) {
        isNewBest = true;
      }

      completion.stars = Math.max(completion.stars, validatedStars);
      if (validatedTimeMs > 0 && (completion.timeTakenMs === 0 || validatedTimeMs < completion.timeTakenMs)) {
        completion.timeTakenMs = validatedTimeMs;
      }
      completion.movesCount = Number(movesCount) || completion.movesCount;
      completion.mistakesCount = Number(mistakesCount) || completion.mistakesCount;
      completion.resetsCount = Number(resetsCount) || completion.resetsCount;
      completion.completedAt = new Date();
      await completion.save();
    }

    // 3. Resolve username
    let resolvedUsername = (req.body?.username && typeof req.body.username === 'string')
      ? req.body.username.trim()
      : 'Player';
    const userAccount = await UserAccount.findById(userId).select('username').lean();
    if (userAccount?.username) {
      resolvedUsername = userAccount.username;
    } else {
      const userProfile = await UserProfile.findOne({ userAccountId: userId }).select('displayName').lean();
      if (userProfile?.displayName) resolvedUsername = userProfile.displayName;
    }

    // 4. Update UserProgress
    let progress = await UserProgress.findOne({ userId });
    const allPrecedingLevelIds = Array.from({ length: levelId }, (_, i) => i + 1);
    if (!progress) {
      const initialLevelStars = { [String(levelId)]: validatedStars };
      progress = new UserProgress({
        userId,
        username: resolvedUsername,
        currentLevelIndex: levelId,
        highestUnlockedIndex: levelId,
        completedLevelIds: allPrecedingLevelIds,
        levelStars: initialLevelStars,
        totalStars: validatedStars
      });
      await progress.save();
    } else {
      progress.username = resolvedUsername;
      const alreadyCompleted = progress.completedLevelIds.includes(levelId);
      if (!alreadyCompleted) {
        progress.completedLevelIds.push(levelId);
      }

      if (!progress.levelStars) {
        progress.levelStars = new Map();
      }
      const prevLevelStar = progress.levelStars.get(String(levelId)) || 0;
      if (validatedStars > prevLevelStar) {
        progress.levelStars.set(String(levelId), validatedStars);
      }

      if (!alreadyCompleted) {
        progress.totalStars = (progress.totalStars || 0) + validatedStars;
      } else if (newStars > 0) {
        progress.totalStars = (progress.totalStars || 0) + newStars;
      }

      if (levelId > progress.highestUnlockedIndex) {
        progress.highestUnlockedIndex = levelId;
      }
      progress.currentLevelIndex = levelId;

      if (progress.highestUnlockedIndex > 0) {
        for (let i = 1; i <= progress.highestUnlockedIndex; i++) {
          if (!progress.completedLevelIds.includes(i)) {
            progress.completedLevelIds.push(i);
          }
        }
      }
      await progress.save();
    }

    // 5. Update Leaderboard (if time taken is positive and best time)
    if (validatedTimeMs > 0) {
      const existingEntry = await Leaderboard.findOne({ userId, levelId });
      if (!existingEntry) {
        await Leaderboard.create({
          levelId,
          userId,
          username: resolvedUsername,
          bestTimeMs: validatedTimeMs,
          stars: validatedStars,
          achievedAt: new Date()
        });
      } else if (validatedTimeMs < existingEntry.bestTimeMs) {
        existingEntry.bestTimeMs = validatedTimeMs;
        existingEntry.stars = Math.max(existingEntry.stars, validatedStars);
        existingEntry.username = resolvedUsername;
        existingEntry.achievedAt = new Date();
        await existingEntry.save();
      } else if (validatedStars > existingEntry.stars) {
        existingEntry.stars = validatedStars;
        await existingEntry.save();
      }
      // Invalidate leaderboard cache for this level
      await del(generateKey('link', 'leaderboard', String(levelId)));
      await del(generateKey('link', 'leaderboard', 'global'));
    }

    // 5. Remove completed level from GameSave (active puzzle is finished)
    await GameSave.deleteOne({ userId, levelId });

    // Invalidate progress and save cache
    await del(generateKey('link', 'progress', String(userId)));
    await del(generateKey('link', 'save', String(userId)));

    const levelStarsObj = progress.levelStars
      ? (progress.levelStars instanceof Map ? Object.fromEntries(progress.levelStars) : progress.levelStars)
      : {};

    return res.status(200).json({
      success: true,
      newStars,
      isNewBest,
      totalStars: progress.totalStars,
      completedLevelIds: progress.completedLevelIds,
      highestUnlockedIndex: progress.highestUnlockedIndex,
      levelStars: levelStarsObj,
      data: completion
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
