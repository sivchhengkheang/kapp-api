import LevelDragon from '../../models/dragon-drop/Level.js';
import GameSessionDragon from '../../models/dragon-drop/GameSessionDragon.js';
import { get, set, del, delPattern, generateKey, TTL } from '../../utils/cache.js';

export const getLevelByNumber = async (req, res) => {
  try {
    const cacheKey = generateKey('dragon', 'level', req.params.levelNumber);
    const cached = await get(cacheKey);
    if (cached) return res.json(cached);

    const level = await LevelDragon.findOne({ levelNumber: req.params.levelNumber });
    if (!level) return res.status(404).json({ success: false, message: 'Level not found' });

    const body = { success: true, data: level };
    await set(cacheKey, body, TTL.STATIC);
    res.status(200).json(body);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const startLevel = async (req, res) => {
  try {
    const level = await LevelDragon.findOne({ levelNumber: req.params.levelNumber });
    if (!level) return res.status(404).json({ success: false, message: 'Level not found' });

    const session = await GameSessionDragon.create({
      userAccountId: req.body.userAccountId,
      levelId: level._id,
      levelNumber: level.levelNumber,
      worldNumber: level.worldNumber,
      difficulty: level.difficulty,
      timing: { startedAt: new Date(), pausedSeconds: 0 },
      performance: { status: 'in_progress' }
    });

    res.status(201).json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const submitLevel = async (req, res) => {
  try {
    const { sessionId, performance, collectibles, moveSequence, rewards } = req.body;
    
    const session = await GameSessionDragon.findByIdAndUpdate(
      sessionId,
      {
        $set: {
          'performance.status': 'completed',
          'performance.score': performance?.score || 0,
          'performance.starRating': performance?.starRating || 0,
          collectibles: collectibles || {},
          moveSequence: moveSequence || [],
          rewards: rewards || {},
          'timing.endedAt': new Date()
        }
      },
      { new: true }
    );

    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

    // Bust session cache
    await del(generateKey('session', 'dragon', sessionId));
    res.status(200).json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getLevelStats = async (req, res) => {
  try {
    const level = await LevelDragon.findOne({ levelNumber: req.params.levelNumber }).select('stats');
    if (!level) return res.status(404).json({ success: false, message: 'Level not found' });
    res.status(200).json({ success: true, data: level.stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getBestRun = async (req, res) => {
  try {
    const session = await GameSessionDragon.findOne({ 
      levelNumber: req.params.levelNumber,
      userAccountId: req.query.userAccountId,
      'performance.status': 'completed'
    }).sort({ 'performance.score': -1 });
    
    if (!session) return res.status(404).json({ success: false, message: 'No runs found' });
    res.status(200).json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getLevelAttempts = async (req, res) => {
  try {
    const sessions = await GameSessionDragon.find({ 
      levelNumber: req.params.levelNumber,
      userAccountId: req.query.userAccountId 
    }).sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, data: sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
