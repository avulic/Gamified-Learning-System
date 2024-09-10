<template>
    <div class="wrap">
        <div class="overlay" ref="overlay" v-show="loaded"></div>
        <div v-show="!loaded">
            <div class="progress-bar">
                <div class="progress-inner" :style="{ width: loadingPercent }"></div>
            </div>

        </div>
    </div>
    <div class="sendEvent">
        <Button @click="saveMapChanges" icon="pi pi-trash" outlined rounded severity="danger">SendEvent</Button>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import * as PIXI from 'pixi.js';
import { CompositeTilemap } from '@pixi/tilemap';
import { TiledParser, MapClass, TiledTileset, Tileset, TiledLayerType, TiledLayer } from './tile/tiled/src'; // Update this path
// On the client side (Vue component)

// import { useSocketIO } from '@/socket.io'
// const { socket } = useSocketIO();

import { ServerToClientEvents, ClientToServerEvents } from '@/types/socket';
import { get, post, put, del } from '@/services/ApiService';

const overlay = ref<HTMLElement | null>(null);
const loadingProgress = ref(0.0);
const loadingPercent = computed(() => `${loadingProgress.value * 100}%`);
const loaded = computed(() => loadingProgress.value >= 1.0);

let pixiApp: PIXI.Application = new PIXI.Application();
let tilemap: CompositeTilemap;

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

const loadTSX = async (source: string) => {
    const response = await fetch(source);
    if (!response.ok) {
        throw new Error(`Failed to load TSX file: ${response.statusText}`);
    }
    const tsxData = await response.text();
    const parser = new TiledParser(tsxData, window.location.origin);
    return parser.parseTileset();
};

const convertTiledTilesetToTileset = (tiledTileset: TiledTileset, firstgid: number): Tileset => {
    const tileset = new Tileset(tiledTileset);
    tileset.firstgid = firstgid;

    if (tiledTileset.tiles) {
        tiledTileset.tiles.forEach(tile => {
            tileset.addTile(tile);
        });
    }

    return tileset;
}


const loadTilesets = async (map: MapClass) => {
    const tilesets: Record<number, { texture: PIXI.Texture, tileWidth: number, tileHeight: number }> = {};
    for (const tileset of map.tilesets) {
        try {
            let tilesetData = tileset;
            if (tileset.source) {
                const tiledTileset = await loadTSX(tileset.source);
                tilesetData = convertTiledTilesetToTileset(tiledTileset, tileset.firstgid);
                Object.assign(tileset, tilesetData);
            }
            if (tilesetData.image) {
                const imageUrl = new URL(tilesetData.image.source, window.location.origin).href;
                const texture = await PIXI.Assets.load(imageUrl);
                //console.log(texture)

                tilesets[tileset.firstgid] = {
                    texture,
                    tileWidth: tilesetData.tilewidth,
                    tileHeight: tilesetData.tileheight,
                };

            }
        } catch (error) {
            console.error(`Error loading tileset ${tileset.name}:`, error);
            throw error;
        }
    }
    return tilesets;
};

const renderMap = (map: MapClass, tilesets: Record<number, { texture: PIXI.Texture, tileWidth: number, tileHeight: number }>) => {
    tilemap = new CompositeTilemap();

    map.layers.forEach((layer: TiledLayer) => {
        if (layer.type === TiledLayerType.Tile) {
            const layerData = layer.data as number[];
            layerData.forEach((gid: number, index: number) => {
                if (gid !== 0) {
                    const tilesetEntry = Object.entries(tilesets).find(
                        ([firstGid]) => gid >= parseInt(firstGid)
                    );
                    if (tilesetEntry) {
                        const [firstGid, tileset] = tilesetEntry;
                        const localId = gid - parseInt(firstGid);
                        const x = (index % layer.width) * map.tilewidth;
                        const y = Math.floor(index / layer.width) * map.tileheight;

                        const tilesPerRow = tileset.texture.width / tileset.tileWidth;
                        const tileX = (localId % tilesPerRow) * tileset.tileWidth;
                        const tileY = Math.floor(localId / tilesPerRow) * tileset.tileHeight;

                        tilemap.tile(
                            tileset.texture,
                            x,
                            y,
                            {
                                u: tileX,
                                v: tileY,
                                tileWidth: tileset.tileWidth,
                                tileHeight: tileset.tileHeight
                            }
                        );
                    }
                }
            });
        }
    });

    return tilemap;
};




const saveMapChanges = async () => {

    const mapChanges = {
        mapId: "myMap1",
        events: ["EV-1"]
    }
    try {
        console.log("updateMap")

        const response = await post<any>('/events', { mapId: "myMap1" });
    } catch (e) {
        console.log('Emit error:', e)
    }

}




onMounted(async () => {
    if (!overlay.value) {
        console.error("Overlay is null!");
        return;
    }

    try {
        const map = await loadTMXMap();
        loadingProgress.value = 0.3;

        const tilesets = await loadTilesets(map);
        loadingProgress.value = 0.6;

        await pixiApp.init({
            width: map.width * map.tilewidth,
            height: map.height * map.tileheight,
            backgroundColor: 0x1099bb,
        });

        overlay.value.appendChild(pixiApp.view as HTMLCanvasElement);

        const mapContainer = renderMap(map, tilesets);
        pixiApp.stage.addChild(mapContainer);

        loadingProgress.value = 1.0;



    } catch (error) {
        console.error("Error in onMounted:", error);
        // Handle the error appropriately (e.g., show an error message to the user)
    }
});

onBeforeUnmount(() => {
    if (pixiApp) {
        pixiApp.destroy(true);
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