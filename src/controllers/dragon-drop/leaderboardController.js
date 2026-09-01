import LeaderboardDragon from '../../models/dragon-drop/Leaderboard.js';

export const getGlobalLeaderboard = async (req, res) => {
  try {
    const leaderboards = await LeaderboardDragon.find({ boardType: 'global' }).sort({ rank: 1 }).limit(100);
    res.status(200).json({ success: true, data: leaderboards });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getStarsLeaderboard = async (req, res) => {
  try {
    const leaderboards = await LeaderboardDragon.find({ boardType: 'stars' }).sort({ rank: 1 }).limit(100);
    res.status(200).json({ success: true, data: leaderboards });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getWorldLeaderboard = async (req, res) => {
  try {
    const leaderboards = await LeaderboardDragon.find({ 
      boardType: 'by_world',
      worldNumber: req.params.world
    }).sort({ rank: 1 }).limit(100);
    res.status(200).json({ success: true, data: leaderboards });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getLevelLeaderboard = async (req, res) => {
  try {
    const leaderboards = await LeaderboardDragon.find({ 
      boardType: 'by_level',
      levelNumber: req.params.level
    }).sort({ rank: 1 }).limit(100);
    res.status(200).json({ success: true, data: leaderboards });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
