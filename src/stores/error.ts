import { defineStore } from 'pinia';
import axios from 'axios';

interface ErrorState {
  errors: string[];
  notifications: {
    id: number;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
    timeout?: number;
  }[];
}

export const useErrorStore = defineStore('error', {
  state: (): ErrorState => ({
    errors: [],
    notifications: [],
  }),

  actions: {
    // Manejar errores de API
    handleApiError(error: unknown) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || error.message;
        this.addError(message);
        this.showNotification('error', message);
      } else {
        this.addError('Ha ocurrido un error inesperado');
        this.showNotification('error', 'Ha ocurrido un error inesperado');
      }
    },

    // Agregar error a la lista
    addError(error: string) {
      this.errors.push(error);
      // Limpiar errores después de 5 segundos
      setTimeout(() => {
        this.errors = this.errors.filter(e => e !== error);
      }, 5000);
    },

    // Mostrar notificación
    showNotification(type: 'success' | 'error' | 'info' | 'warning', message: string, timeout = 5000) {
      const id = Date.now();
      this.notifications.push({ id, type, message, timeout });
      
      if (timeout) {
        setTimeout(() => {
          this.removeNotification(id);
        }, timeout);
      }
    },

    // Remover notificación
    removeNotification(id: number) {
      this.notifications = this.notifications.filter(n => n.id !== id);
    },

    // Limpiar todos los errores
    clearErrors() {
      this.errors = [];
    },

    // Limpiar todas las notificaciones
    clearNotifications() {
      this.notifications = [];
    },
  },
}); 