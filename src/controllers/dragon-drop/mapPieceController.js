import LevelProgressDragon from '../../models/dragon-drop/LevelProgress.js';

// GET /api/dragon-drop/map-pieces/collected
export const getCollectedMapPieces = async (req, res) => {
  try {
    const levelProgresses = await LevelProgressDragon.find({ userAccountId: req.query.userAccountId });
    const collectedPieces = levelProgresses.flatMap(p => p.mapPiecesCollected);
    res.status(200).json({ success: true, data: collectedPieces });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/dragon-drop/map-pieces/world/:world
export const getMapPiecesByWorld = async (req, res) => {
  try {
    const levelProgresses = await LevelProgressDragon.find({
      userAccountId: req.query.userAccountId,
      worldNumber: Number(req.params.world)
    });
    const collectedPieces = levelProgresses.flatMap(p => p.mapPiecesCollected);
    res.status(200).json({ success: true, data: collectedPieces });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
