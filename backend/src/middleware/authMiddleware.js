import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    const tokenFromCookie = req.cookies?.token;
    const authHeader = req.headers.authorization || '';
    const tokenFromHeader = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
    const token = tokenFromCookie || tokenFromHeader;

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.userId) {
      return res.status(401).json({ message: 'Invalid authentication token' });
    }

    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = {
      id: user._id.toString(),
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    };

    return next();
  } catch (error) {
    if (error?.name === 'TokenExpiredError' || error?.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Session expired or invalid' });
    }

    return res.status(500).json({ message: 'Authentication failed' });
  }
};

export const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  return next();
};
