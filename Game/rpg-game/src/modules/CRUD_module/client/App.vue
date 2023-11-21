<script setup lang="ts">
import { onMounted, onUpdated } from 'vue';

import { RouterLink, RouterView, useRouter, useRoute } from 'vue-router';
import Navbar from './components/Navbar.vue';

var isMenuOpen = false;

const redirect = () => window.location.href = "http://localhost:3000";

const router = useRouter()
const route = useRoute()
let rpg;

onMounted(() => {
	rpg = document.querySelector("#rpg");
})

onUpdated(() => {
	if (route.name == "rpg-container") {
		document.querySelector("#rpg-container")?.append(rpg);
	}
})

// export default {
// 	name: 'CrudApp',
// 	inject: ['rpgGui'],
// 	data() {
// 		return {

// 		}
// 	},
// 	mounted() {

// 	},
// 	computed: {

// 	},
// 	unmounted() {

// 	},
// 	methods: {

// 	}
// }
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