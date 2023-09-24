//import './assets/main.css';
import "primevue/resources/themes/lara-light-indigo/theme.css";


import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';

import  InputText  from "primevue/inputtext";
import  Password  from "primevue/password";
import  Button  from "primevue/button";
import  Toast  from "primevue/toast";
import  Card  from "primevue/card";
import MultiSelect  from 'primevue/multiselect';
import InputSwitch from 'primevue/inputswitch';


import { RpgClient, RpgModule, RpgGui , RpgClientEngine } from '@rpgjs/client'
import taskList from './gui/task/TaskList.vue'


const setupApp = (app) => {
    app.use(PrimeVue, {
        zIndex: {
            modal: 9999,        //dialog, sidebar
            overlay: 9999,      //dropdown, overlaypanel
            menu: 1000,         //overlay menus
            tooltip: 1100,       //tooltip
            toast: 9999
        }
    });
    app.use(ToastService);
    
    app.component('InputText', InputText);
    app.component('Button', Button);
    app.component('Password', Password);
    app.component('Toast', Toast);
    app.component('Card', Card);
    app.component('MultiSelect', MultiSelect);
    app.component('InputSwitch', InputSwitch);
}

@RpgModule<RpgClient>({ 
    gui: [
        taskList,
    ],
    engine: {
        onStart(engine: RpgClientEngine){
            setupApp(engine.vueApp);
        }
    }
})
export default class RpgClientEngineModule {}