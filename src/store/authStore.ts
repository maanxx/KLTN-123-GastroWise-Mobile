import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { apiClient } from '../lib/api/client';
import { STORAGE_KEYS } from '../constants';

export interface User {
  _id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  phone?: string;
  status?: string;
  twoFactorEnabled?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  
  setAuth: (user: User, token: string) => Promise<void>;
  login: (credentials: { email: string; password: string }) => Promise<any>;
  register: (payload: { name: string; email: string; phone: string; password: string }) => Promise<any>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  isInitialized: false,

  setAuth: async (user, token) => {
    try {
      await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, token);
      await SecureStore.setItemAsync(STORAGE_KEYS.USER_INFO, JSON.stringify(user));
      set({ user, token });
    } catch (e) {
      console.error('Lỗi lưu Auth SecureStore:', e);
    }
  },

  login: async ({ email, password }) => {
    set({ isLoading: true });
    try {
      const res: any = await apiClient.post('/auth/login', { email, password });
      const token = res.accessToken || res.token;
      const user = res.user;

      if (token && user) {
        await get().setAuth(user, token);
      }

      set({ isLoading: false });
      return res;
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  register: async ({ name, email, phone, password }) => {
    set({ isLoading: true });
    try {
      const res: any = await apiClient.post('/auth/register', { name, email, phone, password });
      const token = res.accessToken || res.token;
      const user = res.user;

      if (token && user) {
        await get().setAuth(user, token);
      }

      set({ isLoading: false });
      return res;
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    try {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_INFO);
    } catch (e) {
      console.error('Lỗi xóa SecureStore:', e);
    }
    set({ user: null, token: null });
  },

  checkAuth: async () => {
    try {
      const token = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
      const userJson = await SecureStore.getItemAsync(STORAGE_KEYS.USER_INFO);

      if (token && userJson) {
        const user = JSON.parse(userJson);
        set({ user, token, isInitialized: true });
      } else {
        set({ user: null, token: null, isInitialized: true });
      }
    } catch (e) {
      set({ user: null, token: null, isInitialized: true });
    }
  },
}));
