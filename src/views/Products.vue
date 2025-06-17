<template>
  <div class="container mx-auto p-4">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Gestión de Productos</h1>
      <button class="btn btn-primary" @click="openCreateModal">Nuevo Producto</button>
    </div>

    <!-- Listado de productos -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="product in products" :key="product.id" class="bg-white rounded-lg shadow p-4">
        <img :src="product.imageUrl || '/placeholder.jpg'" alt="Producto" class="w-full h-40 object-cover rounded-lg mb-4" />
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
import Button from '@/components/ui/Button.vue'
import Modal from '@/components/ui/Modal.vue'
import Input from '@/components/ui/Input.vue'
import type { Product, ProductData } from '@/types/product'

const productStore = useProductStore()
const products = ref<Product[]>([])
const showModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const currentProduct = ref<Product | null>(null)
const loading = ref(false)
const saving = ref(false)

const form = ref<ProductData>({
  name: '',
  description: '',
  price: 0,
  stock: 0,
  min_stock: 5,
  category_id: '',
  sku: '',
  is_active: true,
  imageUrl: '',
})

onMounted(async () => {
  await loadProducts()
})

const loadProducts = async () => {
  try {
    loading.value = true
    products.value = await productStore.fetchProducts()
  } catch (error) {
    console.error('Error al cargar productos:', error)
  } finally {
    loading.value = false
  }
}

function openCreateModal() {
  isEditing.value = false
  form.value = { 
    name: '', 
    description: '', 
    price: 0, 
    stock: 0, 
    min_stock: 5, 
    category_id: '', 
    sku: '', 
    is_active: true, 
    imageUrl: '' 
  }
  showModal.value = true
}

function openEditModal(product: Product) {
  isEditing.value = true
  currentProduct.value = product
  form.value = { 
    name: product.name,
    description: product.description,
    price: product.price,
    stock: product.stock,
    min_stock: product.min_stock,
    category_id: product.category_id,
    sku: product.sku,
    is_active: product.is_active,
    imageUrl: product.imageUrl || '',
  }
  showModal.value = true
}

function openDeleteModal(product: Product) {
  currentProduct.value = product
  showDeleteModal.value = true
}

function closeModal() {
  showModal.value = false
  form.value = { 
    name: '', 
    description: '', 
    price: 0, 
    stock: 0, 
    min_stock: 5, 
    category_id: '', 
    sku: '', 
    is_active: true, 
    imageUrl: '' 
  }
}

function closeDeleteModal() {
  showDeleteModal.value = false
  currentProduct.value = null
}

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    // Aquí deberías subir la imagen y obtener la URL, por ahora solo la previsualizas
    form.value.imageUrl = URL.createObjectURL(file)
  }
}

async function saveProduct() {
  if (isEditing.value && currentProduct.value) {
    await productStore.updateProduct(currentProduct.value.id, form.value)
  } else {
    await productStore.createProduct(form.value)
  }
  closeModal()
  await loadProducts()
}

async function deleteProduct() {
  if (currentProduct.value) {
    await productStore.deleteProduct(currentProduct.value.id)
  }
  closeDeleteModal()
  await loadProducts()
}
</script> 