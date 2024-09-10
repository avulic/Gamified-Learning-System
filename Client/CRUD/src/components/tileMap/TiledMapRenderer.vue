<template>
	<div class="wrap">
		<div class="overlay" ref="overlay" v-show="loaded"></div>
		<div v-show="!loaded">
			<div class="progress-bar">
				<div class="progress-inner" :style="{ width: loadingPercent }"></div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { TiledParser, MapClass } from './tile/tiled/src'; // Update this path
import { MapRenderer } from './tile/tiled/src/generate/MapRenderer'; // Make sure to import the updated MapRenderer class

const overlay = ref<HTMLElement | null>(null);
const loadingProgress = ref(0.0);
const loadingPercent = computed(() => `${loadingProgress.value * 100}%`);
const loaded = computed(() => loadingProgress.value >= 1.0);

let mapRenderer: MapRenderer;

const tmxPath = '/assets/maps/myMap1.tmx';

const loadTMXMap = async () => {
	try {
		const response = await fetch(tmxPath);
		if (!response.ok) {
			throw new Error(`Failed to load TMX file: ${response.statusText}`);
		}
		const tmxData = await response.text();
		const parser = new TiledParser(tmxData, window.location.origin);
		const parsedMap = parser.parseMap();
		const map = new MapClass(parsedMap);
		return map;
	} catch (error) {
		console.error('Error loading TMX map:', error);
		throw error;
	}
};

onMounted(async () => {
	if (!overlay.value) {
		console.error("Overlay is null!");
		return;
	}

	try {
		const map = await loadTMXMap();
		loadingProgress.value = 0.3;

		// Create MapRenderer instance
		mapRenderer = new MapRenderer(map);

		// Initialize the MapRenderer
		await mapRenderer.init(overlay.value.clientWidth, overlay.value.clientHeight);

		loadingProgress.value = 0.6;

		// Add the rendered map to the overlay
		overlay.value.appendChild(mapRenderer.getView());

		loadingProgress.value = 1.0;

		// Start the update loop
		const updateLoop = (time: number) => {
			mapRenderer.update(time);
			requestAnimationFrame(updateLoop);
		};
		requestAnimationFrame(updateLoop);

	} catch (error) {
		console.error("Error in onMounted:", error);
		// Handle the error appropriately (e.g., show an error message to the user)
	}
});

onBeforeUnmount(() => {
	if (mapRenderer) {
		mapRenderer['app'].destroy(true);
	}
});
</script>

<style scoped>
.progress-bar {
	width: 100%;
	height: 10px;
	background: gray;
}

.progress-inner {
	height: 100%;
	background: red;
	transition: width 0.2s;
}

.wrap {
	margin: 0 auto;
}

.overlay {
	width: 100%;
	height: 100%;
}
</style>