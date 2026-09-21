import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL, STORAGE_KEYS } from '../../constants';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptor: Đính kèm Authorization Bearer Token từ SecureStore
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.log('Lỗi đọc Token từ SecureStore:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor: Bắt lỗi Response & 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const customError = error.response?.data || {
      message: error.message || 'Không thể kết nối tới máy chủ GastroWise',
    };

    if (error.response?.status === 401) {
      try {
        await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
        await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_INFO);
      } catch (e) {
        console.log('Lỗi xóa token khi logout:', e);
      }
    }

    return Promise.reject(customError);
  }
);
