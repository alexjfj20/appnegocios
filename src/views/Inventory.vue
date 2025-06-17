<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">Inventario</h1>
      <div class="space-x-4">
        <Button @click="showNewProductModal = true">
          Nuevo Producto
        </Button>
        <Button @click="showNewCategoryModal = true" variant="secondary">
          Nueva Categoría
        </Button>
      </div>
    </div>

    <!-- Filtros -->
    <div class="bg-white rounded-lg shadow p-4 mb-8">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          id="filter-search"
          v-model="filters.search"
          placeholder="Buscar productos..."
          @input="loadProducts"
        />
        <Select
          id="filter-category"
          v-model="filters.category"
          :options="categories"
          placeholder="Filtrar por categoría"
          @change="loadProducts"
        />
        <div class="flex space-x-2">
          <Button
            variant="secondary"
            :class="{ 'bg-indigo-100': filters.showLowStock }"
            @click="filters.showLowStock = !filters.showLowStock; loadProducts()"
          >
            Stock Bajo
          </Button>
          <Button
            variant="secondary"
            :class="{ 'bg-indigo-100': filters.showInactive }"
            @click="filters.showInactive = !filters.showInactive; loadProducts()"
          >
            Inactivos
          </Button>
        </div>
      </div>
    </div>

    <!-- Lista de Productos -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Producto
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Categoría
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              SKU
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Precio
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Stock
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="product in products" :key="product.id">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div>
                  <div class="text-sm font-medium text-gray-900">
                    {{ product.name }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ product.description }}
                  </div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">
                {{ getCategoryName(product.category_id) }}
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ product.sku }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">
                ${{ product.price.toFixed(2) }}
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div
                :class="[
                  'text-sm',
                  {
                    'text-red-600': product.stock <= product.min_stock,
                    'text-gray-900': product.stock > product.min_stock,
                  },
                ]"
              >
                {{ product.stock }}
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="[
                  'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                  {
                    'bg-green-100 text-green-800': product.is_active,
                    'bg-red-100 text-red-800': !product.is_active,
                  },
                ]"
              >
                {{ product.is_active ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button
                class="text-indigo-600 hover:text-indigo-900 mr-4"
                @click="editProduct(product)"
              >
                Editar
              </button>
              <button
                class="text-indigo-600 hover:text-indigo-900"
                @click="showMovements(product)"
              >
                Movimientos
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Paginación -->
      <div class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div class="flex-1 flex justify-between sm:hidden">
          <Button
            variant="secondary"
            :disabled="currentPage === 1"
            @click="currentPage--; loadProducts()"
          >
            Anterior
          </Button>
          <Button
            variant="secondary"
            :disabled="currentPage === totalPages"
            @click="currentPage++; loadProducts()"
          >
            Siguiente
          </Button>
        </div>
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700">
              Mostrando
              <span class="font-medium">{{ (currentPage - 1) * limit + 1 }}</span>
              a
              <span class="font-medium">
                {{ Math.min(currentPage * limit, total) }}
              </span>
              de
              <span class="font-medium">{{ total }}</span>
              resultados
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button
                v-for="page in totalPages"
                :key="page"
                :class="[
                  'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                  {
                    'z-10 bg-indigo-50 border-indigo-500 text-indigo-600':
                      page === currentPage,
                    'bg-white border-gray-300 text-gray-500 hover:bg-gray-50':
                      page !== currentPage,
                  },
                ]"
                @click="currentPage = page; loadProducts()"
              >
                {{ page }}
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Nuevo Producto -->
    <Modal
      v-model="showNewProductModal"
      title="Nuevo Producto"
      size="lg"
    >
      <form @submit.prevent="saveProduct" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            id="new-product-name"
            v-model="newProduct.name"
            label="Nombre"
            required
          />
          <Select
            id="new-product-category"
            v-model="newProduct.category_id"
            :options="categories"
            label="Categoría"
            required
          />
          <Input
            id="new-product-sku"
            v-model="newProduct.sku"
            label="SKU"
          />
          <Input
            id="new-product-price"
            v-model="newProduct.price"
            type="number"
            label="Precio"
            required
          />
          <Input
            id="new-product-stock"
            v-model="newProduct.stock"
            type="number"
            label="Stock Inicial"
            required
          />
          <Input
            id="new-product-min-stock"
            v-model="newProduct.min_stock"
            type="number"
            label="Stock Mínimo"
            required
          />
          <div class="md:col-span-2">
            <Input
              id="new-product-description"
              v-model="newProduct.description"
              label="Descripción"
            />
          </div>
        </div>
        <div class="flex justify-end space-x-4">
          <Button
            variant="secondary"
            @click="showNewProductModal = false"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            :loading="saving"
          >
            Guardar
          </Button>
        </div>
      </form>
    </Modal>

    <!-- Modal de Nueva Categoría -->
    <Modal
      v-model="showNewCategoryModal"
      title="Nueva Categoría"
    >
      <form @submit.prevent="saveCategory" class="space-y-4">
        <Input
          id="new-category-name"
          v-model="newCategory.name"
          label="Nombre"
          required
        />
        <Input
          id="new-category-description"
          v-model="newCategory.description"
          label="Descripción"
        />
        <div class="flex justify-end space-x-4">
          <Button
            variant="secondary"
            @click="showNewCategoryModal = false"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            :loading="saving"
          >
            Guardar
          </Button>
        </div>
      </form>
    </Modal>

    <!-- Modal de Movimientos -->
    <Modal
      v-model="showMovementsModal"
      title="Movimientos de Inventario"
      size="xl"
    >
      <div class="space-y-4">
        <!-- Formulario de Movimiento -->
        <form @submit.prevent="saveMovement" class="bg-gray-50 p-4 rounded-lg">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              id="new-movement-type"
              v-model="newMovement.type"
              :options="[
                { value: 'entry', label: 'Entrada' },
                { value: 'exit', label: 'Salida' },
                { value: 'adjustment', label: 'Ajuste' },
              ]"
              label="Tipo de Movimiento"
              required
            />
            <Input
              id="new-movement-quantity"
              v-model="newMovement.quantity"
              type="number"
              label="Cantidad"
              required
            />
            <Input
              id="new-movement-notes"
              v-model="newMovement.notes"
              label="Notas"
            />
          </div>
          <div class="mt-4 flex justify-end">
            <Button
              type="submit"
              :loading="saving"
            >
              Registrar Movimiento
            </Button>
          </div>
        </form>

        <!-- Lista de Movimientos -->
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cantidad
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock Anterior
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock Nuevo
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notas
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="movement in movements" :key="movement.id">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatDate(movement.created_at) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="[
                      'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                      {
                        'bg-green-100 text-green-800': movement.type === 'entry',
                        'bg-red-100 text-red-800': movement.type === 'exit',
                        'bg-yellow-100 text-yellow-800': movement.type === 'adjustment',
                      },
                    ]"
                  >
                    {{ getMovementTypeLabel(movement.type) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ movement.quantity }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ movement.previous_stock }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ movement.new_stock }}
                </td>
                <td class="px-6 py-4 text-sm text-gray-900">
                  {{ movement.notes }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useErrorStore } from '@/stores/error';
import api from '@/plugins/axios';
import Button from '@/components/ui/Button.vue';
import Input from '@/components/ui/Input.vue';
import Select from '@/components/ui/Select.vue';
import Modal from '@/components/ui/Modal.vue';
import type { Product } from '@/types/product';
import type { Category, Movement, CategoryForm, MovementForm } from '@/types/inventory';
import type { ProductForm } from '@/types/product';

const errorStore = useErrorStore();

// Estado
const products = ref<Product[]>([]);
const categories = ref<{ value: string; label: string }[]>([]);
const movements = ref<Movement[]>([]);
const currentPage = ref(1);
const total = ref(0);
const totalPages = ref(0);
const limit = 10;
const saving = ref(false);

// Filtros
const filters = ref({
  search: '',
  category: '',
  showLowStock: false,
  showInactive: false,
});

// Modales
const showNewProductModal = ref(false);
const showNewCategoryModal = ref(false);
const showMovementsModal = ref(false);

// Formularios
const newProduct = ref<ProductForm>({
  name: '',
  category_id: '',
  sku: '',
  price: 0,
  stock: 0,
  min_stock: 5,
  description: '',
});

const newCategory = ref<CategoryForm>({
  name: '',
  description: '',
});

const newMovement = ref<MovementForm>({
  type: 'entry',
  quantity: 0,
  notes: '',
});

// Utilidades
const selectedProduct = ref<Product | null>(null);

// Cargar datos
const loadProducts = async () => {
  try {
    const params = {
      page: currentPage.value,
      limit,
      search: filters.value.search,
      category_id: filters.value.category,
      show_low_stock: filters.value.showLowStock,
      show_inactive: filters.value.showInactive,
    };

    const response = await api.get('/inventory/products', { params });
    products.value = response.data.products;
    total.value = response.data.total;
    totalPages.value = response.data.pages;
  } catch (error) {
    errorStore.handleApiError(error);
  }
};

const loadCategories = async () => {
  try {
    const response = await api.get('/inventory/categories');
    categories.value = response.data.map((category: Category) => ({
      value: category.id,
      label: category.name,
    }));
  } catch (error) {
    errorStore.handleApiError(error);
  }
};

const loadMovements = async (productId: string) => {
  try {
    const response = await api.get('/inventory/movements', {
      params: { product_id: productId },
    });
    movements.value = response.data.movements;
  } catch (error) {
    errorStore.handleApiError(error);
  }
};

// Guardar datos
const saveProduct = async () => {
  try {
    saving.value = true;
    await api.post('/inventory/products', newProduct.value);
    showNewProductModal.value = false;
    loadProducts();
    errorStore.showNotification('success', 'Producto guardado correctamente');
  } catch (error) {
    errorStore.handleApiError(error);
  } finally {
    saving.value = false;
  }
};

const saveCategory = async () => {
  try {
    saving.value = true;
    await api.post('/inventory/categories', newCategory.value);
    showNewCategoryModal.value = false;
    loadCategories();
    errorStore.showNotification('success', 'Categoría guardada correctamente');
  } catch (error) {
    errorStore.handleApiError(error);
  } finally {
    saving.value = false;
  }
};

const saveMovement = async () => {
  try {
    saving.value = true;
    if (selectedProduct.value) {
      await api.post('/inventory/movements', {
        ...newMovement.value,
        product_id: selectedProduct.value.id,
      });
      loadMovements(selectedProduct.value.id);
    }
    loadProducts();
    errorStore.showNotification('success', 'Movimiento registrado correctamente');
  } catch (error) {
    errorStore.handleApiError(error);
  } finally {
    saving.value = false;
  }
};

// Utilidades
const editProduct = (product: Product) => {
  newProduct.value = { ...product };
  showNewProductModal.value = true;
};

const showMovements = (product: Product) => {
  selectedProduct.value = product;
  showMovementsModal.value = true;
  loadMovements(product.id);
};

const getCategoryName = (categoryId: string) => {
  const category = categories.value.find((c) => c.value === categoryId);
  return category ? category.label : '';
};

const getMovementTypeLabel = (type: 'entry' | 'exit' | 'adjustment') => {
  const types: Record<string, string> = {
    entry: 'Entrada',
    exit: 'Salida',
    adjustment: 'Ajuste',
  };
  return types[type] || type;
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleString();
};

// Inicialización
onMounted(() => {
  loadProducts();
  loadCategories();
});
</script> 