import { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'

const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().positive(),
  imageUrl: z.string().optional(),
  category: z.string().min(1),
  status: z.enum(['active', 'inactive', 'draft']),
  storeId: z.string().uuid(),
})

export const productRoutes: FastifyPluginAsync = async (fastify) => {
  // Listar productos de una tienda
  fastify.get('/stores/:storeId/products', async (request, reply) => {
    const { storeId } = request.params as { storeId: string }
    const products = await fastify.db.query('SELECT * FROM products WHERE store_id = $1', [storeId])
    return products.rows
  })

  // Crear un nuevo producto
  fastify.post('/products', async (request, reply) => {
    const data = productSchema.parse(request.body)
    const { name, description, price, imageUrl, category, status, storeId } = data

    const product = await fastify.db.query(
      'INSERT INTO products (name, description, price, image_url, category, status, store_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [name, description, price, imageUrl, category, status, storeId]
    )

    return product.rows[0]
  })

  // Actualizar un producto
  fastify.put('/products/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const data = productSchema.parse(request.body)
    const { name, description, price, imageUrl, category, status, storeId } = data

    const product = await fastify.db.query(
      'UPDATE products SET name = $1, description = $2, price = $3, image_url = $4, category = $5, status = $6, store_id = $7 WHERE id = $8 RETURNING *',
      [name, description, price, imageUrl, category, status, storeId, id]
    )

    if (product.rows.length === 0) {
      reply.code(404).send({ error: 'Producto no encontrado' })
      return
    }

    return product.rows[0]
  })

  // Eliminar un producto
  fastify.delete('/products/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const product = await fastify.db.query('DELETE FROM products WHERE id = $1 RETURNING *', [id])

    if (product.rows.length === 0) {
      reply.code(404).send({ error: 'Producto no encontrado' })
      return
    }

    return { success: true }
  })
} 