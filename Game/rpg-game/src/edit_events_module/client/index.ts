import { RpgClient, RpgModule, RpgGui } from '@rpgjs/client'
import taskList from './gui/taskList.vue'


@RpgModule<RpgClient>({ 
    gui: [
        taskList,
    ]
})
export default class RpgClientEngine {}