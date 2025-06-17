import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { useAuthStore } from '@/stores/auth';
import { useErrorStore } from '@/stores/error';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const initializeFirebase = async () => {
  try {
    const app = initializeApp(firebaseConfig);
    const messaging = getMessaging(app);

    // Solicitar permiso para notificaciones
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      // Obtener token FCM
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      });

      // Registrar token en el backend
      const userStore = useAuthStore();
      const errorStore = useErrorStore();

      if (userStore.isAuthenticated) {
        try {
          await fetch('/api/notifications/tokens', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              token,
              deviceType: 'web',
            }),
          });
        } catch (error) {
          errorStore.handleApiError(error);
        }
      }

      // Escuchar mensajes en primer plano
      onMessage(messaging, (payload) => {
        const { title, body } = payload.notification || {};
        if (title && body) {
          new Notification(title, {
            body,
            icon: '/logo.png',
          });
        }
      });
    }
  } catch (error) {
    console.error('Error al inicializar Firebase:', error);
  }
}; 