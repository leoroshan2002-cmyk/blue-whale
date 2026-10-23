import mongoose from 'mongoose';
import Category from '../models/Category.js';
import { uploadToCloudinary } from '../middleware/cloudinaryStorage.js';
import cloudinary from '../config/cloudinary.js';

const toCategoryResponse = (category) => {
  const doc = category.toObject ? category.toObject() : { ...category };
  doc.id = String(doc._id || doc.id);
  delete doc._id;
  return doc;
};

const sendCategoryError = (res, error, action) => {
  if (error?.code === 11000) {
    const duplicateField = Object.keys(error.keyPattern || error.keyValue || {})[0];
    const message = duplicateField
      ? `A category with this ${duplicateField} already exists.`
      : 'A category with this name or slug already exists.';
    return res.status(409).json({ success: false, message });
  }

  if (error?.name === 'ValidationError') {
    const message = Object.values(error.errors || {})
      .map((validationError) => validationError.message)
      .join(' ');
    return res.status(400).json({ success: false, message: message || 'Invalid category data.' });
  }

  if (error?.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid category ID.' });
  }

  console.error(`Failed to ${action} category:`, error);
  return res.status(500).json({ success: false, message: `Unable to ${action} category.` });
};

export const listCategories = async (_req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, categories: categories.map(toCategoryResponse) });
  } catch (error) {
    return sendCategoryError(res, error, 'load');
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

  if (typeof payload.subCategoryCards === 'string') {
    try {
      payload.subCategoryCards = JSON.parse(payload.subCategoryCards);
    } catch {
      payload.subCategoryCards = [];
    }
  }
  if (!Array.isArray(payload.subCategoryCards)) payload.subCategoryCards = [];
  payload.subCategoryCards = payload.subCategoryCards
    .filter((card) => card && typeof card === 'object' && !Array.isArray(card))
    .map((card) => ({
      name: String(card.name || '').trim(),
      subtitle: String(card.subtitle || '').trim(),
      image: String(card.image || '').trim(),
      imageFileIndex: Number.isInteger(Number(card.imageFileIndex)) ? Number(card.imageFileIndex) : null,
    }))
    .filter((card) => card.name);
  payload.subCategories = Array.from(new Set([
    ...payload.subCategories,
    ...payload.subCategoryCards.map((card) => card.name),
  ]));

  if (!payload.subCategory || typeof payload.subCategory !== 'string' || !payload.subCategory.trim()) {
    payload.subCategory = payload.subCategories[0] || '';
  } else {
    payload.subCategory = payload.subCategory.trim();
  }

  return payload;
};

const applySubcategoryImages = async (payload, files = []) => {
  const cards = payload.subCategoryCards || [];
  for (const card of cards) {
    const file = card.imageFileIndex === null ? null : files[card.imageFileIndex];
    if (file) {
      const uploaded = await uploadToCloudinary(file, 'categories/subcategories');
      card.image = uploaded.secure_url;
    }
    delete card.imageFileIndex;
  }
};

export const createCategory = async (req, res) => {
  try {
    const payload = normalizeCategoryPayload({ ...req.body });
    const files = req.files || {};
    if (files.image?.[0]) {
      try {
        const cloudinaryResult = await uploadToCloudinary(files.image[0]);
        payload.image = cloudinaryResult.secure_url;
        payload.cloudinaryPublicId = cloudinaryResult.public_id;
        await applySubcategoryImages(payload, files.subcategoryImages || []);
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return res.status(500).json({ message: 'Image upload failed', error: uploadError.message });
      }
    } else {
      try {
        await applySubcategoryImages(payload, files.subcategoryImages || []);
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return res.status(500).json({ message: 'Image upload failed', error: uploadError.message });
      }
    }
    const category = await Category.create(payload);
    res.status(201).json({ success: true, category: toCategoryResponse(category) });
  } catch (error) {
    return sendCategoryError(res, error, 'create');
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid category ID.' });
    }

    const payload = normalizeCategoryPayload({ ...req.body });
    const files = req.files || {};
    
    if (files.image?.[0] || files.subcategoryImages?.length) {
      try {
        if (files.image?.[0]) {
          const cloudinaryResult = await uploadToCloudinary(files.image[0]);
          payload.image = cloudinaryResult.secure_url;
          payload.cloudinaryPublicId = cloudinaryResult.public_id;
        }
        await applySubcategoryImages(payload, files.subcategoryImages || []);
        
        // Delete old image from Cloudinary if it exists
        const existingCategory = await Category.findById(id);
        if (files.image?.[0] && existingCategory?.cloudinaryPublicId) {
          await cloudinary.uploader.destroy(existingCategory.cloudinaryPublicId);
        }
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return res.status(500).json({ message: 'Image upload failed', error: uploadError.message });
      }

      if (!files.image?.[0]) {
        const existingCategory = await Category.findById(id).select('image cloudinaryPublicId');
        if (existingCategory) {
          payload.image = existingCategory.image;
          payload.cloudinaryPublicId = existingCategory.cloudinaryPublicId;
        }
      }
    }
    
    const updatedCategory = await Category.findByIdAndUpdate(id, payload, { new: true, runValidators: true });

    if (!updatedCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.status(200).json({ success: true, category: toCategoryResponse(updatedCategory) });
  } catch (error) {
    return sendCategoryError(res, error, 'update');
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid category ID.' });
    }

    const deletedCategory = await Category.findByIdAndDelete(id);

    if (!deletedCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.status(200).json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    return sendCategoryError(res, error, 'delete');
  }
};
