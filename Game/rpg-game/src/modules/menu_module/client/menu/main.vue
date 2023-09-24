<template>
    <div class="menu-main">
        <component :is="layout" @changeLayout="change" ref="layout"></component>
        <BackButton />
    </div>
</template>

<script>
import MainLayout from './layouts/main.vue'
import ItemsLayout from './layouts/item.vue'
import StatusLayout from './layouts/status.vue'
import EquipmentLayout from './layouts/equipment.vue'
import SaveLayout from './layouts/save.vue'
import BackButton from '../components/back.vue'

import { Control, Direction } from '@rpgjs/client'


export default {
    name: 'main-menu',
    inject: ['rpgEngine', 'rpgStage', 'rpgGui'],
    data() {
        return {
            layout: 'MainLayout'
        }
    },
    mounted() {
        //if (this.rpgGui.exists('rpg-controls')) this.rpgGui.hide('rpg-controls')
        //this.rpgEngine.controls.stopInputs()
        const blur = new this.rpgEngine.PIXI.BlurFilter()
        this.rpgStage.filters = [blur]
    },
    methods: {
        change(name) {
            if (name === "EditorLayout") {
                this.rpgEngine.controls.applyControl(Control.Back)
                this.rpgGui.display('taskList')
            }
            this.layout = name
        }
    },
    components: {
        MainLayout,
        ItemsLayout,
        StatusLayout,
        BackButton,
        EquipmentLayout,
        SaveLayout
    }
}
</script>

<style scoped>
.menu-main {
    height: 100%;
    position: absolute;
    width: 100%;
    z-index: 100;
}
</style>