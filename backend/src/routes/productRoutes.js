import express from 'express';
import upload from '../middleware/cloudinaryStorage.js';
import {
  createProduct,
  deleteProduct,
  getProductById,
  listProducts,
  updateProduct,
} from '../controllers/productController.js';

const router = express.Router();

router.get('/', listProducts);
router.get('/:id', getProductById);
router.post('/', upload.array('productImage', 8), createProduct);
router.put('/:id', upload.array('productImage', 8), updateProduct);
router.delete('/:id', deleteProduct);

export default router;
