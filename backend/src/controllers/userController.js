import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { uploadToCloudinary } from '../middleware/cloudinaryStorage.js';

const toUserResponse = (user) => {
  const doc = user.toObject();
  doc.id = doc._id.toString();
  delete doc._id;
  delete doc.password;
  return doc;
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

    const payload = { ...req.body };

    if (payload.password) {
      payload.password = await bcrypt.hash(payload.password, 10);
    }

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
