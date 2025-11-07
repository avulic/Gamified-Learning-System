// composables/useSpriteManager.ts
import { ref, computed } from 'vue';
import type { 
    Sprite, 
    PlacedSprite, 
    Position, 
    SpriteLayer, 
    SpriteMapState 
} from './sprite';

export function useSpriteManager() {
    const mapState = ref<SpriteMapState>({
        layers: [],
        animations: [],
        selectedSprite: null,
        selectedLayer: 0,
        spriteSheets: []
    });

    // Add a new sprite to the current layer
    const placeSprite = (sprite: Sprite, position: Position): PlacedSprite => {
        const placedSprite: PlacedSprite = {
            id: crypto.randomUUID(),
            sprite,
            position,
            layer: mapState.value.selectedLayer,
            scale: { x: 1, y: 1 },
            flipped: { horizontal: false, vertical: false }
        };

        const currentLayer = mapState.value.layers[mapState.value.selectedLayer];
        if (currentLayer) {
            currentLayer.sprites.push(placedSprite);
        }

        return placedSprite;
    };

    // Remove a placed sprite
    const removeSprite = (spriteId: string) => {
        mapState.value.layers.forEach(layer => {
            layer.sprites = layer.sprites.filter(sprite => sprite.id !== spriteId);
        });
    };

    // Move a placed sprite
    const moveSprite = (spriteId: string, newPosition: Position) => {
        mapState.value.layers.forEach(layer => {
            const sprite = layer.sprites.find(s => s.id === spriteId);
            if (sprite) {
                sprite.position = newPosition;
            }
        });
    };

    // Add a new layer
    const addLayer = (name: string): SpriteLayer => {
        const layer: SpriteLayer = {
            id: crypto.randomUUID(),
            name,
            visible: true,
            opacity: 1,
            sprites: []
        };
        mapState.value.layers.push(layer);
        return layer;
    };

    // Get all sprites in a specific area
    const getSpritesInArea = (area: { x: number; y: number; width: number; height: number }) => {
        return mapState.value.layers.flatMap(layer => 
            layer.sprites.filter(sprite => 
                sprite.position.x >= area.x &&
                sprite.position.x < area.x + area.width &&
                sprite.position.y >= area.y &&
                sprite.position.y < area.y + area.height
            )
        );
    };

    // Export map state
    const exportMapState = () => {
        return JSON.stringify(mapState.value);
    };

    // Import map state
    const importMapState = (state: string) => {
        try {
            mapState.value = JSON.parse(state);
        } catch (error) {
            console.error('Failed to import map state:', error);
        }
    };

    // Computed properties
    const visibleSprites = computed(() => 
        mapState.value.layers
            .filter(layer => layer.visible)
            .flatMap(layer => layer.sprites)
    );

    const currentLayer = computed(() => 
        mapState.value.layers[mapState.value.selectedLayer]
    );

    return {
        mapState,
        placeSprite,
        removeSprite,
        moveSprite,
        addLayer,
        getSpritesInArea,
        exportMapState,
        importMapState,
        visibleSprites,
        currentLayer
    };
}