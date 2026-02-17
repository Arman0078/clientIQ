import { v2 as cloudinary } from 'cloudinary';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' });
    }

    const { mimetype, size, buffer } = req.file;

    if (!ALLOWED_TYPES.includes(mimetype)) {
      return res.status(400).json({ message: 'Invalid file type. Use JPEG, PNG, WebP or GIF.' });
    }
    if (size > MAX_SIZE) {
      return res.status(400).json({ message: 'File too large. Max 5MB.' });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return res.status(500).json({ message: 'Cloudinary not configured on server' });
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });

    const dataUri = `data:${mimetype};base64,${buffer.toString('base64')}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: 'clientiq',
      resource_type: 'image',
    });

    res.json({ url: result.secure_url });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Upload failed' });
  }
};
