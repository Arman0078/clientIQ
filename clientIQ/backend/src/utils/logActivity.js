import Activity from '../models/Activity.js';

export const logActivity = async (type, entityType, entityId, description, userId, metadata = {}) => {
  try {
    await Activity.create({
      type,
      entityType,
      entityId,
      description,
      metadata,
      createdBy: userId,
    });
  } catch (err) {
    console.error('Failed to log activity:', err.message);
  }
};
