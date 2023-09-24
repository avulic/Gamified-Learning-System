import { RpgClientEngine, RpgClientEngineHooks } from '@rpgjs/client'

const engine: RpgClientEngineHooks = {
    onStart(engine: RpgClientEngine){
        console.log("starting")
        //return false;
    },
    onConnected(engine: RpgClientEngine) {
        console.log("Connected")
    },
}

export default engine