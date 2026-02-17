import express from 'express';
import { draftEmail, summarizeContact } from '../controllers/ai.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.post('/draft-email', draftEmail);
router.post('/summarize', summarizeContact);

export default router;
