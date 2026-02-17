import mongoose from 'mongoose';

export const validateObjectId = (paramName = 'id') => (req, res, next) => {
  const id = req.params[paramName];
  if (!id || !mongoose.Types.ObjectId.isValid(id) || String(new mongoose.Types.ObjectId(id)) !== String(id)) {
    return res.status(400).json({ message: 'Invalid ID' });
  }
  next();
};
