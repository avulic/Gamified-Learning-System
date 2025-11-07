<template>
    <div class="wrap">
        <div class="overlay" ref="overlay" v-show="loaded"></div>
        <div v-show="!loaded">
            <div class="progress-bar">
                <div class="progress-inner" :style="{ width: loadingPercent }"></div>
            </div>
        </div>

        <!-- <TaskList :assignmentId="assignmentId" :placedSprites="placedSprites" @spriteAssigned="handleSpriteAssigned" /> -->
    </div>
    <div class="sendEvent">
        <Button @click="saveMapChanges" icon="pi pi-trash" outlined rounded severity="danger"
            class="p-button-raised pi">Save</Button>
        <Button @click="handleOpenEditor" icon="pi pi-user" label="Open Mapper" class="pi p-button-raised" />
    </div>
    <Dialog v-model:visible="showEditor" header="Quest edditor" :modal="true" class="overflow-y-hidden"
        style="height: 80%; width: 90%">
        <div class="editor-container" style="height:100%;">
            <TaskEditor :sprites="spriteInventory" :spritesLoaded="loadedSpriteOnMap" @save-quest="handleQuestSaved" />
        </div>
    </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import * as PIXI from 'pixi.js'
import { CompositeTilemap } from '@pixi/tilemap'
import {
    MapClass,
    TiledLayer,
    TiledLayerType,
    TiledParser,
    TiledTileset,
    Tileset
} from '@rpgjs/tiled'

import CharacterSelector from './CharacterSelector.vue'
import GameQuestService from './GameQuestService'
import TaskEditor, { DialogueResponse, QuestSpriteData, Reward, TaskNodeData } from './QuestMapper/QuestAssignmentsMapper.vue'
import { Position, SpriteSheet, Sprite, PlacedSprite } from './sprite'
import { useSpriteManager } from './UseSpriteManager'
import { PixiSpriteManager } from './PixiSpriteManager'
import { Assets, Texture, TextureSource } from 'pixi.js'
import { SpriteHUD } from './SpriteHUD'
import { useToast } from 'primevue/usetoast';

const toast = useToast();

import TaskService from '@/services/TaskService'
import AssignmentService from '@/services/AssignmentService'
import { Assignment } from '@/types/Assignment'
import { Quest } from './game'
import { BaseTask } from '@/types/task/Task'

const overlay = ref<HTMLElement | null>(null)
const loadingProgress = ref(0.0)
const loadingPercent = computed(() => `${loadingProgress.value * 100}%`)
const loaded = computed(() => loadingProgress.value >= 1.0)

const characterSelector = ref<InstanceType<typeof CharacterSelector> | null>(null)





let pixiApp: PIXI.Application = new PIXI.Application()
let tilemap: CompositeTilemap
var spriteManager: PixiSpriteManager

const tmxPath = '/assets/maps/myMap1.tmx'

const loadTMXMap = async (tmxPath: string) => {
    try {
        const response = await fetch(tmxPath)
        if (!response.ok) {
            throw new Error(`Failed to load TMX file: ${response.statusText}`)
        }
        const tmxData = await response.text()
        const parser = new TiledParser(tmxData, window.location.origin)
        const parsedMap = parser.parseMap()

        // Process embedded tilesets and external TSX files
        const processedTilesets = await Promise.all(
            parsedMap.tilesets.map(async (tileset) => {
                if (tileset.source) {
                    const fileName = tileset.source.split('/').pop() // Get [Base]BaseChip_pipo.tsx
                    const url = new URL(`assets/maps/${fileName}`, new URL(tileset.source).origin)
                    const tsxResponse = await fetch(url.href)
                    if (!tsxResponse.ok) {
                        throw new Error(`Failed to load TSX file: ${tsxResponse.statusText}`)
                    }
                    const tsxData = await tsxResponse.text()
                    const tsxParser = new TiledParser(tsxData, window.location.origin)
                    const parsedTileset = tsxParser.parseTileset()
                    return {
                        ...parsedTileset,
                        firstgid: tileset.firstgid
                    }
                }
                return tileset
            })
        )

        parsedMap.tilesets = processedTilesets
        return new MapClass(parsedMap)
    } catch (error) {
        console.error('Error loading TMX map:', error)
        throw error
    }
}


const loadTilesets = async (map: MapClass) => {
    const tilesets: Record<number, { texture: PIXI.Texture; tileWidth: number; tileHeight: number }> =
        {}
    for (const tileset of map.tilesets) {
        try {
            let tilesetData = tileset
            if (tileset.source) {
                // const tiledTileset = await loadTSX(tileset.source);
                // tilesetData = convertTiledTilesetToTileset(tiledTileset, tileset.firstgid);
                // Object.assign(tileset, tilesetData);
            }
            if (tilesetData.image) {
                const fileName = tilesetData.image.source.split('/').pop()?.split('.')[0]
                const imageUrl = new URL(tilesetData.image.source, window.location.origin).href
                const texture = await PIXI.Assets.load(fileName!)
                //console.log(texture)

                tilesets[tileset.firstgid] = {
                    texture,
                    tileWidth: tilesetData.tilewidth,
                    tileHeight: tilesetData.tileheight
                }
            }
        } catch (error) {
            console.error(`Error loading tileset ${tileset.name}:`, error)
            throw error
        }
    }
    return tilesets
}

const renderMap = (
    map: MapClass,
    tilesets: Record<number, { texture: PIXI.Texture; tileWidth: number; tileHeight: number }>
) => {
    const mapContainer = new PIXI.Container()

    // Process layers in order (their order defines their z-index)
    map.layers.forEach((layer: TiledLayer, layerIndex: number) => {
        if (layer.type === TiledLayerType.Tile) {
            // Create a new CompositeTilemap for each layer
            const layerTilemap = new CompositeTilemap()

            // Set layer properties
            layerTilemap.alpha = layer.opacity ?? 1
            layerTilemap.visible = layer.visible ?? true
            layerTilemap.zIndex = layerIndex // Set z-index based on layer order

            const layerData = layer.data as number[]
            layerData.forEach((gid: number, index: number) => {
                if (gid !== 0) {
                    // Skip empty tiles
                    const tilesetEntry = Object.entries(tilesets).find(
                        ([firstGid]) => gid >= parseInt(firstGid)
                    )

                    if (tilesetEntry) {
                        const [firstGid, tileset] = tilesetEntry
                        const localId = gid - parseInt(firstGid)

                        // Calculate tile positions
                        const x = (index % layer.width) * map.tilewidth
                        const y = Math.floor(index / layer.width) * map.tileheight

                        // Calculate texture coordinates
                        const tilesPerRow = tileset.texture.width / tileset.tileWidth
                        const tileX = (localId % tilesPerRow) * tileset.tileWidth
                        const tileY = Math.floor(localId / tilesPerRow) * tileset.tileHeight

                        // Add tile to layer
                        layerTilemap.tile(tileset.texture, x, y, {
                            u: tileX,
                            v: tileY,
                            tileWidth: tileset.tileWidth,
                            tileHeight: tileset.tileHeight
                        })
                    }
                }
            })

            // Add layer to map container
            mapContainer.addChild(layerTilemap)
        }
    })

    // Enable sortableChildren to respect zIndex
    mapContainer.sortableChildren = true

    return mapContainer
}

const assignmentId = ref<string>("67c623d593b42c36efb8e315")

const handleSpriteAssigned = ({ taskId, spriteId }: { taskId: string; spriteId: string }) => {
    // Update the task-sprite mapping
    const sprite = Array.from(placedSprites).find((s) => s.id === spriteId)
    if (sprite) {
        // You might want to store this mapping somewhere
        console.log(`Task ${taskId} assigned to sprite ${spriteId}`)
    }
}

// const loadQuestEvents = async () => {
//     try {
//         const events = await GameQuestService.getEventsForQuest(questId.value)
//         // Update your events state
//     } catch (error) {
//         console.error('Error loading events:', error)
//     }
// }

const showEditor = ref(false);
const spriteInventory = ref<Map<string, PIXI.Texture>>();
const loadedSpriteOnMap = ref<Map<string, PlacedSprite>>();

const handleOpenEditor = () => {
    spriteInventory.value = spriteManager.getSpriteTexturesMap()
    loadedSpriteOnMap.value = spriteManager.getPlacedSprites()

    showEditor.value = !showEditor.value;
}


const saveMapChanges = async () => {

    try {
        const updatedTasks = Array.from(placedSprites).flatMap((sprite: PlacedSprite) =>
            sprite.questData ? sprite.questData.tasks.map(
                (task: {
                    taskId: string;
                    taskData: TaskNodeData;
                    prerequisites: string[];
                    dialogue?: {
                        text: string;
                        responses: Array<{
                            text: string;
                            nextTaskId?: string;
                        }>;
                    };
                    rewards?: Reward[]
                }) => ({
                    taskId: task.taskId,
                    prerequisites: task.prerequisites
                })
            ) : []
        )

        await Promise.all(updatedTasks.map((task) => AssignmentService.updateAssignment(
            assignmentId.value,
            { tasks: [{ id: task.taskId, prerequisites: task?.prerequisites } as unknown as BaseTask] } as unknown as Assignment
        )))


        toast.add({ severity: 'success', summary: 'Successful', detail: 'Task Updated', life: 3000 });

    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update task',
            life: 3000
        });
    }


    const quest: Quest = {
        assignmentId: assignmentId.value,
        mapId: 'myMap1',
        sprites: Array.from(placedSprites).map((sprite) => ({
            spriteId: sprite.id,        // Matches QuestSprite interface
            spriteLabel: sprite.sprite.id,
            spriteUrl: new URL(sprite.texture.texture.source._sourceOrigin).pathname,
            position: {
                x: sprite.position.x,
                y: sprite.position.y
            },
            layer: sprite.layer,
            tasks: sprite.questData?.tasks?.map((task) => {
                // Ensure rewards match the QuestReward interface
                const rewards = task.rewards?.map(reward => ({
                    id: reward.id || crypto.randomUUID(),
                    imageUrl: reward.imageUrl || '/default-reward.png',
                    name: reward.name || 'Default Reward',
                    description: reward.description || 'Default Description',
                    category: reward.category || 'DEFAULT',
                    value: reward.value || 0
                } satisfies Reward)) || [];

                // Ensure dialogue matches the QuestDialogue interface if present
                const dialogue = task.dialogue ? {
                    text: task.dialogue.text,
                    responses: task.dialogue.responses.map(response => ({
                        text: response.text,
                        nextTaskId: response.nextTaskId

                    }))
                } satisfies DialogueResponse : undefined;


                return {
                    id: task.taskId,
                    taskId: task.taskId,
                    prerequisites: task.prerequisites || [],
                    requiredForCompletion: false,
                    dialogue,
                    rewards,
                    xpReward: 0                 // Required by QuestTask
                }                      // Provide empty array as default
            }) || [],
        }))
    }

    try {
        //const response = await post('/api/assignments/update-tasks', mapChanges)

        await GameQuestService.saveQuest(quest)

        toast.add({ severity: 'success', summary: 'Successful', detail: 'Quest added', life: 3000 });
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to add quest',
            life: 3000
        });
    }
}





var placedSprites = new Set<PlacedSprite>()

const handleCharacterSelected = (sprite: string) => {
    // Get center of viewport
    const centerX = pixiApp.screen.width / 2
    const centerY = pixiApp.screen.height / 2

    // Place the sprite at the center of the viewport
    const placedSprite = spriteManager.placeSprite(sprite, {
        x: centerX,
        y: centerY
    })
    placedSprites.add(placedSprite)
}




const handleQuestSaved = (questData: QuestSpriteData[]) => {

    try {
        questData.forEach(spriteData => {
            const sprite = spriteManager.placeSprite(spriteData.spriteId, {
                x: 570,
                y: 910
            });

            // Ensure tasks are properly structured with prerequisites
            const tasks = spriteData.tasks.map(task => ({
                taskId: task.taskId,
                taskData: task.taskData,
                prerequisites: task.prerequisites || [], // Ensure prerequisites is always an array
                dialogue: task.dialogue,
                rewards: task.rewards
            }));

            sprite.questData = {
                tasks: tasks
            };

            spriteManager.removeTaskRectangles(sprite.id);
            spriteManager.addTaskRectangleToSprite(sprite.id, spriteData.tasks);
            placedSprites.add(sprite);
        });

    } catch (error) {
        console.error('Error saving quest:', error)
    }
    finally {
        showEditor.value = false;
    }
};

onMounted(async () => {
    if (!overlay.value) {
        console.error('Overlay is null!')
        return
    }

    try {
        Assets.add({
            alias: '[Base]BaseChip_pipo3',
            src: 'http://localhost:8080/assets/maps/assets/[Base]BaseChip_pipo3.png'
        })
        Assets.add({
            alias: 'BaseChip_pipo',
            src: 'http://localhost:8080/assets/maps/assets/BaseChip_pipo.png'
        })
        Assets.add({
            alias: 'Dirt_pipo',
            src: 'http://localhost:8080/assets/maps/assets/Dirt_pipo.png'
        })
        Assets.add({
            alias: 'Flower_pipo',
            src: 'http://localhost:8080/assets/maps/assets/Flower_pipo.png'
        })
        Assets.add({
            alias: 'Grass_pipo',
            src: 'http://localhost:8080/assets/maps/assets/Grass_pipo.png'
        })
        Assets.add({
            alias: 'Water_pipo',
            src: 'http://localhost:8080/assets/maps/assets/Water_pipo.png'
        })
        Assets.add({
            alias: 'Wall-Up_pipo',
            src: 'http://localhost:8080/assets/maps/assets/Wall-Up_pipo.png'
        })

        //await loadQuestEvents()

        const map = await loadTMXMap(tmxPath)
        loadingProgress.value = 0.3

        const tilesets = await loadTilesets(map)
        loadingProgress.value = 0.6

        await pixiApp.init({
            width: map.width * map.tilewidth,
            height: map.height * map.tileheight,
            backgroundColor: 0x1099bb
        })

        overlay.value.appendChild(pixiApp.canvas as HTMLCanvasElement)

        const spriteSheet: SpriteSheet = {
            id: 'characters',
            url: '/assets/female.png', // Update this to your actual sprite sheet path
            frames: {
                width: 32,
                height: 32,
                columns: 4,
                rows: 3
            },
            sprites: [
                {
                    id: 'female',
                    x: 0, // X position in the sprite sheet
                    y: 0, // Y position in the sprite sheet
                    width: 32,
                    height: 32,
                    animationFrames: 2,
                    frameDelay: 200
                } as Sprite
            ]
        }

        spriteManager = new PixiSpriteManager(pixiApp)
        await spriteManager.loadSpriteSheet(spriteSheet)
        const placedSprite = spriteManager.placeSprite('female', { x: 550, y: 900 })
        placedSprites.add(placedSprite)

        const mapContainer = renderMap(map, tilesets)
        pixiApp.stage.addChild(mapContainer)

        var loadedSpritesManager = spriteManager.getSpriteTexturesMap()
        // Create the HUD
        const spriteHUD = new SpriteHUD(loadedSpritesManager, (spriteId: string) => {
            handleCharacterSelected(spriteId)
        })

        pixiApp.stage.addChild(spriteHUD.getContainer())

        loadingProgress.value = 1.0
    } catch (error) {
        console.error('Error in onMounted:', error)
    }
})

onBeforeUnmount(() => {
    if (pixiApp) {
        pixiApp.destroy(true)
    }
})
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
