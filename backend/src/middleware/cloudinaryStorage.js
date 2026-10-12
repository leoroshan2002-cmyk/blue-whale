import multer from 'multer';
import cloudinary from '../config/cloudinary.js';
import { v4 as uuidv4 } from 'uuid';

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (file.mimetype && file.mimetype.startsWith('image/')) {
      callback(null, true);
      return;
    }
    callback(new Error('Only image files are allowed'));
  },
});

const uploadToCloudinary = async (file, folder = 'categories') => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      public_id: uuidv4(),
    };

    cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
          });
        }
      }
    ).end(file.buffer);
  });
};

export { uploadToCloudinary };
export default upload;