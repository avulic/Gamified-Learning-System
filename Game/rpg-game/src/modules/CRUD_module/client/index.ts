import { RpgClient, RpgModule, RpgGui, RpgClientEngine,RpgClientEngineHooks } from '@rpgjs/client'

import { TheWelcome, WelcomeItem, Navbar}  from './components/index';

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

        
        // engine.vueApp.use(FloatingVue, {
        //     container: '#tooltips',
        //     disposeTimeout: 0,
        // })

        
        app.component("Navbar", Navbar)
        app.component("WelcomeItem", WelcomeItem)
        app.component("TheWelcome", TheWelcome)


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
        app.use(router);

        app.component('InputText', InputText);
        app.component('Button', Button);
        app.component('Password', Password);
        app.component('Toast', Toast);
        app.component('Card', Card);
        app.component('MultiSelect', MultiSelect);
        app.component('InputSwitch', InputSwitch);

        

        Crudapp.component("CrudApp", App)

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

        Crudapp.mount("#app")
    }
}


@RpgModule<RpgClient>({ 
    engine: engine,
    gui: [
        App
    ],
})
export default class RpgClientEngineModule {}
