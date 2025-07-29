import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import { JWTPayload } from '../types/auth';

export const authenticateJWT = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined = undefined;

    const authHeader = req.header('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies?.authToken) {
      token = req.cookies.authToken;
    }

    if (!token) {
      res.status(401).json({
        success: false,
        errorType: 'no_token',
        message: 'Access denied. No token provided.'
      });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    const user = await User.findById(decoded.id);

    if (!user || !user.isVerified) {
      res.status(401).json({
        success: false,
        errorType: 'invalid_token_or_unverified_user',
        message: 'Invalid token or user not verified.'
      });
      return;
    }

    (req as any).user = {
      _id: String(user._id),
      name: user.name,
      email: user.email,
      dateOfBirth: user.dateOfBirth,
      isVerified: user.isVerified,
      otp: user.otp,
      googleId: user.googleId,
      profilePicture: user.profilePicture,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    next();
  } catch (error: any) {
    res.status(401).json({
      success: false,
      errorType: 'invalid_token',
      message: 'Invalid token.'
    });
  }
};
