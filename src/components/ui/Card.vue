<template>
  <div
    :class="[
      'bg-white rounded-lg shadow',
      {
        'border border-gray-200': bordered,
        'hover:shadow-lg transition-shadow': hoverable,
      },
    ]"
  >
    <!-- Encabezado -->
    <div
      v-if="$slots.header || title"
      class="px-6 py-4 border-b border-gray-200"
    >
      <slot name="header">
        <h3 class="text-lg font-medium text-gray-900">{{ title }}</h3>
      </slot>
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
</template>

<script setup lang="ts">
defineProps({
  title: {
    type: String,
    default: '',
  },
  bordered: {
    type: Boolean,
    default: false,
  },
  hoverable: {
    type: Boolean,
    default: false,
  },
});
</script> 