import { RpgClient, RpgModule, RpgGui, RpgClientEngine,RpgClientEngineHooks } from '@rpgjs/client';

import { TheWelcome, WelcomeItem, Navbar}  from './components/index';
import { RpgView }  from './views/index';


import './assets/main.css';
import "primevue/resources/themes/lara-light-indigo/theme.css";

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import  InputText  from "primevue/inputtext";
import  Password  from "primevue/password";
import  Button  from "primevue/button";
import  Toast  from "primevue/toast";
import  Card  from "primevue/card";
import MultiSelect  from 'primevue/multiselect';
import InputSwitch from 'primevue/inputswitch';


const Crudapp = createApp(App);

const engine: RpgClientEngineHooks = {
    onStart(engine: RpgClientEngine) {
        const app = engine.vueApp;
        const appInstance = engine.vueInstance;

        Crudapp.use(PrimeVue, {
            zIndex: {
                modal: 9999,        //dialog, sidebar
                overlay: 9999,      //dropdown, overlaypanel
                menu: 1000,         //overlay menus
                tooltip: 1100,       //tooltip
                toast: 9999
            }
        });
        Crudapp.use(ToastService);
        Crudapp.use(router);

        Crudapp.component('InputText', InputText);
        Crudapp.component('Button', Button);
        Crudapp.component('Password', Password);
        Crudapp.component('Toast', Toast);
        Crudapp.component('Card', Card);
        Crudapp.component('MultiSelect', MultiSelect);
        Crudapp.component('InputSwitch', InputSwitch);

        Crudapp.component("CrudApp", App);
        Crudapp.component("Navbar", Navbar);
        Crudapp.component("WelcomeItem", WelcomeItem);
        Crudapp.component("TheWelcome", TheWelcome);
        Crudapp.component("RpgView", RpgView);

        Crudapp.mount("#app");
    },
    onConnected(engine: RpgClientEngine){
        
    }
}


@RpgModule<RpgClient>({ 
    engine: engine,
    gui: [
        App,
        Navbar,
        RpgView
    ],
})
export default class RpgClientEngineModule {}
