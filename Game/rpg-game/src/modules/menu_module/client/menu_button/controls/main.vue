<template>
    <div class="controls">
        <div class="actions">
            <div class="action" @click="action"></div>
        </div>
        <div class="menu-access" @click="openMenu"></div>
    </div>
</template>

<script lang="ts">
import { Control, Direction } from '@rpgjs/client'

export default {
    name: 'menu-button',
    inject: ['rpgEngine'],
    mounted() {

    },
    methods: {
        openMenu() {
            this.rpgEngine.controls.applyControl(Control.Back)
        },
        action() {
            this.rpgEngine.controls.applyControl(Control.Action)
        }
    }
}
</script>

<style scoped>
.controls {
    height: 100%;
    position: absolute;
    width: 100%;
    z-index: 50;
}

.d-pad {
    width: 70%;
    position: absolute;
    height: 100%;
}

.actions {
    width: 30%;
    position: absolute;
    right: 0;
    height: 100%;
}

.action {
    background-image: url('../assets/flatDark35.png');
    width: 80px;
    height: 80px;
    opacity: 0.8;
    bottom: 10px;
    position: absolute;
    right: 10px;
}

.menu-access {
    background-image: url('../assets/flatDark32.png');
    width: 48px;
    height: 48px;
    opacity: 0.8;
    top: 10px;
    position: absolute;
    right: 10px;
}
</style>