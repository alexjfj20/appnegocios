<template>
  <OnboardingLayout>
    <form @submit.prevent="nextStep" class="space-y-6">
      <div>
        <label class="block text-sm font-medium mb-1">Correo electrónico</label>
        <input v-model="email" type="email" class="input" required />
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">Nombre del negocio</label>
        <input v-model="businessName" type="text" class="input" required />
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">Categoría</label>
        <select v-model="category" class="input" required>
          <option value="">Selecciona una categoría</option>
          <option value="ropa">Ropa</option>
          <option value="comida">Comida</option>
          <option value="tecnologia">Tecnología</option>
          <option value="belleza">Belleza</option>
          <option value="otros">Otros</option>
        </select>
      </div>
      <button class="btn btn-primary w-full" type="submit">Siguiente</button>
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

const email = ref(onboarding.email)
const businessName = ref(onboarding.businessName)
const category = ref(onboarding.category)

function nextStep() {
  onboarding.setStep1({
    email: email.value,
    businessName: businessName.value,
    category: category.value,
  })
  router.push({ name: 'onboarding-step2' })
}
</script> 