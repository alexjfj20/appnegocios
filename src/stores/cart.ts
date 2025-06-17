import { defineStore } from 'pinia'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  imageUrl: string
}

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] as CartItem[],
  }),

  getters: {
    total: (state) => state.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    itemCount: (state) => state.items.reduce((count, item) => count + item.quantity, 0),
  },

  actions: {
    addItem(product: CartItem) {
      const existingItem = this.items.find(item => item.id === product.id)
      if (existingItem) {
        existingItem.quantity++
      } else {
        this.items.push({ ...product, quantity: 1 })
      }
    },

    updateQuantity(id: string, quantity: number) {
      const item = this.items.find(item => item.id === id)
      if (item) {
        item.quantity = quantity
      }
    },

    removeItem(id: string) {
      this.items = this.items.filter(item => item.id !== id)
    },

    clearCart() {
      this.items = []
    },
  },
}) 