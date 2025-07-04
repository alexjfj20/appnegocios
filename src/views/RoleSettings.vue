<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Gestión de Roles y Permisos</h1>
      <Button @click="openCreateRoleModal">
        Crear Nuevo Rol
      </Button>
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
    <Modal
      v-model="showCreateRoleModal"
      title="Crear/Editar Rol"
      size="lg"
    >
      <form @submit.prevent="saveRole" class="space-y-4">
        <Input
          id="role-name"
          v-model="roleForm.name"
          label="Nombre"
          required
        />

        <Input
          id="role-description"
          v-model="roleForm.description"
          type="textarea"
          label="Descripción"
        />

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

        <div class="mt-6 flex justify-end space-x-3">
          <Button
            type="button"
            variant="secondary"
            @click="closeCreateRoleModal"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            :loading="loading"
          >
            {{ loading ? 'Guardando...' : 'Guardar' }}
          </Button>
        </div>
      </form>
    </Modal>

    <!-- Modal de Asignar Usuarios -->
    <Modal
      v-model="showAssignUsersModal"
      title="Asignar Usuarios al Rol"
      size="xl"
    >
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
        <Button
          type="button"
          variant="secondary"
          @click="closeAssignUsersModal"
        >
          Cancelar
        </Button>
        <Button
          @click="assignUsers"
          :loading="loading"
        >
          {{ loading ? 'Asignando...' : 'Asignar Usuarios' }}
        </Button>
      </div>
    </Modal>

    <!-- Modal de Confirmación de Eliminación -->
    <Modal
      v-model="showDeleteRoleModal"
      title="Confirmar Eliminación"
      size="sm"
    >
      <p>¿Estás seguro de que deseas eliminar el rol "{{ selectedRole ? selectedRole.name : '' }}"?</p>
      <div class="mt-6 flex justify-end space-x-3">
        <Button
          variant="secondary"
          @click="closeDeleteRoleModal"
        >
          Cancelar
        </Button>
        <Button
          variant="danger"
          @click="confirmDeleteRole"
          :loading="loading"
        >
          {{ loading ? 'Eliminando...' : 'Eliminar' }}
        </Button>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import api from '@/plugins/axios';
import Button from '@/components/ui/Button.vue';
import Input from '@/components/ui/Input.vue';
import Modal from '@/components/ui/Modal.vue';
import type { Role, RoleForm } from '@/types/role';
import type { Permission } from '@/types/permission';
import type { User } from '@/types/user';

const roles = ref<Role[]>([]);
const users = ref<User[]>([]);
const showCreateRoleModal = ref(false);
const showAssignUsersModal = ref(false);
const showDeleteRoleModal = ref(false);
const editingRole = ref<Role | null>(null);
const selectedRole = ref<Role | null>(null);
const loading = ref(false);

const permissions = ref<Permission[]>([]);
const selectedUsers = ref<string[]>([]);

const roleForm = ref<RoleForm>({
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
    const response = await api.get<Role[]>('/roles');
    roles.value = response.data;
  } catch (error) {
    toast.error('Error al cargar los roles');
  }
};

const loadUsers = async () => {
  try {
    const response = await api.get<User[]>('/users');
    users.value = response.data;
  } catch (error) {
    toast.error('Error al cargar los usuarios');
  }
};

const loadPermissions = async () => {
  try {
    const response = await api.get<Permission[]>('/permissions');
    permissions.value = response.data;
  } catch (error) {
    toast.error('Error al cargar los permisos');
  }
};

const openCreateRoleModal = () => {
  editingRole.value = null;
  roleForm.value = { name: '', description: '', permissions: [] };
  showCreateRoleModal.value = true;
};

const closeCreateRoleModal = () => {
  showCreateRoleModal.value = false;
  editingRole.value = null;
  roleForm.value = { name: '', description: '', permissions: [] };
};

const editRole = (role: Role) => {
  editingRole.value = role;
  roleForm.value = {
    name: role.name,
    description: role.description,
    permissions: role.permissions?.map((p: Permission) => p.id) || [],
  };
  showCreateRoleModal.value = true;
};

const saveRole = async () => {
  loading.value = true;
  try {
    if (editingRole.value) {
      await api.put(`/roles/${editingRole.value.id}`, roleForm.value);
      toast.success('Rol actualizado correctamente');
    } else {
      await api.post('/roles', roleForm.value);
      toast.success('Rol creado correctamente');
    }
    closeCreateRoleModal();
    await loadRoles();
  } catch (error) {
    toast.error('Error al guardar el rol');
  } finally {
    loading.value = false;
  }
};

const deleteRole = (role: Role) => {
  selectedRole.value = role;
  showDeleteRoleModal.value = true;
};

const confirmDeleteRole = async () => {
  if (!selectedRole.value) return;
  
  loading.value = true;
  try {
    await api.delete(`/roles/${selectedRole.value.id}`);
    toast.success('Rol eliminado correctamente');
    closeDeleteRoleModal();
    await loadRoles();
  } catch (error) {
    toast.error('Error al eliminar el rol');
  } finally {
    loading.value = false;
  }
};

const closeDeleteRoleModal = () => {
  showDeleteRoleModal.value = false;
  selectedRole.value = null;
};

const assignUsersToRole = (role: Role) => {
  selectedRole.value = role;
  selectedUsers.value = [];
  showAssignUsersModal.value = true;
};

const assignUsers = async () => {
  if (!selectedRole.value) return;
  
  loading.value = true;
  try {
    await api.put(`/roles/${selectedRole.value.id}/users`, {
      userIds: selectedUsers.value,
    });
    toast.success('Usuarios asignados correctamente');
    closeAssignUsersModal();
    await loadRoles();
  } catch (error) {
    toast.error('Error al asignar usuarios');
  } finally {
    loading.value = false;
  }
};

const closeAssignUsersModal = () => {
  showAssignUsersModal.value = false;
  selectedRole.value = null;
  selectedUsers.value = [];
};
</script>
