<template>
  <button
    :class="[
      'inline-flex items-center justify-center px-4 py-2 border rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors',
      // Variantes
      {
        'bg-indigo-600 text-white border-transparent hover:bg-indigo-700 focus:ring-indigo-500': variant === 'primary',
        'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 focus:ring-indigo-500': variant === 'secondary',
        'bg-red-600 text-white border-transparent hover:bg-red-700 focus:ring-red-500': variant === 'danger',
        'bg-green-600 text-white border-transparent hover:bg-green-700 focus:ring-green-500': variant === 'success',
      },
      // Tamaños
      {
        'text-sm': size === 'sm',
        'text-base': size === 'md',
        'text-lg': size === 'lg',
      },
      // Estados
      {
        'opacity-50 cursor-not-allowed': disabled,
        'cursor-pointer': !disabled,
      },
    ]"
    :disabled="disabled || loading"
    v-bind="$attrs"
  >
    <svg
      v-if="loading"
      class="animate-spin -ml-1 mr-2 h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      ></circle>
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value: string) => ['primary', 'secondary', 'danger', 'success'].includes(value),
  },
  size: {
    type: String,
    default: 'md',
    validator: (value: string) => ['sm', 'md', 'lg'].includes(value),
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});
</script> 