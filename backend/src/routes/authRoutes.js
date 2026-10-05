import express from 'express';
import {
  googleAuth,
  loginUser,
  registerUser,
  requestEmailVerificationCode,
  confirmEmailVerificationCode,
  requestSetPasswordOtp,
  verifySetPasswordOtp,
  setPasswordWithOtp,
  logoutUser,
  getCurrentUser,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/me', protect, getCurrentUser);
router.post('/google', googleAuth);
router.post('/email/verify/request', requestEmailVerificationCode);
router.post('/email/verify/confirm', confirmEmailVerificationCode);
router.post('/set-password/request-otp', requestSetPasswordOtp);
router.post('/set-password/verify-otp', verifySetPasswordOtp);
router.post('/set-password', setPasswordWithOtp);

export default router;
