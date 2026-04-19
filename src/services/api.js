import axios from 'axios';

const api = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/v1/users`,
});

// Attach token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sky_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const authAPI = {
  login: (data) => api.post('/login', data),
  register: (data) => api.post('/register', data),
  requestPasswordReset: (data) => api.post('/forgot-password', data),
  resetPassword: (data) => api.post('/reset-password', data),
};

// Users / contacts
export const usersAPI = {
  getProfile: () => api.get('/profile'),
  getAll:  ()     => api.get('/users'),
  search:  (q)    => api.get(`/users/search?q=${q}`),
  getById: (id)   => api.get(`/users/${id}`),
  updateProfile: (data) => api.put('/profile', data),
};

// Messages
export const messagesAPI = {
  getConversation: (userId, page = 1) =>
    api.get(`/messages/${userId}?page=${page}&limit=30`),
  send: (data) => api.post('/messages', data),
  deleteMessage: (id) => api.delete(`/messages/${id}`),
};

// Conversations / rooms
export const conversationsAPI = {
  getAll:  ()   => api.get('/conversations'),
  getById: (id) => api.get(`/conversations/${id}`),
  create:  (data) => api.post('/conversations', data),
};

export default api;