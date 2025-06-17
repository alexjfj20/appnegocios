import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/Home.vue'),
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/Dashboard.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/products',
      name: 'products',
      component: () => import('@/views/Products.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/store/:slug',
      name: 'store',
      component: () => import('@/views/Store.vue'),
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/Settings.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/onboarding',
      component: () => import('@/views/onboarding/OnboardingLayout.vue'),
      children: [
        {
          path: '',
          redirect: { name: 'onboarding-step1' },
        },
        {
          path: 'paso-1',
          name: 'onboarding-step1',
          component: () => import('@/views/onboarding/Step1Register.vue'),
        },
        {
          path: 'paso-2',
          name: 'onboarding-step2',
          component: () => import('@/views/onboarding/Step2Personalize.vue'),
        },
        {
          path: 'paso-3',
          name: 'onboarding-step3',
          component: () => import('@/views/onboarding/Step3FirstProduct.vue'),
        },
      ],
    },
    {
      path: '/order-confirmation/:id',
      name: 'order-confirmation',
      component: () => import('@/views/OrderConfirmation.vue'),
    },
    {
      path: '/orders',
      name: 'orders',
      component: () => import('@/views/Orders.vue'),
    },
  ],
})

// Guardia de navegación
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'home' })
  } else {
    next()
  }
})

export default router 