<template>
  <div class="container mx-auto p-4">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Gestión de Productos</h1>
      <button class="btn btn-primary" @click="openCreateModal">Nuevo Producto</button>
    </div>

    <!-- Listado de productos -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="product in products" :key="product.id" class="bg-white rounded-lg shadow p-4">
        <img :src="product.imageUrl" alt="Producto" class="w-full h-40 object-cover rounded-lg mb-4" />
        <h2 class="text-lg font-semibold">{{ product.name }}</h2>
        <p class="text-gray-600">{{ product.description }}</p>
        <p class="text-primary font-bold mt-2">${{ product.price }}</p>
        <div class="flex justify-between mt-4">
          <button class="btn btn-sm btn-outline" @click="openEditModal(product)">Editar</button>
          <button class="btn btn-sm btn-danger" @click="openDeleteModal(product)">Eliminar</button>
        </div>
      </div>
    </div>

    <!-- Modal de creación/edición -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 class="text-xl font-bold mb-4">{{ isEditing ? 'Editar Producto' : 'Nuevo Producto' }}</h2>
        <form @submit.prevent="saveProduct" class="space-y-4">
          <Input
            id="product-name"
            v-model="form.name"
            label="Nombre"
            required
          />
          <Input
            id="product-description"
            v-model="form.description"
            type="textarea"
            label="Descripción"
            required
          />
          <Input
            id="product-price"
            v-model.number="form.price"
            type="number"
            label="Precio"
            min="0"
            required
          />
          <div>
            <label class="block text-sm font-medium mb-1">Imagen</label>
            <input type="file" accept="image/*" class="input" @change="onFileChange" />
            <div v-if="form.imageUrl" class="mt-2">
              <img :src="form.imageUrl" alt="Preview" class="h-20 rounded-lg border" />
            </div>
          </div>
          <div class="flex justify-end space-x-2">
            <button type="button" class="btn btn-outline" @click="closeModal">Cancelar</button>
            <button type="submit" class="btn btn-primary">Guardar</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de eliminación -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 class="text-xl font-bold mb-4">Eliminar Producto</h2>
        <p>¿Estás seguro de que deseas eliminar este producto?</p>
        <div class="flex justify-end space-x-2 mt-4">
          <button class="btn btn-outline" @click="closeDeleteModal">Cancelar</button>
          <button class="btn btn-danger" @click="deleteProduct">Eliminar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useProductStore } from '@/stores/products'
import Input from '@/components/ui/Input.vue' // Importar el componente Input
import type { Product, ProductForm } from '@/types/product' // Importar tipos

const productStore = useProductStore()
const products = ref<Product[]>([]) // Tipar products
const showModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const currentProduct = ref<Product | null>(null) // Tipar currentProduct

const form = ref<ProductForm>({
  name: '',
  description: '',
  price: 0,
  imageUrl: '',
  imageFile: null,
})

onMounted(async () => {
  await loadProducts()
})

async function loadProducts() {
  products.value = await productStore.fetchProducts()
}

function openCreateModal() {
  isEditing.value = false
  form.value = { name: '', description: '', price: 0, imageUrl: '', imageFile: null }
  showModal.value = true
}

function openEditModal(product: Product) { // Tipar product
  isEditing.value = true
  currentProduct.value = product
  form.value = { ...product, imageFile: null }
  showModal.value = true
}

function openDeleteModal(product: Product) { // Tipar product
  currentProduct.value = product
  showDeleteModal.value = true
}

function closeModal() {
  showModal.value = false
  form.value = { name: '', description: '', price: 0, imageUrl: '', imageFile: null }
}

function closeDeleteModal() {
  showDeleteModal.value = false
  currentProduct.value = null
}

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    form.value.imageFile = file
    form.value.imageUrl = URL.createObjectURL(file)
  }
}

async function saveProduct() {
  if (isEditing.value) {
    if (currentProduct.value) { // Comprobación de nulidad
      await productStore.updateProduct(currentProduct.value.id, form.value)
    }
  } else {
    await productStore.createProduct(form.value)
  }
  closeModal()
  await loadProducts()
}

async function deleteProduct() {
  if (currentProduct.value) { // Comprobación de nulidad
    await productStore.deleteProduct(currentProduct.value.id)
  }
  closeDeleteModal()
  await loadProducts()
}
</script> 