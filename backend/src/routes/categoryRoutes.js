import express from 'express';
import upload from '../middleware/cloudinaryStorage.js';
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from '../controllers/categoryController.js';

const router = express.Router();

router.get('/', listCategories);
const categoryImages = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'subcategoryImages', maxCount: 10 },
]);

router.post('/', categoryImages, createCategory);
router.put('/:id', categoryImages, updateCategory);
router.delete('/:id', deleteCategory);

export default router;
