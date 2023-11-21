<template>
    <div class="background">
        <div class="title" v-if="step == 'title'">
            <h1>{{ title }}</h1>
        </div>
        <rpgLogin v-if="page == 'login'" class="margin-bottom" @create="page = 'create'" />
        <rpgCreatAccount v-if="page == 'create'" @login="page = 'login'" />
        <rpgSelectSubject :user="user" v-if="page == 'select'" />
    </div>
</template>

<!-- <template>
    <div class="background">
        <CrudApp></CrudApp>
    </div>
</template> -->

<script lang="ts">
import { Control } from '@rpgjs/client'
import rpgCreatAccount from './create-account.vue'
import rpgSelectSubject from './subjects.vue'

const name = 'rpg-title-screen'

export default {
    name,
    inject: ['rpgEngine', 'rpgGui', 'rpgGuiInteraction', 'rpgKeypress', 'rpgSound', 'rpgSocket'],
    components: {
        rpgCreatAccount,
        rpgSelectSubject
    },
    data() {
        return {
            step: 'title',
            title: 'Login',
            page: 'login',
            user: {}
        }
    },
    mounted() {
        const socket = this.rpgSocket()
        socket.on('authSuccess', (user) => {
            if (user.nickname) {
                this.user = user
                this.page = 'select';
            }
            else
                this.notificationError("Error in subject select")
        })
    },
    unmounted() {

    },
    methods: {

    },
    computed: {

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
}

.step-title {
    display: flex;
}
</style>