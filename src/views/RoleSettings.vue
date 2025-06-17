<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Gestión de Roles y Permisos</h1>
      <button
        @click="showCreateRoleModal = true"
        class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Crear Nuevo Rol
      </button>
    </div>

    <!-- Lista de Roles -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nombre
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Descripción
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Usuarios
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="role in roles" :key="role.id">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">{{ role.name }}</div>
            </td>
            <td class="px-6 py-4">
              <div class="text-sm text-gray-500">{{ role.description }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-500">{{ role.userCount }} usuarios</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button
                @click="editRole(role)"
                class="text-blue-600 hover:text-blue-900 mr-4"
              >
                Editar
              </button>
              <button
                @click="deleteRole(role)"
                class="text-red-600 hover:text-red-900"
                :disabled="role.isSystem"
              >
                Eliminar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal de Crear/Editar Rol -->
    <div v-if="showCreateRoleModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div class="bg-white rounded-lg p-6 max-w-2xl w-full">
        <h2 class="text-xl font-semibold mb-4">
          {{ editingRole ? 'Editar Rol' : 'Crear Nuevo Rol' }}
        </h2>
        <form @submit.prevent="saveRole">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Nombre</label>
              <input
                v-model="roleForm.name"
                type="text"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Descripción</label>
              <textarea
                v-model="roleForm.description"
                rows="3"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Permisos</label>
              <div class="grid grid-cols-2 gap-4">
                <div v-for="permission in permissions" :key="permission.id" class="flex items-center">
                  <input
                    v-model="roleForm.permissions"
                    :value="permission.id"
                    type="checkbox"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label class="ml-2 block text-sm text-gray-900">
                    {{ permission.name }}
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              @click="showCreateRoleModal = false"
              class="bg-white text-gray-700 px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              :disabled="loading"
            >
              {{ loading ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de Asignar Usuarios -->
    <div v-if="showAssignUsersModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div class="bg-white rounded-lg p-6 max-w-2xl w-full">
        <h2 class="text-xl font-semibold mb-4">Asignar Usuarios al Rol</h2>
        <div class="space-y-4">
          <div class="max-h-96 overflow-y-auto">
            <div v-for="user in users" :key="user.id" class="flex items-center py-2">
              <input
                v-model="selectedUsers"
                :value="user.id"
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label class="ml-2 block text-sm text-gray-900">
                {{ user.name }} ({{ user.email }})
              </label>
            </div>
          </div>
        </div>

        <div class="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            @click="showAssignUsersModal = false"
            class="bg-white text-gray-700 px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Cancelar
          </button>
          <button
            @click="assignUsers"
            class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            :disabled="loading"
          >
            {{ loading ? 'Asignando...' : 'Asignar Usuarios' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import axios from 'axios';

const loading = ref(false);
const showCreateRoleModal = ref(false);
const showAssignUsersModal = ref(false);
const editingRole = ref(null);
const selectedRole = ref(null);

const roles = ref([]);
const users = ref([]);
const permissions = ref([]);
const selectedUsers = ref([]);

const roleForm = ref({
  name: '',
  description: '',
  permissions: [],
});

onMounted(async () => {
  await loadRoles();
  await loadUsers();
  await loadPermissions();
});

const loadRoles = async () => {
  try {
    const response = await axios.get('/api/roles');
    roles.value = response.data;
  } catch (error) {
    toast.error('Error al cargar los roles');
  }
};

const loadUsers = async () => {
  try {
    const response = await axios.get('/api/users');
    users.value = response.data;
  } catch (error) {
    toast.error('Error al cargar los usuarios');
  }
};

const loadPermissions = async () => {
  try {
    const response = await axios.get('/api/permissions');
    permissions.value = response.data;
  } catch (error) {
    toast.error('Error al cargar los permisos');
  }
};

const editRole = (role) => {
  editingRole.value = role;
  roleForm.value = {
    name: role.name,
    description: role.description,
    permissions: role.permissions.map(p => p.id),
  };
  showCreateRoleModal.value = true;
};

const saveRole = async () => {
  loading.value = true;
  try {
    if (editingRole.value) {
      await axios.put(`/api/roles/${editingRole.value.id}`, roleForm.value);
      toast.success('Rol actualizado correctamente');
    } else {
      await axios.post('/api/roles', roleForm.value);
      toast.success('Rol creado correctamente');
    }
    showCreateRoleModal.value = false;
    await loadRoles();
  } catch (error) {
    toast.error('Error al guardar el rol');
  } finally {
    loading.value = false;
  }
};

const deleteRole = async (role) => {
  if (!confirm('¿Estás seguro de que deseas eliminar este rol?')) return;

  try {
    await axios.delete(`/api/roles/${role.id}`);
    toast.success('Rol eliminado correctamente');
    await loadRoles();
  } catch (error) {
    toast.error('Error al eliminar el rol');
  }
};

const assignUsers = async () => {
  if (!selectedRole.value) return;

  loading.value = true;
  try {
    await axios.put(`/api/roles/${selectedRole.value.id}/users`, {
      userIds: selectedUsers.value,
    });
    toast.success('Usuarios asignados correctamente');
    showAssignUsersModal.value = false;
    await loadRoles();
  } catch (error) {
    toast.error('Error al asignar usuarios');
  } finally {
    loading.value = false;
  }
};
</script> 