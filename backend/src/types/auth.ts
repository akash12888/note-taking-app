import { Request } from 'express';
import { IUser } from './user';

export interface AuthRequest extends Request {
  user?: IUser;
}

export interface JWTPayload {
  id: string;
  email: string;
}

