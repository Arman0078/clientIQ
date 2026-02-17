import Activity from '../models/Activity.js';

export const getActivities = async (req, res) => {
  try {
    const pageNum = Math.max(1, parseInt(req.query.page) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(req.query.limit) || 20));
    const entityType = req.query.entityType || '';
    const entityId = req.query.entityId || '';
    const type = req.query.type || '';
    const skip = (pageNum - 1) * limitNum;

    const filter = { createdBy: req.user._id };
    if (entityType) filter.entityType = entityType;
    if (entityId) filter.entityId = entityId;
    if (type) filter.type = type;

    const [activities, total] = await Promise.all([
      Activity.find(filter)
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Activity.countDocuments(filter),
    ]);

    res.json({
      activities,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const getRecentActivities = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const activities = await Activity.find({ createdBy: req.user._id })
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};
