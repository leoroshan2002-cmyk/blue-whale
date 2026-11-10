import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'development-secret-key';

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const tokenFromHeader = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
    const tokens = [...new Set([tokenFromHeader, req.cookies?.token].filter(Boolean))];

    if (tokens.length === 0) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    let user = null;
    for (const token of tokens) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (!decoded?.userId) continue;

        user = await User.findById(decoded.userId).select('-password');
        if (user) break;
      } catch (error) {
        if (error?.name !== 'TokenExpiredError' && error?.name !== 'JsonWebTokenError') {
          throw error;
        }
      }
    }

    if (!user) {
      return res.status(401).json({ message: 'Session expired or invalid' });
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
