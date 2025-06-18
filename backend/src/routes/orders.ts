import { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'

const orderSchema = z.object({
  items: z.array(z.object({
    id: z.string().uuid(),
    name: z.string(),
    price: z.number().positive(),
    quantity: z.number().positive(),
    imageUrl: z.string().optional(),
  })),
  total: z.number().positive(),
  name: z.string().min(1),
  email: z.string().email(),
  address: z.string().min(1),
  phone: z.string().min(1),
  notes: z.string().optional(),
  paymentMethod: z.enum(['card', 'transfer']),
})

export const orderRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/orders', async (request, reply) => {
    const data = orderSchema.parse(request.body)
    const { items, total, name, email, address, phone, notes, paymentMethod } = data

    // Crear pedido en la base de datos
    const order = await fastify.db.query(
      'INSERT INTO orders (total, customer_name, customer_email, customer_address, customer_phone, notes, payment_method) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [total, name, email, address, phone, notes, paymentMethod]
    )

    // Crear items del pedido
    for (const item of items) {
      await fastify.db.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
        [order.rows[0].id, item.id, item.quantity, item.price]
      )
    }

    return { success: true, order: order.rows[0] }
  })

  // Listar pedidos del usuario
  fastify.get('/orders', async (request, reply) => {
    const { email } = request.query as { email: string }

    const orders = await fastify.db.query(
      'SELECT * FROM orders WHERE customer_email = $1 ORDER BY created_at DESC',
      [email]
    )

    // Obtener items de cada pedido
    for (const order of orders.rows) {
      const items = await fastify.db.query(
        'SELECT oi.*, p.name, p.image_url FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = $1',
        [order.id]
      )
      order.items = items.rows
    }

    return orders.rows
  })
} 