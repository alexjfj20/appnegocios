<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm">
      <div class="container mx-auto p-4">
        <div class="flex justify-between items-center">
          <div class="flex items-center space-x-4">
            <img :src="store.logoUrl" alt="Logo" class="h-10 w-10 rounded-full" />
            <h1 class="text-xl font-bold">{{ store.name }}</h1>
          </div>
          <div class="flex items-center space-x-4">
            <button class="btn btn-outline" @click="openCart">
              <span class="relative">
                <i class="fas fa-shopping-cart"></i>
                <span v-if="cart.itemCount" class="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {{ cart.itemCount }}
                </span>
              </span>
            </button>
            <a :href="whatsappLink" target="_blank" class="btn btn-success">
              <i class="fab fa-whatsapp"></i> Contactar
            </a>
          </div>
        </div>
      </div>
    </header>

    <!-- Búsqueda y Filtros -->
    <div class="container mx-auto p-4">
      <div class="flex space-x-4 mb-6">
        <div class="flex-1">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar productos..."
            class="input w-full"
            @input="filterProducts"
          />
        </div>
        <select v-model="selectedCategory" class="input" @change="filterProducts">
          <option value="">Todas las categorías</option>
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
      </div>

      <!-- Listado de Productos -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div v-for="product in filteredProducts" :key="product.id" class="bg-white rounded-lg shadow-sm overflow-hidden">
          <img :src="product.imageUrl" :alt="product.name" class="w-full h-48 object-cover" />
          <div class="p-4">
            <h2 class="font-semibold mb-2">{{ product.name }}</h2>
            <p class="text-gray-600 text-sm mb-4">{{ product.description }}</p>
            <div class="flex justify-between items-center">
              <span class="text-primary font-bold">${{ product.price }}</span>
              <button class="btn btn-primary btn-sm" @click="addToCart(product)">
                Agregar al carrito
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Carrito Flotante -->
    <div v-if="showCart" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold">Carrito de Compras</h2>
          <button class="btn btn-sm btn-outline" @click="closeCart">Cerrar</button>
        </div>
        <div v-if="cart.items.length === 0" class="text-center py-8">
          <p class="text-gray-500">Tu carrito está vacío</p>
        </div>
        <div v-else class="space-y-4">
          <div v-for="item in cart.items" :key="item.id" class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <img :src="item.imageUrl" :alt="item.name" class="w-16 h-16 object-cover rounded" />
              <div>
                <h3 class="font-semibold">{{ item.name }}</h3>
                <p class="text-primary">${{ item.price }}</p>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <button class="btn btn-sm btn-outline" @click="updateQuantity(item.id, item.quantity - 1)" :disabled="item.quantity <= 1">-</button>
              <span class="w-8 text-center">{{ item.quantity }}</span>
              <button class="btn btn-sm btn-outline" @click="updateQuantity(item.id, item.quantity + 1)">+</button>
              <button class="btn btn-sm btn-danger ml-2" @click="removeItem(item.id)">×</button>
            </div>
          </div>
          <div class="border-t pt-4">
            <div class="flex justify-between font-bold mb-4">
              <span>Total:</span>
              <span class="text-primary">${{ cart.total }}</span>
            </div>
            <button class="btn btn-success w-full" @click="goToCheckout">Finalizar Compra</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import axios from 'axios'
import type { Product } from '@/types/product'

interface StoreInfo {
  name: string;
  logoUrl: string;
  whatsapp: string;
}

const route = useRoute()
const router = useRouter()
const cart = useCartStore()

const store = ref<StoreInfo>({
  name: '',
  logoUrl: '',
  whatsapp: '',
})
const products = ref<Product[]>([])
const categories = ref<string[]>([])
const selectedCategory = ref<string>('all')
const searchQuery = ref('')
const showCart = ref(false)
const loading = ref(false)

const whatsappLink = computed(() => {
  return `https://wa.me/${store.value.whatsapp}?text=Hola, me gustaría hacer una consulta sobre tus productos.`
})

const filteredProducts = computed(() => {
  return products.value.filter((product: Product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesCategory = !selectedCategory.value || product.category_id === selectedCategory.value
    return matchesSearch && matchesCategory
  })
})

onMounted(async () => {
  try {
    const storeResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/stores/${route.params.slug}`)
    store.value = storeResponse.data

    const productsResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/stores/${route.params.slug}/products`)
    products.value = productsResponse.data

    // Extraer categorías únicas
    categories.value = [...new Set(products.value.map((p: Product) => p.category_id))]
  } catch (error) {
    console.error('Error al cargar la tienda:', error)
  }
})

function filterProducts() {
  // La lógica de filtrado se maneja en el computed filteredProducts
}

const addToCart = (product: Product) => {
  cart.addItem({
    id: product.id,
    name: product.name,
    price: product.price,
    imageUrl: product.imageUrl || '',
    quantity: 1
  })
}

function updateQuantity(id: string, quantity: number) {
  if (quantity > 0) {
    cart.updateQuantity(id, quantity)
  }
}

function removeItem(id: string) {
  cart.removeItem(id)
}

function openCart() {
  showCart.value = true
}

function closeCart() {
  showCart.value = false
}

function goToCheckout() {
  router.push({ name: 'checkout' })
}
</script> 