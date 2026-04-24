import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Replace with your computer's local IP address or 10.0.2.2 for Android Emulator
const BASE_URL = 'https://rythu-mitra-chea.onrender.com/api/sensor';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add x-auth-token to every request if it exists
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('userToken');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authService = {
  login: (phoneNumber, password) => api.post('/auth/login', { phoneNumber, password }),
  register: (userData) => api.post('/auth/register', userData),
  updatePassword: (passwords) => api.post('/auth/update-password', passwords),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  verifyPhone: (phoneNumber) => api.post('/auth/verify-phone', { phoneNumber }),
};




export const deviceService = {
  getDevices: () => api.get('/devices'),
  registerDevice: (deviceData) => api.post('/devices', deviceData),
};

export const telemetryService = {
  getLatest: (deviceId) => api.get(`/telemetry/${deviceId}/latest`),
};

export const profileService = {
  getProfile: () => api.get('/profile'),
  updateProfile: (profileData) => api.put('/profile', profileData),
};

export const alertService = {
  getAlerts: () => api.get('/alerts'),
  markRead: (id) => api.put(`/alerts/${id}`),
  deleteAlert: (id) => api.delete(`/alerts/${id}`),
  clearAll: () => api.delete('/alerts'),
};

export const dashboardService = {
  getData: () => api.get('/dashboard'),
};



export default api;
