import axios from 'axios';
import type { User, Note, ApiResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Axios instance with credentials enabled
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

//  Helper function to get token from both storages
const getStoredToken = (): string | null => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

//  Helper function to store token based on remember preference
const storeToken = (token: string, rememberMe: boolean = false): void => {
  if (rememberMe) {
    localStorage.setItem('token', token);
    sessionStorage.removeItem('token');
  } else {
    sessionStorage.setItem('token', token);
    localStorage.removeItem('token');
  }
};

//  Helper function to store user data
const storeUser = (user: User): void => {
  localStorage.setItem('user', JSON.stringify(user));
};

//  Helper function to clear all auth data
const clearAuthData = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('rememberMe');
  sessionStorage.removeItem('token');
};

//  Interceptor: Attach Authorization header if token exists
api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

//  Interceptor: Handle 401 globally with proper error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthData();
      // Only redirect if we're not already on the login page
      if (window.location.pathname !== '/' && window.location.pathname !== '/signin') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

//  Auth APIs
export const authAPI = {
  sendOTP: async (userData: { name: string; email: string; dateOfBirth: string }): Promise<ApiResponse> => {
    const response = await api.post('/auth/send-otp', userData);
    return response.data;
  },

  verifyOTP: async (email: string, otp: string, rememberMe: boolean = false): Promise<ApiResponse<{ user: User; token: string }>> => {
    const response = await api.post('/auth/verify-otp', { email, otp });
    
    storeToken(response.data.token, rememberMe);
    storeUser(response.data.user);

    return response.data;
  },

  sendSigninOTP: async (email: string): Promise<ApiResponse> => {
    const response = await api.post('/auth/send-signin-otp', { email });
    return response.data;
  },

  signin: async (email: string, otp: string, rememberMe: boolean = false): Promise<ApiResponse<{ user: User; token: string }>> => {
    const response = await api.post('/auth/signin', { email, otp });

    storeToken(response.data.token, rememberMe);
    storeUser(response.data.user);

    return response.data;
  },

  googleSignin: (): void => {
    window.location.href = `${API_URL}/auth/google`;
  },

  handleGoogleAuthSuccess: async (): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.get('/auth/me');
    
    // Check if user had selected "remember me" before Google OAuth
    const rememberMe = localStorage.getItem('rememberMe') === 'true';
    localStorage.removeItem('rememberMe');
    
    storeUser(response.data.user);
    
    // If your backend provides a token for Google OAuth, store it based on preference
    if (response.data.token) {
      storeToken(response.data.token, rememberMe);
    }
    
    return response.data;
  },

  getCurrentUser: async (): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  logout: async (): Promise<ApiResponse> => {
    try {
      const response = await api.post('/auth/logout');
      clearAuthData();
      return response.data;
    } catch (error) {
      // Even if logout API fails, clear local data
      clearAuthData();
      throw error;
    }
  },

  isAuthenticated: (): boolean => {
    const token = getStoredToken();
    const user = localStorage.getItem('user');
    return !!(token || user);
  },

  getStoredUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        // If user data is corrupted, clear it
        localStorage.removeItem('user');
        return null;
      }
    }
    return null;
  },

  //  Additional utility method for token validation
  hasValidToken: (): boolean => {
    const token = getStoredToken();
    if (!token) return false;
    
    try {
      // Basic JWT structure check (you might want to add expiration check)
      const parts = token.split('.');
      return parts.length === 3;
    } catch {
      return false;
    }
  },

  //  Method to refresh authentication state
  refreshAuth: async (): Promise<User | null> => {
    try {
      const response = await authAPI.getCurrentUser();
      if (response.user) {
        storeUser(response.user);
        return response.user;
      }
      return null;
    } catch {
      clearAuthData();
      return null;
    }
  }
};

//  Notes APIs
export const notesAPI = {
  getNotes: async (): Promise<ApiResponse<{ notes: Note[] }>> => {
    const response = await api.get('/notes');
    return response.data;
  },

  createNote: async (noteData: { title: string; content: string }): Promise<ApiResponse<{ note: Note }>> => {
    const response = await api.post('/notes', noteData);
    return response.data;
  },

  updateNote: async (noteId: string, noteData: { title?: string; content?: string }): Promise<ApiResponse<{ note: Note }>> => {
    const response = await api.put(`/notes/${noteId}`, noteData);
    return response.data;
  },

  deleteNote: async (noteId: string): Promise<ApiResponse> => {
    const response = await api.delete(`/notes/${noteId}`);
    return response.data;
  }
};

export default api;
