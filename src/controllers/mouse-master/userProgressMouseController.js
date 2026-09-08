import UserProgressMouse from '../../models/mouse-master/UserProgressMouse.js';
import { get, set, del, delPattern, generateKey, TTL } from '../../utils/cache.js';

// ── GET /api/mouse-master/progress/user/:userId ───────────────────────────────
// All progress records for a user (powers the level-select screen)
export const getProgressByUser = async (req, res) => {
  try {
    const { status } = req.query;
    const cacheKey = generateKey('mouse', 'progress', req.params.userId, status || 'all');
    const cached = await get(cacheKey);
    if (cached) return res.json(cached);

    const filter = { userAccountId: req.params.userId };
    if (status) filter.status = status;

    const data = await UserProgressMouse.find(filter)
      .populate('levelId', 'levelNumber challengeType difficulty config.timeLimitMs xpReward')
      .sort({ 'levelId.levelNumber': 1 });

    const body = { success: true, count: data.length, data };
    await set(cacheKey, body, TTL.USER_STATS);
    return res.status(200).json(body);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET /api/mouse-master/progress/user/:userId/level/:levelId ───────────────
export const getProgressByLevel = async (req, res) => {
  try {
    const cacheKey = generateKey('mouse', 'progress', req.params.userId, req.params.levelId);
    const cached = await get(cacheKey);
    if (cached) return res.json(cached);

    const progress = await UserProgressMouse.findOne({
      userAccountId: req.params.userId,
      levelId:       req.params.levelId
    }).populate('levelId', 'levelNumber challengeType difficulty passThreshold xpReward');

    if (!progress) return res.status(404).json({ success: false, message: 'Progress record not found.' });
    
    const body = { success: true, data: progress };
    await set(cacheKey, body, TTL.USER_STATS);
    return res.status(200).json(body);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── PATCH /api/mouse-master/progress/user/:userId/level/:levelId ─────────────
// Upsert progress — called internally by session-complete hook; exposed for flexibility
export const upsertProgress = async (req, res) => {
  try {
    const progress = await UserProgressMouse.findOneAndUpdate(
      { userAccountId: req.params.userId, levelId: req.params.levelId },
      { $set: req.body },
      { returnDocument: 'after', upsert: true, runValidators: true }
    );
    await delPattern(`mouse:progress:${req.params.userId}:*`);
    return res.status(200).json({ success: true, data: progress });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── POST /api/mouse-master/progress ───────────────────────────────────────────
// Unlock a level explicitly (e.g. initial unlock on account creation)
export const unlockLevel = async (req, res) => {
  try {
    const { userAccountId, levelId } = req.body;
    const progress = await UserProgressMouse.findOneAndUpdate(
      { userAccountId, levelId },
      { $setOnInsert: { userAccountId, levelId, status: 'unlocked' } },
      { returnDocument: 'after', upsert: true }
    );
    return res.status(201).json({ success: true, data: progress });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
