<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">Alertas de Inventario</h1>
      <div class="flex space-x-4">
        <Button
          variant="secondary"
          :class="{ 'bg-indigo-100': filters.showRead }"
          @click="filters.showRead = !filters.showRead; loadAlerts()"
        >
          Mostrar Leídas
        </Button>
        <Button
          variant="secondary"
          @click="markAllAsRead"
          :disabled="!hasUnreadAlerts"
        >
          Marcar Todas como Leídas
        </Button>
      </div>
    </div>

    <!-- Lista de Alertas -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div v-if="loading" class="p-8 text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p class="mt-4 text-gray-600">Cargando alertas...</p>
      </div>

      <div v-else-if="alerts.length === 0" class="p-8 text-center">
        <p class="text-gray-600">No hay alertas para mostrar</p>
      </div>

      <div v-else class="divide-y divide-gray-200">
        <div
          v-for="alert in alerts"
          :key="alert.id"
          :class="[
            'p-6',
            {
              'bg-gray-50': !alert.is_read,
              'bg-white': alert.is_read,
            },
          ]"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center">
                <span
                  :class="[
                    'px-2 py-1 text-xs font-semibold rounded-full mr-3',
                    {
                      'bg-red-100 text-red-800': alert.type === 'low_stock',
                      'bg-yellow-100 text-yellow-800': alert.type === 'expiring',
                      'bg-blue-100 text-blue-800': alert.type === 'system',
                    },
                  ]"
                >
                  {{ getAlertTypeLabel(alert.type) }}
                </span>
                <span
                  v-if="!alert.is_read"
                  class="px-2 py-1 text-xs font-semibold bg-indigo-100 text-indigo-800 rounded-full"
                >
                  Nueva
                </span>
              </div>
              <h3 class="mt-2 text-lg font-medium text-gray-900">
                {{ alert.title }}
              </h3>
              <p class="mt-1 text-sm text-gray-600">
                {{ alert.message }}
              </p>
              <div class="mt-2 text-sm text-gray-500">
                {{ formatDate(alert.created_at) }}
              </div>
            </div>
            <div class="ml-4 flex-shrink-0">
              <Button
                v-if="!alert.is_read"
                variant="secondary"
                size="sm"
                @click="markAsRead(alert.id)"
              >
                Marcar como Leída
              </Button>
            </div>
          </div>
        </div>
      </div>

      <!-- Paginación -->
      <div class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div class="flex-1 flex justify-between sm:hidden">
          <Button
            variant="secondary"
            :disabled="currentPage === 1"
            @click="currentPage--; loadAlerts()"
          >
            Anterior
          </Button>
          <Button
            variant="secondary"
            :disabled="currentPage === totalPages"
            @click="currentPage++; loadAlerts()"
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
                @click="currentPage = page; loadAlerts()"
              >
                {{ page }}
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useErrorStore } from '@/stores/error';
import { useWebSocket } from '@/plugins/websocket';
import api from '@/plugins/axios';
import Button from '@/components/ui/Button.vue';
import type { Alert } from '@/types/alert';

const errorStore = useErrorStore();
const { connect, disconnect } = useWebSocket();

// Estado
const alerts = ref<Alert[]>([]);
const loading = ref(false);
const currentPage = ref(1);
const total = ref(0);
const totalPages = ref(0);
const limit = 10;

// Filtros
const filters = ref({
  showRead: false,
});

// Computed
const hasUnreadAlerts = computed(() => {
  return alerts.value.some((alert: any) => !alert.is_read);
});

// Cargar alertas
const loadAlerts = async () => {
  try {
    loading.value = true;
    const params = {
      page: currentPage.value,
      limit,
      show_read: filters.value.showRead,
    };

    const response = await api.get('/inventory/alerts', { params });
    alerts.value = response.data.alerts;
    total.value = response.data.total;
    totalPages.value = response.data.pages;
  } catch (error) {
    errorStore.handleApiError(error);
  } finally {
    loading.value = false;
  }
};

// Manejar nueva alerta
const handleNewAlert = (event: CustomEvent) => {
  const newAlert = event.detail;
  alerts.value.unshift(newAlert);
  total.value++;

  // Mostrar notificación
  errorStore.showNotification('info', `Nueva alerta: ${newAlert.title}`);
};

// Marcar alertas como leídas
const markAsRead = async (alertId: number) => {
  try {
    await api.put(`/inventory/alerts/${alertId}/read`);
    const alert = alerts.value.find((a: any) => a.id === alertId);
    if (alert) {
      alert.is_read = true;
    }
    errorStore.showNotification('success', 'Alerta marcada como leída');
  } catch (error) {
    errorStore.handleApiError(error);
  }
};

const markAllAsRead = async () => {
  try {
    await api.put('/inventory/alerts/read-all');
    alerts.value.forEach((alert: any) => {
      alert.is_read = true;
    });
    errorStore.showNotification('success', 'Todas las alertas marcadas como leídas');
  } catch (error) {
    errorStore.handleApiError(error);
  }
};

// Utilidades
const getAlertTypeLabel = (type: string) => {
  const types: Record<string, string> = {
    low_stock: 'Stock Bajo',
    expiring: 'Producto por Vencer',
    system: 'Sistema',
  };
  return types[type] || type;
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleString();
};

// Inicialización
onMounted(() => {
  loadAlerts();
  connect();
  window.addEventListener('new-alert', handleNewAlert as EventListener);
});

onUnmounted(() => {
  disconnect();
  window.removeEventListener('new-alert', handleNewAlert as EventListener);
});
</script> 