import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';

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
  registerContractor: (formData) =>
    api.post('/auth/contractor/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
};

// Contractor API
export const contractorAPI = {
  getComplaints: (params) => api.get('/contractor/complaints', { params }),
  getNotifications: () => api.get('/contractor/notifications'),
  getChatMessages: (complaintId) => api.get(`/chat/${complaintId}`),
  sendMessage: (complaintId, formData) => api.post(`/chat/${complaintId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  markMessagesRead: (complaintId) => api.put(`/chat/${complaintId}/read`),
};

export default api;

