import express from 'express';
import {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from '../controllers/customer.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validateObjectId } from '../middleware/validateObjectId.js';

const router = express.Router();

router.use(protect);

router.route('/').get(getCustomers).post(createCustomer);
router.route('/:id').all(validateObjectId()).get(getCustomer).put(updateCustomer).delete(deleteCustomer);

export default router;
