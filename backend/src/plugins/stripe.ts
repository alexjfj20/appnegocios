import { FastifyPluginAsync } from 'fastify'
import Stripe from 'stripe'

declare module 'fastify' {
  interface FastifyInstance {
    stripe: Stripe
  }
}

export const stripePlugin: FastifyPluginAsync = async (fastify) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-10-16',
  })

  fastify.decorate('stripe', stripe)

  // Middleware para verificar webhooks de Stripe
  fastify.addHook('preHandler', async (request, reply) => {
    if (request.url === '/api/webhooks/stripe') {
      const sig = request.headers['stripe-signature']

      if (!sig) {
        return reply.status(400).send({ error: 'No signature provided' })
      }

      try {
        const event = stripe.webhooks.constructEvent(
          request.body as string,
          sig,
          process.env.STRIPE_WEBHOOK_SECRET || ''
        )
        request.stripeEvent = event
      } catch (error) {
        return reply.status(400).send({ error: 'Invalid signature' })
      }
    }
  })
} 