<template>
  <div class="min-h-screen">
    <!-- Hero Section -->
    <section class="bg-gradient-to-b from-primary to-primary-dark text-white">
      <div class="container mx-auto px-4 py-20">
        <div class="max-w-3xl mx-auto text-center">
          <h1 class="text-4xl md:text-6xl font-bold mb-6">
            Tu Tienda Online en Minutos
          </h1>
          <p class="text-xl md:text-2xl mb-8 text-gray-100">
            Crea tu tienda online profesional sin conocimientos técnicos y empieza a vender hoy mismo.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <button class="btn btn-success text-lg px-8 py-3">
              Comenzar Gratis
            </button>
            <button class="btn bg-white text-primary hover:bg-gray-100 text-lg px-8 py-3">
              Ver Demo
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-20 bg-gray-50">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl md:text-4xl font-bold text-center mb-12">
          Todo lo que necesitas para vender online
        </h2>
        <div class="grid md:grid-cols-3 gap-8">
          <div class="card">
            <div class="text-primary mb-4">
              <ShoppingCart class="w-12 h-12" />
            </div>
            <h3 class="text-xl font-semibold mb-2">Tienda Profesional</h3>
            <p class="text-gray-600">
              Diseño moderno y responsive que se adapta a todos los dispositivos.
            </p>
          </div>
          <div class="card">
            <div class="text-primary mb-4">
              <MessageSquare class="w-12 h-12" />
            </div>
            <h3 class="text-xl font-semibold mb-2">Integración WhatsApp</h3>
            <p class="text-gray-600">
              Recibe pedidos directamente en tu WhatsApp de forma automática.
            </p>
          </div>
          <div class="card">
            <div class="text-primary mb-4">
              <BarChart class="w-12 h-12" />
            </div>
            <h3 class="text-xl font-semibold mb-2">Analytics</h3>
            <p class="text-gray-600">
              Estadísticas detalladas de tus ventas y visitantes.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing Section -->
    <section class="py-20">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl md:text-4xl font-bold text-center mb-12">
          Planes que se adaptan a tu negocio
        </h2>
        <div class="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div class="card border-2 border-gray-200">
            <h3 class="text-2xl font-bold mb-4">Gratis</h3>
            <p class="text-4xl font-bold mb-6">$0<span class="text-lg text-gray-500">/mes</span></p>
            <ul class="space-y-4 mb-8">
              <li class="flex items-center">
                <Check class="w-5 h-5 text-success mr-2" />
                5 productos
              </li>
              <li class="flex items-center">
                <Check class="w-5 h-5 text-success mr-2" />
                Tienda básica
              </li>
              <li class="flex items-center">
                <Check class="w-5 h-5 text-success mr-2" />
                Soporte por email
              </li>
            </ul>
            <button class="btn btn-primary w-full">Comenzar</button>
          </div>
          <div class="card border-2 border-primary relative">
            <div class="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm">
              Más Popular
            </div>
            <h3 class="text-2xl font-bold mb-4">Pro</h3>
            <p class="text-4xl font-bold mb-6">$29<span class="text-lg text-gray-500">/mes</span></p>
            <ul class="space-y-4 mb-8">
              <li class="flex items-center">
                <Check class="w-5 h-5 text-success mr-2" />
                100 productos
              </li>
              <li class="flex items-center">
                <Check class="w-5 h-5 text-success mr-2" />
                Tienda personalizada
              </li>
              <li class="flex items-center">
                <Check class="w-5 h-5 text-success mr-2" />
                Soporte prioritario
              </li>
            </ul>
            <button class="btn btn-primary w-full">Comenzar</button>
          </div>
          <div class="card border-2 border-gray-200">
            <h3 class="text-2xl font-bold mb-4">Premium</h3>
            <p class="text-4xl font-bold mb-6">$79<span class="text-lg text-gray-500">/mes</span></p>
            <ul class="space-y-4 mb-8">
              <li class="flex items-center">
                <Check class="w-5 h-5 text-success mr-2" />
                Productos ilimitados
              </li>
              <li class="flex items-center">
                <Check class="w-5 h-5 text-success mr-2" />
                Tienda avanzada
              </li>
              <li class="flex items-center">
                <Check class="w-5 h-5 text-success mr-2" />
                Soporte 24/7
              </li>
            </ul>
            <button class="btn btn-primary w-full">Comenzar</button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ShoppingCart, MessageSquare, BarChart, Check } from 'lucide-vue-next'
</script> 