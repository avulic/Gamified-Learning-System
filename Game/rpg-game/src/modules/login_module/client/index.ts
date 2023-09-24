import { RpgClient, RpgModule, RpgGui, RpgClientEngineHooks, RpgClientEngine } from '@rpgjs/client'
import titleGui from './gui/title.vue'
import loginGui from './gui/login.vue'
import subject from './gui/subjects.vue'
import create from './gui/create-account.vue'

import { sprite } from './sprite'


const engine: RpgClientEngineHooks = {
    onStart(engine: RpgClientEngine){
        console.log("Started module")
    }
}

@RpgModule<RpgClient>({ 
    sprite,
    gui: [
        titleGui,
        loginGui,
        subject,
        create
    ],
    engine: engine
})
export default class RpgClientEngineModule {}