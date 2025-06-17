<template>
  <Transition
    enter-active-class="ease-out duration-300"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="ease-in duration-200"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 overflow-y-auto"
      @click="closeOnBackdrop && $emit('update:modelValue', false)"
    >
      <!-- Fondo oscuro -->
      <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>

      <!-- Contenido del modal -->
      <div class="flex min-h-full items-center justify-center p-4">
        <div
          :class="[
            'relative bg-white rounded-lg shadow-xl transform transition-all',
            {
              'max-w-sm': size === 'sm',
              'max-w-md': size === 'md',
              'max-w-lg': size === 'lg',
              'max-w-2xl': size === 'xl',
            },
          ]"
          @click.stop
        >
          <!-- Encabezado -->
          <div
            v-if="$slots.header || title"
            class="px-6 py-4 border-b border-gray-200 flex items-center justify-between"
          >
            <slot name="header">
              <h3 class="text-lg font-medium text-gray-900">{{ title }}</h3>
            </slot>
            <button
              v-if="closeable"
              class="text-gray-400 hover:text-gray-500 focus:outline-none"
              @click="$emit('update:modelValue', false)"
            >
              <span class="sr-only">Cerrar</span>
              <svg
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <!-- Contenido -->
          <div class="px-6 py-4">
            <slot></slot>
          </div>

          <!-- Pie -->
          <div
            v-if="$slots.footer"
            class="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg"
          >
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    default: '',
  },
  size: {
    type: String,
    default: 'md',
    validator: (value: string) => ['sm', 'md', 'lg', 'xl'].includes(value),
  },
  closeable: {
    type: Boolean,
    default: true,
  },
  closeOnBackdrop: {
    type: Boolean,
    default: true,
  },
});

defineEmits(['update:modelValue']);
</script> 