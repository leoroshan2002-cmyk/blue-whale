import express from 'express';
import {
  createCoupon,
  deleteCoupon,
  listCoupons,
  toggleCoupon,
  updateCoupon,
} from '../controllers/couponController.js';

const router = express.Router();

router.get('/', listCoupons);
router.post('/', createCoupon);
router.put('/:id', updateCoupon);
router.patch('/:id/toggle', toggleCoupon);
router.delete('/:id', deleteCoupon);

export default router;
