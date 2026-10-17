import crypto from 'crypto';
import dotenv from 'dotenv';
import Razorpay from 'razorpay';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import emailService from '../services/email/emailService.js';
import { calculateOrderPricing } from '../utils/orderPricing.js';

dotenv.config();

const razorpay = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  : null;

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

const createOrderFromPayload = async (payload = {}, authenticatedUser) => {
  const customerName = String(payload.customerName || payload.customer?.name || payload.customer?.fullName || 'Customer').trim() || 'Customer';
  const status = String(payload.status || 'Processing').trim();
  const paymentStatus = String(payload.paymentStatus || 'Pending').trim();
  const estimatedDeliveryValue = payload.estimatedDelivery ? new Date(payload.estimatedDelivery) : null;

  if (!authenticatedUser?._id) {
    throw new Error('An authenticated customer is required');
  }
  const pricing = await calculateOrderPricing(payload);
  const submittedTotal = Number(payload.total);
  if (!Number.isFinite(submittedTotal) || Math.abs(submittedTotal - pricing.total) > 0.01) {
    const error = new Error('Product prices or checkout totals changed. Please review your cart and try again.');
    error.status = 409;
    throw error;
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

  const normalizedItems = pricing.items;
  const initialTrackingHistory = normalizeTrackingHistory(payload.trackingHistory, status, payload.paymentStatus === 'Paid' ? 'Payment verified' : 'Order placed');
  const normalizedEstimatedDelivery = estimatedDeliveryValue || (payload.estimatedDelivery ? new Date(payload.estimatedDelivery) : undefined);

  const normalizedCourier = normalizeCourierValue(payload);

  const orderData = {
    userId: authenticatedUser._id,
    customerName: authenticatedUser.name || customerName,
    customerEmail: authenticatedUser.email,
    customerPhone,
    customerAddressText,
    items: normalizedItems,
    subtotal: pricing.subtotal,
    total: pricing.total,
    shipping: pricing.shipping,
    deliveryCost: pricing.deliveryCost,
    tax: pricing.tax,
    couponDiscount: pricing.couponDiscount,
    couponCode: pricing.couponCode,
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
    const quantity = Number(item.quantity || item.qty || 1);
    await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -quantity } });
  }

  await User.findByIdAndUpdate(authenticatedUser._id, {
    $addToSet: { orders: order._id },
    $set: { cart: [] },
  });

  return order;
};

export const createPaymentOrder = async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(500).json({ success: false, message: 'Razorpay is not configured on the server.' });
    }

    const pricing = await calculateOrderPricing(req.body?.order || {});
    const amount = Number(req.body?.amount ?? req.body?.total ?? 0);
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ success: false, message: 'A valid amount is required.' });
    }
    if (Math.abs(amount - pricing.total) > 0.01) {
      return res.status(409).json({
        success: false,
        message: 'Product prices or checkout totals changed. Please review your cart and try again.',
        pricing,
      });
    }

    const options = {
      amount: Math.round(pricing.total * 100),
      currency: 'INR',
      receipt: req.body?.receipt || `order_${Date.now()}`,
      notes: {
        purpose: 'HAIERAH purchase',
        customerId: String(req.user.userId),
      },
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      order,
      razorpayKey: process.env.RAZORPAY_KEY_ID,
      total: pricing.total,
    });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Unable to create Razorpay order.' });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(500).json({ success: false, message: 'Razorpay is not configured on the server.' });
    }
    const authenticatedUser = await User.findById(req.user.userId);
    if (!authenticatedUser) {
      return res.status(401).json({ success: false, message: 'Authenticated customer was not found.' });
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

    const razorpayOrder = await razorpay.orders.fetch(razorpayOrderId);
    if (String(razorpayOrder.notes?.customerId || '') !== String(authenticatedUser._id)) {
      return res.status(403).json({ success: false, message: 'This payment does not belong to your account.' });
    }
    const existingOrder = await Order.findOne({
      razorpayOrderId,
      userId: authenticatedUser._id,
    });
    if (existingOrder) {
      return res.status(200).json({
        success: true,
        message: 'Payment was already verified.',
        order: existingOrder,
      });
    }
    const pricing = await calculateOrderPricing(paymentOrderPayload || {});
    if (Number(razorpayOrder.amount) !== Math.round(pricing.total * 100)) {
      return res.status(400).json({ success: false, message: 'The payment amount does not match the current order total.' });
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
    }, authenticatedUser);

    if (authenticatedUser.preferences?.orderNotifications !== false) {
      try {
        await emailService.sendOrderStatusEmail(order, `Payment confirmed — Order ${order.orderId}`);
      } catch (err) {
        console.error('Failed to send order confirmation email', err);
      }
    }

    res.status(201).json({ success: true, message: 'Payment verified and order created.', order });
  } catch (error) {
    console.error('Payment verification failed', error);
    res.status(error.status || 500).json({ success: false, message: error.message || 'Unable to verify payment.' });
  }
};
