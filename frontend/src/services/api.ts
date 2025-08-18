import axios from 'axios';
import type { User, ApiResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

const getStoredToken = (): string | null => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

const storeToken = (token: string, rememberMe: boolean = false): void => {
  if (rememberMe) {
    localStorage.setItem('token', token);
    sessionStorage.removeItem('token');
  } else {
    sessionStorage.setItem('token', token);
    localStorage.removeItem('token');
  }
};

const storeUser = (user: User): void => {
  localStorage.setItem('user', JSON.stringify(user));
};

const clearAuthData = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  sessionStorage.removeItem('token');
};

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthData();
      if (window.location.pathname !== '/' && window.location.pathname !== '/signin') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  sendOTP: async (userData: { name: string; email: string; dateOfBirth: string }): Promise<ApiResponse> => {
    const response = await api.post('/auth/send-otp', userData);
    return response.data;
  },

  verifyOTP: async (email: string, otp: string, rememberMe: boolean = false): Promise<ApiResponse> => {
    const response = await api.post('/auth/verify-otp', { email, otp });
    if (response.data.token) {
      storeToken(response.data.token, rememberMe);
    }
    if (response.data.user) {
      storeUser(response.data.user);
    }
    return response.data;
  },

  sendSigninOTP: async (email: string): Promise<ApiResponse> => {
    const response = await api.post('/auth/send-signin-otp', { email });
    return response.data;
  },

  signin: async (email: string, otp: string, rememberMe: boolean = false): Promise<ApiResponse> => {
    const response = await api.post('/auth/signin', { email, otp });
    if (response.data.token) {
      storeToken(response.data.token, rememberMe);
    }
    if (response.data.user) {
      storeUser(response.data.user);
    }
    return response.data;
  },

  googleSignin: (): void => {
    window.location.href = `${API_URL}/auth/google`;
  },

  getCurrentUser: async (): Promise<ApiResponse> => {
    const response = await api.get('/auth/me');
    if (response.data.user) {
      // The backend returns the token as an HTTP-only cookie.
      // We store the user data locally. The axios instance will automatically
      // send the cookie with `withCredentials: true`.
      storeUser(response.data.user);
    }
    return response.data;
  },

  logout: async (): Promise<ApiResponse> => {
    try {
      const response = await api.post('/auth/logout');
      clearAuthData();
      return response.data;
    } catch (error) {
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
        localStorage.removeItem('user');
        return null;
      }
    }
    return null;
  },

  refreshAuth: async (): Promise<User | null> => {
    try {
      const response = await authAPI.getCurrentUser();
      if (response.user) {
        storeUser(response.user);
        return response.user;
      }
      return null;
    } catch (error) {
      clearAuthData();
      console.error( error);
      return null;
    }
  },

  clearAuthData
};

export const notesAPI = {
  getNotes: async (): Promise<ApiResponse> => {
    const response = await api.get('/notes');
    return response.data;
  },

  createNote: async (noteData: { title: string; content: string }): Promise<ApiResponse> => {
    const response = await api.post('/notes', noteData);
    return response.data;
  },

  updateNote: async (noteId: string, noteData: { title?: string; content?: string }): Promise<ApiResponse> => {
    const response = await api.put(`/notes/${noteId}`, noteData);
    return response.data;
  },

  deleteNote: async (noteId: string): Promise<ApiResponse> => {
    const response = await api.delete(`/notes/${noteId}`);
    return response.data;
  }
};

export default api;