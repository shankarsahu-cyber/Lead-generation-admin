import React, { createContext, useContext, useState, ReactNode } from 'react';
import axios from 'axios';
import { login as apiLogin, User } from '../services/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await apiLogin(email, password);
      console.log("Full Login API Response:", response); // Log the entire response object
      console.log("Login API Response Data (contents of response.data):", response.data); // Log just the data payload

      // Check if login was successful and data.user exists
      if (!response.success || !response.data || !response.data.token || typeof response.data.token !== 'string' || !response.data.email || !response.data.role || !response.data.merchantId) {
        console.error("Login API response indicates failure or missing expected token, email, role, or merchantId data within response.data:", response);
        return false;
      }

      const loggedInUser: User = {
        email: response.data.email,
        token: response.data.token,
        name: response.data.name, // Include name if available
        role: response.data.role,
        merchantId: response.data.merchantId,
        refreshToken: response.data.refreshToken || '', // refreshToken might be optional or handled separately
      };
      setUser(loggedInUser);
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      return true;
    } catch (error) {
      console.error('Login error:', error, (error as any).response?.data);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const isAuthenticated = !!user;

  const value = {
    user,
    login,
    logout,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};