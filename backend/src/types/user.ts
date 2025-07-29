export interface IUser {
  _id: string;
  name: string;
  email: string;
  dateOfBirth?: Date;
  isVerified: boolean;
  otp?: {
    code: string;
    expiresAt: Date;
  };
  googleId?: string;
  profilePicture?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSignupData {
  name: string;
  email: string;
  dateOfBirth: string;
}

export interface UserSigninData {
  email: string;
  otp: string;
}

export interface JWTPayload {
  id: string;
  email: string;
}
