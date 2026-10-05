import crypto from 'crypto';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Razorpay from 'razorpay';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import emailService from '../services/email/emailService.js';

dotenv.config();

const razorpay = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  : null;

const normalizeOrderItem = (item) => {
  const productId = String(
    item.productId || item.product?.id || item.product?._id || item.product?.sku || item.id || item._id || item.sku || ''
  ).trim();
  const quantity = Number(item.quantity ?? item.qty ?? item.count ?? 1) || 1;
  const price = Number(item.price ?? item.discountPrice ?? item.salePrice ?? item.unitPrice ?? 0) || 0;

  return {
    productId,
    name: String(item.name || item.title || 'Product').trim() || 'Product',
    quantity: Math.max(1, quantity),
    price: Math.max(0, price),
    image: item.image || item.images?.[0] || item.imageUrl || item.productImage || '',
    color: item.color || item.selectedColor || item.variant?.color || '',
    size: item.size || item.selectedSize || item.variant?.size || '',
  };
};

const resolveItemImage = (item, product) => {
  const candidates = [
    item?.image,
    item?.images?.[0],
    item?.imageUrl,
    item?.productImage,
    item?.imagePath,
    product?.image,
    product?.images?.[0],
    product?.imageUrl,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim();
    }
  }

  return '';
};

const findProductByIdentifier = async (identifier) => {
  if (!identifier) return null;

  const candidate = String(identifier).trim();
  if (!candidate) return null;

  if (mongoose.isValidObjectId(candidate)) {
    return Product.findById(candidate);
  }

  return Product.findOne({ sku: candidate });
};

const normalizeShippingAddress = (payload = {}) => {
  const shipping = payload.shippingAddress || {};
  const customer = payload.customer || {};
  const addressLine = shipping.address || shipping.street || customer.address || payload.customerAddressText || '';
  const city = shipping.city || customer.city || '';
  const state = shipping.state || customer.state || '';
  const pincode = shipping.pincode || shipping.zip || customer.pincode || customer.zip || '';
  const country = shipping.country || customer.country || 'India';

  return {
    fullName: shipping.fullName || customer.fullName || payload.customerName || '',
    phone: shipping.phone || customer.phone || payload.customerPhone || '',
    address: addressLine,
    street: shipping.street || addressLine,
    city,
    state,
    pincode,
    zip: pincode,
    country,
  };
};

const normalizeTrackingHistory = (trackingHistory, fallbackStatus = 'Pending', fallbackNote = 'Order placed') => {
  if (Array.isArray(trackingHistory) && trackingHistory.length > 0) {
    return trackingHistory
      .filter(Boolean)
      .map((entry) => ({
        status: String(entry?.status || fallbackStatus).trim() || fallbackStatus,
        note: String(entry?.note || entry?.message || '').trim() || fallbackNote,
        updatedAt: entry?.updatedAt ? new Date(entry.updatedAt) : new Date(),
      }));
  }

  return [
    {
      status: String(fallbackStatus).trim() || 'Pending',
      note: fallbackNote,
      updatedAt: new Date(),
    },
  ];
};

export const normalizeCourierValue = (payload = {}) => {
  if (typeof payload?.courier === 'string') {
    return payload.courier;
  }

  if (payload?.courier && typeof payload.courier === 'object') {
    return payload.courier.partner || payload.courier.name || 'Not Assigned';
  }

  return 'Not Assigned';
};

const createOrderFromPayload = async (payload = {}) => {
  const customerName = String(payload.customerName || payload.customer?.name || payload.customer?.fullName || 'Customer').trim() || 'Customer';
  const customerEmail = String(payload.customerEmail || payload.customer?.email || '').trim().toLowerCase();
  const items = Array.isArray(payload.items) ? payload.items : [];
  const total = Number(payload.total ?? 0);
  const status = String(payload.status || 'Processing').trim();
  const paymentStatus = String(payload.paymentStatus || 'Pending').trim();
  const estimatedDeliveryValue = payload.estimatedDelivery ? new Date(payload.estimatedDelivery) : null;

  if (!customerEmail) {
    throw new Error('customerEmail is required');
  }

  const buildUniqueOrderId = async (baseOrderId) => {
    const fallbackBase = `ORD-${Date.now()}`;
    let candidate = String(baseOrderId || fallbackBase).trim() || fallbackBase;

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const existingOrder = await Order.findOne({ orderId: candidate }).select('_id');
      if (!existingOrder) {
        return candidate;
      }

      candidate = `${candidate}-${attempt + 1}`;
    }

    return `${fallbackBase}-${Math.random().toString(36).slice(2, 8)}`;
  };

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Incomplete order data');
  }

  const customerPhone = String(payload.customerPhone || payload.customer?.phone || payload.customer?.mobile || '').trim();
  const normalizedShippingAddress = normalizeShippingAddress(payload);
  const customerAddressText = String(
    payload.customerAddressText ||
      [
        normalizedShippingAddress.address,
        normalizedShippingAddress.city,
        normalizedShippingAddress.state,
        normalizedShippingAddress.pincode || normalizedShippingAddress.zip,
        normalizedShippingAddress.country,
      ].filter(Boolean).join(', ') ||
      ''
  ).trim();

  const normalizedItems = [];
  for (const item of items) {
    const normalizedItem = normalizeOrderItem(item);
    if (normalizedItem.quantity <= 0) continue;

    const fallbackProductId = normalizedItem.productId || `fallback-${Date.now()}-${normalizedItems.length + 1}`;
    const matchedProduct = await findProductByIdentifier(normalizedItem.productId || fallbackProductId);
    normalizedItems.push({
      ...normalizedItem,
      productId: matchedProduct?._id?.toString() || normalizedItem.productId || fallbackProductId,
      image: resolveItemImage(item, matchedProduct),
    });
  }

  if (normalizedItems.length === 0) {
    throw new Error('Order must contain at least one valid item');
  }

  const orderTotal = total || normalizedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const initialTrackingHistory = normalizeTrackingHistory(payload.trackingHistory, status, payload.paymentStatus === 'Paid' ? 'Payment verified' : 'Order placed');
  const normalizedEstimatedDelivery = estimatedDeliveryValue || (payload.estimatedDelivery ? new Date(payload.estimatedDelivery) : undefined);

  for (const item of normalizedItems) {
    const productId = item.productId;
    const quantity = Number(item.quantity || item.qty || 1);
    if (!productId || !quantity) continue;

    const product = await findProductByIdentifier(productId);
    if (!product) continue;

    const availableStock = Number(product.stock || 0);
    if (availableStock < quantity) {
      throw new Error(`Insufficient stock for ${product.name}`);
    }
  }

  const normalizedCourier = normalizeCourierValue(payload);

  const orderData = {
    customerName,
    customerEmail,
    customerPhone,
    customerAddressText,
    items: normalizedItems,
    subtotal: Number(payload.subtotal ?? normalizedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)),
    total: orderTotal,
    shipping: Number(payload.shipping ?? 0),
    deliveryCost: Number(payload.deliveryCost ?? payload.delivery?.cost ?? 0),
    tax: Number(payload.tax ?? 0),
    couponDiscount: Number(payload.couponDiscount ?? 0),
    orderId: await buildUniqueOrderId(payload.orderId || payload.id || `ORD-${Date.now()}`),
    paymentStatus,
    status,
    paymentMethod: payload.paymentMethod || 'Razorpay',
    customerAvatar: payload.customerAvatar || '',
    shippingAddress: normalizedShippingAddress,
    courier: normalizedCourier,
    estimatedDelivery: normalizedEstimatedDelivery,
    trackingHistory: initialTrackingHistory,
    trackingNumber: payload.trackingNumber || undefined,
    razorpayOrderId: payload.razorpayOrderId || undefined,
    razorpayPaymentId: payload.razorpayPaymentId || undefined,
    razorpaySignature: payload.razorpaySignature || undefined,
    transactionId: payload.transactionId || payload.razorpayPaymentId || undefined,
  };

  const order = await Order.create(orderData);

  for (const item of normalizedItems) {
    const productId = item.productId;
    const quantity = Number(item.quantity || item.qty || 1);
    if (!productId || !quantity) continue;

    const product = await findProductByIdentifier(productId);
    if (!product) continue;

    const remainingStock = Math.max(0, Number(product.stock || 0) - quantity);
    await Product.findByIdAndUpdate(product._id, { stock: remainingStock });
  }

  const matchedUser = customerEmail
    ? await User.findOne({ email: customerEmail.toLowerCase() })
    : null;

  if (matchedUser) {
    await User.findByIdAndUpdate(matchedUser._id, {
      $addToSet: { orders: order._id },
    });
  }

  return order;
};

export const createPaymentOrder = async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(500).json({ success: false, message: 'Razorpay is not configured on the server.' });
    }

    const amount = Number(req.body?.amount ?? req.body?.total ?? 0);
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ success: false, message: 'A valid amount is required.' });
    }

    const options = {
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: req.body?.receipt || `order_${Date.now()}`,
      notes: {
        purpose: 'HAIERAH purchase',
      },
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      order,
      razorpayKey: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to create Razorpay order.', error: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(500).json({ success: false, message: 'Razorpay is not configured on the server.' });
    }

    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      order: paymentOrderPayload,
    } = req.body || {};

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ success: false, message: 'Payment verification data is incomplete.' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    const receivedSignature = String(razorpaySignature || '').trim().toLowerCase();
    const normalizedExpectedSignature = expectedSignature.toLowerCase();

    const isValidSignature = receivedSignature.length === normalizedExpectedSignature.length
      && crypto.timingSafeEqual(
        Buffer.from(normalizedExpectedSignature),
        Buffer.from(receivedSignature)
      );

    if (!isValidSignature) {
      return res.status(400).json({ success: false, message: 'Signature verification failed.' });
    }

    const order = await createOrderFromPayload({
      ...paymentOrderPayload,
      paymentStatus: 'Paid',
      paymentMethod: 'Razorpay',
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      transactionId: razorpayPaymentId,
      status: paymentOrderPayload?.status || 'Processing',
    });

    try {
      await emailService.sendOrderStatusEmail(order, `Payment confirmed — Order ${order.orderId}`);
    } catch (err) {
      console.error('Failed to send order confirmation email', err);
    }

    res.status(201).json({ success: true, message: 'Payment verified and order created.', order });
  } catch (error) {
    console.error('Payment verification failed', error);
    res.status(500).json({ success: false, message: 'Unable to verify payment.', error: error.message });
  }
};
