import { useState } from 'react';
import { toast } from 'react-toastify';
import { authAPI } from '../services/api';
import { extractErrorMessage } from '../utils/errorHandler';
import type { User } from '../types';
import type { ApiError } from '../types';
import { Mail, Shield } from 'lucide-react';

interface SignInProps {
  onSuccess: (user: User) => void;
  onSwitchToSignUp: () => void;
}

function SignIn({ onSuccess, onSwitchToSignUp }: SignInProps) {
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    rememberMe: false
  });
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);


  const handleSendOTP = async () => {
    if (!formData.email) {
      toast.error('Please enter your email');
      return;
    }

    setLoading(true);

    try {
      await authAPI.sendSigninOTP(formData.email);
      setOtpSent(true);
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
      const response = await authAPI.signin(formData.email, formData.otp, formData.rememberMe);
      if (response.user) {
        toast.success('Signed in successfully!');
        onSuccess(response.user);
      } else {
        toast.error('Failed to receive user data. Please try again.');
        onSwitchToSignUp();
      }
    } catch (error) {
      const errorMessage = extractErrorMessage(error as ApiError);
      toast.error(errorMessage);
      console.error('Sign In Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setGoogleLoading(true);
    authAPI.googleSignin();
  };

  return (
    <div className="w-full bg-white min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
              <path d="M44 11.2727C44 14.0109 39.8386 16.3957 33.69 17.6364C39.8386 18.877 44 21.2618 44 24C44 26.7382 39.8386 29.123 33.69 30.3636C39.8386 31.6043 44 33.9891 44 36.7273C44 40.7439 35.0457 44 24 44C12.9543 44 4 40.7439 4 36.7273C4 33.9891 8.16144 31.6043 14.31 30.3636C8.16144 29.123 4 26.7382 4 24C4 21.2618 8.16144 18.877 14.31 17.6364C8.16144 16.3957 4 14.0109 4 11.2727Z" fill="white"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-[#101a23] mb-2">Welcome back</h1>
          <p className="text-gray-600">Sign in to continue to NoteSphere</p>
        </div>

        <div className="space-y-6">
          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading || googleLoading}
            className="w-full flex items-center justify-center gap-3 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 py-3 px-4 rounded-xl font-medium transition-all duration-200 bg-white"
          >
            {googleLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                <span>Redirecting...</span>
              </div>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-gray-700">Continue with Google</span>
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">or sign in with email</span>
            </div>
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Email address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0d80f2] focus:border-[#0d80f2] outline-none bg-white transition-all duration-200"
                placeholder="Enter your email"
                disabled={otpSent}
              />
            </div>
          </div>

          {/* OTP Field */}
          {otpSent && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Verification Code</label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={formData.otp}
                  onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0d80f2] focus:border-[#0d80f2] outline-none bg-white transition-all duration-200"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                />
              </div>
              <p className="text-xs text-gray-500">Check your email for the verification code</p>
            </div>
          )}

          {/* Remember Me */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="rememberMe"
              checked={formData.rememberMe}
              onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
              className="w-4 h-4 text-[#0d80f2] bg-gray-100 border-gray-300 rounded focus:ring-[#0d80f2] focus:ring-2"
            />
            <label htmlFor="rememberMe" className="text-sm text-gray-700 cursor-pointer select-none">
              Keep me signed in
            </label>
          </div>

          {/* Action Button */}
          {!otpSent ? (
            <button
              onClick={handleSendOTP}
              disabled={loading || googleLoading}
              className="w-full bg-[#0d80f2] hover:bg-blue-600 disabled:bg-blue-300 text-white py-3 px-4 rounded-xl font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Sending...</span>
                </div>
              ) : (
                'Send verification code'
              )}
            </button>
          ) : (
            <button
              onClick={handleSignIn}
              disabled={loading || googleLoading}
              className="w-full bg-[#0d80f2] hover:bg-blue-600 disabled:bg-blue-300 text-white py-3 px-4 rounded-xl font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign in'
              )}
            </button>
          )}

          {/* Switch to Sign Up */}
          <div className="text-center">
            <span className="text-gray-600">Don't have an account? </span>
            <button
              onClick={onSwitchToSignUp}
              className="text-[#0d80f2] hover:text-blue-600 font-medium transition-colors"
            >
              Create account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignIn;