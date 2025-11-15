// SpriteHUD.ts
import * as PIXI from 'pixi.js';

export class SpriteHUD {
	private container: PIXI.Container;
	private background: PIXI.Graphics;
	private sprites: Map<string, PIXI.Sprite> = new Map();
	private selectedSprite: string | null = null;

	private readonly SPRITE_SIZE = 64;
	private readonly PADDING = 8;
	private readonly SPRITES_PER_ROW = 5;

	constructor(
		private textures: Map<string, PIXI.Texture>,
		private onSpriteSelect: (spriteId: string) => void,
			x: number = 10,
			y: number = 10
		) {
			this.container = new PIXI.Container();
			this.container.x = x;
			this.container.y = y;

			// Create background
			this.background = new PIXI.Graphics();
			this.container.addChild(this.background);

			this.initializeHUD();
	}

	private initializeHUD(): void {
		const textureKeys = Array.from(this.textures.keys());
		const rows = Math.ceil(textureKeys.length / this.SPRITES_PER_ROW);

		// Draw background
		const width = (this.SPRITE_SIZE + this.PADDING) * this.SPRITES_PER_ROW + this.PADDING;
		const height = (this.SPRITE_SIZE + this.PADDING) * rows + this.PADDING;

		this.background			
			.filletRect(0, 0, width, height, 8)
			.fill(0xffffff)


		// Add sprites
		textureKeys.forEach((key, index) => {
			const row = Math.floor(index / this.SPRITES_PER_ROW);
			const col = index % this.SPRITES_PER_ROW;

			const sprite = new PIXI.Sprite(this.textures.get(key)); 
			sprite.width = this.SPRITE_SIZE;
			sprite.height = this.SPRITE_SIZE;
			sprite.x = col * (this.SPRITE_SIZE + this.PADDING) + this.PADDING;
			sprite.y = row * (this.SPRITE_SIZE + this.PADDING) + this.PADDING;

			// Make sprite interactive
			sprite.eventMode = 'static';
			sprite.cursor = 'pointer';

			// Add hover effect
			sprite.on('pointerover', () => {
				sprite.alpha = 0.8;
			});

			sprite.on('pointerout', () => {
				sprite.alpha = 1.0;
			});

			// Add click handler
			sprite.on('pointerdown', () => {
				this.selectSprite(key);
			});

			this.sprites.set(key, sprite);
			this.container.addChild(sprite);

			// Add border
			const border = new PIXI.Graphics();
			border.setStrokeStyle(0xdddddd)
				.rect(
					sprite.x,
					sprite.y,
					this.SPRITE_SIZE,
					this.SPRITE_SIZE
				);
			this.container.addChild(border);
		});
	}

	private selectSprite(spriteId: string): void {
		// Remove previous selection highlight
		if (this.selectedSprite) {
			const prevSprite = this.sprites.get(this.selectedSprite);
			if (prevSprite) {
				prevSprite.tint = 0xffffff;
			}
		}

		// Highlight new selection
		const sprite = this.sprites.get(spriteId);
		if (sprite) {
			sprite.tint = 0x007bff;
			this.selectedSprite = spriteId;
			this.onSpriteSelect(spriteId);
		}
	}

	public getContainer(): PIXI.Container {
		return this.container;
	}

	public getSelectedSprite(): string | null {
		return this.selectedSprite;
	}

	public setPosition(x: number, y: number): void {
		this.container.x = x;
		this.container.y = y;
	}
}

