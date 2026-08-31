import RobotType from '../../models/robot-brainiac/RobotType.js';

export const getRobotTypes = async (req, res) => {
  try {
    const { isActive, isPremium } = req.query;
    const filter = {};
    if (isActive !== undefined) filter['status.isActive'] = isActive === 'true';
    if (isPremium !== undefined) filter['status.isPremium'] = isPremium === 'true';

    const robotTypes = await RobotType.find(filter).sort({ createdAt: 1 });
    return res.status(200).json({ success: true, count: robotTypes.length, data: robotTypes });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getRobotTypeById = async (req, res) => {
  try {
    const robotType = await RobotType.findById(req.params.id);
    if (!robotType) {
      return res.status(404).json({ success: false, message: 'RobotType not found.' });
    }
    return res.status(200).json({ success: true, data: robotType });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
