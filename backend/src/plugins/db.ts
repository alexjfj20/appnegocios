import { FastifyPluginAsync } from 'fastify'
import { Pool } from 'pg'

declare module 'fastify' {
  interface FastifyInstance {
    db: Pool
  }
}

export const dbPlugin: FastifyPluginAsync = async (fastify) => {
  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
  })

  fastify.decorate('db', pool)

  // Cerrar la conexión cuando se detenga el servidor
  fastify.addHook('onClose', async () => {
    await pool.end()
  })

  // Verificar la conexión
  try {
    await pool.query('SELECT NOW()')
    fastify.log.info('Database connection successful')
  } catch (error) {
    fastify.log.error('Database connection failed:', error)
    process.exit(1)
  }
} 