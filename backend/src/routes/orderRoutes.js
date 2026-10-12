import express from 'express';
import {
  cancelOrder,
  createOrder,
  deleteOrder,
  getOrderById,
  getOrdersByUser,
  listOrders,
  updateOrderStatus,
} from '../controllers/orderController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, adminOnly, listOrders);
router.get('/:id', protect, getOrderById);
router.get('/user/:userId', protect, getOrdersByUser);
router.post('/', protect, createOrder);
router.put('/:id', protect, adminOnly, updateOrderStatus);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);
router.patch('/:id/status', protect, adminOnly, updateOrderStatus);
router.patch('/:id/cancel', protect, cancelOrder);
router.delete('/:id', protect, adminOnly, deleteOrder);

export default router;
