import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Product from '../models/Product.js';
import { uploadToCloudinary } from '../middleware/cloudinaryStorage.js';
import { resolveProductColor, resolveProductImage } from '../utils/productVariants.js';

const profileFields = ['name', 'firstName', 'lastName', 'phone', 'gender', 'birthday', 'address', 'city', 'state', 'zip'];
const productFields = 'name sku price discountPrice category subCategory stock description images variants status';

const toUserResponse = (user) => {
  const doc = user.toObject();
  doc.id = doc._id.toString();
  delete doc._id;
  delete doc.password;
  return doc;
};

const getCurrentCustomer = (req) => User.findById(req.user.userId);

const toPopulatedCart = (cart = []) => cart
  .filter((entry) => entry.productId)
  .map((entry) => {
    const product = entry.productId.toObject ? entry.productId.toObject() : entry.productId;
    const selectedColor = entry.selectedColor || '';
    const selectedColorVariant = resolveProductColor(product, selectedColor);
    const selectedImage = resolveProductImage(product, entry.selectedImageIndex);
    return {
      ...product,
      id: String(product._id),
      productId: String(product._id),
      qty: entry.quantity,
      image: selectedImage.image,
      selectedImageIndex: selectedImage.index,
      selectedColor,
      selectedColorHex: selectedColorVariant.hex,
      selectedSize: entry.selectedSize || '',
      color: selectedColor,
      colorHex: selectedColorVariant.hex,
      size: entry.selectedSize || '',
    };
  });

export const getMyWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate('wishlist', productFields);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    const wishlist = user.wishlist.filter(Boolean).map((product) => ({
      ...product.toObject(),
      id: product._id.toString(),
    }));
    return res.status(200).json({ success: true, wishlist });
  } catch (error) {
    console.error('Failed to load customer wishlist:', error);
    return res.status(500).json({ success: false, message: 'Unable to load wishlist.' });
  }
};

export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body || {};
    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: 'A valid product ID is required.' });
    }
    const productExists = await Product.exists({ _id: productId });
    if (!productExists) return res.status(404).json({ success: false, message: 'Product not found.' });
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $addToSet: { wishlist: productId } },
      { new: true }
    ).populate('wishlist', productFields);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    const wishlist = user.wishlist.filter(Boolean).map((product) => ({
      ...product.toObject(),
      id: product._id.toString(),
    }));
    return res.status(200).json({ success: true, wishlist });
  } catch (error) {
    console.error('Failed to add product to wishlist:', error);
    return res.status(500).json({ success: false, message: 'Unable to update wishlist.' });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: 'A valid product ID is required.' });
    }
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $pull: { wishlist: productId } },
      { new: true }
    ).populate('wishlist', productFields);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    const wishlist = user.wishlist.filter(Boolean).map((product) => ({
      ...product.toObject(),
      id: product._id.toString(),
    }));
    return res.status(200).json({ success: true, wishlist });
  } catch (error) {
    console.error('Failed to remove product from wishlist:', error);
    return res.status(500).json({ success: false, message: 'Unable to update wishlist.' });
  }
};

export const clearWishlist = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user.userId, { $set: { wishlist: [] } }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    return res.status(200).json({ success: true, wishlist: [] });
  } catch (error) {
    console.error('Failed to clear customer wishlist:', error);
    return res.status(500).json({ success: false, message: 'Unable to clear wishlist.' });
  }
};

export const getMyCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate('cart.productId', productFields);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    return res.status(200).json({ success: true, cart: toPopulatedCart(user.cart) });
  } catch (error) {
    console.error('Failed to load customer cart:', error);
    return res.status(500).json({ success: false, message: 'Unable to load cart.' });
  }
};

export const updateMyCart = async (req, res) => {
  try {
    const items = req.body?.items;
    if (!Array.isArray(items) || items.length > 100) {
      return res.status(400).json({ success: false, message: 'Cart items must be a list of at most 100 products.' });
    }

    const nextCart = [];
    for (const item of items) {
      const productId = String(item?.productId || item?.id || '').trim();
      const quantity = Number(item?.quantity ?? item?.qty);
      if (!mongoose.isValidObjectId(productId) || !Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({ success: false, message: 'Cart contains an invalid product or quantity.' });
      }
      const product = await Product.findById(productId).select('stock name images variants');
      if (!product) return res.status(404).json({ success: false, message: 'A product in your cart no longer exists.' });
      if (quantity > product.stock) {
        return res.status(400).json({ success: false, message: `Only ${product.stock} item(s) of ${product.name} remain in stock.` });
      }
      const selectedColor = String(item?.selectedColor || item?.color || '').trim();
      if (selectedColor && product.variants?.colors?.length && !resolveProductColor(product, selectedColor).found) {
        return res.status(400).json({ success: false, message: `The selected color is not available for ${product.name}.` });
      }
      const selectedImageIndex = Number(item?.selectedImageIndex ?? 0);
      if (!Number.isInteger(selectedImageIndex) || selectedImageIndex < 0 || selectedImageIndex >= Math.max(product.images?.length || 0, 1)) {
        return res.status(400).json({ success: false, message: `The selected product image is invalid for ${product.name}.` });
      }
      nextCart.push({
        productId,
        quantity,
        selectedColor,
        selectedSize: String(item?.selectedSize || item?.size || '').trim(),
        selectedImageIndex,
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: { cart: nextCart } },
      { new: true }
    ).populate('cart.productId', productFields);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    return res.status(200).json({ success: true, cart: toPopulatedCart(user.cart) });
  } catch (error) {
    console.error('Failed to save customer cart:', error);
    return res.status(500).json({ success: false, message: 'Unable to save cart.' });
  }
};

export const getMyPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('preferences');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    return res.status(200).json({ success: true, preferences: user.preferences });
  } catch (error) {
    console.error('Failed to load customer preferences:', error);
    return res.status(500).json({ success: false, message: 'Unable to load preferences.' });
  }
};

export const updateMyPreferences = async (req, res) => {
  try {
    const allowedFields = ['emailNewsletter', 'orderNotifications', 'smsAlerts'];
    const updates = {};
    for (const field of allowedFields) {
      if (typeof req.body?.[field] !== 'boolean') {
        return res.status(400).json({ success: false, message: `Preference ${field} must be a boolean.` });
      }
      updates[`preferences.${field}`] = req.body[field];
    }
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('preferences');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    return res.status(200).json({ success: true, preferences: user.preferences });
  } catch (error) {
    console.error('Failed to save customer preferences:', error);
    return res.status(500).json({ success: false, message: 'Unable to save preferences.' });
  }
};

export const updateMyPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (typeof currentPassword !== 'string' || !currentPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Current password and a new password of at least 6 characters are required.' });
    }
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (!user.password || !(await bcrypt.compare(currentPassword, user.password))) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    return res.status(200).json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    console.error('Failed to update customer password:', error);
    return res.status(500).json({ success: false, message: 'Unable to update password.' });
  }
};

export const listCustomers = async (_req, res) => {
  try {
    const customers = await User.find({ role: { $ne: 'admin' } }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, customers: customers.map(toUserResponse) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await User.findById(id);

    if (!customer) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isAdmin = req.user?.role === 'admin';
    const isOwner = req.user && String(req.user.userId || req.user.id || '') === String(customer._id);

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Not authorized to view this profile' });
    }

    res.status(200).json({ success: true, customer: toUserResponse(customer) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createCustomer = async (req, res) => {
  try {
    const payload = req.body;
    const user = await User.create(payload);
    res.status(201).json({ success: true, customer: toUserResponse(user) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user?.role === 'admin';
    const isOwner = req.user && String(req.user.userId || req.user.id || '') === String(id);

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Not authorized to update this profile' });
    }

    const payload = Object.fromEntries(
      profileFields
        .filter((field) => Object.prototype.hasOwnProperty.call(req.body || {}, field))
        .map((field) => [field, req.body[field]])
    );

    if (req.file) {
      const cloudinaryResult = await uploadToCloudinary(req.file, 'avatars');
      payload.avatar = cloudinaryResult.secure_url;
    }

    const updatedUser = await User.findByIdAndUpdate(id, payload, { new: true, runValidators: true });

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ success: true, customer: toUserResponse(updatedUser) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
