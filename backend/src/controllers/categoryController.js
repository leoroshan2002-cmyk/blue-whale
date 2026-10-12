import Category from '../models/Category.js';
import { uploadToCloudinary } from '../middleware/cloudinaryStorage.js';
import cloudinary from '../config/cloudinary.js';

const toCategoryResponse = (category) => {
  const doc = category.toObject();
  doc.id = doc._id.toString();
  delete doc._id;
  return doc;
};

export const listCategories = async (_req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, categories: categories.map(toCategoryResponse) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const normalizeCategoryPayload = (payload) => {
  if (payload.subCategories === null || payload.subCategories === undefined) {
    payload.subCategories = [];
  }

  if (typeof payload.subCategories === 'string') {
    const raw = payload.subCategories.trim();
    if (!raw) {
      payload.subCategories = [];
    } else {
      try {
        payload.subCategories = JSON.parse(raw);
      } catch {
        payload.subCategories = raw
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean);
      }
    }
  }

  if (!Array.isArray(payload.subCategories)) {
    payload.subCategories = [String(payload.subCategories).trim()].filter(Boolean);
  }

  payload.subCategories = payload.subCategories
    .map((item) => String(item).trim())
    .filter(Boolean);

  if (!payload.subCategory || typeof payload.subCategory !== 'string' || !payload.subCategory.trim()) {
    payload.subCategory = payload.subCategories[0] || '';
  } else {
    payload.subCategory = payload.subCategory.trim();
  }

  return payload;
};

export const createCategory = async (req, res) => {
  try {
    const payload = normalizeCategoryPayload({ ...req.body });
    if (req.file) {
      try {
        const cloudinaryResult = await uploadToCloudinary(req.file);
        payload.image = cloudinaryResult.secure_url;
        payload.cloudinaryPublicId = cloudinaryResult.public_id;
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return res.status(500).json({ message: 'Image upload failed', error: uploadError.message });
      }
    }
    const category = await Category.create(payload);
    res.status(201).json({ success: true, category: toCategoryResponse(category) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = normalizeCategoryPayload({ ...req.body });
    
    if (req.file) {
      try {
        const cloudinaryResult = await uploadToCloudinary(req.file);
        payload.image = cloudinaryResult.secure_url;
        payload.cloudinaryPublicId = cloudinaryResult.public_id;
        
        // Delete old image from Cloudinary if it exists
        const existingCategory = await Category.findById(id);
        if (existingCategory && existingCategory.cloudinaryPublicId) {
          await cloudinary.uploader.destroy(existingCategory.cloudinaryPublicId);
        }
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return res.status(500).json({ message: 'Image upload failed', error: uploadError.message });
      }
    }
    
    const updatedCategory = await Category.findByIdAndUpdate(id, payload, { new: true, runValidators: true });

    if (!updatedCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.status(200).json({ success: true, category: toCategoryResponse(updatedCategory) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCategory = await Category.findByIdAndDelete(id);

    if (!deletedCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.status(200).json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
