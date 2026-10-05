export const evaluateCoupon = (coupon, subtotal = 0) => {
  if (!coupon) {
    return { isValid: false, reason: 'missing', discountAmount: 0, finalTotal: subtotal };
  }

  const now = new Date();
  const expiresAt = coupon.expirationDate ? new Date(coupon.expirationDate) : null;
  const isExpired = expiresAt && expiresAt < now;

  if (!coupon.isActive) {
    return { isValid: false, reason: 'inactive', discountAmount: 0, finalTotal: subtotal };
  }

  if (isExpired) {
    return { isValid: false, reason: 'expired', discountAmount: 0, finalTotal: subtotal };
  }

  const minSpend = Number(coupon.minSpend ?? coupon.minOrderValue ?? 0) || 0;
  if (subtotal < minSpend) {
    return { isValid: false, reason: 'min-spend', discountAmount: 0, finalTotal: subtotal };
  }

  const usageLimit = Number(coupon.usageLimit ?? 0) || 0;
  const usesCount = Number(coupon.usesCount ?? 0) || 0;
  if (usageLimit > 0 && usesCount >= usageLimit) {
    return { isValid: false, reason: 'limit-reached', discountAmount: 0, finalTotal: subtotal };
  }

  const value = Number(coupon.value ?? 0) || 0;
  let discountAmount = 0;

  if (coupon.type === 'FixedAmount') {
    discountAmount = Math.min(value, subtotal);
  } else if (coupon.type === 'Percentage') {
    discountAmount = Number(((subtotal * value) / 100).toFixed(2));
  }

  return {
    isValid: true,
    reason: null,
    discountAmount,
    finalTotal: Number((subtotal - discountAmount).toFixed(2)),
  };
};
