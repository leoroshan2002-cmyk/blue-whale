import express from 'express';
import { getAdminDashboard } from '../controllers/adminController.js';
import { getAdminProfile, updateAdminProfile, changeAdminPassword } from '../controllers/adminProfileController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import upload from '../middleware/cloudinaryStorage.js';
import productRoutes from './productRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import orderRoutes from './orderRoutes.js';
import userRoutes from './userRoutes.js';
import couponRoutes from './couponRoutes.js';
import campaignRoutes from './campaignRoutes.js';

const router = express.Router();

router.use(protect);
router.use(adminOnly);

router.get('/dashboard', getAdminDashboard);
router.get('/profile', getAdminProfile);
router.put('/profile', upload.single('avatar'), updateAdminProfile);
router.put('/profile/password', changeAdminPassword);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/categories', categoryRoutes);
router.use('/customers', userRoutes);
router.use('/coupons', couponRoutes);
router.use('/campaigns', campaignRoutes);

export default router;
