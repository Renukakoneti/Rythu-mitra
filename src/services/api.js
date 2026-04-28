import axios from 'axios';
import { storage } from '../utils/storage';

// Replace with your computer's local IP address or 10.0.2.2 for Android Emulator
// For Local Development (replace with your machine's IP for physical devices)
// const BASE_URL = 'http://192.168.1.44:5000/api'; 
const BASE_URL = 'http://10.0.2.2:5000/api'; // Android Emulator
// const BASE_URL = 'https://rythu-mitra-chea.onrender.com/api'; // Production

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add x-auth-token to every request if it exists
api.interceptors.request.use(
  async (config) => {
    const token = await storage.getItemAsync('userToken');
    console.log("TOKEN VALUE:", token);
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

const normalizeSensorData = (data = {}) => {
  const soilValue = data.soil_moisture ?? data.soil ?? 0;
  const co2Value = data.co2_ppm ?? data.gas ?? 0;
  const rainValue = data.rain_intensity ?? data.rain ?? 0;

  return {
    soil_moisture: soilValue,
    soil: soilValue,
    temperature: data.temperature ?? 0,
    humidity: data.humidity ?? 0,
    co2_ppm: co2Value,
    gas: co2Value,
    rain_intensity: rainValue,
    rain: rainValue,
    updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date()
  };
};

export const dashboardService = {
  getData: () => api.get('/dashboard'),
};

// 📡 Live Sensor Data Service
export const sensorService = {
  getLiveData: async () => {
    const endpoints = [
      '/sensor/data',
      '/sensor',
      'http://192.168.1.44:5000/api/sensor/data',
      'http://192.168.1.44:5000/api/sensor'
    ];

    for (const endpoint of endpoints) {
      try {
        const response = endpoint.startsWith('http')
          ? await axios.get(endpoint)
          : await api.get(endpoint);

        if (!response?.data || typeof response.data !== 'object') {
          throw new Error('Invalid sensor JSON response');
        }

        return {
          ...response,
          data: normalizeSensorData(response.data)
        };
      } catch (error) {
        if (error.response?.status === 404) {
          console.debug(`Sensor endpoint not found (404): ${endpoint}`);
          continue;
        }

        if (error.message?.includes('Invalid sensor JSON response')) {
          console.debug(`Sensor endpoint returned invalid JSON: ${endpoint}`);
          continue;
        }

        console.debug(`Sensor endpoint request failed: ${endpoint}`, error.message || error);
        continue;
      }
    }

    throw new Error('No sensor endpoint available');
  }
};

export default api;
