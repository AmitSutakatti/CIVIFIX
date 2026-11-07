// services/complaintService.js
//
// All complaint-related API calls.
// Wraps raw Axios responses into clean result objects.

import api, { buildComplaintFormData } from './api';

export const complaintService = {
  // POST /api/complaints  (multipart/form-data)
  create: async ({ category, description, latitude, longitude, address, images }) => {
    const formData = buildComplaintFormData({ category, description, latitude, longitude, address, images });
    const res = await api.post('/complaints', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data; // { success, message, data: { complaint, requiresReview, reviewFlags, reviewNotice } }
  },

  // GET /api/complaints/my
  getMyComplaints: async () => {
    const res = await api.get('/complaints/my');
    return res.data.data.complaints; // array
  },

  // GET /api/complaints/:id
  getComplaint: async (id) => {
    const res = await api.get(`/complaints/${id}`);
    return res.data.data.complaint;
  },
};
