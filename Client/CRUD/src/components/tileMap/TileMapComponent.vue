//made by: https://github.com/steel97/vue3-pixi-tilemap/blob/master/src/components/PixiTilemap.vue

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
import * as PIXI from "pixi.js";
import { CompositeTilemap } from "@pixi/tilemap";
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

const overlay = ref<HTMLElement | null>(null);
const loadingProgress = ref(0.0);
const loadingPercent = computed(() => `${loadingProgress.value * 100}%`);
const loaded = computed(() => loadingProgress.value >= 1.0);

let active = true;
let frame = 0;

const assetUrls = {
	grass: '/assets/grass.png',
	tough: '/assets/tough.png',
	atlas: '/assets/atlas.json',
	button: '/assets/button.png',
	brick: '/assets/brick.png',
	brick_wall: '/assets/brick_wall.png',
	chest: '/assets/chest.png',
};


const loadAssets = async () => {
	try {
		const totalAssets = Object.keys(assetUrls).length;
		let loadedAssets = 0;

		const loadedTextures: Record<string, PIXI.Texture | PIXI.Spritesheet> = {};

		for (const [key, url] of Object.entries(assetUrls)) {
			const asset = await PIXI.Assets.load(url);
			loadedTextures[key] = asset;
			loadedAssets++;
			loadingProgress.value = loadedAssets / totalAssets;
		}

		console.log('Assets loaded successfully:', loadedTextures);
		return loadedTextures;
	} catch (error) {
		console.error('Error loading assets:', error);
		throw error;
	}
};

const buildTilemap = (tilemap: CompositeTilemap, assets: Record<string, PIXI.Texture | PIXI.Spritesheet>) => {
	try {
		tilemap.clear();
		const size = 32;

		const grassTexture = assets.grass as PIXI.Texture;
		const toughTexture = assets.tough as PIXI.Texture;

		if (!grassTexture || !toughTexture) {
			throw new Error("Grass or tough textures are not available.");
		}

		for (let i = 0; i < 7; i++) {
			for (let j = 0; j < 5; j++) {
				tilemap.tile(grassTexture, i * size, j * size);

				if (i % 2 === 1 && j % 2 === 1) {
					tilemap.tile(toughTexture, i * size, j * size);
				}
			}
		}

		const atlasSprites = assets.atlas as PIXI.Spritesheet;
		if (atlasSprites && atlasSprites.textures) {
			tilemap.tile(atlasSprites.textures['brick.png'], 2 * size, 2 * size);
			tilemap.tile(atlasSprites.textures['brick_wall.png'], 2 * size, 3 * size, { alpha: 0.6 });
			tilemap.tile(atlasSprites.textures['chest.png'], 4 * size, 4 * size).tileAnimX(34, 2);
			tilemap.tile(atlasSprites.textures['chest.png'], 8 * size, 4 * size, { animX: 34, animCountX: 2, animDivisor: 6 });
		} else {
			console.warn("Atlas textures are not available.");
		}

		const buttonTexture = assets.button as PIXI.Texture;
		if (buttonTexture) {
			tilemap.tile(buttonTexture, 6 * size, 2 * size);
		}

		const origTex = atlasSprites.textures['chest.png'];

		if (origTex) {
			for (let i = 0; i < 8; i++) {
				const frame = origTex.frame.clone();
				const orig = origTex.orig.clone();
				const trim = origTex.orig.clone();
				const rotate = i * 2;

				if (rotate % 4 === 2) {
					orig.width = frame.height;
					orig.height = frame.width;
				}

				const tmpTex = new PIXI.Texture({ source: origTex.source, frame, orig, trim, rotate });

				tilemap.tile(tmpTex, (i % 4) * size, (Math.floor(i / 4) * size) + (5 * size));
			}
		}
	} catch (error) {
		console.error('Error building tilemap:', error);
		throw error;
	}
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const runAnimations = async (tilemap: CompositeTilemap) => {
	while (active) {
		await sleep(100);
		tilemap.tileAnim = [frame, frame];
		frame++;
	}
};

const handleTileClick = (event: MouseEvent, tilemap: CompositeTilemap) => {
	const rect = (event.currentTarget as HTMLCanvasElement).getBoundingClientRect();
	const x = event.clientX - rect.left;
	const y = event.clientY - rect.top;
	const tileSize = 32;

	const tileX = Math.floor(x / tileSize);
	const tileY = Math.floor(y / tileSize);

	console.log(`Clicked tile coordinates: (${tileX}, ${tileY})`);
};

onBeforeUnmount(() => active = false);
onMounted(async () => {
	if (!overlay.value) {
		console.error("Overlay is null!");
		return;
	}

	try {
		const assets = await loadAssets();


		const pixiApp = new PIXI.Application();

		await pixiApp.init({
			resolution: window.devicePixelRatio || 1,
			autoDensity: true,
			width: overlay.value.clientWidth,
			height: overlay.value.clientHeight,
			antialias: false,
			premultipliedAlpha: true,
			backgroundAlpha: 0,
			backgroundColor: 0x000,
			resizeTo: overlay.value,
			clearBeforeRender: true,
			powerPreference: "high-performance",
		});

		//document.body.appendChild(app.canvas);

		const tilemap = new CompositeTilemap();
		pixiApp.stage.addChild(tilemap);

		buildTilemap(tilemap, assets);


		if (pixiApp.view instanceof HTMLCanvasElement) {
			pixiApp.view.addEventListener("click", (event: MouseEvent) => {
				handleTileClick(event, tilemap);
			});
			overlay.value.appendChild(pixiApp.view as any as Node);
		} else {
			console.error("PixiJS view is not a HTMLCanvasElement");
		}

		pixiApp.resize();

		runAnimations(tilemap);
	} catch (error) {
		console.error("Error in onMounted:", error);
		// Handle the error appropriately (e.g., show an error message to the user)
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
	max-width: 500px;
	margin: 0 auto;
}

.overlay {
	width: 100%;
	height: 500px;
}
</style>