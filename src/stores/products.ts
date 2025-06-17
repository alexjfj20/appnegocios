import { defineStore } from 'pinia'
import axios from 'axios'
import type { Product, ProductData } from '@/types/product'

export const useProductStore = defineStore('products', {
  state: () => ({
    products: [] as Product[],
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchProducts() {
      this.loading = true
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/stores/${import.meta.env.VITE_STORE_ID}/products`)
        this.products = response.data
        return this.products
      } catch (error) {
        this.error = 'Error al cargar productos'
        throw error
      } finally {
        this.loading = false
      }
    },

    async createProduct(productData: ProductData) {
      this.loading = true
      try {
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/products`, productData)
        this.products.push(response.data)
        return response.data
      } catch (error) {
        this.error = 'Error al crear producto'
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateProduct(id: string, productData: Partial<ProductData>) {
      this.loading = true
      try {
        const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/products/${id}`, productData)
        const index = this.products.findIndex(p => p.id === id)
        if (index !== -1) {
          this.products[index] = response.data
        }
        return response.data
      } catch (error) {
        this.error = 'Error al actualizar producto'
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteProduct(id: string) {
      this.loading = true
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/products/${id}`)
        this.products = this.products.filter(p => p.id !== id)
      } catch (error) {
        this.error = 'Error al eliminar producto'
        throw error
      } finally {
        this.loading = false
      }
    }
  },
}) 