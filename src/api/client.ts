import axios from 'axios';
import { installMockAdapter } from './mocks/adapter';
import { storageService } from '@/services/storage';

const USE_MOCK = true;

export const apiClient = axios.create({
  baseURL: 'https://api.communify.app/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

if (USE_MOCK) {
  installMockAdapter(apiClient);
}

apiClient.interceptors.request.use(async (config) => {
  const token = await storageService.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401) {
      await storageService.clearAuth();
    }
    return Promise.reject(error);
  }
);
