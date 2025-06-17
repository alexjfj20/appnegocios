<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-6">Finalizar Compra</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Resumen del carrito -->
      <div class="bg-white p-4 rounded-lg shadow">
        <h2 class="font-semibold mb-4">Resumen del Pedido</h2>
        <div v-for="item in cart.items" :key="item.id" class="flex justify-between py-2">
          <span>{{ item.name }} x {{ item.quantity }}</span>
          <span>${{ item.price * item.quantity }}</span>
        </div>
        <div class="border-t mt-4 pt-4">
          <div class="flex justify-between font-bold">
            <span>Total:</span>
            <span class="text-primary">${{ cart.total }}</span>
          </div>
        </div>
      </div>

      <!-- Formulario de envío y pago -->
      <div class="bg-white p-4 rounded-lg shadow">
        <h2 class="font-semibold mb-4">Datos de Envío y Pago</h2>
        <form @submit.prevent="submitOrder" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Nombre completo</label>
            <input v-model="form.name" type="text" class="input" required />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Email</label>
            <input v-model="form.email" type="email" class="input" required />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Dirección</label>
            <input v-model="form.address" type="text" class="input" required />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Teléfono</label>
            <input v-model="form.phone" type="tel" class="input" required />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Notas adicionales</label>
            <textarea v-model="form.notes" class="input"></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Método de pago</label>
            <select v-model="form.paymentMethod" class="input" required>
              <option value="card">Tarjeta de crédito</option>
              <option value="transfer">Transferencia bancaria</option>
            </select>
          </div>
          <button type="submit" class="btn btn-success w-full" :disabled="loading">
            {{ loading ? 'Procesando...' : 'Confirmar Pedido' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useRouter } from 'vue-router'
import axios from 'axios'

const cart = useCartStore()
const router = useRouter()
const loading = ref(false)

const form = ref({
  name: '',
  email: '',
  address: '',
  phone: '',
  notes: '',
  paymentMethod: 'card',
})

async function submitOrder() {
  loading.value = true
  try {
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/orders`, {
      items: cart.items,
      total: cart.total,
      ...form.value,
    })
    cart.clearCart()
    router.push({ name: 'order-confirmation', params: { id: response.data.id } })
  } catch (error) {
    console.error('Error al procesar el pedido:', error)
  } finally {
    loading.value = false
  }
}
</script> 