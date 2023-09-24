
import { RpgServer, RpgModule, RpgServerEngine, RpgPlayer, RpgWorld, RpgPlugin } from '@rpgjs/server'


@RpgModule<RpgServer>({
    player: {
        onConnected(player: RpgPlayer) {
            console.log("opening")
            const gui = player.gui('taskList')
            gui.open()
        }
    }
})
export default class RpgServerModule { }