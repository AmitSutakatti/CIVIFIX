// services/notificationService.js
//
// All notification-related API calls.

import api from './api';

export const notificationService = {
  // GET /api/notifications/user
  getNotifications: async () => {
    const res = await api.get('/notifications/user');
    return res.data.data; // { notifications, unreadCount }
  },

  // PUT /api/notifications/:id/read
  markAsRead: async (id) => {
    const res = await api.put(`/notifications/${id}/read`);
    return res.data;
  },

  // PUT /api/notifications/read-all
  markAllAsRead: async () => {
    const res = await api.put('/notifications/read-all');
    return res.data;
  },
};
