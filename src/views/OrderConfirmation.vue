<template>
  <div class="container mx-auto p-4">
    <div class="max-w-md mx-auto bg-white rounded-lg shadow p-6 text-center">
      <div class="text-5xl text-success mb-4">✓</div>
      <h1 class="text-2xl font-bold mb-2">¡Pedido Confirmado!</h1>
      <p class="text-gray-600 mb-4">Tu pedido ha sido procesado correctamente.</p>
      <div class="border-t border-b py-4 my-4">
        <p class="font-semibold">Número de Pedido: #{{ orderId }}</p>
        <p class="text-primary font-bold mt-2">Total: ${{ order?.total || 0 }}</p>
      </div>
      <div class="space-y-2">
        <router-link to="/orders" class="btn btn-outline w-full">Ver Mis Pedidos</router-link>
        <router-link to="/" class="btn btn-primary w-full">Volver a la Tienda</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import type { Order } from '@/types/order';
import axios from 'axios'

const route = useRoute()
const orderId = route.params.id
const order = ref<Order | null>(null)

onMounted(async () => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/orders/${orderId}`)
    order.value = response.data
  } catch (error) {
    console.error('Error al cargar el pedido:', error)
  }
})
</script> 