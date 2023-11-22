<script lang="ts">
import { onMounted, onUpdated } from 'vue';

import { RouterLink, RouterView, useRouter, useRoute } from 'vue-router';
import Navbar from './components/Navbar.vue';

import { RpgClient, RpgModule, RpgGui, RpgClientEngineHooks, RpgClientEngine } from '@rpgjs/client';
import { inject } from 'vue';

var isMenuOpen = false;

const redirect = () => window.location.href = "http://localhost:3000";

const router = useRouter()
const route = useRoute()
let rpg;


export default {
	name: 'CrudApp',
	inject: ['rpgGui'],
	data() {
		return {

		}
	},
	mounted() {
		this.moveParent()
	},
	computed: {

	},
	unmounted() {

	},
	methods: {
		moveParent() {
			// Get the parent element
			const parentElement = this.$el;
			// Move the parent element to a new location in the DOM
			const newLocation = document.getElementById('app');

			newLocation?.prepend(parentElement);
		},
	}
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