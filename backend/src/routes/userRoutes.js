import express from 'express';
import upload from '../middleware/cloudinaryStorage.js';
import {
  createCustomer,
  addToWishlist,
  clearWishlist,
  deleteCustomer,
  getCustomer,
  getMyCart,
  getMyPreferences,
  getMyWishlist,
  listCustomers,
  removeFromWishlist,
  updateMyCart,
  updateMyPassword,
  updateMyPreferences,
  updateCustomer,
} from '../controllers/userController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/me/cart', protect, getMyCart);
router.put('/me/cart', protect, updateMyCart);
router.get('/me/wishlist', protect, getMyWishlist);
router.post('/me/wishlist', protect, addToWishlist);
router.delete('/me/wishlist', protect, clearWishlist);
router.delete('/me/wishlist/:productId', protect, removeFromWishlist);
router.get('/me/preferences', protect, getMyPreferences);
router.put('/me/preferences', protect, updateMyPreferences);
router.put('/me/password', protect, updateMyPassword);
router.get('/', protect, adminOnly, listCustomers);
router.get('/:id', protect, getCustomer);
router.post('/createuser', protect, adminOnly, createCustomer);
router.put('/:id', protect, upload.single('avatar'), updateCustomer);
router.delete('/:id', protect, adminOnly, deleteCustomer);

export default router;
