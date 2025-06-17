<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">Configuración</h1>

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

    <!-- Contenido de las pestañas -->
    <div class="bg-white rounded-lg shadow p-6">
      <!-- Perfil -->
      <div v-if="activeTab === 'profile'" class="space-y-6">
        <h2 class="text-xl font-semibold mb-4">Perfil de Usuario</h2>
        <form @submit.prevent="updateProfile" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Nombre</label>
            <input
              v-model="profile.name"
              type="text"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Email</label>
            <input
              v-model="profile.email"
              type="email"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Teléfono</label>
            <input
              v-model="profile.phone"
              type="tel"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Guardar Cambios
          </button>
        </form>
      </div>

      <!-- Tienda -->
      <div v-if="activeTab === 'store'" class="space-y-6">
        <h2 class="text-xl font-semibold mb-4">Configuración de Tienda</h2>
        <form @submit.prevent="updateStore" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Nombre de la Tienda</label>
            <input
              v-model="store.name"
              type="text"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Descripción</label>
            <textarea
              v-model="store.description"
              rows="3"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            ></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">URL de la Tienda</label>
            <div class="mt-1 flex rounded-md shadow-sm">
              <span class="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                {{ baseUrl }}/
              </span>
              <input
                v-model="store.slug"
                type="text"
                class="flex-1 block w-full rounded-none rounded-r-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
          <button
            type="submit"
            class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Guardar Cambios
          </button>
        </form>
      </div>

      <!-- Tema -->
      <div v-if="activeTab === 'theme'" class="space-y-6">
        <h2 class="text-xl font-semibold mb-4">Personalización de Tema</h2>
        <form @submit.prevent="updateTheme" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Color Principal</label>
            <input
              v-model="theme.primaryColor"
              type="color"
              class="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Fuente</label>
            <select
              v-model="theme.font"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="inter">Inter</option>
              <option value="roboto">Roboto</option>
              <option value="open-sans">Open Sans</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Estilo de Botones</label>
            <select
              v-model="theme.buttonStyle"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="rounded">Redondeado</option>
              <option value="square">Cuadrado</option>
              <option value="pill">Píldora</option>
            </select>
          </div>
          <button
            type="submit"
            class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Guardar Cambios
          </button>
        </form>
      </div>

      <!-- WhatsApp -->
      <div v-if="activeTab === 'whatsapp'" class="space-y-6">
        <h2 class="text-xl font-semibold mb-4">Configuración de WhatsApp</h2>
        <form @submit.prevent="updateWhatsApp" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Número de WhatsApp</label>
            <input
              v-model="whatsapp.number"
              type="tel"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="+1234567890"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Mensaje Predeterminado</label>
            <textarea
              v-model="whatsapp.defaultMessage"
              rows="3"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Hola, me gustaría obtener más información sobre..."
            ></textarea>
          </div>
          <div class="flex items-center">
            <input
              v-model="whatsapp.enabled"
              type="checkbox"
              class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label class="ml-2 block text-sm text-gray-900">
              Habilitar botón de WhatsApp en la tienda
            </label>
          </div>
          <button
            type="submit"
            class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Guardar Cambios
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';

const baseUrl = import.meta.env.VITE_APP_URL;

const tabs = [
  { id: 'profile', name: 'Perfil' },
  { id: 'store', name: 'Tienda' },
  { id: 'theme', name: 'Tema' },
  { id: 'whatsapp', name: 'WhatsApp' },
];

const activeTab = ref('profile');

// Estado de los formularios
const profile = ref({
  name: '',
  email: '',
  phone: '',
});

const store = ref({
  name: '',
  description: '',
  slug: '',
});

const theme = ref({
  primaryColor: '#4F46E5',
  font: 'inter',
  buttonStyle: 'rounded',
});

const whatsapp = ref({
  number: '',
  defaultMessage: '',
  enabled: true,
});

// Cargar datos iniciales
onMounted(async () => {
  try {
    const [profileRes, storeRes, themeRes, whatsappRes] = await Promise.all([
      axios.get('/api/users/profile'),
      axios.get('/api/stores/current'),
      axios.get('/api/stores/theme'),
      axios.get('/api/stores/whatsapp'),
    ]);

    profile.value = profileRes.data;
    store.value = storeRes.data;
    theme.value = themeRes.data;
    whatsapp.value = whatsappRes.data;
  } catch (error) {
    console.error('Error al cargar la configuración:', error);
  }
});

// Funciones para actualizar
const updateProfile = async () => {
  try {
    await axios.put('/api/users/profile', profile.value);
    // Mostrar mensaje de éxito
  } catch (error) {
    console.error('Error al actualizar el perfil:', error);
  }
};

const updateStore = async () => {
  try {
    await axios.put('/api/stores/current', store.value);
    // Mostrar mensaje de éxito
  } catch (error) {
    console.error('Error al actualizar la tienda:', error);
  }
};

const updateTheme = async () => {
  try {
    await axios.put('/api/stores/theme', theme.value);
    // Mostrar mensaje de éxito
  } catch (error) {
    console.error('Error al actualizar el tema:', error);
  }
};

const updateWhatsApp = async () => {
  try {
    await axios.put('/api/stores/whatsapp', whatsapp.value);
    // Mostrar mensaje de éxito
  } catch (error) {
    console.error('Error al actualizar WhatsApp:', error);
  }
};
</script> 