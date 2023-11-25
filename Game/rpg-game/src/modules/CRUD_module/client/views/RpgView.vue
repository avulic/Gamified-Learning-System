<template>
    <div id="rpg-container">

    </div>
</template>

<style>
#rpg-container {
    margin: 0;
    /* background-color: white; */
    display: flex;
    align-items: center;
    justify-content: center;
    /* width: 100vw; */
    /* height: 100vh;*/
}

#rpg {
    position: relative;
    background-color: white;
}


@media (min-width: 800px) {
    #rpg {
        width: 816px;
        height: 624px;
    }
}
</style>

<script lang="ts">
export default {
    name: 'RPG',
    inheritAttrs: false,
    customOptions: {}
}
</script>
<script setup lang="ts">
import { watch, computed, onBeforeMount, ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import AuthService from '../../../../services/AuthService';
import type User from '../../../../types/User/User';
import { Observable } from 'rxjs';
import { Role } from '../../../../types/Role';

import { RpgClient, RpgModule, RpgGui, RpgClientEngineHooks, RpgClientEngine } from '@rpgjs/client';


function showRpg() {
    var rpg = document.getElementById('rpg');
    var rpgContainer = document.getElementById('rpg-container');
    rpgContainer.appendChild(rpg);
    rpg.style.display = '';

    //RpgGui.display("rpg-title-screen")
}
function hideRpg() {
    var rpg = document.getElementById('rpg');
    rpg.style.display = 'none';
    var app = document.getElementById('app');
    app.appendChild(rpg);
}

onBeforeUnmount(() => {
    hideRpg()
});
onMounted(() => {
    showRpg()
    
    RpgGui.display("rpg-title-screen")
});

// export default {
//     name: 'RPG',
//     inject: ['rpgGui'],
//     data() {
//         const router = useRouter();

//         const isMenuOpen = ref(false);
//         const currentUser = ref<User | null>(null);
//         return {
//             isMenuOpen,
//             currentUser,
//         };
//     },
//     beforeMount() {

//     },
//     mounted() {
//         this.showRpg()
//         console.log(RpgGui.getAll())
//         this.rpgGui.display("rpg-title-screen")
//     },
//     beforeUnmount() {
//         this.hideRpg()
//     },
//     unmounted() {

//     },

//     methods: {
//         showRpg() {
//             var rpg = document.getElementById('rpg');
//             var rpgContainer = document.getElementById('rpg-container');
//             rpgContainer.appendChild(rpg);
//             rpg.style.display = '';

//             //RpgGui.display("rpg-title-screen")
//         },
//         hideRpg() {
//             var rpg = document.getElementById('rpg');
//             rpg.style.display = 'none';
//             var app = document.getElementById('app');
//             app.appendChild(rpg);
//         },
//     },
//     computed: {

//     }
// };


</script>