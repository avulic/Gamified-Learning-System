<script lang="ts">
import { defineComponent } from 'vue';
import TileMapComponent from '../components/tileMap/TileMapComponent.vue'
import TiledMapRenderer from '../components/tileMap/TiledMapRenderer.vue'
import Tiled from '../components/tileMap/Tiled.vue'
import TiledNew from '../components/tileMap/TileNew.vue'


export default defineComponent({
  name: 'App',
  components: {
    Tiled
  }
});
</script>


<template>
  <div>
    <h1>Tiled Map Renderer</h1>
    <Tiled mapPath="assets/myMap1.tmx" :width="800" :height="600" />
  </div>
</template>
