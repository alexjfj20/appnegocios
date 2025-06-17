<template>
  <OnboardingLayout>
    <form @submit.prevent="nextStep" class="space-y-6">
      <div>
        <label class="block text-sm font-medium mb-1">Logo del negocio</label>
        <input type="file" accept="image/*" class="input" @change="onFileChange" />
        <div v-if="logoUrl" class="mt-2">
          <img :src="logoUrl" alt="Logo preview" class="h-16 rounded-xl border" />
        </div>
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">Color principal</label>
        <input v-model="color" type="color" class="input w-16 h-10 p-0" />
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">Teléfono de contacto</label>
        <input v-model="phone" type="tel" class="input" />
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">WhatsApp</label>
        <input v-model="whatsapp" type="tel" class="input" />
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

const logoUrl = ref<string | null>(null)
const logoFile = ref<File | null>(onboarding.logoFile)
const color = ref(onboarding.color)
const phone = ref(onboarding.phone)
const whatsapp = ref(onboarding.whatsapp)

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    logoFile.value = file
    logoUrl.value = URL.createObjectURL(file)
  }
}

function nextStep() {
  onboarding.setStep2({
    logoFile: logoFile.value,
    color: color.value,
    phone: phone.value,
    whatsapp: whatsapp.value,
  })
  router.push({ name: 'onboarding-step3' })
}
</script> 