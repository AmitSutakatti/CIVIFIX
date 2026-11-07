// services/userService.js
//
// User profile API calls.
// Note: profile update endpoints do not yet exist in the backend.
// They are documented here and will be enabled after backend approval.

import api from './api';

export const userService = {
  // GET /api/auth/me  (alias — same as authService.getMe)
  getProfile: async () => {
    const res = await api.get('/auth/me');
    return res.data.data.user;
  },

  // POST /api/letters/generate
  generateLetter: async ({ category, description, user, location, address }) => {
    const res = await api.post('/letters/generate', { category, description, user, location, address });
    return res.data.data.letter; // string
  },

  // ── PENDING BACKEND APPROVAL ───────────────────────────
  // PUT /api/auth/profile  — update name + phone
  // updateProfile: async ({ name, phone }) => { ... },

  // PUT /api/auth/password  — change password
  // changePassword: async ({ oldPassword, newPassword }) => { ... },
};
