import axios from 'axios';

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
      window.location.href = '/municipal/login';
    }
    return Promise.reject(error);
  }
);

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
