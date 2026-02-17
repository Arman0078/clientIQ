import express from 'express';
import {
  getRevenueReport,
  getFunnelReport,
  getSummaryReport,
  exportLeadsCsv,
  exportCustomersCsv,
} from '../controllers/report.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/revenue', getRevenueReport);
router.get('/funnel', getFunnelReport);
router.get('/summary', getSummaryReport);
router.get('/export/leads', exportLeadsCsv);
router.get('/export/customers', exportCustomersCsv);

export default router;
