
import { RpgServer, RpgModule, RpgServerEngine, RpgPlayer, RpgWorld, RpgPlugin } from '@rpgjs/server'


@RpgModule<RpgServer>({
    player: {
        onConnected(player: RpgPlayer) {

        }
    }
})
export default class RpgServerModule { }