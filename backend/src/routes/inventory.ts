import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { PushService } from '../services/PushService';
import { EmailService } from '../services/EmailService';
import { WhatsAppService } from '../services/WhatsAppService';

const inventoryRoutes: FastifyPluginAsync = async (fastify) => {
  // Obtener categorías
  fastify.get('/categories', async (request, reply) => {
    const storeId = request.user.storeId;

    const categories = await fastify.db
      .selectFrom('product_categories')
      .selectAll()
      .where('store_id', '=', storeId)
      .execute();

    return categories;
  });

  // Crear categoría
  const createCategorySchema = z.object({
    name: z.string().min(2),
    description: z.string().optional(),
  });

  fastify.post('/categories', async (request, reply) => {
    const storeId = request.user.storeId;
    const data = createCategorySchema.parse(request.body);

    const category = await fastify.db
      .insertInto('product_categories')
      .values({
        store_id: storeId,
        ...data,
      })
      .returningAll()
      .executeTakeFirst();

    return category;
  });

  // Obtener productos
  fastify.get('/products', async (request, reply) => {
    const storeId = request.user.storeId;
    const { category_id, search, page = 1, limit = 10 } = request.query as {
      category_id?: number;
      search?: string;
      page?: number;
      limit?: number;
    };

    let query = fastify.db
      .selectFrom('products')
      .selectAll()
      .where('store_id', '=', storeId);

    if (category_id) {
      query = query.where('category_id', '=', category_id);
    }

    if (search) {
      query = query.where((eb) =>
        eb.or([
          eb('name', 'ilike', `%${search}%`),
          eb('sku', 'ilike', `%${search}%`),
        ])
      );
    }

    const total = await query.execute();
    const products = await query
      .limit(limit)
      .offset((page - 1) * limit)
      .execute();

    return {
      products,
      total: total.length,
      page,
      limit,
      pages: Math.ceil(total.length / limit),
    };
  });

  // Crear producto
  const createProductSchema = z.object({
    category_id: z.number().optional(),
    name: z.string().min(2),
    description: z.string().optional(),
    sku: z.string().optional(),
    price: z.number().positive(),
    stock: z.number().min(0),
    min_stock: z.number().min(0),
  });

  fastify.post('/products', async (request, reply) => {
    const storeId = request.user.storeId;
    const data = createProductSchema.parse(request.body);

    const product = await fastify.db
      .insertInto('products')
      .values({
        store_id: storeId,
        ...data,
      })
      .returningAll()
      .executeTakeFirst();

    return product;
  });

  // Actualizar producto
  const updateProductSchema = createProductSchema.partial();

  fastify.put('/products/:id', async (request, reply) => {
    const storeId = request.user.storeId;
    const { id } = request.params as { id: number };
    const data = updateProductSchema.parse(request.body);

    const product = await fastify.db
      .updateTable('products')
      .set(data)
      .where('id', '=', id)
      .where('store_id', '=', storeId)
      .returningAll()
      .executeTakeFirst();

    if (!product) {
      return reply.status(404).send({ error: 'Producto no encontrado' });
    }

    return product;
  });

  // Registrar movimiento de inventario
  const createMovementSchema = z.object({
    product_id: z.number(),
    type: z.enum(['entry', 'exit', 'adjustment']),
    quantity: z.number().int(),
    notes: z.string().optional(),
  });

  fastify.post('/movements', async (request, reply) => {
    const storeId = request.user.storeId;
    const userId = request.user.id;
    const data = createMovementSchema.parse(request.body);

    // Obtener stock actual
    const product = await fastify.db
      .selectFrom('products')
      .select(['id', 'stock'])
      .where('id', '=', data.product_id)
      .where('store_id', '=', storeId)
      .executeTakeFirst();

    if (!product) {
      return reply.status(404).send({ error: 'Producto no encontrado' });
    }

    // Crear movimiento
    const movement = await fastify.db
      .insertInto('inventory_movements')
      .values({
        store_id: storeId,
        user_id: userId,
        product_id: data.product_id,
        type: data.type,
        quantity: data.quantity,
        previous_stock: product.stock,
        notes: data.notes,
      })
      .returningAll()
      .executeTakeFirst();

    return movement;
  });

  // Obtener movimientos de inventario
  fastify.get('/movements', async (request, reply) => {
    const storeId = request.user.storeId;
    const { product_id, page = 1, limit = 10 } = request.query as {
      product_id?: number;
      page?: number;
      limit?: number;
    };

    let query = fastify.db
      .selectFrom('inventory_movements')
      .selectAll()
      .where('store_id', '=', storeId);

    if (product_id) {
      query = query.where('product_id', '=', product_id);
    }

    const total = await query.execute();
    const movements = await query
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset((page - 1) * limit)
      .execute();

    return {
      movements,
      total: total.length,
      page,
      limit,
      pages: Math.ceil(total.length / limit),
    };
  });

  // Esquema de validación para alertas
  const alertSchema = z.object({
    type: z.enum(['low_stock', 'expiring', 'system']),
    title: z.string(),
    message: z.string(),
    product_id: z.number().optional(),
    is_read: z.boolean().default(false),
  });

  // Endpoint para obtener alertas
  fastify.get('/alerts', async (request, reply) => {
    const { page = 1, limit = 10, show_read = false } = request.query as any;
    const offset = (page - 1) * limit;

    try {
      // Obtener alertas
      const alerts = await fastify.db.query(
        `SELECT a.*, p.name as product_name 
         FROM inventory_alerts a
         LEFT JOIN products p ON a.product_id = p.id
         WHERE a.store_id = $1
         ${!show_read ? 'AND a.is_read = false' : ''}
         ORDER BY a.created_at DESC
         LIMIT $2 OFFSET $3`,
        [request.user.store_id, limit, offset]
      );

      // Obtener total de alertas
      const total = await fastify.db.query(
        `SELECT COUNT(*) 
         FROM inventory_alerts
         WHERE store_id = $1
         ${!show_read ? 'AND is_read = false' : ''}`,
        [request.user.store_id]
      );

      return {
        alerts,
        total: parseInt(total[0].count),
        pages: Math.ceil(parseInt(total[0].count) / limit),
      };
    } catch (error) {
      fastify.log.error(error);
      throw new Error('Error al obtener alertas');
    }
  });

  // Endpoint para marcar una alerta como leída
  fastify.put('/alerts/:id/read', async (request, reply) => {
    const { id } = request.params as any;

    try {
      await fastify.db.query(
        `UPDATE inventory_alerts 
         SET is_read = true
         WHERE id = $1 AND store_id = $2`,
        [id, request.user.store_id]
      );

      return { success: true };
    } catch (error) {
      fastify.log.error(error);
      throw new Error('Error al marcar alerta como leída');
    }
  });

  // Endpoint para marcar todas las alertas como leídas
  fastify.put('/alerts/read-all', async (request, reply) => {
    try {
      await fastify.db.query(
        `UPDATE inventory_alerts 
         SET is_read = true
         WHERE store_id = $1 AND is_read = false`,
        [request.user.store_id]
      );

      return { success: true };
    } catch (error) {
      fastify.log.error(error);
      throw new Error('Error al marcar alertas como leídas');
    }
  });

  // Función para crear una alerta
  const createAlert = async (
    storeId: number,
    type: string,
    title: string,
    message: string,
    productId?: number
  ) => {
    try {
      // Crear la alerta en la base de datos
      const result = await fastify.db.query(
        `INSERT INTO inventory_alerts 
         (store_id, type, title, message, product_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [storeId, type, title, message, productId]
      );

      const alert = result[0];

      // Enviar notificación en tiempo real
      fastify.ws.sendToStore(storeId.toString(), {
        type: 'alert',
        data: alert,
      });

      // Enviar notificación push
      const pushService = new PushService(fastify);
      await pushService.sendToStore(storeId, {
        title: alert.title,
        body: alert.message,
        data: {
          type: 'alert',
          alertId: alert.id.toString(),
          alertType: alert.type,
        },
      });

      // Enviar notificación por correo electrónico
      const emailService = new EmailService(fastify);
      await emailService.sendAlertEmail(storeId, alert);

      // Enviar notificación por WhatsApp
      const whatsappService = new WhatsAppService(fastify);
      await whatsappService.sendAlert(storeId, alert);

      return alert;
    } catch (error) {
      fastify.log.error(error);
      throw error;
    }
  };
};

export default inventoryRoutes; 