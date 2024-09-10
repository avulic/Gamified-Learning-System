import * as PIXI from 'pixi.js';
import { CompositeTilemap } from '@pixi/tilemap';
import {  TiledLayer, TiledLayerType,  } from '../types/Layer';
import {  MapClass } from '../classes/Map';
import {  Tileset } from '../classes/Tileset';
import { TiledParser, TiledTileset } from '../../src'; // Update this path

export class MapRenderer {
    private app: PIXI.Application =new PIXI.Application();
    private tilemap: CompositeTilemap;
    private tilesets: Record<number, PIXI.Texture>;
    private map: MapClass;

    constructor(map: MapClass) {
        this.map = map;
        this.tilemap = new CompositeTilemap();
        this.tilesets = {};
    }

    public async init(width: number, height: number) {
        await this.loadTilesets();
        
        await this.app.init({
            width: this.map.width * this.map.tilewidth,
            height: this.map.height * this.map.tileheight,
            backgroundColor: 0x1099bb,
        });

        
        this.renderLayers();
        this.app.stage.addChild(this.tilemap as unknown as PIXI.Container);
    }

    private async loadTilesets() {
        for (const tileset of this.map.tilesets) {
            try {
                let tilesetData: Tileset = tileset;
                if (tileset.source) {
                    const tiledTileset = await this.loadTSX(tileset.source);
                    tilesetData = this.convertTiledTilesetToTileset(tiledTileset, tileset.firstgid);
                    Object.assign(tileset, tilesetData);
                }
                if (tilesetData.image) {
                    const imageUrl = new URL(tilesetData.image.source, window.location.origin).href;
                    const texture = await PIXI.Assets.load(imageUrl);
                    this.tilesets[tileset.firstgid] = texture as PIXI.Texture;
                }
            } catch (error) {
                console.error(`Error loading tileset ${tileset.name}:`, error);
                throw error;
            }
        }
    }

    private convertTiledTilesetToTileset(tiledTileset: TiledTileset, firstgid: number): Tileset {
        const tileset = new Tileset(tiledTileset);
        tileset.firstgid = firstgid;

        if (tiledTileset.tiles) {
            tiledTileset.tiles.forEach(tile => {
                tileset.addTile(tile);
            });
        }

        return tileset;
    }

    private async loadTSX(source: string): Promise<TiledTileset> {
        const response = await fetch(source);
        if (!response.ok) {
            throw new Error(`Failed to load TSX file: ${response.statusText}`);
        }
        const tsxData = await response.text();
        const parser = new TiledParser(tsxData, window.location.origin);
        return parser.parseTileset();
    }

    private renderLayers() {
        this.map.layers.forEach((layer: TiledLayer) => {
            if (layer.type === TiledLayerType.Tile) {
                this.renderTileLayer(layer);
            }
        });
    }

    private renderTileLayer(layer: TiledLayer) {
        const { width, height, tilewidth, tileheight } = this.map;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const tileIndex = y * width + x;
                const gid = (layer.data as number[])[tileIndex];

                if (gid !== 0) {
                    const tilesetEntry = this.findTileSet(gid);
                    if (tilesetEntry) {
                        const localId = gid - tilesetEntry.firstgid;
                        const tilesetWidth = Math.floor(tilesetEntry.imagewidth / tilesetEntry.tilewidth);

                        const sx = (localId % tilesetWidth) * tilesetEntry.tilewidth;
                        const sy = Math.floor(localId / tilesetWidth) * tilesetEntry.tileheight;

                        this.tilemap.tile(
                            this.tilesets[tilesetEntry.firstgid] as any,
                            x * tilewidth,
                            y * tileheight,
                            {
                                u: sx,
                                v: sy,
                                tileWidth: tilewidth,
                                tileHeight: tileheight,
                                animX: tilesetEntry.tilewidth,
                                animY: tilesetEntry.tileheight
                            }
                        );
                    }
                }
            }
        }
    }

    private findTileSet(gid: number): Tileset | undefined {
        return this.map.tilesets.find(tileset => gid >= tileset.firstgid && gid < tileset.firstgid + tileset.tilecount);
    }

    public getView(): HTMLCanvasElement {
        return this.app.canvas as HTMLCanvasElement;
    }

    public update(deltaTime: number) {
        this.app.ticker.update(deltaTime);
    }

    public resize(width: number, height: number) {
        this.app.renderer.resize(width, height);
    }

    public destroy() {
        if (this.app) {
            this.app.destroy(true);
        }
    }
}
