<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-6">Mis Pedidos</h1>

    <div v-if="loading" class="text-center py-8">
      <p class="text-gray-500">Cargando pedidos...</p>
    </div>

    <div v-else-if="orders.length === 0" class="text-center py-8">
      <p class="text-gray-500">No tienes pedidos aún</p>
      <router-link to="/" class="btn btn-primary mt-4">Ir a la Tienda</router-link>
    </div>

    <div v-else class="space-y-4">
      <div v-for="order in orders" :key="order.id" class="bg-white rounded-lg shadow p-4">
        <div class="flex justify-between items-start">
          <div>
            <h2 class="font-semibold">Pedido #{{ order.id }}</h2>
            <p class="text-sm text-gray-500">{{ new Date(order.created_at).toLocaleDateString() }}</p>
          </div>
          <span class="text-primary font-bold">${{ order.total }}</span>
        </div>
        <div class="mt-4">
          <p class="text-sm"><span class="font-medium">Estado:</span> {{ order.status }}</p>
          <p class="text-sm"><span class="font-medium">Método de pago:</span> {{ order.payment_method }}</p>
        </div>
        <div class="mt-4 flex justify-end">
          <button class="btn btn-sm btn-outline" @click="viewOrderDetails(order)">Ver Detalles</button>
        </div>
      </div>
    </div>

    <!-- Modal de detalles del pedido -->
    <div v-if="selectedOrder" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 class="text-xl font-bold mb-4">Detalles del Pedido #{{ selectedOrder.id }}</h2>
        <div class="space-y-4">
          <div v-for="item in selectedOrder.items" :key="item.id" class="flex justify-between">
            <span>{{ item.name }} x {{ item.quantity }}</span>
            <span>${{ item.price * item.quantity }}</span>
          </div>
          <div class="border-t pt-4">
            <div class="flex justify-between font-bold">
              <span>Total:</span>
              <span class="text-primary">${{ selectedOrder.total }}</span>
            </div>
          </div>
        </div>
        <button class="btn btn-outline w-full mt-4" @click="selectedOrder = null">Cerrar</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'

const orders = ref([])
const loading = ref(true)
const selectedOrder = ref(null)

onMounted(async () => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/orders`)
    orders.value = response.data
  } catch (error) {
    console.error('Error al cargar los pedidos:', error)
  } finally {
    loading.value = false
  }
})

function viewOrderDetails(order) {
  selectedOrder.value = order
}
</script> 