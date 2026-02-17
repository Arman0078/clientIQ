import express from 'express';
import {
  getTasks,
  getUpcomingTasks,
  createTask,
  updateTask,
  deleteTask,
} from '../controllers/task.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validateObjectId } from '../middleware/validateObjectId.js';

const router = express.Router();

router.use(protect);

router.get('/', getTasks);
router.get('/upcoming', getUpcomingTasks);
router.post('/', createTask);
router.put('/:id', validateObjectId(), updateTask);
router.delete('/:id', validateObjectId(), deleteTask);

export default router;
