import axios from 'axios';

// In production: set VITE_API_URL to your backend URL (e.g. https://api.yourdomain.com)
// In dev: uses /api with Vite proxy, or VITE_API_URL if set
const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');
export const updateProfile = (data) => api.put('/auth/me', data);

// Customers
export const getCustomers = (params) => api.get('/customers', { params });
export const getCustomer = (id) => api.get(`/customers/${id}`);
export const createCustomer = (data) => api.post('/customers', data);
export const updateCustomer = (id, data) => api.put(`/customers/${id}`, data);
export const deleteCustomer = (id) => api.delete(`/customers/${id}`);

// Leads
export const getLeads = (params) => api.get('/leads', { params });
export const getLead = (id) => api.get(`/leads/${id}`);
export const createLead = (data) => api.post('/leads', data);
export const updateLead = (id, data) => api.put(`/leads/${id}`, data);
export const deleteLead = (id) => api.delete(`/leads/${id}`);
export const addLeadNote = (id, text) => api.post(`/leads/${id}/notes`, { text });

// Dashboard
export const getDashboardStats = () => api.get('/leads/dashboard');

// Activities
export const getActivities = (params) => api.get('/activities', { params });
export const getRecentActivities = (limit = 10) => api.get('/activities/recent', { params: { limit } });

// Emails
export const sendEmail = (data) => api.post('/emails/send', data);
export const getEmails = (params) => api.get('/emails', { params });

// Tasks
export const getTasks = (params) => api.get('/tasks', { params });
export const getUpcomingTasks = (limit = 10) => api.get('/tasks/upcoming', { params: { limit } });
export const createTask = (data) => api.post('/tasks', data);
export const updateTask = (id, data) => api.put(`/tasks/${id}`, data);
export const deleteTask = (id) => api.delete(`/tasks/${id}`);

// Reports
export const getRevenueReport = (period = 30) => api.get('/reports/revenue', { params: { period } });
export const getFunnelReport = () => api.get('/reports/funnel');
export const getSummaryReport = () => api.get('/reports/summary');
export const exportLeadsCsv = () => api.get('/reports/export/leads', { responseType: 'blob' });
export const exportCustomersCsv = () => api.get('/reports/export/customers', { responseType: 'blob' });

// AI
export const draftEmail = (data) => api.post('/ai/draft-email', data);
export const summarizeContact = (data) => api.post('/ai/summarize', data);

// Admin
export const getAdminStats = () => api.get('/admin/stats');

// Axios instance for file uploads (no Content-Type default so browser sets multipart boundary)
const uploadApi = axios.create({
  baseURL: API_BASE,
});
uploadApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Upload (authenticated)
export const uploadImage = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return uploadApi.post('/upload', formData);
};

// Upload for registration (no auth)
export const uploadImageRegister = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return uploadApi.post('/upload/register', formData);
};
