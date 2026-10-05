import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, default: '' },
    color: { type: String, default: '' },
    size: { type: String, default: '' },
  },
  { _id: false }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, default: '' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    pincode: { type: String, default: '' },
    zip: { type: String, default: '' },
    country: { type: String, default: 'India' },
  },
  { _id: false }
);

const trackingHistoryItemSchema = new mongoose.Schema(
  {
    status: { type: String, default: '' },
    note: { type: String, default: '' },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    customerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      default: [],
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    subtotal: { type: Number, min: 0, default: 0 },
    shipping: { type: Number, min: 0, default: 0 },
    deliveryCost: { type: Number, min: 0, default: 0 },
    tax: { type: Number, min: 0, default: 0 },
    couponDiscount: { type: Number, min: 0, default: 0 },
    paymentStatus: {
      type: String,
      default: 'Pending',
    },
    trackingNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
    trackingHistory: {
      type: [trackingHistoryItemSchema],
      default: [],
    },
    courier: {
      type: String,
      default: 'Not Assigned',
      trim: true,
    },
    estimatedDelivery: {
      type: Date,
    },
    customerAvatar: {
      type: String,
      default: '',
    },
    paymentMethod: {
      type: String,
      default: 'Cash on Delivery',
    },
    razorpayOrderId: {
      type: String,
      default: '',
      trim: true,
    },
    razorpayPaymentId: {
      type: String,
      default: '',
      trim: true,
    },
    razorpaySignature: {
      type: String,
      default: '',
      trim: true,
    },
    transactionId: {
      type: String,
      default: '',
      trim: true,
    },
    shippingAddress: {
      type: shippingAddressSchema,
      default: () => ({}),
    },
    customerPhone: {
      type: String,
      default: '',
    },
    customerAddressText: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

orderSchema.pre('save', async function(next) {
  if (!this.isNew) {
    return next();
  }

  if (!this.trackingNumber) {
    let trackingNumber = '';
    let attempts = 0;

    while (attempts < 10) {
      trackingNumber = `HAI${Math.floor(100000000 + Math.random() * 900000000)}`;
      const existingOrder = await this.constructor.findOne({ trackingNumber }).select('_id');

      if (!existingOrder) {
        this.trackingNumber = trackingNumber;
        break;
      }

      attempts += 1;
    }

    if (!this.trackingNumber) {
      return next(new Error('Unable to generate a unique tracking number'));
    }
  }

  if (!this.estimatedDelivery) {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 5);
    this.estimatedDelivery = deliveryDate;
  }

  return next();
});

export default mongoose.model('Order', orderSchema);
