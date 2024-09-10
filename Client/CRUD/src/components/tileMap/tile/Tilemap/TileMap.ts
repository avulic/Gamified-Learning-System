import { Container, Texture, Rectangle, BaseTexture } from 'pixi.js';
import { CompositeTilemap } from '@pixi/tilemap';
import { TiledMap, Layer, TiledLayerType } from '@rpgjs/tiled';

export default class TileMap extends Container {
    private compositeTilemap: CompositeTilemap;
    private tilesets: Map<number, { texture: Texture, tileWidth: number, tileHeight: number }> = new Map();

    constructor(private data: TiledMap) {
        super();
        this.compositeTilemap = new CompositeTilemap();
        this.addChild(this.compositeTilemap);
    }

    async init() {
        await this.loadTilesets();
        this.renderLayers();
    }

    private async loadTilesets() {
        for (const tileset of this.data.tilesets) {
            if (tileset.image) {
                try {
                    const baseTexture = await BaseTexture.from(tileset.image.source);
                    for (let i = 0; i < tileset.tilecount; i++) {
                        const x = (i % tileset.columns) * tileset.tilewidth;
                        const y = Math.floor(i / tileset.columns) * tileset.tileheight;
                        const texture = new Texture(baseTexture, new Rectangle(x, y, tileset.tilewidth, tileset.tileheight));
                        this.tilesets.set(tileset.firstgid + i, {
                            texture,
                            tileWidth: tileset.tilewidth,
                            tileHeight: tileset.tileheight
                        });
                    }
                } catch (error) {
                    console.error(`Failed to load tileset image: ${tileset.image.source}`, error);
                }
            }
        }
    }

    private renderLayers() {
        this.data.layers.forEach(layer => this.renderLayer(layer));
    }

    private renderLayer(layer: Layer) {
        if (layer.type === TiledLayerType.Tile && layer.data) {
            layer.data.forEach((gid, index) => {
                if (gid !== 0) {
                    const tilesetEntry = this.findTilesetEntry(gid);
                    if (tilesetEntry) {
                        const [firstGid, tileset] = tilesetEntry;
                        const localId = gid - firstGid;
                        const x = (index % layer.width) * this.data.tilewidth;
                        const y = Math.floor(index / layer.width) * this.data.tileheight;

                        this.compositeTilemap.tile(
                            tileset.texture,
                            x,
                            y,
                            {
                                u: (localId % (tileset.texture.width / tileset.tileWidth)) * tileset.tileWidth,
                                v: Math.floor(localId / (tileset.texture.width / tileset.tileWidth)) * tileset.tileHeight,
                                tileWidth: tileset.tileWidth,
                                tileHeight: tileset.tileHeight,
                            }
                        );
                    }
                }
            });
        }
    }

    private findTilesetEntry(gid: number): [number, { texture: Texture, tileWidth: number, tileHeight: number }] | undefined {
        let lastValidEntry: [number, { texture: Texture, tileWidth: number, tileHeight: number }] | undefined;
        for (const [firstGid, tileset] of this.tilesets.entries()) {
            if (firstGid <= gid) {
                lastValidEntry = [firstGid, tileset];
            } else {
                break;
            }
        }
        return lastValidEntry;
    }
}