import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import { Type } from '@fastify/type-provider-typebox';
import { z } from 'zod';
import { uploadToS3 } from '../services/s3';

interface AuthenticatedRequest extends FastifyRequest {
  user: {
    store_id: number;
  };
}

const storeSettingsSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  primaryColor: z.string().optional(),
  logo: z.string().optional(),
  banner: z.string().optional(),
  whatsappNumber: z.string().optional(),
  whatsappWelcomeMessage: z.string().optional(),
  whatsappEnabled: z.boolean().optional(),
});

const storeRoutes: FastifyPluginAsync = async (fastify) => {
  // ... existing code ...

  // Obtener tienda pública por slug
  fastify.get('/public/:slug', async (request, reply) => {
    const { slug } = request.params as { slug: string };

    const store = await fastify.db
      .selectFrom('stores')
      .selectAll()
      .where('slug', '=', slug)
      .executeTakeFirst();

    if (!store) {
      return reply.status(404).send({ error: 'Tienda no encontrada' });
    }

    // Obtener productos de la tienda
    const products = await fastify.db
      .selectFrom('products')
      .selectAll()
      .where('store_id', '=', store.id)
      .where('is_active', '=', true)
      .execute();

    return {
      ...store,
      products,
    };
  });

  // Obtener configuración actual de la tienda
  fastify.get('/current', async (request, reply) => {
    const userId = request.user.id;

    const store = await fastify.db
      .selectFrom('stores')
      .selectAll()
      .where('user_id', '=', userId)
      .executeTakeFirst();

    if (!store) {
      return reply.status(404).send({ error: 'Tienda no encontrada' });
    }

    return store;
  });

  // Actualizar configuración de la tienda
  const updateStoreSchema = z.object({
    name: z.string().min(2),
    description: z.string().optional(),
    slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  });

  fastify.put('/current', async (request, reply) => {
    const userId = request.user.id;
    const data = updateStoreSchema.parse(request.body);

    await fastify.db
      .updateTable('stores')
      .set(data)
      .where('user_id', '=', userId)
      .execute();

    return { message: 'Tienda actualizada correctamente' };
  });

  // Obtener tema de la tienda
  fastify.get('/theme', async (request, reply) => {
    const userId = request.user.id;

    const theme = await fastify.db
      .selectFrom('store_themes')
      .selectAll()
      .where('user_id', '=', userId)
      .executeTakeFirst();

    return theme || {
      primaryColor: '#4F46E5',
      font: 'inter',
      buttonStyle: 'rounded',
    };
  });

  // Actualizar tema de la tienda
  const updateThemeSchema = z.object({
    primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    font: z.enum(['inter', 'roboto', 'open-sans']),
    buttonStyle: z.enum(['rounded', 'square', 'pill']),
  });

  fastify.put('/theme', async (request, reply) => {
    const userId = request.user.id;
    const data = updateThemeSchema.parse(request.body);

    await fastify.db
      .insertInto('store_themes')
      .values({
        user_id: userId,
        ...data,
      })
      .onConflict((oc) => oc.columns(['user_id']).doUpdateSet(data))
      .execute();

    return { message: 'Tema actualizado correctamente' };
  });

  // Obtener configuración de WhatsApp
  fastify.get('/whatsapp', async (request, reply) => {
    const userId = request.user.id;

    const whatsapp = await fastify.db
      .selectFrom('store_whatsapp')
      .selectAll()
      .where('user_id', '=', userId)
      .executeTakeFirst();

    return whatsapp || {
      number: '',
      defaultMessage: '',
      enabled: true,
    };
  });

  // Actualizar configuración de WhatsApp
  const updateWhatsAppSchema = z.object({
    number: z.string().regex(/^\+[0-9]{10,15}$/),
    defaultMessage: z.string().optional(),
    enabled: z.boolean(),
  });

  fastify.put('/whatsapp', async (request, reply) => {
    const userId = request.user.id;
    const data = updateWhatsAppSchema.parse(request.body);

    await fastify.db
      .insertInto('store_whatsapp')
      .values({
        user_id: userId,
        ...data,
      })
      .onConflict((oc) => oc.columns(['user_id']).doUpdateSet(data))
      .execute();

    return { message: 'Configuración de WhatsApp actualizada correctamente' };
  });

  // Obtener configuración de la tienda
  fastify.get('/settings', async (request, reply) => {
    try {
      const store = await fastify.db.query(
        `SELECT 
          name,
          description,
          address,
          phone,
          primary_color,
          logo,
          banner,
          whatsapp_number,
          whatsapp_welcome_message,
          whatsapp_enabled
         FROM stores
         WHERE user_id = $1`,
        [request.user.id]
      );

      if (store.length === 0) {
        return reply.status(404).send({ error: 'Tienda no encontrada' });
      }

      return {
        name: store[0].name,
        description: store[0].description,
        address: store[0].address,
        phone: store[0].phone,
        primaryColor: store[0].primary_color,
        logo: store[0].logo,
        banner: store[0].banner,
        whatsappNumber: store[0].whatsapp_number,
        whatsappWelcomeMessage: store[0].whatsapp_welcome_message,
        whatsappEnabled: store[0].whatsapp_enabled,
      };
    } catch (error) {
      fastify.log.error(error);
      throw new Error('Error al obtener configuración de la tienda');
    }
  });

  // Actualizar configuración de la tienda
  fastify.put('/settings', async (request, reply) => {
    const settings = storeSettingsSchema.parse(request.body);

    try {
      await fastify.db.query(
        `UPDATE stores
         SET 
          name = COALESCE($1, name),
          description = COALESCE($2, description),
          address = COALESCE($3, address),
          phone = COALESCE($4, phone),
          primary_color = COALESCE($5, primary_color),
          logo = COALESCE($6, logo),
          banner = COALESCE($7, banner),
          whatsapp_number = COALESCE($8, whatsapp_number),
          whatsapp_welcome_message = COALESCE($9, whatsapp_welcome_message),
          whatsapp_enabled = COALESCE($10, whatsapp_enabled)
         WHERE user_id = $11`,
        [
          settings.name,
          settings.description,
          settings.address,
          settings.phone,
          settings.primaryColor,
          settings.logo,
          settings.banner,
          settings.whatsappNumber,
          settings.whatsappWelcomeMessage,
          settings.whatsappEnabled,
          request.user.id,
        ]
      );

      return { success: true };
    } catch (error) {
      fastify.log.error(error);
      throw new Error('Error al actualizar configuración de la tienda');
    }
  });

  // Esquema de validación para configuración general
  const generalConfigSchema = z.object({
    name: z.string().min(1, 'El nombre es requerido'),
    description: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    contactEmail: z.string().email('Email inválido').optional(),
  });

  // Esquema de validación para personalización
  const customizationSchema = z.object({
    primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color inválido'),
    logo: z.string().url('URL inválida').optional(),
    banner: z.string().url('URL inválida').optional(),
    favicon: z.string().url('URL inválida').optional(),
  });

  // Esquema de validación para integraciones
  const integrationsSchema = z.object({
    whatsappApiKey: z.string().optional(),
    googleAnalyticsId: z.string().optional(),
    facebookPixelId: z.string().optional(),
  });

  // Esquema de validación para pagos
  const paymentsSchema = z.object({
    paymentMethods: z.array(z.enum(['cash', 'card', 'transfer'])),
    stripeApiKey: z.string().optional(),
    stripePublicKey: z.string().optional(),
    bankAccount: z.string().optional(),
  });

  // Obtener configuración de la tienda
  fastify.get('/config', async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const store = await fastify.db.query(
        `SELECT 
          name, description, address, phone, contact_email,
          primary_color, logo, banner, favicon,
          whatsapp_api_key, google_analytics_id, facebook_pixel_id,
          payment_methods, stripe_api_key, stripe_public_key, bank_account
         FROM stores
         WHERE id = $1`,
        [request.user.store_id]
      );

      if (store.length === 0) {
        return reply.status(404).send({ error: 'Tienda no encontrada' });
      }

      return {
        name: store[0].name,
        description: store[0].description,
        address: store[0].address,
        phone: store[0].phone,
        contactEmail: store[0].contact_email,
        primaryColor: store[0].primary_color,
        logo: store[0].logo,
        banner: store[0].banner,
        favicon: store[0].favicon,
        whatsappApiKey: store[0].whatsapp_api_key,
        googleAnalyticsId: store[0].google_analytics_id,
        facebookPixelId: store[0].facebook_pixel_id,
        paymentMethods: store[0].payment_methods || [],
        stripeApiKey: store[0].stripe_api_key,
        stripePublicKey: store[0].stripe_public_key,
        bankAccount: store[0].bank_account,
      };
    } catch (error) {
      fastify.log.error(error);
      throw new Error('Error al obtener configuración de la tienda');
    }
  });

  // Actualizar configuración de la tienda
  fastify.put('/config', async (request: AuthenticatedRequest, reply: FastifyReply) => {
    const config = request.body;

    try {
      // Validar según el tipo de configuración
      if (config.name || config.description || config.address || config.phone || config.contactEmail) {
        generalConfigSchema.parse(config);
      }
      if (config.primaryColor || config.logo || config.banner || config.favicon) {
        customizationSchema.parse(config);
      }
      if (config.whatsappApiKey || config.googleAnalyticsId || config.facebookPixelId) {
        integrationsSchema.parse(config);
      }
      if (config.paymentMethods || config.stripeApiKey || config.stripePublicKey || config.bankAccount) {
        paymentsSchema.parse(config);
      }

      // Actualizar en la base de datos
      await fastify.db.query(
        `UPDATE stores
         SET 
          name = COALESCE($1, name),
          description = COALESCE($2, description),
          address = COALESCE($3, address),
          phone = COALESCE($4, phone),
          contact_email = COALESCE($5, contact_email),
          primary_color = COALESCE($6, primary_color),
          logo = COALESCE($7, logo),
          banner = COALESCE($8, banner),
          favicon = COALESCE($9, favicon),
          whatsapp_api_key = COALESCE($10, whatsapp_api_key),
          google_analytics_id = COALESCE($11, google_analytics_id),
          facebook_pixel_id = COALESCE($12, facebook_pixel_id),
          payment_methods = COALESCE($13, payment_methods),
          stripe_api_key = COALESCE($14, stripe_api_key),
          stripe_public_key = COALESCE($15, stripe_public_key),
          bank_account = COALESCE($16, bank_account)
         WHERE id = $17`,
        [
          config.name,
          config.description,
          config.address,
          config.phone,
          config.contactEmail,
          config.primaryColor,
          config.logo,
          config.banner,
          config.favicon,
          config.whatsappApiKey,
          config.googleAnalyticsId,
          config.facebookPixelId,
          config.paymentMethods,
          config.stripeApiKey,
          config.stripePublicKey,
          config.bankAccount,
          request.user.store_id,
        ]
      );

      return { success: true };
    } catch (error) {
      fastify.log.error(error);
      throw new Error('Error al actualizar configuración de la tienda');
    }
  });

  // Subir logo
  fastify.post('/upload-logo', async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const data = await request.file();
      if (!data) {
        return reply.status(400).send({ error: 'No se proporcionó ningún archivo' });
      }

      const buffer = await data.toBuffer();
      const url = await uploadToS3(buffer, `stores/${request.user.store_id}/logo`, data.mimetype);

      await fastify.db.query(
        'UPDATE stores SET logo = $1 WHERE id = $2',
        [url, request.user.store_id]
      );

      return { url };
    } catch (error) {
      fastify.log.error(error);
      throw new Error('Error al subir el logo');
    }
  });

  // Subir banner
  fastify.post('/upload-banner', async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const data = await request.file();
      if (!data) {
        return reply.status(400).send({ error: 'No se proporcionó ningún archivo' });
      }

      const buffer = await data.toBuffer();
      const url = await uploadToS3(buffer, `stores/${request.user.store_id}/banner`, data.mimetype);

      await fastify.db.query(
        'UPDATE stores SET banner = $1 WHERE id = $2',
        [url, request.user.store_id]
      );

      return { url };
    } catch (error) {
      fastify.log.error(error);
      throw new Error('Error al subir el banner');
    }
  });

  // Subir favicon
  fastify.post('/upload-favicon', async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const data = await request.file();
      if (!data) {
        return reply.status(400).send({ error: 'No se proporcionó ningún archivo' });
      }

      const buffer = await data.toBuffer();
      const url = await uploadToS3(buffer, `stores/${request.user.store_id}/favicon`, data.mimetype);

      await fastify.db.query(
        'UPDATE stores SET favicon = $1 WHERE id = $2',
        [url, request.user.store_id]
      );

      return { url };
    } catch (error) {
      fastify.log.error(error);
      throw new Error('Error al subir el favicon');
    }
  });
};

export default storeRoutes; 