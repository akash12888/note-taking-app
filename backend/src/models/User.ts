import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from '../types/user';

// Use Omit to exclude _id from IUser and let Mongoose handle it
interface IUserDocument extends Omit<IUser, '_id'>, Document {
  clearExpiredOTP(): Promise<void>;
}

const userSchema = new Schema<IUserDocument>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  dateOfBirth: {
    type: Date
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  otp: {
    code: String,
    expiresAt: Date
  },
  googleId: String,
  profilePicture: String
}, {
  timestamps: true 
});

userSchema.methods.clearExpiredOTP = async function(): Promise<void> {
  if (this.otp && this.otp.expiresAt < new Date()) {
    this.otp = undefined;
    await this.save();
  }
};

export default mongoose.model<IUserDocument>('User', userSchema);
