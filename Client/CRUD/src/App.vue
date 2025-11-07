<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import Navbar from './components/Navbar.vue';

var isMenuOpen = false

const redirect = () => window.location.href = "http://localhost:3000"


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
      <RouterView />
    </main>
  </div>
</template>
