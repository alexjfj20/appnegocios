import * as admin from 'firebase-admin';
import { FastifyInstance } from 'fastify';

interface PushNotification {
  title: string;
  body: string;
  data?: Record<string, string>;
}

export class PushService {
  private fastify: FastifyInstance;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
    this.initializeFirebase();
  }

  private initializeFirebase() {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    }
  }

  async registerToken(storeId: number, userId: number, token: string, deviceType: string) {
    try {
      await this.fastify.db.query(
        `INSERT INTO push_tokens (store_id, user_id, token, device_type)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (store_id, token) DO UPDATE
         SET user_id = $2, device_type = $4, updated_at = CURRENT_TIMESTAMP`,
        [storeId, userId, token, deviceType]
      );
    } catch (error) {
      this.fastify.log.error(error);
      throw new Error('Error al registrar token de notificación');
    }
  }

  async unregisterToken(storeId: number, token: string) {
    try {
      await this.fastify.db.query(
        'DELETE FROM push_tokens WHERE store_id = $1 AND token = $2',
        [storeId, token]
      );
    } catch (error) {
      this.fastify.log.error(error);
      throw new Error('Error al eliminar token de notificación');
    }
  }

  async sendToStore(storeId: number, notification: PushNotification) {
    try {
      // Obtener tokens de la tienda
      const tokens = await this.fastify.db.query(
        'SELECT token FROM push_tokens WHERE store_id = $1',
        [storeId]
      );

      if (tokens.length === 0) return;

      const message: admin.messaging.MulticastMessage = {
        tokens: tokens.map((t: any) => t.token),
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: notification.data,
        android: {
          priority: 'high',
          notification: {
            channelId: 'alerts',
            priority: 'high',
            defaultSound: true,
            defaultVibrateTimings: true,
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
        webpush: {
          headers: {
            Urgency: 'high',
          },
          notification: {
            requireInteraction: true,
          },
        },
      };

      const response = await admin.messaging().sendMulticast(message);

      // Eliminar tokens inválidos
      if (response.failureCount > 0) {
        const invalidTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            invalidTokens.push(tokens[idx].token);
          }
        });

        if (invalidTokens.length > 0) {
          await this.fastify.db.query(
            'DELETE FROM push_tokens WHERE store_id = $1 AND token = ANY($2)',
            [storeId, invalidTokens]
          );
        }
      }
    } catch (error) {
      this.fastify.log.error(error);
      throw new Error('Error al enviar notificación push');
    }
  }

  async sendToUser(storeId: number, userId: number, notification: PushNotification) {
    try {
      // Obtener tokens del usuario
      const tokens = await this.fastify.db.query(
        'SELECT token FROM push_tokens WHERE store_id = $1 AND user_id = $2',
        [storeId, userId]
      );

      if (tokens.length === 0) return;

      const message: admin.messaging.MulticastMessage = {
        tokens: tokens.map((t: any) => t.token),
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: notification.data,
        android: {
          priority: 'high',
          notification: {
            channelId: 'alerts',
            priority: 'high',
            defaultSound: true,
            defaultVibrateTimings: true,
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
        webpush: {
          headers: {
            Urgency: 'high',
          },
          notification: {
            requireInteraction: true,
          },
        },
      };

      const response = await admin.messaging().sendMulticast(message);

      // Eliminar tokens inválidos
      if (response.failureCount > 0) {
        const invalidTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            invalidTokens.push(tokens[idx].token);
          }
        });

        if (invalidTokens.length > 0) {
          await this.fastify.db.query(
            'DELETE FROM push_tokens WHERE store_id = $1 AND token = ANY($2)',
            [storeId, invalidTokens]
          );
        }
      }
    } catch (error) {
      this.fastify.log.error(error);
      throw new Error('Error al enviar notificación push');
    }
  }
} 