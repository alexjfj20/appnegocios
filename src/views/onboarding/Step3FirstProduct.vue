<template>
  <OnboardingLayout>
    <form @submit.prevent="finishOnboarding" class="space-y-6">
      <div>
        <label class="block text-sm font-medium mb-1">Nombre del producto</label>
        <input v-model="productName" type="text" class="input" required />
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">Descripción</label>
        <textarea v-model="description" class="input" required></textarea>
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">Precio</label>
        <input v-model.number="price" type="number" min="0" class="input" required />
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">Imagen del producto</label>
        <input type="file" accept="image/*" class="input" @change="onFileChange" />
        <div v-if="imageUrl" class="mt-2">
          <img :src="imageUrl" alt="Preview" class="h-20 rounded-xl border" />
        </div>
      </div>
      <button class="btn btn-success w-full" type="submit">¡Activar mi tienda!</button>
    </form>
  </OnboardingLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useOnboardingStore } from '@/stores/onboarding'
import OnboardingLayout from './OnboardingLayout.vue'

const router = useRouter()
const onboarding = useOnboardingStore()

const productName = ref(onboarding.productName)
const description = ref(onboarding.description)
const price = ref(onboarding.price)
const imageUrl = ref<string | null>(null)
const productImageFile = ref<File | null>(onboarding.productImageFile)
const loading = ref(false)
const error = ref('')

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    productImageFile.value = file
    imageUrl.value = URL.createObjectURL(file)
  }
}

async function finishOnboarding() {
  onboarding.setStep3({
    productName: productName.value,
    description: description.value,
    price: price.value,
    productImageFile: productImageFile.value,
  })
  loading.value = true
  error.value = ''
  try {
    await onboarding.submitOnboarding()
    router.push({ name: 'dashboard' })
  } catch (e: any) {
    error.value = 'Hubo un error al crear la tienda. Intenta de nuevo.'
  } finally {
    loading.value = false
  }
}
</script> 