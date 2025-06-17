import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export const useOnboardingStore = defineStore('onboarding', () => {
  // Paso 1
  const email = ref('')
  const businessName = ref('')
  const category = ref('')
  // Paso 2
  const logoFile = ref<File | null>(null)
  const color = ref('#2563eb')
  const phone = ref('')
  const whatsapp = ref('')
  // Paso 3
  const productName = ref('')
  const description = ref('')
  const price = ref(0)
  const productImageFile = ref<File | null>(null)

  function setStep1(data: { email: string; businessName: string; category: string }) {
    email.value = data.email
    businessName.value = data.businessName
    category.value = data.category
  }

  function setStep2(data: { logoFile: File | null; color: string; phone: string; whatsapp: string }) {
    logoFile.value = data.logoFile
    color.value = data.color
    phone.value = data.phone
    whatsapp.value = data.whatsapp
  }

  function setStep3(data: { productName: string; description: string; price: number; productImageFile: File | null }) {
    productName.value = data.productName
    description.value = data.description
    price.value = data.price
    productImageFile.value = data.productImageFile
  }

  async function submitOnboarding() {
    // Subir logo y producto a Cloudinary (opcional: hacerlo en backend)
    let logoUrl = ''
    let productImageUrl = ''
    if (logoFile.value) {
      const formData = new FormData()
      formData.append('file', logoFile.value)
      formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET)
      const res = await axios.post(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`, formData)
      logoUrl = res.data.secure_url
    }
    if (productImageFile.value) {
      const formData = new FormData()
      formData.append('file', productImageFile.value)
      formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET)
      const res = await axios.post(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`, formData)
      productImageUrl = res.data.secure_url
    }
    // Enviar datos al backend
    await axios.post(`${import.meta.env.VITE_API_URL}/api/onboarding`, {
      email: email.value,
      businessName: businessName.value,
      category: category.value,
      logoUrl,
      color: color.value,
      phone: phone.value,
      whatsapp: whatsapp.value,
      product: {
        name: productName.value,
        description: description.value,
        price: price.value,
        imageUrl: productImageUrl,
      },
    })
  }

  return {
    email, businessName, category,
    logoFile, color, phone, whatsapp,
    productName, description, price, productImageFile,
    setStep1, setStep2, setStep3, submitOnboarding,
  }
}) 