import KeyboardHeatmapStat from '../../models/koompi-typing/KeyboardHeatmapStat.js';
import { get, set, del, generateKey, TTL } from '../../utils/cache.js';

// GET /api/koompi-typing/heatmap/user/:userId
export const getHeatmapByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { language = 'en' } = req.query;

    const cacheKey = generateKey('typing', 'heatmap', userId, language);
    const cached = await get(cacheKey);
    if (cached) return res.json(cached);

    const heatmap = await KeyboardHeatmapStat.findOne({ userAccountId: userId, language });

    if (!heatmap) {
      return res.json({ success: true, data: { userAccountId: userId, language, keyStats: {} } });
    }

    const body = { success: true, data: heatmap };
    await set(cacheKey, body, TTL.USER_STATS);
    return res.json(body);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/koompi-typing/heatmap/user/:userId
export const updateHeatmap = async (req, res) => {
  try {
    const { userId } = req.params;
    const { language = 'en', keyStats } = req.body;

    if (!keyStats || typeof keyStats !== 'object') {
      return res.status(400).json({ success: false, message: 'keyStats object is required.' });
    }

    let heatmap = await KeyboardHeatmapStat.findOne({
      userAccountId: userId,
      language
    });

    if (!heatmap) {
      heatmap = new KeyboardHeatmapStat({
        userAccountId: userId,
        language,
        keyStats: new Map()
      });
    }

    for (const [key, stat] of Object.entries(keyStats)) {
      const current = heatmap.keyStats.get(key) || { attempts: 0, correct: 0, avgTimeMs: 0 };
      const newAttempts = current.attempts + (stat.attempts || 0);
      const newCorrect = current.correct + (stat.correct || 0);
      const newAvgTime = newAttempts > 0
        ? Math.round(((current.attempts * current.avgTimeMs) + ((stat.attempts || 0) * (stat.avgTimeMs || 0))) / newAttempts)
        : current.avgTimeMs;

      heatmap.keyStats.set(key, {
        attempts: newAttempts,
        correct: newCorrect,
        avgTimeMs: newAvgTime
      });
    }

    await heatmap.save();
    await del(generateKey('typing', 'heatmap', userId, language));
    return res.json({ success: true, data: heatmap });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
