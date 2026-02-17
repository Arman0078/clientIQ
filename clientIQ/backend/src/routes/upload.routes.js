import express from 'express';
import multer from 'multer';
import { protect } from '../middleware/auth.middleware.js';
import { uploadImage } from '../controllers/upload.controller.js';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post('/', protect, upload.single('file'), uploadImage);
// For registration (no auth) - rate limit in production recommended
router.post('/register', upload.single('file'), uploadImage);

export default router;
