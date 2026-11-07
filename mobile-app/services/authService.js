// services/authService.js
//
// All authentication API calls.
// Wraps the raw Axios responses into clean result objects
// so callers never need to dig into response.data.data.user.

import api from './api';

export const authService = {
  // POST /api/auth/signup
  signup: async (userData) => {
    try {
      const res = await api.post('/auth/signup', userData);
      const { user, token, registrationBonus } = res.data.data;
      return {
        success: true,
        user,
        token,
        registrationBonus,
        message: res.data.message,
      };
    } catch (error) {
      const data = error.response?.data || {};
      return { success: false, message: data.message || 'Registration failed' };
    }
  },

  // POST /api/auth/login
  login: async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { user, token } = res.data.data;
      return { success: true, user, token };
    } catch (error) {
      const status = error.response?.status;
      const data   = error.response?.data || {};
      // 403 ACCOUNT_BLOCKED — not an auth error, a business rule error
      if (status === 403 && data.code === 'ACCOUNT_BLOCKED') {
        return {
          success: false,
          blocked: true,
          message: data.message,
          blockedUntil: data.blockedUntil,
          demeritPoints: data.demeritPoints,
        };
      }
      return { success: false, message: data.message || 'Login failed' };
    }
  },

  // GET /api/auth/me
  getMe: async () => {
    try {
      const res = await api.get('/auth/me');
      return { success: true, user: res.data.data.user };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to fetch profile' };
    }
  },
};
