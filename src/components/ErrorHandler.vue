<template>
  <div class="fixed inset-0 z-50 pointer-events-none">
    <!-- Notificaciones -->
    <div class="fixed top-4 right-4 space-y-4">
      <TransitionGroup
        enter-active-class="transform ease-out duration-300 transition"
        enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
        enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
        leave-active-class="transition ease-in duration-100"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <Notification
          v-for="notification in notifications"
          :key="notification.id"
          :type="notification.type"
          :title="notification.message"
          :modelValue="true"
          @update:model-value="removeNotification(notification.id)"
        />
      </TransitionGroup>
    </div>

    <!-- Errores -->
    <div class="fixed bottom-4 right-4 space-y-4">
      <TransitionGroup
        enter-active-class="transform ease-out duration-300 transition"
        enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
        enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
        leave-active-class="transition ease-in duration-100"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-for="error in errors"
          :key="error"
          class="bg-red-50 border-l-4 border-red-400 p-4 rounded-md shadow-lg pointer-events-auto"
        >
          <div class="flex">
            <div class="flex-shrink-0">
              <ExclamationCircleIcon class="h-5 w-5 text-red-400" />
            </div>
            <div class="ml-3">
              <p class="text-sm text-red-700">{{ error }}</p>
            </div>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useErrorStore } from '@/stores/error';
import { ExclamationCircleIcon } from '@heroicons/vue/24/outline';
import Notification from './ui/Notification.vue';

const errorStore = useErrorStore();
const { errors, notifications } = storeToRefs(errorStore);
const { removeNotification } = errorStore;
</script> 