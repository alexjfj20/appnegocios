<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-3xl mx-auto">
      <h1 class="text-3xl font-bold mb-8">Configuración de Notificaciones</h1>

      <div v-if="loading" class="text-center py-8">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p class="mt-4 text-gray-600">Cargando configuración...</p>
      </div>

      <div v-else class="space-y-8">
        <!-- Notificaciones por Email -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold mb-4">Notificaciones por Email</h2>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-medium">Alertas de Inventario</h3>
                <p class="text-sm text-gray-600">
                  Recibe alertas sobre stock bajo y otros eventos importantes
                </p>
              </div>
              <Switch
                v-model="settings.email.inventory_alerts"
                @update:modelValue="updateSettings"
              />
            </div>
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-medium">Pedidos Nuevos</h3>
                <p class="text-sm text-gray-600">
                  Notificaciones cuando se reciben nuevos pedidos
                </p>
              </div>
              <Switch
                v-model="settings.email.new_orders"
                @update:modelValue="updateSettings"
              />
            </div>
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-medium">Resúmenes Diarios</h3>
                <p class="text-sm text-gray-600">
                  Recibe un resumen diario de la actividad de tu tienda
                </p>
              </div>
              <Switch
                v-model="settings.email.daily_summary"
                @update:modelValue="updateSettings"
              />
            </div>
          </div>
        </div>

        <!-- Notificaciones Push -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold mb-4">Notificaciones Push</h2>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-medium">Alertas de Inventario</h3>
                <p class="text-sm text-gray-600">
                  Recibe notificaciones instantáneas sobre el inventario
                </p>
              </div>
              <Switch
                v-model="settings.push.inventory_alerts"
                @update:modelValue="updateSettings"
              />
            </div>
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-medium">Pedidos Nuevos</h3>
                <p class="text-sm text-gray-600">
                  Notificaciones push para nuevos pedidos
                </p>
              </div>
              <Switch
                v-model="settings.push.new_orders"
                @update:modelValue="updateSettings"
              />
            </div>
          </div>
        </div>

        <!-- Notificaciones por WhatsApp -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold mb-4">Notificaciones por WhatsApp</h2>
          <div class="space-y-6">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-medium">Habilitar WhatsApp</h3>
                <p class="text-sm text-gray-600">
                  Recibe notificaciones importantes por WhatsApp
                </p>
              </div>
              <Switch
                v-model="settings.whatsapp.enabled"
                @update:modelValue="updateSettings"
              />
            </div>

            <div v-if="settings.whatsapp.enabled" class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="font-medium">Alertas de Inventario</h3>
                  <p class="text-sm text-gray-600">
                    Recibe alertas sobre stock bajo y otros eventos
                  </p>
                </div>
                <Switch
                  v-model="settings.whatsapp.inventory_alerts"
                  @update:modelValue="updateSettings"
                />
              </div>
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="font-medium">Pedidos Nuevos</h3>
                  <p class="text-sm text-gray-600">
                    Notificaciones para nuevos pedidos
                  </p>
                </div>
                <Switch
                  v-model="settings.whatsapp.new_orders"
                  @update:modelValue="updateSettings"
                />
              </div>

              <div class="mt-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Número de WhatsApp
                </label>
                <div class="flex space-x-4">
                  <Input
                    v-model="settings.whatsapp.phone"
                    type="tel"
                    placeholder="+52 123 456 7890"
                    class="flex-1"
                    @update:modelValue="updateSettings"
                    id="notification-whatsapp-phone"
                  />
                  <Button
                    variant="secondary"
                    @click="verifyPhone"
                    :loading="verifying"
                  >
                    Verificar
                  </Button>
                </div>
                <p class="mt-2 text-sm text-gray-500">
                  Incluye el código de país (ej. +52 para México)
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Guardar Cambios -->
        <div class="flex justify-end">
          <Button
            @click="saveSettings"
            :loading="saving"
            :disabled="!hasChanges"
          >
            Guardar Cambios
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useErrorStore } from '@/stores/error';
import api from '@/plugins/axios';
import Button from '@/components/ui/Button.vue';
import Input from '@/components/ui/Input.vue';
import Switch from '@/components/ui/Switch.vue';

const errorStore = useErrorStore();

// Estado
const loading = ref(false);
const saving = ref(false);
const verifying = ref(false);
const originalSettings = ref(null);

const settings = ref({
  email: {
    inventory_alerts: false,
    new_orders: false,
    daily_summary: false,
  },
  push: {
    inventory_alerts: false,
    new_orders: false,
  },
  whatsapp: {
    enabled: false,
    inventory_alerts: false,
    new_orders: false,
    phone: '',
  },
});

// Computed
const hasChanges = computed(() => {
  if (!originalSettings.value) return false;
  return JSON.stringify(settings.value) !== JSON.stringify(originalSettings.value);
});

// Cargar configuración
const loadSettings = async () => {
  try {
    loading.value = true;
    const response = await api.get('/users/notification-settings');
    settings.value = response.data;
    originalSettings.value = JSON.parse(JSON.stringify(response.data));
  } catch (error) {
    errorStore.handleApiError(error);
  } finally {
    loading.value = false;
  }
};

// Actualizar configuración
const updateSettings = async () => {
  if (!hasChanges.value) return;

  try {
    saving.value = true;
    await api.put('/users/notification-settings', settings.value);
    originalSettings.value = JSON.parse(JSON.stringify(settings.value));
    errorStore.showNotification('success', 'Configuración actualizada');
  } catch (error) {
    errorStore.handleApiError(error);
  } finally {
    saving.value = false;
  }
};

// Verificar número de WhatsApp
const verifyPhone = async () => {
  try {
    verifying.value = true;
    await api.post('/users/verify-whatsapp', {
      phone: settings.value.whatsapp.phone,
    });
    errorStore.showNotification('success', 'Código de verificación enviado');
  } catch (error) {
    errorStore.handleApiError(error);
  } finally {
    verifying.value = false;
  }
};

// Inicialización
onMounted(() => {
  loadSettings();
});
</script> 