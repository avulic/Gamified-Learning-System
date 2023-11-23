<template>
    <div class="background">
        <div class="full">
            <rpg-window width="200px" position="bottom-middle" class="margin-bottom">
                <rpg-choice :choices="menuChoice" @selected="selected"></rpg-choice>
            </rpg-window>
        </div>
    </div>
</template>

<script lang="ts">
import { Control } from '@rpgjs/client'

const name = 'rpgSelectSubject'

export default {
    name,
    inject: ['rpgEngine', 'rpgGui', 'rpgGuiInteraction', 'rpgKeypress', 'rpgSound'],
    props: ['user'],
    data() {
        return {
            menu: [
                { text: 'Vas', value: 'vas' },
                { text: 'ERP', value: 'erp' },
                { text: 'TBP', value: 'tbp' }
            ]
        }
    },
    mounted() {
        this.obsKeyPress = this.rpgKeypress.subscribe(({ control }) => {
            if (!control) return
            if (control.actionName == Control.Back) {
                this.step = 'title'
            }
        });

        /*Dohvati kolegijue */
    },
    unmounted() {
        this.obsKeyPress.unsubscribe()
    },
    methods: {

        selected(index) {
            const { value } = this.menu[index]
            console.log(this.user)
            this.rpgGuiInteraction('rpg-title-screen', 'start-game', [this.user, value])
        }
    },
    computed: {
        menuChoice() {
            return this.menu.filter(menu => {
                if (menu.value == 'options') {
                    return false
                }
                return true
            })
        }
    }
}
</script>

<style scoped lang="scss">
$title-screen-font-size: 40px !default;
$title-screen-font-color: white !default;
$title-screen-font-border-color: black !default;
$title-screen-background: url('./assets/default.png') !default;

.title {
    position: absolute;
    display: flex;
    width: 100%;
    justify-content: center;
    margin-top: 50px;
    font-family: $window-font-family;
    font-size: $title-screen-font-size;

    & h1 {
        color: white;
        text-shadow:
            -1px -1px 0 $title-screen-font-border-color,
            1px -1px 0 $title-screen-font-border-color,
            -1px 1px 0 $title-screen-font-border-color,
            1px 1px 0 $title-screen-font-border-color;
    }
}

.background {
    position: absolute;
    background: $title-screen-background;
    width: 100%;
    height: 100%;
    display: flex;
    background-size: cover;
    z-index: 100;
}

.margin-bottom {
    margin-bottom: 50px;
}

.full {
    width: 100%;
    display: flex;
}

.step-title {
    display: flex;
}
</style>