import { useState } from 'react';
import { User as UserIcon, Mail, Shield, ChevronDown, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { authAPI } from '../services/api';
import { extractErrorMessage } from '../utils/errorHandler';
import type { User } from '../types';
import type { ApiError } from '../types';

interface SignUpProps {
  onSuccess: (user: User) => void;
  onSwitchToSignIn: () => void;
}

// Custom Calendar Component
const Calendar = ({ selected, onSelect, className }: {
  selected: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  className?: string;
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'days' | 'months' | 'years'>('days');

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const getYearRange = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear - 80; year <= currentYear; year++) {
      years.push(year);
    }
    return years.reverse();
  };

  const handleDateSelect = (date: Date) => {
    onSelect(date);
  };

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleMonthSelect = (monthIndex: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), monthIndex, 1));
    setViewMode('days');
  };

  const handleYearSelect = (year: number) => {
    setCurrentDate(new Date(year, currentDate.getMonth(), 1));
    setViewMode('months');
  };

  if (viewMode === 'years') {
    return (
      <div className={`bg-white border border-gray-200 rounded-xl p-4 shadow-lg ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setViewMode('days')}
            className="text-sm font-medium text-gray-900 hover:text-blue-600"
          >
            ← Back to Calendar
          </button>
        </div>
        <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
          {getYearRange().map((year) => (
            <button
              key={year}
              onClick={() => handleYearSelect(year)}
              className="p-2 text-sm hover:bg-blue-50 rounded-lg transition-colors text-center"
            >
              {year}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (viewMode === 'months') {
    return (
      <div className={`bg-white border border-gray-200 rounded-xl p-4 shadow-lg ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setViewMode('years')}
            className="text-sm font-medium text-gray-900 hover:text-blue-600"
          >
            {currentDate.getFullYear()}
          </button>
          <button
            onClick={() => setViewMode('days')}
            className="text-sm font-medium text-gray-600 hover:text-blue-600"
          >
            ← Back
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {months.map((month, index) => (
            <button
              key={month}
              onClick={() => handleMonthSelect(index)}
              className="p-2 text-sm hover:bg-blue-50 rounded-lg transition-colors text-center"
            >
              {month.slice(0, 3)}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-xl p-4 shadow-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePreviousMonth}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          ←
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('months')}
            className="text-sm font-medium text-gray-900 hover:text-blue-600"
          >
            {months[currentDate.getMonth()]}
          </button>
          <button
            onClick={() => setViewMode('years')}
            className="text-sm font-medium text-gray-900 hover:text-blue-600"
          >
            {currentDate.getFullYear()}
          </button>
        </div>
        <button
          onClick={handleNextMonth}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          →
        </button>
      </div>

      {/* Days of week */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
          <div key={day} className="p-2 text-xs font-medium text-gray-500 text-center">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-1">
        {getDaysInMonth(currentDate).map((date, index) => (
          <div key={index} className="aspect-square">
            {date && (
              <button
                onClick={() => handleDateSelect(date)}
                className={`w-full h-full text-sm rounded-lg transition-colors ${
                  selected && date.toDateString() === selected.toDateString()
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-blue-50 text-gray-900'
                }`}
              >
                {date.getDate()}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

function SignUp({ onSuccess, onSwitchToSignIn }: SignUpProps) {
  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    email: '',
    otp: ''
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);


  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date || null);
    setShowCalendar(false);
    
    if (date) {
      const formattedDate = format(date, 'MM-dd-yyyy');
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

    setLoading(true);

    try {
      await authAPI.sendOTP({
        name: formData.name,
        email: formData.email,
        dateOfBirth: formData.dateOfBirth
      });
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

  const handleSignUp = async () => {
    if (!formData.otp) {
      toast.error('Please enter OTP');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.verifyOTP(formData.email, formData.otp);
      if (response.user) {
        toast.success('Account created successfully!');
        onSuccess(response.user);
      } else {
        toast.error('Failed to receive user data. Please try signing in.');
        onSwitchToSignIn();
      }
    } catch (error) {
      const errorMessage = extractErrorMessage(error as ApiError);
      toast.error(errorMessage);
      console.error('Sign Up Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    setGoogleLoading(true);
    authAPI.googleSignin();
  };

  return (
    <div className="w-full bg-white h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md flex flex-col h-full">
        {/* Header (fixed) */}
        <div className="text-center mb-6 mt-8 md:mt-0">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
              <path d="M44 11.2727C44 14.0109 39.8386 16.3957 33.69 17.6364C39.8386 18.877 44 21.2618 44 24C44 26.7382 39.8386 29.123 33.69 30.3636C39.8386 31.6043 44 33.9891 44 36.7273C44 40.7439 35.0457 44 24 44C12.9543 44 4 40.7439 4 36.7273C4 33.9891 8.16144 31.6043 14.31 30.3636C8.16144 29.123 4 26.7382 4 24C4 21.2618 8.16144 18.877 14.31 17.6364C8.16144 16.3957 4 14.0109 4 11.2727Z" fill="white"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Create your account</h1>
          <p className="text-gray-600 text-lg">Join NoteSphere and start organizing your thoughts</p>
        </div>

        {/* Form Content */}
        <div className="space-y-4 flex-grow flex flex-col justify-center">
          {/* Google Sign Up Button */}
          <button
            onClick={handleGoogleSignUp}
            disabled={loading || googleLoading}
            className="w-full flex items-center justify-center gap-3 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 py-3.5 px-4 rounded-xl font-medium transition-all duration-200 bg-white shadow-sm"
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
                <span className="text-gray-700 font-medium">Continue with Google</span>
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">or create account with email</span>
            </div>
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-800">Full Name</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-10 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white transition-all duration-200 font-medium"
                placeholder="Enter your full name"
                disabled={otpSent}
              />
            </div>
          </div>

          {/* Date of Birth */}
          <div className="space-y-2 relative">
            <label className="text-sm font-semibold text-gray-800">Date of Birth</label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none z-10" />
              <button
                type="button"
                onClick={() => setShowCalendar(!showCalendar)}
                disabled={otpSent}
                className="w-full pl-10 pr-10 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer bg-white transition-all duration-200 text-left font-medium"
              >
                {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select your date of birth'}
              </button>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            </div>
            {showCalendar && (
                <div className="absolute bottom-full left-0 mb-2 z-50">
                  <Calendar
                    selected={selectedDate || undefined}
                    onSelect={handleDateChange}
                    className="w-80"
                  />
                </div>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-800">Email address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white transition-all duration-200 font-medium"
                placeholder="Enter your email"
                disabled={otpSent}
              />
            </div>
          </div>

          {/* OTP Field */}
          {otpSent && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-800">Verification Code</label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={formData.otp}
                  onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                  className="w-full pl-10 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white transition-all duration-200 font-medium"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                />
              </div>
              <p className="text-xs text-gray-500 font-medium">Check your email for the verification code</p>
            </div>
          )}
        </div>

        {/* Footer Buttons  */}
        <div className="mt-6">
          {!otpSent ? (
            <button
              onClick={handleSendOTP}
              disabled={loading || googleLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3.5 px-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] shadow-sm"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating account...</span>
                </div>
              ) : (
                'Create account'
              )}
            </button>
          ) : (
            <button
              onClick={handleSignUp}
              disabled={loading || googleLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3.5 px-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] shadow-sm"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Verifying...</span>
                </div>
              ) : (
                'Verify & complete signup'
              )}
            </button>
          )}

          {/* Switch to Sign In */}
          <div className="text-center mt-4 pb-8">
            <span className="text-gray-600">Already have an account? </span>
            <button
              onClick={onSwitchToSignIn}
              className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUp;