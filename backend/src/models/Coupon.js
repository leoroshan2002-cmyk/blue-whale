import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      trim: true,
      uppercase: true,
      unique: true,
    },
    type: {
      type: String,
      enum: ['Percentage', 'FixedAmount'],
      default: 'Percentage',
    },
    value: {
      type: Number,
      required: [true, 'Coupon value is required'],
      min: 0,
      default: 0,
    },
    minSpend: {
      type: Number,
      min: 0,
      default: 0,
    },
    expirationDate: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    usesCount: {
      type: Number,
      min: 0,
      default: 0,
    },
    usageLimit: {
      type: Number,
      min: 0,
      default: 0,
    },
    description: {
      type: String,
      default: '',
    },
    createdBy: {
      type: String,
      default: 'admin',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Coupon', couponSchema);
