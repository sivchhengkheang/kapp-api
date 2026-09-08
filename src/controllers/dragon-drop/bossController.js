import mongoose from 'mongoose';
import BossBattleDragon from '../../models/dragon-drop/BossBattle.js';
import WorldDragon from '../../models/dragon-drop/World.js';
import { get, set, generateKey, TTL } from '../../utils/cache.js';

export const getBossForWorld = async (req, res) => {
  try {
    const cacheKey = generateKey('dragon', 'world-boss', req.params.world);
    const cached = await get(cacheKey);
    if (cached) return res.status(200).json(cached);

    const world = await WorldDragon.findOne({ worldNumber: req.params.world }).populate('boss.bossId');
    if (!world && Number(req.params.world) > 10) {
      return res.status(404).json({ success: false, message: 'Boss not found' });
    }

    const bossData = (world && world.boss && world.boss.name) ? world.boss : {
      name: 'Infernus the Fire Drake',
      worldNumber: Number(req.params.world),
      difficulty: 'hard',
      hp: 1000,
      specialMove: 'fire_tornado'
    };

    const responseData = { success: true, data: bossData };
    await set(cacheKey, responseData, TTL.LONG_STATIC);
    return res.status(200).json(responseData);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const startBossBattle = async (req, res) => {
  try {
    const world = await WorldDragon.findOne({ worldNumber: req.params.world });
    
    const bossName = world?.boss?.name || 'Infernus the Fire Drake';
    const bossLevelId = world?.boss?.bossId || new mongoose.Types.ObjectId();
    const worldNum = world ? world.worldNumber : Number(req.params.world);

    const battle = await BossBattleDragon.create({
      userAccountId: req.body.userAccountId,
      bossLevelId,
      bossName,
      worldNumber: worldNum,
      status: 'in_progress',
      attempts: { startedAt: new Date(), attemptNumber: 1 }
    });

    res.status(201).json({ success: true, data: battle });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const submitBossBattle = async (req, res) => {
  try {
    const { battleId, performance, rewards, battleResult } = req.body;
    
    const battle = await BossBattleDragon.findByIdAndUpdate(
      battleId,
      {
        $set: {
          status: 'completed',
          battleResult: battleResult,
          performance: performance || {},
          rewards: rewards || {},
          'attempts.endedAt': new Date()
        }
      },
      { new: true }
    );

    if (!battle) return res.status(404).json({ success: false, message: 'Battle not found' });

    res.status(200).json({ success: true, data: battle });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
