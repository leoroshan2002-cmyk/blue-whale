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
router.post('/', upload.single('image'), createCategory);
router.put('/:id', upload.single('image'), updateCategory);
router.delete('/:id', deleteCategory);

export default router;
