import Achievement from '../../models/shared/Achievement.js';

// POST /api/shared/achievements
// Create a new achievement definition
export const createAchievement = async (req, res) => {
  try {
    const { achievementId } = req.body;

    if (!achievementId) {
      return res.status(400).json({ success: false, message: 'achievementId is required.' });
    }

    const achievement = await Achievement.create(req.body);
    return res.status(201).json({ success: true, data: achievement });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Achievement with this ID already exists.' });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/shared/achievements
// List all achievements, with optional filters: category, rarity
export const getAchievements = async (req, res) => {
  try {
    const { category, rarity } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (rarity) filter.rarity = rarity;

    const achievements = await Achievement.find(filter).sort({ displayOrder: 1 });
    return res.status(200).json({ success: true, count: achievements.length, data: achievements });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/shared/achievements/:id
// Get a single achievement by its MongoDB document ID
export const getAchievementById = async (req, res) => {
  try {
    const achievement = await Achievement.findById(req.params.id);

    if (!achievement) {
      return res.status(404).json({ success: false, message: 'Achievement not found.' });
    }

    return res.status(200).json({ success: true, data: achievement });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/shared/achievements/:id
// Update an achievement definition
export const updateAchievement = async (req, res) => {
  try {
    const achievement = await Achievement.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { returnDocument: 'after', runValidators: true }
    );

    if (!achievement) {
      return res.status(404).json({ success: false, message: 'Achievement not found.' });
    }

    return res.status(200).json({ success: true, data: achievement });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/shared/achievements/:id
// Delete an achievement definition
export const deleteAchievement = async (req, res) => {
  try {
    const achievement = await Achievement.findByIdAndDelete(req.params.id);

    if (!achievement) {
      return res.status(404).json({ success: false, message: 'Achievement not found.' });
    }

    return res.status(200).json({ success: true, message: 'Achievement deleted.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
