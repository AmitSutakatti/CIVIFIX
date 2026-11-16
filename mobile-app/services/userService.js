// services/userService.js
//
// User profile API calls.
import api from './api';

export const userService = {
  // GET /api/auth/me  (alias — same as authService.getMe)
  getProfile: async () => {
    const res = await api.get('/auth/me');
    return res.data.data.user;
  },

  updateProfilePhoto: async (image) => {
    if (!image?.uri) {
      throw new Error('The selected photo is no longer accessible. Choose it again.');
    }

    const formData = new FormData();
    formData.append('profilePhoto', {
      uri: image.uri,
      type: image.mimeType || 'image/jpeg',
      name: image.fileName || `profile-${Date.now()}.jpg`,
    });

    const res = await api.put('/auth/profile/photo', formData);
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
