import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { PushService } from '../services/push';

const notificationRoutes: FastifyPluginAsync = async (fastify) => {
  const pushService = new PushService(fastify);

  // Esquema de validación para tokens
  const tokenSchema = z.object({
    token: z.string(),
    deviceType: z.enum(['web', 'android', 'ios']),
  });

  // Registrar token
  fastify.post('/tokens', async (request, reply) => {
    const { token, deviceType } = tokenSchema.parse(request.body);

    try {
      await pushService.registerToken(
        request.user.store_id,
        request.user.id,
        token,
        deviceType
      );

      return { success: true };
    } catch (error) {
      fastify.log.error(error);
      throw new Error('Error al registrar token');
    }
  });

  // Eliminar token
  fastify.delete('/tokens/:token', async (request, reply) => {
    const { token } = request.params as { token: string };

    try {
      await pushService.unregisterToken(request.user.store_id, token);
      return { success: true };
    } catch (error) {
      fastify.log.error(error);
      throw new Error('Error al eliminar token');
    }
  });

  // Obtener tokens del usuario
  fastify.get('/tokens', async (request, reply) => {
    try {
      const tokens = await fastify.db.query(
        'SELECT token, device_type, created_at FROM push_tokens WHERE store_id = $1 AND user_id = $2',
        [request.user.store_id, request.user.id]
      );

      return { tokens };
    } catch (error) {
      fastify.log.error(error);
      throw new Error('Error al obtener tokens');
    }
  });
};

export default notificationRoutes; 