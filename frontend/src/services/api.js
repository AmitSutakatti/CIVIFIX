import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
  signup: (userData) => api.post('/auth/signup', userData),
  login: (email, password) => api.post('/auth/login', { email, password }),
  getMe: () => api.get('/auth/me'),
};

// Complaint API
export const complaintAPI = {
  create: (formData) => api.post('/complaints', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  getMyComplaints: () => api.get('/complaints/my'),
  getComplaint: (id) => api.get(`/complaints/${id}`),
};

// Notification API
export const notificationAPI = {
  getUserNotifications: () => api.get('/notifications/user'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
};

// Letter API
export const letterAPI = {
  generateLetter: (data) => api.post('/letters/generate', data),
};

// Municipal API
export const municipalAPI = {
  getDashboardStats: () => api.get('/municipal/dashboard/stats'),
  getComplaints: (params) => api.get('/municipal/complaints', { params }),
  verifyComplaint: (id, data) => api.put(`/municipal/complaints/${id}/verify`, data),
  assignContractor: (id, data) => api.put(`/municipal/complaints/${id}/assign`, data),
  updateComplaintStatus: (id, data) => api.put(`/municipal/complaints/${id}/status`, data),
  closeComplaint: (id, data) => api.put(`/municipal/complaints/${id}/close`, data),
  getAnalytics: () => api.get('/municipal/analytics'),
  getContractors: () => api.get('/municipal/contractors'),
};

export default api;

