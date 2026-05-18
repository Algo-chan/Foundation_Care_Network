import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  // Use the state directly from the store's non-hook API
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.error?.message || 'An unexpected error occurred';
    
    // If unauthorized, we might want to logout, but let's be careful with refresh cycles
    if (error.response?.status === 401) {
       // useAuthStore.getState().logout();
    }
    
    return Promise.reject(new Error(message));
  }
);

export default api;
