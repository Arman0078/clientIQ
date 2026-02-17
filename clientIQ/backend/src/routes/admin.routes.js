import express from 'express';
import { getPlatformStats } from '../controllers/admin.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { adminOnly } from '../middleware/admin.middleware.js';

const router = express.Router();

router.use(protect);
router.use(adminOnly);

router.get('/stats', getPlatformStats);

export default router;
