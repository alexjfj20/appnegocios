import { FastifyPluginAsync } from 'fastify'
import { v2 as cloudinary } from 'cloudinary'

declare module 'fastify' {
  interface FastifyInstance {
    cloudinary: typeof cloudinary
  }
}

export const cloudinaryPlugin: FastifyPluginAsync = async (fastify) => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })

  fastify.decorate('cloudinary', cloudinary)

  // Función helper para subir imágenes
  fastify.decorate('uploadImage', async (file: Buffer, folder: string) => {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) {
            reject(error)
          } else {
            resolve(result)
          }
        }
      ).end(file)
    })
  })
} 