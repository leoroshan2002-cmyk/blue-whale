import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import emailService from '../services/email/emailService.js';

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const parseCsvList = (value) =>
  String(value || '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

const generateSixDigitCode = () => String(crypto.randomInt(100000, 1000000));

const buildEmailVerificationEmail = (name, code) => {
  const displayName = name ? String(name).split(' ')[0] : 'there';
  return {
    subject: 'Verify your email address',
    text: `Hi ${displayName},\n\nUse the following 6-digit code to verify your email address: ${code}\nThis code expires in 10 minutes.\n\nIf you did not create an account, please ignore this email.`,
    html: `<p>Hi ${displayName},</p><p>Use the following <strong>6-digit code</strong> to verify your email address: <strong>${code}</strong></p><p>This code expires in 10 minutes.</p><p>If you did not create an account, please ignore this email.</p>`,
  };
};

const authorizedEmails = parseCsvList(process.env.AUTHORIZED_EMAILS);
const authorizedDomains = parseCsvList(process.env.AUTHORIZED_EMAIL_DOMAINS);

const isEmailAuthorized = (email) => {
  const trimmed = String(email || '').trim().toLowerCase();
  if (!trimmed) return false;
  if (authorizedEmails.length && authorizedEmails.includes(trimmed)) {
    return true;
  }
  if (
    authorizedDomains.length &&
    authorizedDomains.some((domain) => trimmed.endsWith(`@${domain}`))
  ) {
    return true;
  }
  return authorizedEmails.length === 0 && authorizedDomains.length === 0;
};

const generateSixDigitOtp = () => String(crypto.randomInt(100000, 1000000));
const buildSetPasswordEmail = (name, otp) => {
  const displayName = name ? String(name).split(' ')[0] : 'there';
  return {
    subject: 'Set your password',
    text: `Hi ${displayName},\n\nUse this 6-digit code to set your password: ${otp}\nIt expires in 10 minutes.\n\nIf you did not request this, ignore this email.`,
    html: `<p>Hi ${displayName},</p><p>Use this 6-digit code to set your password: <strong>${otp}</strong></p><p>This code expires in 10 minutes.</p><p>If you did not request this, ignore this email.</p>`,
  };
};

const toAuthUserResponse = (user) => ({
  id: user._id.toString(),
  name: user.name,
  firstName: user.firstName || '',
  lastName: user.lastName || '',
  email: user.email,
  avatar: user.avatar || '',
  role: user.role,
  phone: user.phone || '',
  gender: user.gender || '',
  birthday: user.birthday || '',
  address: user.address || '',
  city: user.city || '',
  state: user.state || '',
  zip: user.zip || '',
});

const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isCrossOrigin = Boolean(process.env.FRONTEND_URL && process.env.FRONTEND_URL !== 'http://localhost:5173');

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction && isCrossOrigin ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
};

const setAuthCookie = (res, user) => {
  const token = jwt.sign(
    {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  res.cookie('token', token, getCookieOptions());
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    const trimmedEmail = email?.trim?.().toLowerCase();

    if (!name || !trimmedEmail || !password || !confirmPassword) {
      return res.status(400).json({ message: 'Name, email, password and confirmPassword are required' });
    }

    if (!isValidEmail(trimmedEmail)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Password and confirmPassword do not match' });
    }

    if (!isEmailAuthorized(trimmedEmail)) {
      return res.status(403).json({
        message: 'Email is not authorized for registration. Use an approved email address.',
      });
    }

    const existingUser = await User.findOne({ email: trimmedEmail });
    if (existingUser) {
      if (!existingUser.emailVerified) {
        return res.status(409).json({
          message: 'This email is already registered but not verified. Please check your inbox or request a new verification code.',
        });
      }
      return res.status(409).json({ message: 'User already exists' });
    }

    const verificationCode = generateSixDigitCode();
    const hashedVerificationCode = await bcrypt.hash(verificationCode, 10);
    const now = new Date();
    const verificationExpiresAt = new Date(now.getTime() + 10 * 60 * 1000);

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: trimmedEmail,
      password: hashedPassword,
      role: 'user',
      authProvider: 'local',
      emailVerified: false,
      emailVerificationCode: hashedVerificationCode,
      emailVerificationExpiresAt: verificationExpiresAt,
      emailVerificationRequestedAt: now,
    });

    const { subject, text, html } = buildEmailVerificationEmail(name, verificationCode);
    await emailService.sendMail({
      to: trimmedEmail,
      subject,
      text,
      html,
      from: process.env.EMAIL_FROM || `no-reply@${process.env.APP_DOMAIN || 'example.com'}`,
    });

    res.status(201).json({
      message: 'User registered successfully. Verification code sent to your email.',
      user: toAuthUserResponse(user),
      emailVerificationSent: true,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const requestEmailVerificationCode = async (req, res) => {
  try {
    const { email } = req.body || {};
    const trimmedEmail = String(email || '').trim().toLowerCase();

    if (!trimmedEmail) {
      return res.status(400).json({ message: 'Email is required' });
    }

    if (!isValidEmail(trimmedEmail)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const user = await User.findOne({ email: trimmedEmail });
    if (!user) {
      return res.status(404).json({ message: 'No account found for this email' });
    }
    if (user.emailVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    const verificationCode = generateSixDigitCode();
    const hashedVerificationCode = await bcrypt.hash(verificationCode, 10);
    const now = new Date();
    const verificationExpiresAt = new Date(now.getTime() + 10 * 60 * 1000);

    user.emailVerificationCode = hashedVerificationCode;
    user.emailVerificationExpiresAt = verificationExpiresAt;
    user.emailVerificationRequestedAt = now;
    await user.save();

    const { subject, text, html } = buildEmailVerificationEmail(user.name, verificationCode);
    await emailService.sendMail({
      to: trimmedEmail,
      subject,
      text,
      html,
      from: process.env.EMAIL_FROM || `no-reply@${process.env.APP_DOMAIN || 'example.com'}`,
    });

    return res.status(200).json({ message: 'Verification code resent to your email address' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const confirmEmailVerificationCode = async (req, res) => {
  try {
    const { email, code } = req.body || {};
    const trimmedEmail = String(email || '').trim().toLowerCase();

    if (!trimmedEmail || !code) {
      return res.status(400).json({ message: 'Email and verification code are required' });
    }

    if (!isValidEmail(trimmedEmail)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const user = await User.findOne({ email: trimmedEmail });
    if (!user) {
      return res.status(404).json({ message: 'No account found for this email' });
    }
    if (user.emailVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }
    if (!user.emailVerificationCode || !user.emailVerificationExpiresAt) {
      return res.status(400).json({ message: 'No verification code has been issued. Please request a code.' });
    }
    if (new Date() > user.emailVerificationExpiresAt) {
      return res.status(400).json({ message: 'Verification code has expired. Please request a new code.' });
    }

    const isValidCode = await bcrypt.compare(String(code).trim(), user.emailVerificationCode);
    if (!isValidCode) {
      return res.status(400).json({ message: 'Invalid verification code. Please try again.' });
    }

    user.emailVerified = true;
    user.emailVerificationCode = '';
    user.emailVerificationExpiresAt = undefined;
    user.emailVerificationRequestedAt = undefined;
    await user.save();

    return res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const trimmedEmail = email?.trim?.().toLowerCase();

    if (!trimmedEmail || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: trimmedEmail });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = user.password ? await bcrypt.compare(password, user.password) : false;
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    setAuthCookie(res, user);

    res.status(200).json({
      message: 'Login successful',
      user: toAuthUserResponse(user),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const googleAuth = async (req, res) => {
  try {
    const { credential, password, confirmPassword, createIfMissing } = req.body || {};
    const allowCreate = createIfMissing === true || createIfMissing === 'true';

    if (!credential) {
      return res.status(400).json({ message: 'Google credential is required' });
    }

    if (password || confirmPassword) {
      if (!password || !confirmPassword) {
        return res.status(400).json({ message: 'Both password and confirmPassword are required when setting a password.' });
      }
      if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Password and confirmPassword do not match' });
      }
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({ message: 'Google auth is not configured on the server.' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      return res.status(400).json({ message: 'Google account email is missing.' });
    }

    const email = payload.email.toLowerCase();
    const name = payload.name || payload.given_name || 'Google User';
    const avatar = payload.picture || '';

    if (payload.email_verified !== true) {
      return res.status(403).json({
        message: 'Google account email is not verified. Please use a verified Google account.',
      });
    }

    let user = await User.findOne({ email });
    if (!user && !isEmailAuthorized(email)) {
      return res.status(403).json({
        message: 'Google account email is not authorized for registration. Contact administrator.',
      });
    }

    if (user && user.authProvider !== 'google') {
      return res.status(401).json({
        message: 'This account is registered with email/password only. Please sign in using email and password.',
      });
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : '';

    if (!user) {
      if (!allowCreate) {
        return res.status(409).json({
          message: 'Google account is not registered. Please use the register page to complete signup with a password.',
        });
      }

      user = await User.create({
        name,
        email,
        avatar,
        password: hashedPassword,
        authProvider: 'google',
        role: 'user',
      });
    } else if (user.authProvider === 'google' && !user.password && password) {
      user.password = hashedPassword;
      await user.save();
    }

    setAuthCookie(res, user);

    return res.status(200).json({
      message: 'Google login successful',
      user: toAuthUserResponse({
        ...user.toObject(),
        avatar: user.avatar || avatar,
      }),
    });
  } catch (error) {
    console.error('Google auth failed:', error);
    return res.status(401).json({ message: 'Google authentication failed.' });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      user: toAuthUserResponse(user),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const logoutUser = async (_req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });

  return res.status(200).json({ message: 'Logged out successfully' });
};

export const requestSetPasswordOtp = async (req, res) => {
  try {
    const { email } = req.body || {};
    const trimmedEmail = String(email || '').trim().toLowerCase();

    if (!trimmedEmail) {
      return res.status(400).json({ message: 'Email is required' });
    }

    if (!isValidEmail(trimmedEmail)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const user = await User.findOne({ email: trimmedEmail });
    if (!user || user.authProvider !== 'google' || user.password) {
      return res.status(400).json({
        message: 'Only Google users without an existing password can request a password setup code',
      });
    }

    const now = new Date();
    if (user.setPasswordOtpRequestedAt && now - user.setPasswordOtpRequestedAt < 60 * 1000) {
      return res.status(429).json({
        message: 'Please wait a minute before requesting another OTP',
      });
    }

    const otp = generateSixDigitOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000);

    user.setPasswordOtp = hashedOtp;
    user.setPasswordOtpExpiresAt = expiresAt;
    user.setPasswordOtpRequestedAt = now;
    user.setPasswordOtpVerifiedAt = undefined;
    await user.save();

    const { subject, text, html } = buildSetPasswordEmail(user.name, otp);
    await emailService.sendMail({
      to: trimmedEmail,
      subject,
      text,
      html,
      from: process.env.EMAIL_FROM || `no-reply@${process.env.APP_DOMAIN || 'example.com'}`,
    });

    res.status(200).json({ message: 'OTP has been sent to your registered email address' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const verifySetPasswordOtp = async (req, res) => {
  try {
    const { email, otp } = req.body || {};
    const trimmedEmail = String(email || '').trim().toLowerCase();

    if (!trimmedEmail || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const user = await User.findOne({ email: trimmedEmail });
    if (!user || user.authProvider !== 'google' || user.password) {
      return res.status(400).json({ message: 'Invalid email or OTP' });
    }

    if (!user.setPasswordOtp || !user.setPasswordOtpExpiresAt) {
      return res.status(400).json({ message: 'No OTP request found. Please request a new code.' });
    }

    if (new Date() > user.setPasswordOtpExpiresAt) {
      user.setPasswordOtp = '';
      user.setPasswordOtpExpiresAt = undefined;
      user.setPasswordOtpRequestedAt = undefined;
      await user.save();
      return res.status(400).json({ message: 'OTP has expired. Request a new code.' });
    }

    const isValidOtp = await bcrypt.compare(String(otp), user.setPasswordOtp);
    if (!isValidOtp) {
      return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
    }

    user.setPasswordOtpVerifiedAt = new Date();
    await user.save();

    res.status(200).json({ message: 'OTP verified successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const setPasswordWithOtp = async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body || {};
    const trimmedEmail = String(email || '').trim().toLowerCase();

    if (!trimmedEmail || !password || !confirmPassword) {
      return res.status(400).json({ message: 'Email, password and confirmPassword are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Password and confirmPassword do not match' });
    }

    const user = await User.findOne({ email: trimmedEmail });
    if (!user || user.authProvider !== 'google' || user.password) {
      return res.status(400).json({
        message: 'Only Google users without an existing password can set a new password',
      });
    }

    if (!user.setPasswordOtpVerifiedAt || !user.setPasswordOtpExpiresAt) {
      return res.status(400).json({ message: 'OTP must be verified before setting a password' });
    }

    if (new Date() > user.setPasswordOtpExpiresAt) {
      user.setPasswordOtp = '';
      user.setPasswordOtpExpiresAt = undefined;
      user.setPasswordOtpRequestedAt = undefined;
      user.setPasswordOtpVerifiedAt = undefined;
      await user.save();
      return res.status(400).json({ message: 'OTP has expired. Request a new code.' });
    }

    user.password = await bcrypt.hash(password, 10);
    user.setPasswordOtp = '';
    user.setPasswordOtpExpiresAt = undefined;
    user.setPasswordOtpRequestedAt = undefined;
    user.setPasswordOtpVerifiedAt = undefined;
    await user.save();

    res.status(200).json({ message: 'Password has been set successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
