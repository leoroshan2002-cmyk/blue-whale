import express from 'express';
import { validatePublicCoupon } from '../controllers/couponController.js';

const router = express.Router();

router.get('/validate', validatePublicCoupon);

export default router;
