import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { authAPI } from '../services/api';
import type { User } from '../types';
import type{ ApiError } from '../types';
interface SignInProps {
  onSuccess: (user: User, token: string, rememberMe?: boolean) => void;
  onSwitchToSignUp: () => void;
}

const SignIn: React.FC<SignInProps> = ({ onSuccess, onSwitchToSignUp }) => {
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    rememberMe: false
  });
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
    
    
    if (error?.code === 'NETWORK_ERROR' || error?.name === 'NetworkError') {
      return 'Network connection failed. Please check your internet connection.';
    }
    

    return 'An unexpected error occurred. Please try again.';
  };

  const handleSendOTP = async () => {
    if (!formData.email) {
      toast.error('Please enter your email');
      return;
    }

    setLoading(true);

    try {
      await authAPI.sendSigninOTP(formData.email);
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

  const handleSignIn = async () => {
    if (!formData.otp) {
      toast.error('Please enter OTP');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.signin(formData.email, formData.otp);
      toast.success('Signed in successfully!');
      onSuccess(response.user!, response.token!, formData.rememberMe);
    } catch (error) {
      const errorMessage = extractErrorMessage(error as ApiError);
      toast.error(errorMessage);
      console.error('Sign In Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    if (formData.rememberMe) {
      localStorage.setItem('rememberMe', 'true');
    }
    authAPI.googleSignin();
  };

  return (
    <div className="w-full bg-white">
      
      <div className="text-center lg:text-left mb-8">
        <h1 className="text-3xl font-bold text-black mb-2">Sign in</h1>
        <p className="text-gray-600">Please login to continue to your account</p>
      </div>

      <div className="space-y-4">

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


        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="rememberMe"
            checked={formData.rememberMe}
            onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
          />
          <label htmlFor="rememberMe" className="text-sm text-black-700 cursor-pointer select-none">
            Keep me logged in
          </label>
        </div>

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
            onClick={handleSignIn}
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white py-3 rounded-lg font-medium transition-colors"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        )}

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        {/* Google Sign In */}
        <button
          onClick={handleGoogleSignIn}
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

        {/* Switch to Sign Up - Left aligned on desktop, centered on mobile */}
        <div className="text-center lg:text-left">
          <span className="text-gray-600">Don't have an account? </span>
          <button
            onClick={onSwitchToSignUp}
            className="text-blue-500 hover:text-blue-600 font-medium"
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
