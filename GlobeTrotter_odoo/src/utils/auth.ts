import { clearAccessToken, getAccessToken } from './api';

export interface AuthData {
  role: 'user' | 'admin';
  lastScreen: string;
  timestamp: number;
}

const AUTH_KEY = 'globeTrotterAuth';
const SESSION_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const authUtils = {
  // Save authentication data to localStorage
  saveAuth: (role: 'user' | 'admin', lastScreen: string = 'dashboard') => {
    const authData: AuthData = {
      role,
      lastScreen,
      timestamp: Date.now()
    };
    localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
  },

  // Get authentication data from localStorage
  getAuth: (): AuthData | null => {
    try {
      const savedAuth = localStorage.getItem(AUTH_KEY);
      if (!savedAuth || !getAccessToken()) return null;

      const authData: AuthData = JSON.parse(savedAuth);
      
      // Check if session has expired
      const isExpired = authData.timestamp && (Date.now() - authData.timestamp > SESSION_EXPIRY);
      
      if (isExpired) {
        localStorage.removeItem(AUTH_KEY);
        return null;
      }

      return authData;
    } catch (error) {
      console.error('Error parsing saved auth data:', error);
      localStorage.removeItem(AUTH_KEY);
      clearAccessToken();
      return null;
    }
  },

  // Update last screen and refresh timestamp
  updateAuth: (lastScreen: string) => {
    try {
      const savedAuth = localStorage.getItem(AUTH_KEY);
      if (savedAuth) {
        const authData: AuthData = JSON.parse(savedAuth);
        authUtils.saveAuth(authData.role, lastScreen);
      }
    } catch (error) {
      console.error('Error updating auth data:', error);
    }
  },

  // Clear authentication data
  clearAuth: () => {
    localStorage.removeItem(AUTH_KEY);
    clearAccessToken();
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return authUtils.getAuth() !== null;
  }
};
