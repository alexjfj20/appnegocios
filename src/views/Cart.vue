<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-6">Carrito de Compras</h1>

    <div v-if="cart.items.length === 0" class="text-center py-8">
      <p class="text-gray-500">Tu carrito está vacío</p>
      <router-link to="/" class="btn btn-primary mt-4">Seguir comprando</router-link>
    </div>

    <div v-else class="space-y-4">
      <div v-for="item in cart.items" :key="item.id" class="flex items-center justify-between bg-white p-4 rounded-lg shadow">
        <div class="flex items-center space-x-4">
          <img :src="item.imageUrl" alt="Producto" class="w-16 h-16 object-cover rounded" />
          <div>
            <h2 class="font-semibold">{{ item.name }}</h2>
            <p class="text-primary font-bold">${{ item.price }}</p>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <button class="btn btn-sm btn-outline" @click="updateQuantity(item.id, item.quantity - 1)" :disabled="item.quantity <= 1">-</button>
          <span class="w-8 text-center">{{ item.quantity }}</span>
          <button class="btn btn-sm btn-outline" @click="updateQuantity(item.id, item.quantity + 1)">+</button>
          <button class="btn btn-sm btn-danger ml-4" @click="removeItem(item.id)">Eliminar</button>
        </div>
      </div>

      <div class="bg-white p-4 rounded-lg shadow mt-6">
        <div class="flex justify-between items-center mb-4">
          <span class="font-semibold">Total:</span>
          <span class="text-xl font-bold text-primary">${{ cart.total }}</span>
        </div>
        <button class="btn btn-success w-full" @click="goToCheckout">Finalizar Compra</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCartStore } from '@/stores/cart'
import { useRouter } from 'vue-router'

const cart = useCartStore()
const router = useRouter()

function updateQuantity(id: string, quantity: number) {
  if (quantity > 0) {
    cart.updateQuantity(id, quantity)
  }
}

function removeItem(id: string) {
  cart.removeItem(id)
}

function goToCheckout() {
  router.push({ name: 'checkout' })
}
</script> 