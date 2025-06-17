<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-6">Configuración de Usuario</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Perfil -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold mb-4">Perfil</h2>
        <form @submit.prevent="updateProfile">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Nombre</label>
              <input
                v-model="userInfo.name"
                type="text"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Email</label>
              <input
                v-model="userInfo.email"
                type="email"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Teléfono</label>
              <input
                v-model="userInfo.phone"
                type="tel"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Avatar</label>
              <div class="mt-1 flex items-center space-x-4">
                <img
                  v-if="userInfo.avatar"
                  :src="userInfo.avatar"
                  alt="Avatar"
                  class="h-16 w-16 rounded-full object-cover"
                />
                <input
                  type="file"
                  accept="image/*"
                  @change="handleAvatarUpload"
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

      <!-- Seguridad -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold mb-4">Seguridad</h2>
        <form @submit.prevent="updatePassword">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Contraseña Actual</label>
              <input
                v-model="password.current"
                type="password"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Nueva Contraseña</label>
              <input
                v-model="password.new"
                type="password"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Confirmar Nueva Contraseña</label>
              <input
                v-model="password.confirm"
                type="password"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div class="mt-6">
            <button
              type="submit"
              class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              :disabled="loading"
            >
              {{ loading ? 'Actualizando...' : 'Actualizar Contraseña' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Preferencias -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold mb-4">Preferencias</h2>
        <form @submit.prevent="updatePreferences">
          <div class="space-y-4">
            <div class="flex items-center">
              <input
                v-model="preferences.darkMode"
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label class="ml-2 block text-sm text-gray-900">
                Modo Oscuro
              </label>
            </div>

            <div class="flex items-center">
              <input
                v-model="preferences.emailNotifications"
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label class="ml-2 block text-sm text-gray-900">
                Notificaciones por Email
              </label>
            </div>

            <div class="flex items-center">
              <input
                v-model="preferences.pushNotifications"
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label class="ml-2 block text-sm text-gray-900">
                Notificaciones Push
              </label>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Idioma</label>
              <select
                v-model="preferences.language"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="es">Español</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>

          <div class="mt-6">
            <button
              type="submit"
              class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              :disabled="loading"
            >
              {{ loading ? 'Guardando...' : 'Guardar Preferencias' }}
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

const userInfo = ref({
  name: '',
  email: '',
  phone: '',
  avatar: '',
});

const password = ref({
  current: '',
  new: '',
  confirm: '',
});

const preferences = ref({
  darkMode: false,
  emailNotifications: true,
  pushNotifications: true,
  language: 'es',
});

onMounted(async () => {
  try {
    const response = await axios.get('/api/users/profile');
    userInfo.value = response.data;
  } catch (error) {
    toast.error('Error al cargar el perfil del usuario');
  }

  try {
    const response = await axios.get('/api/users/preferences');
    preferences.value = response.data;
  } catch (error) {
    toast.error('Error al cargar las preferencias del usuario');
  }
});

const handleAvatarUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('avatar', file);

  try {
    const response = await axios.post('/api/users/upload-avatar', formData);
    userInfo.value.avatar = response.data.url;
    toast.success('Avatar actualizado correctamente');
  } catch (error) {
    toast.error('Error al subir el avatar');
  }
};

const updateProfile = async () => {
  loading.value = true;
  try {
    await axios.put('/api/users/profile', {
      name: userInfo.value.name,
      email: userInfo.value.email,
      phone: userInfo.value.phone,
    });
    toast.success('Perfil actualizado correctamente');
  } catch (error) {
    toast.error('Error al actualizar el perfil');
  } finally {
    loading.value = false;
  }
};

const updatePassword = async () => {
  if (password.value.new !== password.value.confirm) {
    toast.error('Las contraseñas no coinciden');
    return;
  }

  loading.value = true;
  try {
    await axios.put('/api/users/password', {
      currentPassword: password.value.current,
      newPassword: password.value.new,
    });
    toast.success('Contraseña actualizada correctamente');
    password.value = { current: '', new: '', confirm: '' };
  } catch (error) {
    toast.error('Error al actualizar la contraseña');
  } finally {
    loading.value = false;
  }
};

const updatePreferences = async () => {
  loading.value = true;
  try {
    await axios.put('/api/users/preferences', preferences.value);
    toast.success('Preferencias actualizadas correctamente');
  } catch (error) {
    toast.error('Error al actualizar las preferencias');
  } finally {
    loading.value = false;
  }
};
</script> 