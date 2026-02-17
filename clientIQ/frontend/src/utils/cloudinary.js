/**
 * Upload image via backend (backend uses Cloudinary with API keys).
 * Uses authenticated /api/upload for logged-in users.
 */
import { uploadImage, uploadImageRegister } from '../services/api';

export async function uploadToCloudinary(file, options = {}) {
  const { forRegister = false } = options;
  const uploadFn = forRegister ? uploadImageRegister : uploadImage;

  const res = await uploadFn(file);
  const url = res.data?.url;
  if (!url) throw new Error('Upload failed');
  return url;
}
