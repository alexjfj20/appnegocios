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
    <input
      :id="id"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
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
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      v-bind="$attrs"
    />
    <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>
    <p v-if="hint" class="mt-1 text-sm text-gray-500">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps({
  id: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: 'text',
    validator: (value: string) =>
      ['text', 'email', 'password', 'number', 'tel', 'url'].includes(value),
  },
  modelValue: {
    type: [String, Number],
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  required: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: '',
  },
  hint: {
    type: String,
    default: '',
  },
});

defineEmits(['update:modelValue']);
</script> 