import { defineStore } from 'pinia'
import type { StoreDefinition } from 'pinia'
import { ref } from 'vue'
import { Clerk } from '@clerk/clerk-js'

interface AuthState {
  clerk: Clerk | null
  isAuthenticated: boolean
  user: any
}

interface AuthStore extends AuthState {
  initialize: () => Promise<void>
  signOut: () => Promise<void>
}

export const useAuthStore: StoreDefinition<'auth', AuthState, {}, { initialize: () => Promise<void>; signOut: () => Promise<void> }> = defineStore('auth', () => {
  const clerk = ref<Clerk | null>(null)
  const isAuthenticated = ref(false)
  const user = ref<any>(null)

  async function initialize() {
    const clerkInstance = new Clerk(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY)
    await clerkInstance.load()
    clerk.value = clerkInstance

    // Suscribirse a cambios en la autenticación
    clerkInstance.addListener(({ user: newUser }) => {
      user.value = newUser
      isAuthenticated.value = !!newUser
    })
  }

  async function signOut() {
    if (clerk.value) {
      await clerk.value.signOut()
    }
  }

  return {
    clerk,
    isAuthenticated,
    user,
    initialize,
    signOut,
  }
}) 