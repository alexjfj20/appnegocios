import { config } from 'dotenv'

// Cargar variables de entorno de prueba
config({ path: '.env.test' })

// Configuración global de pruebas
beforeAll(() => {
  // Configuración inicial
})

afterAll(() => {
  // Limpieza final
})

// Helpers de prueba
export const createTestUser = () => {
  return {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
  }
}

export const createTestStore = () => {
  return {
    id: 'test-store-id',
    name: 'Test Store',
    userId: 'test-user-id',
    slug: 'test-store',
  }
}

export const createTestProduct = () => {
  return {
    id: 'test-product-id',
    name: 'Test Product',
    description: 'Test Description',
    price: 1000,
    storeId: 'test-store-id',
  }
} 