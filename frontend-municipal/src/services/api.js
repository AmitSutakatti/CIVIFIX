import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  getMe: () => api.get('/auth/me'),
};

// Municipal API
export const municipalAPI = {
  getDashboardStats: () => api.get('/municipal/dashboard/stats'),
  getComplaints: (params) => api.get('/municipal/complaints', { params }),
  getComplaint: (id) => api.get(`/municipal/complaints/${id}`),
  verifyComplaint: (id, data) => api.put(`/municipal/complaints/${id}/verify`, data),
  markDuplicate: (id, data) => api.put(`/municipal/complaints/${id}/duplicate`, data),
  startFieldVerification: (id, data) =>
    api.put(`/municipal/complaints/${id}/field-verification`, data),
  submitFieldVerification: (id, formData) =>
    api.put(`/municipal/complaints/${id}/field-verification/submit`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  markFake: (id, data) => api.put(`/municipal/complaints/${id}/fake`, data),
  assignContractor: (id, data) => api.put(`/municipal/complaints/${id}/assign`, data),
  updateComplaintStatus: (id, data) => api.put(`/municipal/complaints/${id}/status`, data),
  closeComplaint: (id, data) => api.put(`/municipal/complaints/${id}/close`, data),
  getAnalytics: () => api.get('/municipal/analytics'),
  getContractors: () => api.get('/municipal/contractors'),
  getContractorApplications: () => api.get('/municipal/contractor-applications'),
  verifyContractorApplication: (userId, data) =>
    api.put(`/municipal/contractor-applications/${userId}/verify`, data),
  scheduleContractorAppointment: (userId, data) =>
    api.put(`/municipal/contractor-applications/${userId}/appointment`, data),
};

// Chat API (shared with contractor portal)
export const chatAPI = {
  getChatMessages: (complaintId) => api.get(`/chat/${complaintId}`),
  sendMessage: (complaintId, formData) => api.post(`/chat/${complaintId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  markMessagesRead: (complaintId) => api.put(`/chat/${complaintId}/read`),
};

// Quotation API
export const quotationAPI = {
  getAll: () => api.get('/quotation'),
  getById: (quotationId) => api.get(`/quotation/${quotationId}`),
  approve: (quotationId) => api.post(`/quotation/${quotationId}/approve`),
  reject: (quotationId, reason) => api.post(`/quotation/${quotationId}/reject`, { reason }),
};

export default api;
