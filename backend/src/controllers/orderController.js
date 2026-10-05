import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import emailService from '../services/email/emailService.js';

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

const VALID_ORDER_STATUSES = ['Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];
const VALID_PAYMENT_STATUSES = ['Pending', 'Paid', 'Failed', 'Refunded'];

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

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const validateOrderPayload = (payload = {}) => {
  const errors = [];
  const customerName = String(payload.customerName || payload.customer?.name || payload.customer?.fullName || 'Customer').trim();
  const customerEmail = String(payload.customerEmail || payload.customer?.email || '').trim().toLowerCase();
  const items = Array.isArray(payload.items) ? payload.items : [];
  const total = Number(payload.total ?? 0);
  const status = String(payload.status || 'Pending').trim();
  const paymentStatus = String(payload.paymentStatus || 'Pending').trim();
  const estimatedDeliveryValue = payload.estimatedDelivery ? new Date(payload.estimatedDelivery) : null;

  if (!customerName) {
    errors.push('customerName is required');
  }

  if (!customerEmail) {
    errors.push('customerEmail is required');
  } else if (!isValidEmail(customerEmail)) {
    errors.push('customerEmail must be a valid email address');
  }

  if (!Array.isArray(payload.items) || items.length === 0) {
    errors.push('Order must contain at least one item');
  }

  if (!Number.isFinite(total) || total < 0) {
    errors.push('total must be a non-negative number');
  }

  if (!VALID_ORDER_STATUSES.includes(status)) {
    errors.push(`status must be one of: ${VALID_ORDER_STATUSES.join(', ')}`);
  }

  if (!VALID_PAYMENT_STATUSES.includes(paymentStatus)) {
    errors.push(`paymentStatus must be one of: ${VALID_PAYMENT_STATUSES.join(', ')}`);
  }

  if (payload.estimatedDelivery && Number.isNaN(estimatedDeliveryValue?.getTime())) {
    errors.push('estimatedDelivery must be a valid date');
  }

  return {
    errors,
    customerName,
    customerEmail,
    items,
    total: Number.isFinite(total) ? total : 0,
    status,
    paymentStatus,
    estimatedDelivery: estimatedDeliveryValue,
  };
};

const validateStatusUpdatePayload = (payload = {}) => {
  const errors = [];
  const status = payload.status !== undefined ? String(payload.status).trim() : undefined;
  const paymentStatus = payload.paymentStatus !== undefined ? String(payload.paymentStatus).trim() : undefined;
  const courier = payload.courier !== undefined ? String(payload.courier || 'Not Assigned').trim() : undefined;
  const estimatedDeliveryValue = payload.estimatedDelivery !== undefined ? new Date(payload.estimatedDelivery) : undefined;

  if (status && !VALID_ORDER_STATUSES.includes(status)) {
    errors.push(`status must be one of: ${VALID_ORDER_STATUSES.join(', ')}`);
  }

  if (paymentStatus && !VALID_PAYMENT_STATUSES.includes(paymentStatus)) {
    errors.push(`paymentStatus must be one of: ${VALID_PAYMENT_STATUSES.join(', ')}`);
  }

  if (payload.estimatedDelivery !== undefined && Number.isNaN(estimatedDeliveryValue?.getTime())) {
    errors.push('estimatedDelivery must be a valid date');
  }

  return {
    errors,
    status,
    paymentStatus,
    courier,
    estimatedDelivery: estimatedDeliveryValue,
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

const toOrderResponse = (order) => {
  const doc = order.toObject();
  doc.id = doc.orderId || doc._id.toString();
  delete doc._id;
  return doc;
};

export const listOrders = async (_req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders: orders.map(toOrderResponse) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = mongoose.isValidObjectId(id)
      ? { $or: [{ orderId: id }, { _id: id }] }
      : { orderId: id };

    const order = await Order.findOne(query);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const isAdmin = req.user?.role === 'admin';
    const isOwner = req.user && String(req.user.userId || req.user.id || '') === String(order.customer?._id || '') ? true : false;
    const emailMatches = String(order.customerEmail || '').toLowerCase() === String(req.user?.email || '').toLowerCase();

    if (!isAdmin && !emailMatches && !isOwner) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.status(200).json({ success: true, order: toOrderResponse(order) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const isAdmin = req.user?.role === 'admin';
    const isOwner = req.user && String(req.user.userId || req.user.id || '') === String(userId);

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Not authorized to view these orders' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const orders = await Order.find({ _id: { $in: user.orders || [] } }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders: orders.map(toOrderResponse) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createOrder = async (req, res) => {
  try {
    const payload = req.body || {};
    const {
      errors,
      customerName,
      customerEmail,
      items,
      total,
      status,
      paymentStatus,
      estimatedDelivery,
    } = validateOrderPayload(payload);

    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: 'Invalid order payload', errors });
    }

    const customerPhone = String(
      payload.customerPhone || payload.customer?.phone || payload.customer?.mobile || ''
    ).trim();
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
      if (!normalizedItem.productId || normalizedItem.quantity <= 0) continue;

      const matchedProduct = await findProductByIdentifier(normalizedItem.productId);
      normalizedItems.push({
        ...normalizedItem,
        productId: matchedProduct?._id?.toString() || normalizedItem.productId,
        image: resolveItemImage(item, matchedProduct),
      });
    }

    if (normalizedItems.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one valid item' });
    }

    const orderTotal = total || normalizedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const initialStatus = status || 'Pending';
    const initialTrackingHistory = normalizeTrackingHistory(payload.trackingHistory, initialStatus, 'Order placed');
    const normalizedEstimatedDelivery = estimatedDelivery || (payload.estimatedDelivery ? new Date(payload.estimatedDelivery) : undefined);

    for (const item of normalizedItems) {
      const productId = item.productId;
      const quantity = Number(item.quantity || item.qty || 1);
      if (!productId || !quantity) continue;

      const product = await findProductByIdentifier(productId);
      if (!product) continue;

      const availableStock = Number(product.stock || 0);
      if (availableStock < quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }
    }

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
      orderId: payload.orderId || payload.id || `ORD-${Date.now()}`,
      paymentStatus: paymentStatus || 'Pending',
      status: initialStatus,
      paymentMethod: payload.paymentMethod || 'Cash on Delivery',
      customerAvatar: payload.customerAvatar || '',
      shippingAddress: normalizedShippingAddress,
      courier: payload.courier || 'Not Assigned',
      estimatedDelivery: normalizedEstimatedDelivery,
      trackingHistory: initialTrackingHistory,
      trackingNumber: payload.trackingNumber || undefined,
    };

    const order = await Order.create(orderData);

    // Email delivery must not hold the checkout response open when SMTP is slow or unavailable.
    void emailService
      .sendOrderStatusEmail(order, `Order confirmation - Order ${order.orderId}`)
      .then(() => console.log('Order confirmation email sent successfully.'))
      .catch((err) => console.error('Failed to send order confirmation email:', err?.message || err));

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

    res.status(201).json({ success: true, order: toOrderResponse(order) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const applyStatusUpdate = async (req, res, { allowCancel = false } = {}) => {
  try {
    const { id } = req.params;
    const payload = req.body || {};
    const { errors, status, paymentStatus, courier, estimatedDelivery } = validateStatusUpdatePayload(payload);

    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: 'Invalid order update payload', errors });
    }

    const query = mongoose.isValidObjectId(id)
      ? { $or: [{ orderId: id }, { _id: id }] }
      : { orderId: id };

    const existingOrder = await Order.findOne(query);
    if (!existingOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const update = {};

    if (status !== undefined) update.status = status;
    if (paymentStatus !== undefined) update.paymentStatus = paymentStatus;
    if (courier !== undefined) update.courier = courier || 'Not Assigned';
    if (estimatedDelivery !== undefined) {
      update.estimatedDelivery = estimatedDelivery ? new Date(estimatedDelivery) : null;
    }
    if (payload.trackingHistory !== undefined) {
      update.trackingHistory = normalizeTrackingHistory(
        payload.trackingHistory,
        update.status || existingOrder.status || 'Pending',
        'Tracking updated'
      );
    }

    const previousStatus = existingOrder.status;
    const nextStatus = update.status || previousStatus;

    if (allowCancel && update.status === 'Cancelled') {
      const cancellableStatuses = ['Pending', 'Confirmed', 'Processing'];
      if (!cancellableStatuses.includes(previousStatus)) {
        return res.status(400).json({ message: 'Order can only be cancelled before shipping.' });
      }
    }

    if (update.status && previousStatus !== nextStatus) {
      update.$push = {
        trackingHistory: {
          status: nextStatus,
          note: payload.note || `Order status updated to ${nextStatus}`,
          updatedAt: new Date(),
        },
      };
    }

    const updatedOrder = await Order.findOneAndUpdate(
      query,
      update,
      { new: true, runValidators: true }
    );

    if (previousStatus !== 'Cancelled' && nextStatus === 'Cancelled') {
      for (const item of existingOrder.items || []) {
        const productId = item.productId || item.id || item._id;
        const quantity = Number(item.quantity || item.qty || 1);
        if (!productId || !quantity) continue;

        const product = await Product.findById(productId);
        if (!product) continue;

        await Product.findByIdAndUpdate(productId, { stock: Math.max(0, Number(product.stock || 0) + quantity) });
      }
    } else if (previousStatus === 'Cancelled' && nextStatus !== 'Cancelled') {
      for (const item of existingOrder.items || []) {
        const productId = item.productId || item.id || item._id;
        const quantity = Number(item.quantity || item.qty || 1);
        if (!productId || !quantity) continue;

        const product = await Product.findById(productId);
        if (!product) continue;

        await Product.findByIdAndUpdate(productId, { stock: Math.max(0, Number(product.stock || 0) - quantity) });
      }
    }

    const notifyStatuses = ['Confirmed', 'Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];
    if (previousStatus !== nextStatus && notifyStatuses.includes(nextStatus)) {
      try {
        await emailService.sendOrderStatusEmail(updatedOrder);
      } catch (err) {
        console.error('Failed to send order status email', err);
      }
    }

    res.status(200).json({ success: true, order: toOrderResponse(updatedOrder) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  return applyStatusUpdate(req, res, { allowCancel: false });
};

export const cancelOrder = async (req, res) => {
  return applyStatusUpdate(req, res, { allowCancel: true });
};

export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const query = mongoose.isValidObjectId(id)
      ? { $or: [{ orderId: id }, { _id: id }] }
      : { orderId: id };

    const deletedOrder = await Order.findOneAndDelete(query);

    if (!deletedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (deletedOrder.status !== 'Cancelled') {
      for (const item of deletedOrder.items || []) {
        const productId = item.productId || item.id || item._id;
        const quantity = Number(item.quantity || item.qty || 1);
        if (!productId || !quantity) continue;

        const product = await Product.findById(productId);
        if (!product) continue;

        await Product.findByIdAndUpdate(productId, { stock: Math.max(0, Number(product.stock || 0) + quantity) });
      }
    }

    const orderEmail = String(deletedOrder.customerEmail || '').trim().toLowerCase();
    if (orderEmail) {
      await User.updateMany(
        { email: orderEmail },
        { $pull: { orders: deletedOrder._id } }
      );
    }

    res.status(200).json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
