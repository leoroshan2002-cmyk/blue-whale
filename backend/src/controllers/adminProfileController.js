import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { uploadToCloudinary } from '../middleware/cloudinaryStorage.js';

const toProfileResponse = (user) => {
  const doc = user.toObject();
  doc.id = doc._id.toString();
  delete doc._id;
  delete doc.password;
  delete doc.emailVerificationCode;
  delete doc.emailVerificationExpiresAt;
  delete doc.emailVerificationRequestedAt;
  delete doc.setPasswordOtp;
  delete doc.setPasswordOtpExpiresAt;
  delete doc.setPasswordOtpRequestedAt;
  delete doc.setPasswordOtpVerifiedAt;
  return doc;
};

export const getAdminProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ success: true, profile: toProfileResponse(user) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateAdminProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, email, phone, gender, birthday, address, city, state, zip } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (gender !== undefined) user.gender = gender;
    if (birthday !== undefined) user.birthday = birthday;
    if (address !== undefined) user.address = address;
    if (city !== undefined) user.city = city;
    if (state !== undefined) user.state = state;
    if (zip !== undefined) user.zip = zip;

    if (req.file) {
      const cloudinaryResult = await uploadToCloudinary(req.file, 'avatars');
      user.avatar = cloudinaryResult.secure_url;
    }

    await user.save();

    res.status(200).json({ success: true, profile: toProfileResponse(user) });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email is already in use' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const changeAdminPassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'Current password, new password and confirm password are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'New password and confirm password do not match' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.password) {
      return res.status(400).json({ message: 'No password set. Use set password flow instead.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
