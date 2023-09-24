import { RpgModule, RpgClient } from '@rpgjs/client'
import ChoiceUi from './window/choice.vue'
import MenuUi from './menu/main.vue'
import ShopUi from './shop/main.vue'
import WindowUi from './window/window.vue'
import DialogGui from './window/dialog.vue'
import DisconnectUi from './notifications/disconnected.vue'
import NotificationUi from './notifications/alert.vue'
import { GuiSounds } from './assets/sounds'

import ControlGui from './menu_button/controls/main.vue'
import { sceneMap } from './menu_button/scene-map'

@RpgModule<RpgClient>({
    gui: [
        MenuUi,
        ChoiceUi,
        ShopUi,
        WindowUi,
        DialogGui,
        ControlGui,
        NotificationUi,
        DisconnectUi
    ],
    scenes: {
        map: sceneMap
    }
})
export default class RpgClientEngine {}