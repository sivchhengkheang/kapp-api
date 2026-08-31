import UserStatistic from '../../models/shared/UserStatistic.js';

// POST /api/shared/statistics
// Create a new statistics document for a user
export const createUserStatistic = async (req, res) => {
  try {
    const { userAccountId } = req.body;

    if (!userAccountId) {
      return res.status(400).json({ success: false, message: 'userAccountId is required.' });
    }

    const existing = await UserStatistic.findOne({ userAccountId });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Statistics document already exists for this user.',
        data: existing,
      });
    }

    const statDoc = await UserStatistic.create(req.body);
    return res.status(201).json({ success: true, data: statDoc });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/shared/statistics/:userId
// Get statistics for a user by their account ID
export const getUserStatistic = async (req, res) => {
  try {
    const statDoc = await UserStatistic.findOne({ userAccountId: req.params.userId });

    if (!statDoc) {
      return res.status(404).json({ success: false, message: 'Statistics not found for this user.' });
    }

    return res.status(200).json({ success: true, data: statDoc });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/shared/statistics/:userId
// Partially update a user's statistics (increments, set fields, push history)
export const updateUserStatistic = async (req, res) => {
  try {
    const statDoc = await UserStatistic.findOneAndUpdate(
      { userAccountId: req.params.userId },
      { $set: req.body },
      { returnDocument: 'after', runValidators: true }
    );

    if (!statDoc) {
      return res.status(404).json({ success: false, message: 'Statistics not found for this user.' });
    }

    return res.status(200).json({ success: true, data: statDoc });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/shared/statistics/:userId/increment
// Increment specific numeric fields atomically (e.g., after a game session)
export const incrementUserStatistic = async (req, res) => {
  try {
    const statDoc = await UserStatistic.findOneAndUpdate(
      { userAccountId: req.params.userId },
      { $inc: req.body },
      { returnDocument: 'after', runValidators: true }
    );

    if (!statDoc) {
      return res.status(404).json({ success: false, message: 'Statistics not found for this user.' });
    }

    return res.status(200).json({ success: true, data: statDoc });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/shared/statistics/:userId
// Delete a user's statistics document
export const deleteUserStatistic = async (req, res) => {
  try {
    const statDoc = await UserStatistic.findOneAndDelete({ userAccountId: req.params.userId });

    if (!statDoc) {
      return res.status(404).json({ success: false, message: 'Statistics not found for this user.' });
    }

    return res.status(200).json({ success: true, message: 'Statistics document deleted.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
