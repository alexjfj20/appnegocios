<template>
  <Transition
    enter-active-class="transform ease-out duration-300 transition"
    enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
    enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
    leave-active-class="transition ease-in duration-100"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="modelValue"
      :class="[
        'fixed top-4 right-4 z-50 max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto',
        {
          'ring-1 ring-black ring-opacity-5': true,
        },
      ]"
    >
      <div class="p-4">
        <div class="flex items-start">
          <!-- Icono -->
          <div class="flex-shrink-0">
            <CheckCircleIcon
              v-if="type === 'success'"
              class="h-6 w-6 text-green-400"
            />
            <ExclamationCircleIcon
              v-else-if="type === 'error'"
              class="h-6 w-6 text-red-400"
            />
            <InformationCircleIcon
              v-else-if="type === 'info'"
              class="h-6 w-6 text-blue-400"
            />
            <ExclamationTriangleIcon
              v-else-if="type === 'warning'"
              class="h-6 w-6 text-yellow-400"
            />
          </div>

          <!-- Contenido -->
          <div class="ml-3 w-0 flex-1 pt-0.5">
            <p
              :class="[
                'text-sm font-medium',
                {
                  'text-green-800': type === 'success',
                  'text-red-800': type === 'error',
                  'text-blue-800': type === 'info',
                  'text-yellow-800': type === 'warning',
                },
              ]"
            >
              {{ title }}
            </p>
            <p
              v-if="message"
              class="mt-1 text-sm text-gray-500"
            >
              {{ message }}
            </p>
          </div>

          <!-- Botón de cierre -->
          <div class="ml-4 flex-shrink-0 flex">
            <button
              class="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              @click="$emit('update:modelValue', false)"
            >
              <span class="sr-only">Cerrar</span>
              <XMarkIcon class="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline';

defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  type: {
    type: String,
    default: 'info',
    validator: (value: string) =>
      ['success', 'error', 'info', 'warning'].includes(value),
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    default: '',
  },
});

defineEmits(['update:modelValue']);
</script> 