<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import Navbar from '@/features/common/components/Navbar.vue';

var isMenuOpen = false


const toggle = () => {
  document.documentElement.classList.toggle('dark')
  localStorage.theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

</script>

<template>
  <div class="min-h-screen bg-app-bg text-app-text flex flex-col">
    <header class="bg-app-bg shadow-md">
      <Navbar />
    </header>

    <main class="flex-1 p-8">
      <RouterView v-slot="{ Component }">
        <Transition name="fade" persisted>
          <component :is="Component" :key="$route.fullPath" />
        </Transition>
      </RouterView>
    </main>
  </div>
</template>
