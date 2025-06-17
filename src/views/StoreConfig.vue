<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-6">Configuración de la Tienda</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Información General -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold mb-4">Información General</h2>
        <form @submit.prevent="updateStoreInfo">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Nombre de la Tienda</label>
              <input
                v-model="storeInfo.name"
                type="text"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Descripción</label>
              <textarea
                v-model="storeInfo.description"
                rows="3"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Dirección</label>
              <input
                v-model="storeInfo.address"
                type="text"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Teléfono</label>
              <input
                v-model="storeInfo.phone"
                type="tel"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Email de Contacto</label>
              <input
                v-model="storeInfo.contactEmail"
                type="email"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div class="mt-6">
            <button
              type="submit"
              class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              :disabled="loading"
            >
              {{ loading ? 'Guardando...' : 'Guardar Cambios' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Personalización -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold mb-4">Personalización</h2>
        <form @submit.prevent="updateStoreCustomization">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Color Principal</label>
              <input
                v-model="storeInfo.primaryColor"
                type="color"
                class="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Logo</label>
              <div class="mt-1 flex items-center space-x-4">
                <img
                  v-if="storeInfo.logo"
                  :src="storeInfo.logo"
                  alt="Logo"
                  class="h-16 w-16 object-contain"
                />
                <input
                  type="file"
                  accept="image/*"
                  @change="handleLogoUpload"
                  class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Banner</label>
              <div class="mt-1 flex items-center space-x-4">
                <img
                  v-if="storeInfo.banner"
                  :src="storeInfo.banner"
                  alt="Banner"
                  class="h-24 w-full object-cover rounded-md"
                />
                <input
                  type="file"
                  accept="image/*"
                  @change="handleBannerUpload"
                  class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
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
                <input
                  type="file"
                  accept="image/*"
                  @change="handleFaviconUpload"
                  class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>
          </div>

          <div class="mt-6">
            <button
              type="submit"
              class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              :disabled="loading"
            >
              {{ loading ? 'Guardando...' : 'Guardar Cambios' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Integraciones -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold mb-4">Integraciones</h2>
        <form @submit.prevent="updateStoreIntegrations">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">WhatsApp Business API</label>
              <input
                v-model="storeInfo.whatsappApiKey"
                type="text"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="API Key de WhatsApp Business"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Google Analytics ID</label>
              <input
                v-model="storeInfo.googleAnalyticsId"
                type="text"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="UA-XXXXXXXXX-X"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Facebook Pixel ID</label>
              <input
                v-model="storeInfo.facebookPixelId"
                type="text"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="XXXXXXXXXXXXXXX"
              />
            </div>
          </div>

          <div class="mt-6">
            <button
              type="submit"
              class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              :disabled="loading"
            >
              {{ loading ? 'Guardando...' : 'Guardar Cambios' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Configuración de Pagos -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold mb-4">Configuración de Pagos</h2>
        <form @submit.prevent="updatePaymentSettings">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Métodos de Pago</label>
              <div class="mt-2 space-y-2">
                <div class="flex items-center">
                  <input
                    v-model="storeInfo.paymentMethods"
                    value="credit_card"
                    type="checkbox"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label class="ml-2 block text-sm text-gray-900">
                    Tarjeta de Crédito
                  </label>
                </div>
                <div class="flex items-center">
                  <input
                    v-model="storeInfo.paymentMethods"
                    value="bank_transfer"
                    type="checkbox"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label class="ml-2 block text-sm text-gray-900">
                    Transferencia Bancaria
                  </label>
                </div>
                <div class="flex items-center">
                  <input
                    v-model="storeInfo.paymentMethods"
                    value="cash"
                    type="checkbox"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label class="ml-2 block text-sm text-gray-900">
                    Efectivo
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Stripe API Key</label>
              <input
                v-model="storeInfo.stripeApiKey"
                type="password"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="sk_test_..."
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Stripe Public Key</label>
              <input
                v-model="storeInfo.stripePublicKey"
                type="text"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="pk_test_..."
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Cuenta Bancaria</label>
              <input
                v-model="storeInfo.bankAccount"
                type="text"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Número de cuenta bancaria"
              />
            </div>
          </div>

          <div class="mt-6">
            <button
              type="submit"
              class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              :disabled="loading"
            >
              {{ loading ? 'Guardando...' : 'Guardar Cambios' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useToast } from 'vue-toastification';
import axios from 'axios';

const toast = useToast();
const loading = ref(false);

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

onMounted(async () => {
  try {
    const response = await axios.get('/api/stores/config');
    storeInfo.value = response.data;
  } catch (error) {
    toast.error('Error al cargar la configuración de la tienda');
  }
});

const handleLogoUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('logo', file);

  try {
    const response = await axios.post('/api/stores/upload-logo', formData);
    storeInfo.value.logo = response.data.url;
    toast.success('Logo actualizado correctamente');
  } catch (error) {
    toast.error('Error al subir el logo');
  }
};

const handleBannerUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('banner', file);

  try {
    const response = await axios.post('/api/stores/upload-banner', formData);
    storeInfo.value.banner = response.data.url;
    toast.success('Banner actualizado correctamente');
  } catch (error) {
    toast.error('Error al subir el banner');
  }
};

const handleFaviconUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('favicon', file);

  try {
    const response = await axios.post('/api/stores/upload-favicon', formData);
    storeInfo.value.favicon = response.data.url;
    toast.success('Favicon actualizado correctamente');
  } catch (error) {
    toast.error('Error al subir el favicon');
  }
};

const updateStoreInfo = async () => {
  loading.value = true;
  try {
    await axios.put('/api/stores/config', {
      name: storeInfo.value.name,
      description: storeInfo.value.description,
      address: storeInfo.value.address,
      phone: storeInfo.value.phone,
      contactEmail: storeInfo.value.contactEmail,
    });
    toast.success('Información actualizada correctamente');
  } catch (error) {
    toast.error('Error al actualizar la información');
  } finally {
    loading.value = false;
  }
};

const updateStoreCustomization = async () => {
  loading.value = true;
  try {
    await axios.put('/api/stores/config', {
      primaryColor: storeInfo.value.primaryColor,
      logo: storeInfo.value.logo,
      banner: storeInfo.value.banner,
      favicon: storeInfo.value.favicon,
    });
    toast.success('Personalización actualizada correctamente');
  } catch (error) {
    toast.error('Error al actualizar la personalización');
  } finally {
    loading.value = false;
  }
};

const updateStoreIntegrations = async () => {
  loading.value = true;
  try {
    await axios.put('/api/stores/config', {
      whatsappApiKey: storeInfo.value.whatsappApiKey,
      googleAnalyticsId: storeInfo.value.googleAnalyticsId,
      facebookPixelId: storeInfo.value.facebookPixelId,
    });
    toast.success('Integraciones actualizadas correctamente');
  } catch (error) {
    toast.error('Error al actualizar las integraciones');
  } finally {
    loading.value = false;
  }
};

const updatePaymentSettings = async () => {
  loading.value = true;
  try {
    await axios.put('/api/stores/config', {
      paymentMethods: storeInfo.value.paymentMethods,
      stripeApiKey: storeInfo.value.stripeApiKey,
      stripePublicKey: storeInfo.value.stripePublicKey,
      bankAccount: storeInfo.value.bankAccount,
    });
    toast.success('Configuración de pagos actualizada correctamente');
  } catch (error) {
    toast.error('Error al actualizar la configuración de pagos');
  } finally {
    loading.value = false;
  }
};
</script> 