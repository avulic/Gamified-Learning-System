import * as PIXI from 'pixi.js';
import { Text } from 'pixi.js';
import type { Sprite, PlacedSprite, Position, SpriteSheet } from './sprite';
import { Reward, TaskNodeData } from './QuestMapper/QuestAssignmentsMapper.vue';

export class PixiSpriteManager {
    private app: PIXI.Application;
    private spriteContainer: PIXI.Container;
    private spriteTextures: Map<string, PIXI.Texture>;
    private placedSprites: Map<string,PlacedSprite>;
    private spriteSheets: Map<string, PIXI.Spritesheet>;
    private taskContainers: Map<string, PIXI.Container>;

    constructor(app: PIXI.Application) {
        this.app = app;
        this.spriteContainer = new PIXI.Container();
        this.spriteTextures = new Map();
        this.placedSprites = new Map();
        this.spriteSheets = new Map();
        this.taskContainers = new Map();
        
        this.spriteContainer.sortableChildren = true;
        this.spriteContainer.zIndex = 1000;
        this.app.stage.addChild(this.spriteContainer);
    }
    
    async loadSpriteSheet(spriteSheetData: SpriteSheet): Promise<void> {
        // Load the sprite sheet base texture
        PIXI.Assets.add({ 
            alias: spriteSheetData.id, 
            src: spriteSheetData.url 
        });
        
        const baseTexture = await PIXI.Assets.load(spriteSheetData.id);

        // Process each sprite definition in the sprite sheet
        for (const spriteData of spriteSheetData.sprites) {
            // Calculate sprite position in the sheet
            const column = Math.floor(spriteData.x / spriteSheetData.frames.width);
            const row = Math.floor(spriteData.y / spriteSheetData.frames.height);
            
            // Create frame rectangle for the sprite
            const frame = new PIXI.Rectangle(
                column * spriteSheetData.frames.width,
                row * spriteSheetData.frames.height,
                spriteData.width,
                spriteData.height
            );

            // Create texture from the base texture and frame
            const texture = new PIXI.Texture({
                source: baseTexture,
                frame: frame
            });

            // Store the texture
            this.spriteTextures.set(spriteData.id, texture);

            // If sprite has animation frames, create textures for each frame
            if (spriteData.animationFrames && spriteData.animationFrames > 1) {
                const animationTextures: PIXI.Texture[] = [];
                
                for (let i = 0; i < spriteData.animationFrames; i++) {
                    const animFrame = new PIXI.Rectangle(
                        (column + i) * spriteSheetData.frames.width,
                        row * spriteSheetData.frames.height,
                        spriteData.width,
                        spriteData.height
                    );
                    
                    const animTexture = new PIXI.Texture({
                        source: baseTexture,
                        frame: animFrame
                    });
                    
                    animationTextures.push(animTexture);
                }
                
                // Store animation textures with a special key
                this.spriteTextures.set(`${spriteData.id}_anim`, animationTextures[0]);
                // You might want to store the full animation sequence somewhere if needed
            }
        }
    }


    addTaskRectangleToSprite(spriteId: string, tasks: Array<{
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
    }>) {
        // Constants for rectangle layout
        const RECT_WIDTH = 200;
        const RECT_HEIGHT = 25;
        const RECT_PADDING = 5; 
        const CORNER_RADIUS = 8;

        const spriteTexture = this.placedSprites.get(spriteId)?.texture;
    
        if (!spriteTexture) {
            throw new Error(`Texture not found for sprite ${spriteId}`);
        }
    
        const taskContainer = new PIXI.Container();
        taskContainer.x = spriteTexture.x;
        taskContainer.y = spriteTexture.y;

        tasks.forEach((task, index) => {
            const taskRectangle = new PIXI.Graphics();
            
            // Position each rectangle below the previous one
            const yOffset = index * (RECT_HEIGHT + RECT_PADDING);
            
            taskRectangle
                .filletRect(0, yOffset, RECT_WIDTH, RECT_HEIGHT, CORNER_RADIUS)
                .fill(0x007bff)

            taskRectangle.interactive = true;
    
            const text = new Text({
                text:  task.taskData.title,
                style: {
                    fontFamily: 'Arial',
                    fontSize: 15,
                    fill: 0xffffff,
                    align: 'center',
                    wordWrap: true,
                    wordWrapWidth: RECT_WIDTH - 20
                }
            });
    
            // Center text in rectangle
            text.anchor.set(0.5);
            text.x = RECT_WIDTH / 2;
            text.y = yOffset + (RECT_HEIGHT / 2);
    
            //hover effects
            taskRectangle.on('pointerover', () => {
                taskRectangle.alpha = 0.8;
            });
            
            taskRectangle.on('pointerout', () => {
                taskRectangle.alpha = 1;
            });
    
            taskRectangle.on('pointerdown', () => {
                console.log('Sprite position:', {
                    x: taskRectangle.x,
                    y: taskRectangle.y,
                    globalX: taskRectangle.getGlobalPosition().x,
                    globalY: taskRectangle.getGlobalPosition().y
                });
            });
    
            taskContainer.addChild(taskRectangle);
            taskContainer.addChild(text);
        });
    
        // Center the task container relative to the sprite
        taskContainer.x = (spriteTexture.x / 2)/6;
        taskContainer.y = -((tasks.length * (RECT_HEIGHT + RECT_PADDING)) / 2);

        this.taskContainers.set(spriteId, taskContainer);

        spriteTexture.addChild(taskContainer);
    }

    removeTaskRectangles(spriteId: string) {
        const existingContainer = this.taskContainers.get(spriteId);
        const spriteTexture = this.placedSprites.get(spriteId)?.texture;

        if (existingContainer && spriteTexture) {
            // Remove all children from the container
            existingContainer.removeChildren();
            // Remove the container from the sprite
            spriteTexture.removeChild(existingContainer);
            // Remove the container reference from our Map
            this.taskContainers.delete(spriteId);
        }
    }

    clearAllTaskRectangles() {
        for (const spriteId of this.taskContainers.keys()) {
            this.removeTaskRectangles(spriteId);
        }
    }

    removeSprite(spriteId: string) {
        this.removeTaskRectangles(spriteId);
        const sprite = this.placedSprites.get(spriteId);
        if (sprite) {
            this.spriteContainer.removeChild(sprite.texture);
            this.placedSprites.delete(spriteId);
        }
    }

    placeSprite(spriteId: string, position: Position): PlacedSprite {
        const sprite = this.placedSprites.get(spriteId);
        var pixiSprite: PIXI.Sprite;
        var texture;
        
        if(sprite) { 
            return sprite;
        }

        texture = this.spriteTextures.get(spriteId);
        if (!texture) {
            throw new Error(`Texture not found for sprite ${spriteId}`);
        }

        pixiSprite = new PIXI.Sprite(texture);
        

        

        pixiSprite.x = position.x;
        pixiSprite.y = position.y;
        pixiSprite.anchor.set(0.5, 1.0);
        
        // Set dimensions based on the texture frame
        pixiSprite.width = texture.frame.width;
        pixiSprite.height = texture.frame.height;
        
        pixiSprite.zIndex = position.y;
        pixiSprite.interactive = true;
        pixiSprite.eventMode = 'static';
        
        pixiSprite.on('pointerdown', () => {
            console.log('Sprite position:', {
                x: pixiSprite.x,
                y: pixiSprite.y,
                globalX: pixiSprite.getGlobalPosition().x,
                globalY: pixiSprite.getGlobalPosition().y
            });
        });
        
        this.makeSpriteDraggable(pixiSprite);
        this.spriteContainer.addChild(pixiSprite);

        const placedSprite: PlacedSprite = {
            id: crypto.randomUUID(),
            sprite: {
                id: spriteId,
                width: texture.frame.width,
                height: texture.frame.height
            } as Sprite,
            position,
            layer: position.y,
            texture: pixiSprite
        };

        this.placedSprites.set(placedSprite.id, placedSprite);
        return placedSprite;
    }

    private makeSpriteDraggable(sprite: PIXI.Sprite) {
        let isDragging = false;
        let dragData: PIXI.FederatedPointerEvent | null = null;
        let offset = { x: 0, y: 0 };

        sprite
            .on('pointerdown', (event: PIXI.FederatedPointerEvent) => {
                isDragging = true;
                dragData = event;
                const position = event.getLocalPosition(sprite.parent);
                offset.x = position.x - sprite.x;
                offset.y = position.y - sprite.y;
                sprite.alpha = 0.8;
            })
            .on('pointermove', (event: PIXI.FederatedPointerEvent) => {
                if (isDragging && dragData) {
                    const position = event.getLocalPosition(sprite.parent);
                    sprite.x = position.x - offset.x;
                    sprite.y = position.y - offset.y;
                    // Update z-index based on new y position
                    sprite.zIndex = sprite.y;
                }
            })
            .on('pointerup', () => {
                isDragging = false;
                dragData = null;
                sprite.alpha = 1;
            })
            .on('pointerupoutside', () => {
                isDragging = false;
                dragData = null;
                sprite.alpha = 1;
            });
    }

    updateSpritePosition(spriteId: string, position: Position) {
        const sprite = this.placedSprites.get(spriteId);
        if (sprite) {
            sprite.texture.x = position.x;
            sprite.texture.y = position.y;
            sprite.texture.zIndex = position.y; // Update z-index with new position
        }
    }

    // Add method to set sprite's layer relative to map layers
    setSpriteMapLayer(spriteId: string, isAboveWater: boolean = true) {
        const sprite = this.placedSprites.get(spriteId);
        if (sprite) {
            // Adjust these values based on your map's layer structure
            sprite.texture.zIndex = isAboveWater ? 1000 : 500;
        }
    }

    getSpriteTextures() {
        return Array.from(this.spriteTextures.values());
    }
    
    getSpriteTexturesMap(): Map<string, PIXI.Texture> {
        return this.spriteTextures;
    }

    getPlacedSprites(): Map<string, PlacedSprite> {
        return this.placedSprites;
    }
}