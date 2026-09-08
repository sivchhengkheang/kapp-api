import WorldDragon from '../../models/dragon-drop/World.js';
import LevelDragon from '../../models/dragon-drop/Level.js';
import { get, set, delPattern, generateKey, TTL } from '../../utils/cache.js';

export const getWorlds = async (req, res) => {
  try {
    const cacheKey = 'dragon:worlds';
    const cached = await get(cacheKey);
    if (cached) return res.json(cached);

    const worlds = await WorldDragon.find({ 'status.isPublished': true }).sort({ worldNumber: 1 });
    const body = { success: true, data: worlds };
    await set(cacheKey, body, TTL.LONG_STATIC);
    res.status(200).json(body);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getWorldByNumber = async (req, res) => {
  try {
    const cacheKey = generateKey('dragon', 'world', req.params.worldNumber);
    const cached = await get(cacheKey);
    if (cached) return res.json(cached);

    const world = await WorldDragon.findOne({ worldNumber: req.params.worldNumber });
    if (!world) return res.status(404).json({ success: false, message: 'World not found' });

    const body = { success: true, data: world };
    await set(cacheKey, body, TTL.LONG_STATIC);
    res.status(200).json(body);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getWorldLevels = async (req, res) => {
  try {
    const cacheKey = generateKey('dragon', 'world', req.params.worldNumber, 'levels');
    const cached = await get(cacheKey);
    if (cached) return res.json(cached);

    const levels = await LevelDragon.find({
      worldNumber: req.params.worldNumber,
      'status.isPublished': true
    }).sort({ levelNumber: 1 });

    const body = { success: true, data: levels };
    await set(cacheKey, body, TTL.STATIC);
    res.status(200).json(body);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
