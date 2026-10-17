import mongoose from 'mongoose';
import Coupon from '../models/Coupon.js';
import Product from '../models/Product.js';
import { evaluateCoupon } from './couponUtils.js';

const deliveryPrices = new Map([
  ['standard delivery', 0],
  ['express delivery', 299],
  ['same day delivery', 499],
]);

const roundCurrency = (amount) => Number(Number(amount).toFixed(2));

export const calculateOrderPricing = async (payload = {}) => {
  const items = Array.isArray(payload.items) ? payload.items : [];
  if (!items.length) {
    const error = new Error('Order must contain at least one item.');
    error.status = 400;
    throw error;
  }

  const normalizedItems = [];
  for (const item of items) {
    const identifier = String(
      item?.productId || item?.product?.id || item?.product?._id || item?.sku || item?.id || item?._id || ''
    ).trim();
    const quantity = Number(item?.quantity ?? item?.qty ?? 1);
    if (!identifier || !Number.isInteger(quantity) || quantity < 1) {
      const error = new Error('Order contains an invalid product or quantity.');
      error.status = 400;
      throw error;
    }

    const product = mongoose.isValidObjectId(identifier)
      ? await Product.findById(identifier)
      : await Product.findOne({ sku: identifier });
    if (!product || String(product.status || 'Active').toLowerCase() !== 'active') {
      const error = new Error('A product in your cart is no longer available.');
      error.status = 400;
      throw error;
    }
    if (Number(product.stock || 0) < quantity) {
      const error = new Error(`Insufficient stock for ${product.name}.`);
      error.status = 400;
      throw error;
    }

    const price = Number(product.discountPrice ?? product.price);
    if (!Number.isFinite(price) || price < 0) {
      const error = new Error(`The price for ${product.name} is invalid.`);
      error.status = 400;
      throw error;
    }
    normalizedItems.push({
      productId: product._id.toString(),
      name: product.name,
      quantity,
      price: roundCurrency(price),
      image: Array.isArray(product.images) ? product.images[0] || '' : '',
      color: String(item?.color || item?.selectedColor || '').trim(),
      size: String(item?.size || item?.selectedSize || '').trim(),
    });
  }

  const subtotal = roundCurrency(normalizedItems.reduce((sum, item) => sum + item.price * item.quantity, 0));
  const couponCode = String(payload.couponCode || '').trim().toUpperCase();
  let couponDiscount = 0;
  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode });
    const couponResult = evaluateCoupon(coupon, subtotal);
    if (!couponResult.isValid) {
      const error = new Error('The coupon is no longer valid for this order.');
      error.status = 400;
      throw error;
    }
    couponDiscount = roundCurrency(Math.min(subtotal, couponResult.discountAmount));
  }

  const deliveryLabel = String(payload.delivery?.method || payload.deliveryMethod || 'Standard Delivery')
    .trim()
    .toLowerCase();
  const deliveryCost = deliveryPrices.get(deliveryLabel);
  if (deliveryCost === undefined) {
    const error = new Error('Please select a valid delivery method.');
    error.status = 400;
    throw error;
  }

  const shipping = 0;
  const tax = roundCurrency(Math.max(0, subtotal - couponDiscount) * 0.05);
  const total = roundCurrency(subtotal - couponDiscount + shipping + deliveryCost + tax);
  return {
    items: normalizedItems,
    subtotal,
    shipping,
    deliveryCost,
    tax,
    couponCode,
    couponDiscount,
    total,
  };
};
