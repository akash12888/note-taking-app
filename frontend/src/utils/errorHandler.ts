import type { ApiError } from '../types';

export const extractErrorMessage = (error: ApiError): string => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error?.response?.data?.error) {
    return error.response.data.error;
  }
  
  if (error?.message) {
    return error.message;
  }
  
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