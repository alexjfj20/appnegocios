<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gray-50">
    <div class="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
      <div class="mb-8">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-primary">Paso {{ step }} de 3</span>
          <span class="text-xs text-gray-400">Onboarding</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div class="bg-primary h-2 rounded-full transition-all duration-300" :style="{ width: `${(step/3)*100}%` }"></div>
        </div>
      </div>
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const step = computed(() => {
  if (route.name === 'onboarding-step1') return 1
  if (route.name === 'onboarding-step2') return 2
  if (route.name === 'onboarding-step3') return 3
  return 1
})
</script> 