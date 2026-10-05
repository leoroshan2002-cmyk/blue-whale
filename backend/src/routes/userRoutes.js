import express from 'express';
import upload from '../middleware/cloudinaryStorage.js';
import {
  createCustomer,
  deleteCustomer,
  getCustomer,
  listCustomers,
  updateCustomer,
} from '../controllers/userController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, adminOnly, listCustomers);
router.get('/:id', protect, getCustomer);
router.post('/createuser', protect, adminOnly, createCustomer);
router.put('/:id', protect, upload.single('avatar'), updateCustomer);
router.delete('/:id', protect, adminOnly, deleteCustomer);

export default router;
