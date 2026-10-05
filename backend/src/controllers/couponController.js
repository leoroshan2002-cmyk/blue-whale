import Coupon from '../models/Coupon.js';

const toCouponResponse = (coupon) => {
  if (!coupon) return null;
  const doc = coupon.toObject ? coupon.toObject() : { ...coupon };
  doc.id = doc._id.toString();
  delete doc._id;
  return doc;
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
