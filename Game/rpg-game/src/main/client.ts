import { RpgClientEngine, RpgClientEngineHooks } from '@rpgjs/client'

const engine: RpgClientEngineHooks = {
    onStart(engine: RpgClientEngine){
        console.log("starting")
    },
    onConnected(engine: RpgClientEngine) {
        console.log("Connected")
    },
}

export default engine