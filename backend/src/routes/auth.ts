import express from 'express';
import passport from 'passport';
import { 
  sendOTP, 
  sendSigninOTP, 
  verifyOTP, 
  signin, 
  googleAuthSuccess, 
  googleAuthFailure,
  getCurrentUser,
  logout
} from '../controllers/authController';

import { authenticateJWT } from '../middleware/auth'; 

const router = express.Router();


router.post('/send-otp', sendOTP);
router.post('/send-signin-otp', sendSigninOTP);
router.post('/verify-otp', verifyOTP);
router.post('/signin', signin);


router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/api/auth/google/failure' }),
  googleAuthSuccess
);

router.get('/google/failure', googleAuthFailure);

// Authenticated routes
router.get('/me', authenticateJWT, getCurrentUser);
router.post('/logout', authenticateJWT, logout);

export default router;
