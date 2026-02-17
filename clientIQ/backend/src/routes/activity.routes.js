import express from 'express';
import { getActivities, getRecentActivities } from '../controllers/activity.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getActivities);
router.get('/recent', getRecentActivities);

export default router;
