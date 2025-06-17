import { defineStore } from 'pinia';
import { ref } from 'vue';

interface Store {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  theme?: {
    primaryColor: string;
    secondaryColor: string;
  };
}

export const useStore = defineStore('store', () => {
  const currentStore = ref<Store | null>(null);
  const stores = ref<Store[]>([]);
  const loading = ref(false);

  // Cargar tienda actual
  const loadCurrentStore = async (storeId?: string) => {
    try {
      loading.value = true;
      // Aquí iría la llamada a la API para cargar la tienda
      // Por ahora usamos datos de ejemplo
      currentStore.value = {
        id: storeId || '1',
        name: 'Mi Tienda',
        slug: 'mi-tienda',
        description: 'Descripción de la tienda',
        theme: {
          primaryColor: '#3B82F6',
          secondaryColor: '#1F2937'
        }
      };
    } catch (error) {
      console.error('Error al cargar la tienda:', error);
    } finally {
      loading.value = false;
    }
  };

  // Cargar todas las tiendas del usuario
  const loadStores = async () => {
    try {
      loading.value = true;
      // Aquí iría la llamada a la API para cargar las tiendas
      // Por ahora usamos datos de ejemplo
      stores.value = [
        {
          id: '1',
          name: 'Mi Tienda',
          slug: 'mi-tienda',
          description: 'Descripción de la tienda'
        }
      ];
    } catch (error) {
      console.error('Error al cargar las tiendas:', error);
    } finally {
      loading.value = false;
    }
  };

  // Cambiar tienda actual
  const setCurrentStore = (store: Store) => {
    currentStore.value = store;
  };

  return {
    currentStore,
    stores,
    loading,
    loadCurrentStore,
    loadStores,
    setCurrentStore
  };
}); 