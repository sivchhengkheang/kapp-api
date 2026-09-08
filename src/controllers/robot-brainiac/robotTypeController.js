import RobotType from '../../models/robot-brainiac/RobotType.js';
import { get, set, generateKey, TTL } from '../../utils/cache.js';

export const getRobotTypes = async (req, res) => {
  try {
    const cacheKey = generateKey('robot-type', 'list', req.query);
    const cached = await get(cacheKey);
    if (cached) return res.status(200).json(cached);

    const { isActive, isPremium } = req.query;
    const filter = {};
    if (isActive !== undefined) filter['status.isActive'] = isActive === 'true';
    if (isPremium !== undefined) filter['status.isPremium'] = isPremium === 'true';

    const robotTypes = await RobotType.find(filter).sort({ createdAt: 1 });
    const responseData = { success: true, count: robotTypes.length, data: robotTypes };

    await set(cacheKey, responseData, TTL.LONG_STATIC);
    return res.status(200).json(responseData);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getRobotTypeById = async (req, res) => {
  try {
    const cacheKey = generateKey('robot-type', 'detail', req.params.id);
    const cached = await get(cacheKey);
    if (cached) return res.status(200).json(cached);

    const robotType = await RobotType.findById(req.params.id);
    if (!robotType) {
      return res.status(404).json({ success: false, message: 'RobotType not found.' });
    }

    const responseData = { success: true, data: robotType };
    await set(cacheKey, responseData, TTL.LONG_STATIC);
    return res.status(200).json(responseData);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
