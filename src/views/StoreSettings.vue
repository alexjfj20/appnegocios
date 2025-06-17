<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">Configuración de la Tienda</h1>

    <!-- Pestañas -->
    <div class="border-b border-gray-200 mb-8">
      <nav class="flex space-x-8">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'py-4 px-1 border-b-2 font-medium text-sm',
            activeTab === tab.id
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          {{ tab.name }}
        </button>
      </nav>
    </div>

    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
      <p class="mt-4 text-gray-600">Cargando configuración...</p>
    </div>

    <div v-else class="space-y-8">
      <!-- Información General -->
      <div v-if="activeTab === 'general'" class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold mb-4">Información General</h2>
        <form @submit.prevent="updateGeneralInfo" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Nombre de la Tienda</label>
            <input
              v-model="storeInfo.name"
              type="text"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Descripción</label>
            <textarea
              v-model="storeInfo.description"
              rows="3"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Dirección</label>
            <input
              v-model="storeInfo.address"
              type="text"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Teléfono</label>
            <input
              v-model="storeInfo.phone"
              type="tel"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Email de Contacto</label>
            <input
              v-model="storeInfo.contactEmail"
              type="email"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div class="flex justify-end">
            <Button
              type="submit"
              :loading="saving"
              :disabled="!hasChanges"
            >
              Guardar Cambios
            </Button>
          </div>
        </form>
      </div>

      <!-- Personalización -->
      <div v-if="activeTab === 'customization'" class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold mb-4">Personalización</h2>
        <form @submit.prevent="updateCustomization" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Color Principal</label>
            <div class="flex items-center space-x-4">
              <input
                v-model="storeInfo.primaryColor"
                type="color"
                class="h-10 w-20 rounded-md border-gray-300"
              />
              <input
                v-model="storeInfo.primaryColor"
                type="text"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Logo</label>
            <div class="mt-1 flex items-center space-x-4">
              <img
                v-if="storeInfo.logo"
                :src="storeInfo.logo"
                alt="Logo"
                class="h-20 w-20 object-contain"
              />
              <div class="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  @change="handleLogoUpload"
                  class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                <p class="mt-1 text-sm text-gray-500">
                  PNG, JPG o GIF. Máximo 2MB.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Banner</label>
            <div class="mt-1 flex items-center space-x-4">
              <img
                v-if="storeInfo.banner"
                :src="storeInfo.banner"
                alt="Banner"
                class="h-20 w-40 object-cover"
              />
              <div class="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  @change="handleBannerUpload"
                  class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                <p class="mt-1 text-sm text-gray-500">
                  PNG, JPG o GIF. Máximo 5MB.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Favicon</label>
            <div class="mt-1 flex items-center space-x-4">
              <img
                v-if="storeInfo.favicon"
                :src="storeInfo.favicon"
                alt="Favicon"
                class="h-8 w-8 object-contain"
              />
              <div class="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  @change="handleFaviconUpload"
                  class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                <p class="mt-1 text-sm text-gray-500">
                  PNG o ICO. Máximo 1MB.
                </p>
              </div>
            </div>
          </div>

          <div class="flex justify-end">
            <Button
              type="submit"
              :loading="saving"
              :disabled="!hasChanges"
            >
              Guardar Cambios
            </Button>
          </div>
        </form>
      </div>

      <!-- Integraciones -->
      <div v-if="activeTab === 'integrations'" class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold mb-4">Integraciones</h2>
        <form @submit.prevent="updateIntegrations" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">WhatsApp Business API Key</label>
            <input
              v-model="storeInfo.whatsappApiKey"
              type="password"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            <p class="mt-1 text-sm text-gray-500">
              Clave API para enviar mensajes a través de WhatsApp Business
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Google Analytics ID</label>
            <input
              v-model="storeInfo.googleAnalyticsId"
              type="text"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            <p class="mt-1 text-sm text-gray-500">
              ID de seguimiento de Google Analytics (ej: UA-XXXXXXXXX-X)
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Facebook Pixel ID</label>
            <input
              v-model="storeInfo.facebookPixelId"
              type="text"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            <p class="mt-1 text-sm text-gray-500">
              ID del píxel de Facebook para seguimiento de conversiones
            </p>
          </div>

          <div class="flex justify-end">
            <Button
              type="submit"
              :loading="saving"
              :disabled="!hasChanges"
            >
              Guardar Cambios
            </Button>
          </div>
        </form>
      </div>

      <!-- Pagos -->
      <div v-if="activeTab === 'payments'" class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold mb-4">Configuración de Pagos</h2>
        <form @submit.prevent="updatePayments" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Métodos de Pago</label>
            <div class="mt-2 space-y-2">
              <div class="flex items-center">
                <input
                  v-model="storeInfo.paymentMethods"
                  type="checkbox"
                  value="cash"
                  class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label class="ml-2 block text-sm text-gray-900">
                  Efectivo
                </label>
              </div>
              <div class="flex items-center">
                <input
                  v-model="storeInfo.paymentMethods"
                  type="checkbox"
                  value="card"
                  class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label class="ml-2 block text-sm text-gray-900">
                  Tarjeta de Crédito/Débito
                </label>
              </div>
              <div class="flex items-center">
                <input
                  v-model="storeInfo.paymentMethods"
                  type="checkbox"
                  value="transfer"
                  class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label class="ml-2 block text-sm text-gray-900">
                  Transferencia Bancaria
                </label>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Stripe API Key</label>
            <input
              v-model="storeInfo.stripeApiKey"
              type="password"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Stripe Public Key</label>
            <input
              v-model="storeInfo.stripePublicKey"
              type="password"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Cuenta Bancaria</label>
            <input
              v-model="storeInfo.bankAccount"
              type="text"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            <p class="mt-1 text-sm text-gray-500">
              Número de cuenta para transferencias bancarias
            </p>
          </div>

          <div class="flex justify-end">
            <Button
              type="submit"
              :loading="saving"
              :disabled="!hasChanges"
            >
              Guardar Cambios
            </Button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useErrorStore } from '@/stores/error';
import api from '@/plugins/axios';
import Button from '@/components/ui/Button.vue';

const errorStore = useErrorStore();

// Estado
const loading = ref(false);
const saving = ref(false);
const activeTab = ref('general');
const originalStoreInfo = ref(null);

const tabs = [
  { id: 'general', name: 'Información General' },
  { id: 'customization', name: 'Personalización' },
  { id: 'integrations', name: 'Integraciones' },
  { id: 'payments', name: 'Pagos' },
];

const storeInfo = ref({
  name: '',
  description: '',
  address: '',
  phone: '',
  contactEmail: '',
  primaryColor: '#3B82F6',
  logo: '',
  banner: '',
  favicon: '',
  whatsappApiKey: '',
  googleAnalyticsId: '',
  facebookPixelId: '',
  paymentMethods: [],
  stripeApiKey: '',
  stripePublicKey: '',
  bankAccount: '',
});

// Computed
const hasChanges = computed(() => {
  if (!originalStoreInfo.value) return false;
  return JSON.stringify(storeInfo.value) !== JSON.stringify(originalStoreInfo.value);
});

// Cargar configuración
const loadStoreConfig = async () => {
  try {
    loading.value = true;
    const response = await api.get('/stores/config');
    storeInfo.value = response.data;
    originalStoreInfo.value = JSON.parse(JSON.stringify(response.data));
  } catch (error) {
    errorStore.handleApiError(error);
  } finally {
    loading.value = false;
  }
};

// Actualizar información general
const updateGeneralInfo = async () => {
  try {
    saving.value = true;
    await api.put('/stores/config', {
      name: storeInfo.value.name,
      description: storeInfo.value.description,
      address: storeInfo.value.address,
      phone: storeInfo.value.phone,
      contactEmail: storeInfo.value.contactEmail,
    });
    originalStoreInfo.value = JSON.parse(JSON.stringify(storeInfo.value));
    errorStore.showNotification('success', 'Información actualizada correctamente');
  } catch (error) {
    errorStore.handleApiError(error);
  } finally {
    saving.value = false;
  }
};

// Actualizar personalización
const updateCustomization = async () => {
  try {
    saving.value = true;
    await api.put('/stores/config', {
      primaryColor: storeInfo.value.primaryColor,
      logo: storeInfo.value.logo,
      banner: storeInfo.value.banner,
      favicon: storeInfo.value.favicon,
    });
    originalStoreInfo.value = JSON.parse(JSON.stringify(storeInfo.value));
    errorStore.showNotification('success', 'Personalización actualizada correctamente');
  } catch (error) {
    errorStore.handleApiError(error);
  } finally {
    saving.value = false;
  }
};

// Actualizar integraciones
const updateIntegrations = async () => {
  try {
    saving.value = true;
    await api.put('/stores/config', {
      whatsappApiKey: storeInfo.value.whatsappApiKey,
      googleAnalyticsId: storeInfo.value.googleAnalyticsId,
      facebookPixelId: storeInfo.value.facebookPixelId,
    });
    originalStoreInfo.value = JSON.parse(JSON.stringify(storeInfo.value));
    errorStore.showNotification('success', 'Integraciones actualizadas correctamente');
  } catch (error) {
    errorStore.handleApiError(error);
  } finally {
    saving.value = false;
  }
};

// Actualizar pagos
const updatePayments = async () => {
  try {
    saving.value = true;
    await api.put('/stores/config', {
      paymentMethods: storeInfo.value.paymentMethods,
      stripeApiKey: storeInfo.value.stripeApiKey,
      stripePublicKey: storeInfo.value.stripePublicKey,
      bankAccount: storeInfo.value.bankAccount,
    });
    originalStoreInfo.value = JSON.parse(JSON.stringify(storeInfo.value));
    errorStore.showNotification('success', 'Configuración de pagos actualizada correctamente');
  } catch (error) {
    errorStore.handleApiError(error);
  } finally {
    saving.value = false;
  }
};

// Manejar subida de archivos
const handleLogoUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('logo', file);

  try {
    const response = await api.post('/stores/upload-logo', formData);
    storeInfo.value.logo = response.data.url;
  } catch (error) {
    errorStore.handleApiError(error);
  }
};

const handleBannerUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('banner', file);

  try {
    const response = await api.post('/stores/upload-banner', formData);
    storeInfo.value.banner = response.data.url;
  } catch (error) {
    errorStore.handleApiError(error);
  }
};

const handleFaviconUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('favicon', file);

  try {
    const response = await api.post('/stores/upload-favicon', formData);
    storeInfo.value.favicon = response.data.url;
  } catch (error) {
    errorStore.handleApiError(error);
  }
};

// Inicialización
onMounted(() => {
  loadStoreConfig();
});
</script> 