import express from 'express';
import { sendEmailToContact, getEmails } from '../controllers/email.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.post('/send', sendEmailToContact);
router.get('/', getEmails);

export default router;
