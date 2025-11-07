import { Reward, TaskNodeData } from './QuestMapper/QuestAssignmentsMapper.vue';
import * as PIXI from 'pixi.js';

export interface Position {
    x: number;
    y: number;
}

// Basic sprite frame data
export interface SpriteFrame {
    x: number;
    y: number;
    width: number;
    height: number;
}

// Sprite metadata and properties
export interface Sprite extends SpriteFrame {
    id: string;               // Unique identifier for the sprite
    spriteSheet: string;      // URL/path to the sprite sheet
    name?: string;            // Optional name for the sprite
    animationFrames?: number; // Number of frames if animated
    frameDelay?: number;      // Delay between frames for animation
}

// Placed sprite instance on the map
export interface PlacedSprite {
    id: string;              // Unique identifier for the placed instance
    sprite: Sprite;          // Reference to the source sprite
    position: Position;      // Position on the map
    texture: PIXI.Sprite;   // Texture for the sprite
    layer: number;           // Layer index
    rotation?: number;       // Optional rotation in degrees
    scale?: {               // Optional scaling
        x: number;
        y: number;
    };
    flipped?: {             // Optional flip states
        horizontal: boolean;
        vertical: boolean;
    };
    properties?: {          // Optional custom properties
        [key: string]: any;
    };
    questData?:{
        tasks: Array<{
            taskId: string;
            taskData: TaskNodeData;
            prerequisites: string[];  // Array of task IDs
            dialogue?: {
                text: string;
                responses: Array<{
                    text: string;
                    nextTaskId?: string;
                }>;
            };
            rewards?: Reward[]
        }>;
    };    
}

// Animation state for animated sprites
export interface SpriteAnimation {
    spriteId: string;
    currentFrame: number;
    isPlaying: boolean;
    frameTimer: number;
}

// Sprite collision data
export interface SpriteCollision {
    bounds: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    solid: boolean;
    trigger?: boolean;
}

// Sprite sheet metadata
export interface SpriteSheet {
    id: string;
    url: string;
    frames: {
        width: number;
        height: number;
        columns: number;
        rows: number;
    };
    sprites: Sprite[];
}

// Sprite layer data
export interface SpriteLayer {
    id: string;
    name: string;
    visible: boolean;
    opacity: number;
    sprites: PlacedSprite[];
}

// Full sprite map state
export interface SpriteMapState {
    layers: SpriteLayer[];
    animations: SpriteAnimation[];
    selectedSprite: Sprite | null;
    selectedLayer: number;
    spriteSheets: SpriteSheet[];
}