import { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'

const onboardingSchema = z.object({
  email: z.string().email(),
  businessName: z.string().min(1),
  category: z.string().min(1),
  logoUrl: z.string().optional(),
  color: z.string().min(1),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  product: z.object({
    name: z.string().min(1),
    description: z.string().min(1),
    price: z.number().positive(),
    imageUrl: z.string().optional(),
  }),
})

export const onboardingRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/onboarding', async (request, reply) => {
    const data = onboardingSchema.parse(request.body)
    const { email, businessName, category, logoUrl, color, phone, whatsapp, product } = data

    // Crear tienda en la base de datos
    const store = await fastify.db.query(
      'INSERT INTO stores (email, business_name, category, logo_url, color, phone, whatsapp) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [email, businessName, category, logoUrl, color, phone, whatsapp]
    )

    // Crear primer producto
    await fastify.db.query(
      'INSERT INTO products (name, description, price, image_url, store_id) VALUES ($1, $2, $3, $4, $5)',
      [product.name, product.description, product.price, product.imageUrl, store.rows[0].id]
    )

    return { success: true, store: store.rows[0] }
  })
} 