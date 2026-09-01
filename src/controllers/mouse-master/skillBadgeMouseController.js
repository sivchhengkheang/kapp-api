import SkillBadgeMouse from '../../models/mouse-master/SkillBadgeMouse.js';

// ── GET /api/mouse-master/badges/user/:userId ─────────────────────────────────
export const getBadgesByUser = async (req, res) => {
  try {
    const badges = await SkillBadgeMouse.find({ userAccountId: req.params.userId })
      .sort({ earnedAt: -1 });
    return res.status(200).json({ success: true, count: badges.length, data: badges });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET /api/mouse-master/badges/user/:userId/:categoryKey ────────────────────
export const getBadgeByCategory = async (req, res) => {
  try {
    const badge = await SkillBadgeMouse.findOne({
      userAccountId: req.params.userId,
      categoryKey:   req.params.categoryKey
    });
    if (!badge) return res.status(404).json({ success: false, message: 'Badge not found.' });
    return res.status(200).json({ success: true, data: badge });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── POST /api/mouse-master/badges ─────────────────────────────────────────────
// Called internally by session-complete hook; exposed for flexibility
export const awardBadge = async (req, res) => {
  try {
    const badge = await SkillBadgeMouse.create(req.body);
    return res.status(201).json({ success: true, data: badge });
  } catch (error) {
    // Duplicate key = badge already earned
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Badge already earned for this category.' });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};
