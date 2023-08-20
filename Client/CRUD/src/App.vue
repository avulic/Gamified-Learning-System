<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import Navbar from './components/Navbar.vue';

var isMenuOpen = false

const redirect = () => window.location.href = "http://localhost:3000"
</script>

<template>
  <div class="flex flex-col h-screen">

    <header class="bg-gray-800 text-white py-4 px-8 items-center">
      <Navbar />
    </header>

    <div class="bg-gray-100 p-8 items-center justify-center">
      <RouterView />
    </div>

  </div>
</template>