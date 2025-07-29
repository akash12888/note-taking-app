import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { authAPI } from '../services/api';
import type { User } from '../types';
import type{ ApiError } from '../types';
interface SignUpProps {
  onSuccess: (user: User, token: string) => void;
  onSwitchToSignIn: () => void;
}

const SignUp: React.FC<SignUpProps> = ({ onSuccess, onSwitchToSignIn }) => {
  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    email: '',
    otp: ''
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [showOtpField, setShowOtpField] = useState(false);
  const [loading, setLoading] = useState(false);

  // Simplified error message extraction - prioritize backend messages
  const extractErrorMessage = (error: ApiError) => {
    console.log('Full error object:', error);
    
    // First priority: Backend error message
    if (error?.response?.data?.message) {
      return error.response.data.message;
    }
    
    // Second priority: Backend error field
    if (error?.response?.data?.error) {
      return error.response.data.error;
    }
    
    // Third priority: Custom error message
    if (error?.message) {
      return error.message;
    }
    
    // Fourth priority: HTTP status with any available message
    if (error?.response?.status) {
      const statusMessage = error?.response?.data?.message || 
                           error?.response?.data?.error || 
                           error?.response?.statusText || 
                           'Something went wrong';
      return `${statusMessage}`;
    }
    
    // Network errors
    if (error?.code === 'NETWORK_ERROR' || error?.name === 'NetworkError') {
      return 'Network connection failed. Please check your internet connection.';
    }
    
    // Final fallback
    return 'An unexpected error occurred. Please try again.';
  };

  // Using date-fns for reliable dd-mm-yyyy formatting for backend
  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    
    if (date) {
      const formattedDate = format(date, 'dd-MM-yyyy');
      console.log('Formatted date for backend:', formattedDate);
      setFormData({ 
        ...formData, 
        dateOfBirth: formattedDate 
      });
    } else {
      setFormData({ 
        ...formData, 
        dateOfBirth: '' 
      });
    }
  };

  const handleSendOTP = async () => {
    if (!formData.name || !formData.email || !formData.dateOfBirth) {
      toast.error('Please fill all required fields');
      return;
    }

    console.log('Sending OTP with date format:', formData.dateOfBirth);

    setLoading(true);

    try {
      await authAPI.sendOTP({
        name: formData.name,
        email: formData.email,
        dateOfBirth: formData.dateOfBirth
      });
      setOtpSent(true);
      setShowOtpField(true);
      toast.success('OTP sent successfully to your email');
    } catch (error) {
      const errorMessage = extractErrorMessage(error as ApiError);
      toast.error(errorMessage);
      console.error('Send OTP Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!formData.otp) {
      toast.error('Please enter OTP');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.verifyOTP(formData.email, formData.otp);
      toast.success('Account created successfully!');
      onSuccess(response.user!, response.token!);
    } catch (error) {
      const errorMessage = extractErrorMessage(error as ApiError);
      toast.error(errorMessage);
      console.error('Sign Up Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    authAPI.googleSignin();
  };

  return (
    <>
      {/* Custom CSS for react-datepicker styling */}
      <style>{`
        .react-datepicker-wrapper {
          width: 100%;
        }
        .react-datepicker__input-container input {
          width: 100%;
          background-color: white !important;
        }
        .react-datepicker {
          border: 1px solid #E5E5E5;
          border-radius: 10px;
          box-shadow: 0px 2px 6px 0px rgba(0, 0, 0, 0.3);
          background-color: white;
        }
        .react-datepicker__header {
          background-color: #3B82F6;
          border-bottom: none;
        }
        .react-datepicker__current-month {
          color: white;
        }
        .react-datepicker__day-name {
          color: white;
        }
        .react-datepicker__day--selected {
          background-color: #3B82F6;
        }
        .react-datepicker__day:hover {
          background-color: #DBEAFE;
        }
      `}</style>

      <div className="w-full bg-white">
        {/* Header - Left aligned on desktop, centered on mobile */}
        <div className="text-center lg:text-left mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">Sign up</h1>
          <p className="text-gray-600">Sign up to enjoy the features of HD</p>
        </div>

        <div className="space-y-4">
          {/* Google Sign Up Button */}
          <button
            onClick={handleGoogleSignUp}
            disabled={loading}
            className="w-full border border-gray-300 hover:bg-gray-50 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 bg-white"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or sign up with email</span>
            </div>
          </div>

          {/* Your Name - Floating Label */}
          <div className="relative">
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white peer"
              placeholder="Full Name"
              disabled={otpSent}
            />
            <label className="absolute -top-2 left-3 bg-white px-1 text-sm text-gray-600 peer-focus:text-blue-500 transition-colors">
              Your Name
            </label>
          </div>

          {/* Date of Birth - Floating Label */}
          <div className="relative">
            <div className="relative">
              <Calendar 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black-500 pointer-events-none z-10" 
                size={16} 
              />
              <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                dateFormat="d MMMM yyyy"
                placeholderText="11 December 2000"
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer bg-white peer"
                disabled={otpSent}
                showPopperArrow={false}
                maxDate={new Date()}
              />
            </div>
            <label className="absolute -top-2 left-3 bg-white px-1 text-sm text-gray-600 peer-focus:text-blue-500 transition-colors">
              Date of Birth
            </label>
          </div>

          {/* Email - Floating Label */}
          <div className="relative">
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white peer"
              placeholder="example123@gmail.com"
              disabled={otpSent}
            />
            <label className="absolute -top-2 left-3 bg-white px-1 text-sm text-blue-500 peer-focus:text-blue-500 transition-colors">
              Email
            </label>
          </div>

          {/* OTP Field (Conditional) - Floating Label */}
          {showOtpField && (
            <div className="relative">
              <input
                type="text"
                value={formData.otp}
                onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white peer"
                placeholder="Enter 6-digit OTP"
                maxLength={6}
              />
              <label className="absolute -top-2 left-3 bg-white px-1 text-sm text-gray-600 peer-focus:text-blue-500 transition-colors">
                OTP
              </label>
              <p className="text-xs text-gray-500 mt-1">Check your email for the OTP code</p>
            </div>
          )}

          {/* Action Button */}
          {!otpSent ? (
            <button
              onClick={handleSendOTP}
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white py-3 rounded-lg font-medium transition-colors"
            >
              {loading ? 'Sending OTP...' : 'Get OTP'}
            </button>
          ) : (
            <button
              onClick={handleSignUp}
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white py-3 rounded-lg font-medium transition-colors"
            >
              {loading ? 'Signing up...' : 'Sign up'}
            </button>
          )}

          {/* Switch to Sign In - Left aligned on desktop, centered on mobile */}
          <div className="text-center lg:text-left">
            <span className="text-gray-600">Already have an account? </span>
            <button
              onClick={onSwitchToSignIn}
              className="text-blue-500 hover:text-blue-600 font-medium"
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignUp;
