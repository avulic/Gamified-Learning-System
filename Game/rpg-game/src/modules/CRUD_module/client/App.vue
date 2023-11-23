<script lang="ts">
export default {
	name: 'CrudApp',
	inheritAttrs: false,
	customOptions: {}
}
</script>
<script setup lang="ts">
import { onMounted, onUpdated, onBeforeMount } from 'vue';
import { RouterLink, RouterView, useRouter, useRoute } from 'vue-router';

import Navbar from './components/Navbar.vue';

import { RpgClient, RpgModule, RpgGui, RpgClientEngineHooks, RpgClientEngine } from '@rpgjs/client';
import { inject } from 'vue';

var isMenuOpen = false;


onBeforeMount(() => {
	hideRpg();
});

const hideRpg = () => {
	var rpg = document.getElementById('rpg');
	rpg!.style.display = 'none';
}
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