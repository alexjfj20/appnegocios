import { FastifyPluginAsync } from 'fastify'
import { Clerk } from '@clerk/clerk-sdk-node'

declare module 'fastify' {
  interface FastifyInstance {
    clerk: Clerk
  }
}

export const clerkPlugin: FastifyPluginAsync = async (fastify) => {
  const clerk = Clerk({ secretKey: process.env.CLERK_SECRET_KEY })

  fastify.decorate('clerk', clerk)

  // Middleware para verificar la autenticación
  fastify.addHook('preHandler', async (request, reply) => {
    const authHeader = request.headers.authorization

    if (!authHeader) {
      return reply.status(401).send({ error: 'No token provided' })
    }

    try {
      const token = authHeader.replace('Bearer ', '')
      const session = await clerk.sessions.verifySession(token)
      request.user = session.userId
    } catch (error) {
      return reply.status(401).send({ error: 'Invalid token' })
    }
  })
} 