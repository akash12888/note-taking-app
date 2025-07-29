import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import User from '../models/User';
import { generateOTP } from '../utils/generateOTP';
import { sendOTPEmail } from '../utils/sendEmail';
import { validateSignup, validateOTPSignin } from '../utils/validators';
import { UserSignupData, UserSigninData } from '../types/user';
import { JWTPayload } from '../types/auth';


const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' as const : 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/'
};

const generateToken = (userId: string, email: string): string => {
  const payload: JWTPayload = { id: userId, email };

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable is not defined');
  }

  const jwtExpire = process.env.JWT_EXPIRE || '7d';

  return jwt.sign(
    payload as string | object | Buffer,
    jwtSecret as jwt.Secret,
    {
      expiresIn: jwtExpire as string | number
    } as jwt.SignOptions
  );
};

export const sendOTP = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { error } = validateSignup(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        errorType: 'validation_error',
        message: error.details[0].message
      });
      return;
    }

    const { name, email, dateOfBirth }: UserSignupData = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isVerified) {
      res.status(409).json({
        success: false,
        errorType: 'email_exists',
        message: 'User already exists with this email'
      });
      return;
    }

    const otpCode = generateOTP();
    const otpExpiry = new Date(Date.now() + parseInt(process.env.OTP_EXPIRE_MINUTES || '5') * 60 * 1000);

    const userData = {
      name,
      email,
      dateOfBirth: new Date(dateOfBirth),
      otp: {
        code: otpCode,
        expiresAt: otpExpiry
      },
      isVerified: false
    };

    await User.findOneAndUpdate({ email }, userData, { upsert: true, new: true });
    await sendOTPEmail(email, name, otpCode);

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully to your email'
    });

  } catch (error) {
    console.error('Error in sendOTP:', error);
    next(error);
  }
};

export const sendSigninOTP = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email }: { email: string } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        errorType: 'validation_error',
        message: 'Email is required'
      });
      return;
    }

    const user = await User.findOne({ email, isVerified: true });
    if (!user) {
      res.status(404).json({
        success: false,
        errorType: 'not_found',
        message: 'No verified account found with this email'
      });
      return;
    }

    const otpCode = generateOTP();
    const otpExpiry = new Date(Date.now() + parseInt(process.env.OTP_EXPIRE_MINUTES || '5') * 60 * 1000);

    user.otp = {
      code: otpCode,
      expiresAt: otpExpiry
    };
    await user.save();

    await sendOTPEmail(email, user.name, otpCode);

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully to your email'
    });

  } catch (error) {
    console.error('Error in sendSigninOTP:', error);
    next(error);
  }
};

export const verifyOTP = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, otp }: { email: string; otp: string } = req.body;

    if (!email || !otp) {
      res.status(400).json({
        success: false,
        errorType: 'validation_error',
        message: 'Email and OTP are required'
      });
      return;
    }

    const user = await User.findOne({
      email,
      'otp.code': otp,
      'otp.expiresAt': { $gt: new Date() }
    });

    if (!user) {
      res.status(400).json({
        success: false,
        errorType: 'invalid_otp',
        message: 'Invalid or expired OTP'
      });
      return;
    }

    user.isVerified = true;
    user.otp = undefined;
    await user.save();

    const token = generateToken(String(user._id), user.email);

    // Set cookie for authentication
    res.cookie('authToken', token, cookieOptions);
    
    res.status(200).json({
      success: true,
      message: 'Account verified successfully',
      token,
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        dateOfBirth: user.dateOfBirth,
        profilePicture: user.profilePicture
      }
    });

  } catch (error) {
    console.error('Error in verifyOTP:', error);
    next(error);
  }
};

export const signin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { error } = validateOTPSignin(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        errorType: 'validation_error',
        message: error.details[0].message
      });
      return;
    }

    const { email, otp }: UserSigninData = req.body;

    const user = await User.findOne({
      email,
      isVerified: true,
      'otp.code': otp,
      'otp.expiresAt': { $gt: new Date() }
    });

    if (!user) {
      res.status(401).json({
        success: false,
        errorType: 'invalid_otp',
        message: 'Invalid credentials or OTP expired'
      });
      return;
    }

    user.otp = undefined;
    await user.save();

    const token = generateToken(String(user._id), user.email);

    
    res.cookie('authToken', token, cookieOptions);

    res.status(200).json({
      success: true,
      message: 'Signed in successfully',
      token,
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        dateOfBirth: user.dateOfBirth,
        profilePicture: user.profilePicture
      }
    });

  } catch (error) {
    console.error('Error in signin:', error);
    next(error);
  }
};


export const googleAuthSuccess = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.redirect(`${FRONTEND_URL}?error=no_user`);
      return;
    }

    const user = req.user as any;
    const token = generateToken(String(user._id), user.email);

    res.cookie('authToken', token, cookieOptions);
    res.redirect(`${FRONTEND_URL}?auth=success`);
  } catch (error) {
    console.error('Error in googleAuthSuccess:', error);
    res.redirect(`${FRONTEND_URL}?error=auth_failed`);
  }
};


export const googleAuthFailure = (req: Request, res: Response): void => {
  res.redirect(`${FRONTEND_URL}?error=google_auth_failed`);
};

export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    let token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      token = req.cookies?.authToken;
    }

    if (!token) {
      res.status(401).json({ 
        success: false, 
        errorType: 'no_token', 
        message: 'No token provided' 
      });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    const user = await User.findById(decoded.id);

    if (!user) {
      res.status(404).json({ 
        success: false, 
        errorType: 'not_found', 
        message: 'User not found' 
      });
      return;
    }

    res.status(200).json({
      success: true,
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        dateOfBirth: user.dateOfBirth,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    res.status(401).json({ 
      success: false, 
      errorType: 'invalid_token', 
      message: 'Invalid token' 
    });
  }
};

export const logout = (req: Request, res: Response): void => {
  res.clearCookie('authToken', cookieOptions);

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

export const healthCheck = (req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
};
