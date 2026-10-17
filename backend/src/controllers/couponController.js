import Coupon from '../models/Coupon.js';
import { evaluateCoupon } from '../utils/couponUtils.js';

const toCouponResponse = (coupon) => {
  if (!coupon) return null;
  const doc = coupon.toObject ? coupon.toObject() : { ...coupon };
  doc.id = doc._id.toString();
  delete doc._id;
  return doc;
};

export const validatePublicCoupon = async (req, res) => {
  try {
    const code = String(req.query.code || '').trim().toUpperCase();
    const subtotal = Number(req.query.subtotal);
    if (!code || !Number.isFinite(subtotal) || subtotal < 0) {
      return res.status(400).json({ success: false, message: 'A coupon code and valid subtotal are required.' });
    }

    const coupon = await Coupon.findOne({ code });
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found.' });
    const result = evaluateCoupon(coupon, subtotal);
    if (!result.isValid) {
      const messages = {
        inactive: 'This coupon is currently inactive.',
        expired: 'This coupon has expired.',
        'min-spend': "The order does not meet this coupon's minimum spend.",
        'limit-reached': 'This coupon has reached its usage limit.',
      };
      return res.status(400).json({
        success: false,
        message: messages[result.reason] || 'This coupon cannot be used for this order.',
      });
    }

    return res.status(200).json({
      success: true,
      coupon: toCouponResponse(coupon),
      discountAmount: result.discountAmount,
    });
  } catch (error) {
    console.error('Failed to validate public coupon:', error);
    return res.status(500).json({ success: false, message: 'Unable to validate coupon.' });
  }
};

export const listCoupons = async (_req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, coupons: coupons.map(toCouponResponse) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createCoupon = async (req, res) => {
  try {
    const payload = {
      code: String(req.body.code || '').trim().toUpperCase(),
      type: req.body.type || 'Percentage',
      value: Number(req.body.value ?? 0) || 0,
      minSpend: Number(req.body.minSpend ?? 0) || 0,
      expirationDate: req.body.expirationDate ? new Date(req.body.expirationDate) : null,
      isActive: req.body.isActive !== false,
      usesCount: Number(req.body.usesCount ?? 0) || 0,
      usageLimit: Number(req.body.usageLimit ?? 0) || 0,
      description: req.body.description || '',
      createdBy: req.body.createdBy || 'admin',
    };

    const coupon = await Coupon.create(payload);
    res.status(201).json({ success: true, coupon: toCouponResponse(coupon) });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(400).json({ success: false, message: 'Coupon code already exists.' });
    }
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findByIdAndUpdate(
      id,
      {
        code: String(req.body.code || '').trim().toUpperCase(),
        type: req.body.type || 'Percentage',
        value: Number(req.body.value ?? 0) || 0,
        minSpend: Number(req.body.minSpend ?? 0) || 0,
        expirationDate: req.body.expirationDate ? new Date(req.body.expirationDate) : null,
        isActive: req.body.isActive !== false,
        usesCount: Number(req.body.usesCount ?? 0) || 0,
        usageLimit: Number(req.body.usageLimit ?? 0) || 0,
        description: req.body.description || '',
      },
      { new: true, runValidators: true }
    );

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    res.status(200).json({ success: true, coupon: toCouponResponse(coupon) });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(400).json({ success: false, message: 'Coupon code already exists.' });
    }
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const toggleCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    coupon.isActive = !coupon.isActive;
    await coupon.save();
    res.status(200).json({ success: true, coupon: toCouponResponse(coupon) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    res.status(200).json({ success: true, message: 'Coupon deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
