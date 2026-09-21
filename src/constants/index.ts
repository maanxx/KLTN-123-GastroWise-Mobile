import { Platform } from 'react-native';

// Tự động nhận diện API Base URL tùy thuộc môi trường chạy (Emulator/Simulator/Wi-Fi/Production)
export const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3001/api/v1';
  }
  
  return 'http://localhost:3001/api/v1';
};

export const API_BASE_URL = getBaseUrl();

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'gastrowise_mobile_access_token',
  USER_INFO: 'gastrowise_mobile_user_info',
  REMEMBER_ME: 'gastrowise_mobile_remember_me',
};

export const COLORS = {
  primary: {
    50: '#ecfdf5',
    100: '#d1fae5',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
  },
  slate: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    400: '#94a3b8',
    600: '#475569',
    800: '#1e293b',
    900: '#0f172a',
  },
  emerald: {
    500: '#10b981',
    600: '#059669',
  },
  rose: {
    500: '#f43f5e',
  },
};
