import React, { createContext, useState, useEffect } from 'react';
import API from '../services/api';
import { toast } from 'react-hot-toast';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('shopez_token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await API.get('/auth/me');
        if (data?.success) {
          setUser(data.user);
          localStorage.setItem('shopez_user', JSON.stringify(data.user));
        }
      } catch (error) {
        console.error('Session validation failed:', error.message);
        logoutLocal();
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const logoutLocal = () => {
    localStorage.removeItem('shopez_token');
    localStorage.removeItem('shopez_user');
    setUser(null);
  };

  // Register User
  const register = async (name, email, password) => {
    try {
      setLoading(true);
      const { data } = await API.post('/auth/register', { name, email, password });
      if (data?.success) {
        localStorage.setItem('shopez_token', data.token);
        localStorage.setItem('shopez_user', JSON.stringify(data.user));
        setUser(data.user);
        toast.success(data.message || 'Registration successful!');
        return { success: true };
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(errMsg);
      return { success: false, message: errMsg };
    } finally {
      setLoading(false);
    }
  };

  // Login User
  const login = async (email, password) => {
    try {
      setLoading(true);
      const { data } = await API.post('/auth/login', { email, password });
      if (data?.success) {
        localStorage.setItem('shopez_token', data.token);
        localStorage.setItem('shopez_user', JSON.stringify(data.user));
        setUser(data.user);
        toast.success(data.message || 'Welcome back!');
        return { success: true };
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Login failed. Invalid email or password.';
      toast.error(errMsg);
      return { success: false, message: errMsg };
    } finally {
      setLoading(false);
    }
  };

  // Logout User
  const logout = async () => {
    try {
      await API.get('/auth/logout');
    } catch (error) {
      console.warn('Backend logout failed, clearing local session anyway');
    } finally {
      logoutLocal();
      toast.success('Logged out successfully.');
    }
  };

  // Forgot Password Link request
  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      const { data } = await API.post('/auth/forgot-password', { email });
      if (data?.success) {
        toast.success(data.message || 'Password reset link sent to your email.');
        return { success: true };
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Failed to request reset link.';
      toast.error(errMsg);
      return { success: false, message: errMsg };
    } finally {
      setLoading(false);
    }
  };

  // Reset Password Action
  const resetPassword = async (token, password) => {
    try {
      setLoading(true);
      const { data } = await API.put(`/auth/reset-password/${token}`, { password });
      if (data?.success) {
        localStorage.setItem('shopez_token', data.token);
        localStorage.setItem('shopez_user', JSON.stringify(data.user));
        setUser(data.user);
        toast.success(data.message || 'Password reset completed.');
        return { success: true };
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Password reset link is invalid or has expired.';
      toast.error(errMsg);
      return { success: false, message: errMsg };
    } finally {
      setLoading(false);
    }
  };

  // Verify Email Action
  const verifyEmail = async (token) => {
    try {
      setLoading(true);
      const { data } = await API.get(`/auth/verify-email/${token}`);
      if (data?.success) {
        toast.success(data.message || 'Email verified successfully!');
        // Update user verification status locally if already logged in
        if (user) {
          const updatedUser = { ...user, isVerified: true };
          localStorage.setItem('shopez_user', JSON.stringify(updatedUser));
          setUser(updatedUser);
        }
        return { success: true };
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Email verification link is invalid or has expired.';
      toast.error(errMsg);
      return { success: false, message: errMsg };
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
        forgotPassword,
        resetPassword,
        verifyEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
