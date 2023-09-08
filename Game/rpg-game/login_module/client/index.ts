import { RpgClient, RpgModule, RpgGui } from '@rpgjs/client'
import titleGui from './gui/title.vue'
import loginGui from './gui/login.vue'
import subject from './gui/subjects.vue'
import create from './gui/create-account.vue'

import { sprite } from './sprite'

@RpgModule<RpgClient>({ 
    sprite,
    gui: [
        titleGui,
        loginGui,
        subject,
        create
    ]
})
export default class RpgClientEngine {}