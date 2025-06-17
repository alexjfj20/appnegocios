import axios from 'axios';
import { useErrorStore } from '@/stores/error';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de solicitudes
api.interceptors.request.use(
  (config) => {
    // Agregar token de autenticación si existe
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

// Interceptor de respuestas
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const errorStore = useErrorStore();

    // Manejar errores de autenticación
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      return;
    }

    // Manejar errores de validación
    if (error.response?.status === 422) {
      const errors = error.response.data.errors;
      Object.values(errors).forEach((messages) => {
        if (Array.isArray(messages)) {
          messages.forEach((message) => {
            errorStore.addError(message);
          });
        }
      });
      return Promise.reject(error);
    }

    // Manejar otros errores
    errorStore.handleApiError(error);
    return Promise.reject(error);
  }
);

export default api; 