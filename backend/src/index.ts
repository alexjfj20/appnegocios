import fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import multipart from '@fastify/multipart'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import { config } from 'dotenv'
import { clerkPlugin } from './plugins/clerk'
import { dbPlugin } from './plugins/db'
import { stripePlugin } from './plugins/stripe'
import { cloudinaryPlugin } from './plugins/cloudinary'
import { productRoutes } from './routes/products'
import { storeRoutes } from './routes/stores'
import { orderRoutes } from './routes/orders'
import { onboardingRoutes } from './routes/onboarding'
import { Pool } from 'pg'
import { S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { initializeApp, cert } from 'firebase-admin/app'
import { getMessaging } from 'firebase-admin/messaging'
import prisma from './lib/prisma'

// Cargar variables de entorno
config()

// Configuración de la base de datos
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

// Configuración de AWS
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
})

// Configuración de Firebase
const firebaseApp = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL
  })
})

const messaging = getMessaging(firebaseApp)

const app = fastify({
  logger: true,
})

// Registrar plugins
app.register(cors, {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://pymes-frontend.vercel.app']
    : ['http://localhost:5173'],
  credentials: true,
})

app.register(jwt, {
  secret: process.env.JWT_SECRET!,
  sign: {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  }
})

app.register(multipart, {
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
})

app.register(swagger, {
  openapi: {
    info: {
      title: 'PYMES SaaS API',
      description: 'API para la plataforma de tiendas online PYMES SaaS',
      version: '1.0.0',
    },
  },
})

app.register(swaggerUi, {
  routePrefix: '/docs',
})

// Registrar plugins personalizados
app.register(clerkPlugin)
app.register(dbPlugin)
app.register(stripePlugin)
app.register(cloudinaryPlugin)

// Registrar rutas
app.register(productRoutes, { prefix: '/api' })
app.register(storeRoutes, { prefix: '/api/stores' })
app.register(orderRoutes, { prefix: '/api' })
app.register(onboardingRoutes, { prefix: '/api' })

// Ruta de prueba
app.get('/api/health', async () => {
  return { status: 'ok' }
})

// Manejar errores
app.setErrorHandler((error, request, reply) => {
  app.log.error(error)
  reply.status(error.statusCode || 500).send({
    error: {
      message: error.message,
      code: error.code
    }
  })
})

// Iniciar servidor
const start = async () => {
  try {
    const port = process.env.PORT || 3000
    await app.listen({ port: Number(port), host: '0.0.0.0' })
    console.log(`Servidor corriendo en el puerto ${port}`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start() 