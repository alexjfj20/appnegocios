<template>
  <div class="relative">
    <label
      v-if="label"
      :for="id"
      class="block text-sm font-medium text-gray-700 mb-1"
    >
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <!-- Select nativo para dispositivos móviles -->
    <select
      v-if="isMobile"
      :id="id"
      :value="modelValue"
      :disabled="disabled"
      :required="required"
      :class="[
        'block w-full rounded-md shadow-sm focus:ring-2 focus:ring-offset-2 transition-colors',
        {
          'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500': !error,
          'border-red-300 focus:border-red-500 focus:ring-red-500': error,
          'bg-gray-50 cursor-not-allowed': disabled,
        },
      ]"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>

    <!-- Select personalizado para escritorio -->
    <div v-else class="relative">
      <button
        type="button"
        :id="id"
        :disabled="disabled"
        :class="[
          'relative w-full bg-white rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors',
          {
            'border border-gray-300 focus:border-indigo-500 focus:ring-indigo-500': !error,
            'border border-red-300 focus:border-red-500 focus:ring-red-500': error,
            'bg-gray-50 cursor-not-allowed': disabled,
          },
        ]"
        @click="isOpen = !isOpen"
      >
        <span class="block truncate">
          {{ selectedLabel || placeholder }}
        </span>
        <span class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <ChevronUpDownIcon class="h-5 w-5 text-gray-400" />
        </span>
      </button>

      <!-- Lista de opciones -->
      <Transition
        enter-active-class="transition ease-out duration-100"
        enter-from-class="transform opacity-0 scale-95"
        enter-to-class="transform opacity-100 scale-100"
        leave-active-class="transition ease-in duration-75"
        leave-from-class="transform opacity-100 scale-100"
        leave-to-class="transform opacity-0 scale-95"
      >
        <div
          v-if="isOpen"
          class="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
        >
          <!-- Búsqueda -->
          <div v-if="searchable" class="px-3 py-2">
            <input
              type="text"
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              :placeholder="searchPlaceholder"
              v-model="searchQuery"
              @click.stop
            />
          </div>

          <!-- Opciones -->
          <template v-for="(group, index) in filteredOptions" :key="index">
            <!-- Grupo -->
            <div v-if="group.group" class="px-3 py-2">
              <div class="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {{ group.group }}
              </div>
            </div>

            <!-- Opciones del grupo -->
            <div
              v-for="option in group.options"
              :key="option.value"
              :class="[
                'cursor-default select-none relative py-2 pl-3 pr-9 hover:bg-indigo-50',
                {
                  'bg-indigo-50': isSelected(option.value),
                },
              ]"
              @click="selectOption(option)"
            >
              <span
                :class="[
                  'block truncate',
                  {
                    'font-semibold': isSelected(option.value),
                    'font-normal': !isSelected(option.value),
                  },
                ]"
              >
                {{ option.label }}
              </span>
              <span
                v-if="isSelected(option.value)"
                class="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600"
              >
                <CheckIcon class="h-5 w-5" />
              </span>
            </div>
          </template>

          <!-- Sin resultados -->
          <div
            v-if="filteredOptions.length === 0"
            class="px-3 py-2 text-sm text-gray-500"
          >
            {{ noResultsText }}
          </div>
        </div>
      </Transition>
    </div>

    <!-- Mensajes de error y ayuda -->
    <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>
    <p v-if="hint" class="mt-1 text-sm text-gray-500">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/vue/24/outline';

interface Option {
  value: string | number;
  label: string;
  group?: string;
}

interface Props {
  id: string;
  modelValue: string | number | (string | number)[];
  options: Option[];
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  hint?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  noResultsText?: string;
  multiple?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Seleccionar...',
  searchPlaceholder: 'Buscar...',
  noResultsText: 'No se encontraron resultados',
  searchable: false,
  multiple: false,
});

const emit = defineEmits(['update:modelValue']);

// Estado
const isOpen = ref(false);
const searchQuery = ref('');
const isMobile = ref(false);

// Computed
const filteredOptions = computed(() => {
  if (!props.searchable || !searchQuery.value) {
    return props.options;
  }

  const query = searchQuery.value.toLowerCase();
  return props.options.filter((option) =>
    option.label.toLowerCase().includes(query)
  );
});

const selectedLabel = computed(() => {
  if (props.multiple) {
    const selected = props.options.filter((option) =>
      (props.modelValue as (string | number)[]).includes(option.value)
    );
    return selected.map((option) => option.label).join(', ');
  }

  const selected = props.options.find(
    (option) => option.value === props.modelValue
  );
  return selected?.label;
});

// Métodos
const isSelected = (value: string | number) => {
  if (props.multiple) {
    return (props.modelValue as (string | number)[]).includes(value);
  }
  return props.modelValue === value;
};

const selectOption = (option: Option) => {
  if (props.multiple) {
    const currentValue = [...(props.modelValue as (string | number)[])];
    const index = currentValue.indexOf(option.value);
    if (index === -1) {
      currentValue.push(option.value);
    } else {
      currentValue.splice(index, 1);
    }
    emit('update:modelValue', currentValue);
  } else {
    emit('update:modelValue', option.value);
    isOpen.value = false;
  }
};

// Detectar dispositivo móvil
const checkMobile = () => {
  isMobile.value = window.innerWidth < 640;
};

onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
  document.addEventListener('click', (e) => {
    if (isOpen.value) {
      isOpen.value = false;
    }
  });
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
});
</script> 