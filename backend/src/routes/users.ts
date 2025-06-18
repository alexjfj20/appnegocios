import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const userRoutes: FastifyPluginAsync = async (fastify) => {
  // Esquema de validación para perfil de usuario
  const userProfileSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
  });

  // Esquema de validación para cambio de contraseña
  const passwordSchema = z.object({
    currentPassword: z.string().min(6),
    newPassword: z.string().min(6),
  });

  // Esquema de validación para preferencias de usuario
  const userPreferencesSchema = z.object({
    darkMode: z.boolean(),
    emailNotifications: z.boolean(),
    pushNotifications: z.boolean(),
    language: z.enum(['es', 'en']),
  });

  // Obtener perfil de usuario
  fastify.get('/profile', async (request, reply) => {
    try {
      const user = await fastify.db.query(
        `SELECT name, email, phone, avatar
         FROM users
         WHERE id = $1`,
        [request.user.id]
      );

      if (user.length === 0) {
        return reply.status(404).send({ error: 'Usuario no encontrado' });
      }

      return user[0];
    } catch (error) {
      fastify.log.error(error);
      throw new Error('Error al obtener perfil de usuario');
    }
  });

  // Actualizar perfil de usuario
  fastify.put('/profile', async (request, reply) => {
    const profile = userProfileSchema.parse(request.body);

    try {
      await fastify.db.query(
        `UPDATE users
         SET name = $1, email = $2, phone = $3
         WHERE id = $4`,
        [profile.name, profile.email, profile.phone, request.user.id]
      );

      return { success: true };
    } catch (error) {
      fastify.log.error(error);
      throw new Error('Error al actualizar perfil de usuario');
    }
  });

  // Actualizar contraseña
  fastify.put('/password', async (request, reply) => {
    const { currentPassword, newPassword } = passwordSchema.parse(request.body);

    try {
      const user = await fastify.db.query(
        `SELECT password
         FROM users
         WHERE id = $1`,
        [request.user.id]
      );

      if (user.length === 0) {
        return reply.status(404).send({ error: 'Usuario no encontrado' });
      }

      const isValid = await fastify.bcrypt.compare(currentPassword, user[0].password);
      if (!isValid) {
        return reply.status(400).send({ error: 'Contraseña actual incorrecta' });
      }

      const hashedPassword = await fastify.bcrypt.hash(newPassword);
      await fastify.db.query(
        `UPDATE users
         SET password = $1
         WHERE id = $2`,
        [hashedPassword, request.user.id]
      );

      return { success: true };
    } catch (error) {
      fastify.log.error(error);
      throw new Error('Error al actualizar contraseña');
    }
  });

  // Subir avatar
  fastify.post('/upload-avatar', async (request, reply) => {
    const data = await request.file();
    if (!data) {
      return reply.status(400).send({ error: 'No se proporcionó ningún archivo' });
    }

    try {
      const buffer = await data.toBuffer();
      const url = await uploadToS3(buffer, `users/${request.user.id}/avatar`, data.mimetype);

      await fastify.db.query(
        `UPDATE users
         SET avatar = $1
         WHERE id = $2`,
        [url, request.user.id]
      );

      return { url };
    } catch (error) {
      fastify.log.error(error);
      throw new Error('Error al subir el avatar');
    }
  });

  // Obtener preferencias de usuario
  fastify.get('/preferences', async (request, reply) => {
    try {
      const preferences = await fastify.db.query(
        `SELECT dark_mode, email_notifications, push_notifications, language
         FROM users
         WHERE id = $1`,
        [request.user.id]
      );

      if (preferences.length === 0) {
        return reply.status(404).send({ error: 'Usuario no encontrado' });
      }

      return {
        darkMode: preferences[0].dark_mode,
        emailNotifications: preferences[0].email_notifications,
        pushNotifications: preferences[0].push_notifications,
        language: preferences[0].language,
      };
    } catch (error) {
      fastify.log.error(error);
      throw new Error('Error al obtener preferencias de usuario');
    }
  });

  // Actualizar preferencias de usuario
  fastify.put('/preferences', async (request, reply) => {
    const preferences = userPreferencesSchema.parse(request.body);

    try {
      await fastify.db.query(
        `UPDATE users
         SET 
          dark_mode = $1,
          email_notifications = $2,
          push_notifications = $3,
          language = $4
         WHERE id = $5`,
        [
          preferences.darkMode,
          preferences.emailNotifications,
          preferences.pushNotifications,
          preferences.language,
          request.user.id,
        ]
      );

      return { success: true };
    } catch (error) {
      fastify.log.error(error);
      throw new Error('Error al actualizar preferencias de usuario');
    }
  });

  // Esquema de validación para configuración de notificaciones
  const notificationSettingsSchema = z.object({
    email: z.object({
      inventory_alerts: z.boolean(),
      new_orders: z.boolean(),
      daily_summary: z.boolean(),
    }),
    push: z.object({
      inventory_alerts: z.boolean(),
      new_orders: z.boolean(),
    }),
    whatsapp: z.object({
      enabled: z.boolean(),
      inventory_alerts: z.boolean(),
      new_orders: z.boolean(),
      phone: z.string().optional(),
    }),
  });

  // Obtener configuración de notificaciones
  fastify.get('/notification-settings', async (request, reply) => {
    try {
      const settings = await fastify.db.query(
        `SELECT 
          email_notifications,
          email_inventory_alerts,
          email_new_orders,
          email_daily_summary,
          push_notifications,
          push_inventory_alerts,
          push_new_orders,
          whatsapp_notifications,
          whatsapp_inventory_alerts,
          whatsapp_new_orders,
          phone
         FROM users
         WHERE id = $1`,
        [request.user.id]
      );

      if (settings.length === 0) {
        return reply.status(404).send({ error: 'Usuario no encontrado' });
      }

      const userSettings = settings[0];

      return {
        email: {
          inventory_alerts: userSettings.email_inventory_alerts,
          new_orders: userSettings.email_new_orders,
          daily_summary: userSettings.email_daily_summary,
        },
        push: {
          inventory_alerts: userSettings.push_inventory_alerts,
          new_orders: userSettings.push_new_orders,
        },
        whatsapp: {
          enabled: userSettings.whatsapp_notifications,
          inventory_alerts: userSettings.whatsapp_inventory_alerts,
          new_orders: userSettings.whatsapp_new_orders,
          phone: userSettings.phone,
        },
      };
    } catch (error) {
      fastify.log.error(error);
      throw new Error('Error al obtener configuración de notificaciones');
    }
  });

  // Actualizar configuración de notificaciones
  fastify.put('/notification-settings', async (request, reply) => {
    const settings = notificationSettingsSchema.parse(request.body);

    try {
      await fastify.db.query(
        `UPDATE users
         SET 
          email_notifications = $1,
          email_inventory_alerts = $2,
          email_new_orders = $3,
          email_daily_summary = $4,
          push_notifications = $5,
          push_inventory_alerts = $6,
          push_new_orders = $7,
          whatsapp_notifications = $8,
          whatsapp_inventory_alerts = $9,
          whatsapp_new_orders = $10,
          phone = $11
         WHERE id = $12`,
        [
          settings.email.inventory_alerts || settings.email.new_orders || settings.email.daily_summary,
          settings.email.inventory_alerts,
          settings.email.new_orders,
          settings.email.daily_summary,
          settings.push.inventory_alerts || settings.push.new_orders,
          settings.push.inventory_alerts,
          settings.push.new_orders,
          settings.whatsapp.enabled,
          settings.whatsapp.inventory_alerts,
          settings.whatsapp.new_orders,
          settings.whatsapp.phone,
          request.user.id,
        ]
      );

      return { success: true };
    } catch (error) {
      fastify.log.error(error);
      throw new Error('Error al actualizar configuración de notificaciones');
    }
  });

  // Verificar número de WhatsApp
  fastify.post('/verify-whatsapp', async (request, reply) => {
    const { phone } = z.object({ phone: z.string() }).parse(request.body);

    try {
      const whatsappService = new WhatsAppService(fastify);
      await whatsappService.sendVerificationCode(phone);

      return { success: true };
    } catch (error) {
      fastify.log.error(error);
      throw new Error('Error al enviar código de verificación');
    }
  });
};

export default userRoutes; 