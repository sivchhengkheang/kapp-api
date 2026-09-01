import BossBattleDragon from '../../models/dragon-drop/BossBattle.js';
import WorldDragon from '../../models/dragon-drop/World.js';

export const getBossForWorld = async (req, res) => {
  try {
    const world = await WorldDragon.findOne({ worldNumber: req.params.world }).populate('boss.bossId');
    if (!world || !world.boss) return res.status(404).json({ success: false, message: 'Boss not found' });
    res.status(200).json({ success: true, data: world.boss });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const startBossBattle = async (req, res) => {
  try {
    const world = await WorldDragon.findOne({ worldNumber: req.params.world });
    if (!world || !world.boss) return res.status(404).json({ success: false, message: 'Boss not found' });

    const battle = await BossBattleDragon.create({
      userAccountId: req.body.userAccountId,
      bossLevelId: world.boss.bossId,
      bossName: world.boss.name,
      worldNumber: world.worldNumber,
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
