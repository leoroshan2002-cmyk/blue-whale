import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    firstName: {
      type: String,
      trim: true,
      default: '',
    },
    lastName: {
      type: String,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    avatar: {
      type: String,
      trim: true,
      default: '',
    },
    password: {
      type: String,
      trim: true,
      default: '',
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationCode: {
      type: String,
      trim: true,
      default: '',
    },
    emailVerificationExpiresAt: {
      type: Date,
    },
    emailVerificationRequestedAt: {
      type: Date,
    },
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    setPasswordOtp: {
      type: String,
      trim: true,
      default: '',
    },
    setPasswordOtpExpiresAt: {
      type: Date,
    },
    setPasswordOtpRequestedAt: {
      type: Date,
    },
    setPasswordOtpVerifiedAt: {
      type: Date,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    gender: {
      type: String,
      trim: true,
      default: '',
    },
    birthday: {
      type: String,
      trim: true,
      default: '',
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    orders: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
      default: [],
    },
    city: {
      type: String,
      trim: true,
      default: '',
    },
    state: {
      type: String,
      trim: true,
      default: '',
    },
    zip: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
