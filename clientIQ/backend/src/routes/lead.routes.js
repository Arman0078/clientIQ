import express from 'express';
import {
  getLeads,
  getLead,
  createLead,
  updateLead,
  addLeadNote,
  deleteLead,
  getDashboardStats,
} from '../controllers/lead.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validateObjectId } from '../middleware/validateObjectId.js';

const router = express.Router();

router.use(protect);

router.get('/dashboard', getDashboardStats);
router.route('/').get(getLeads).post(createLead);
router.route('/:id').all(validateObjectId()).get(getLead).put(updateLead).delete(deleteLead);
router.post('/:id/notes', validateObjectId(), addLeadNote);

export default router;
