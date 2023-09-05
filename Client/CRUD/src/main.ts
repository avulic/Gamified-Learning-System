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

const app = createApp(App);
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
app.use(router)



app.component('InputText', InputText);
app.component('Button', Button);
app.component('Password', Password);
app.component('Toast', Toast);
app.component('Card', Card);
app.component('MultiSelect', MultiSelect);
app.component('InputSwitch', InputSwitch);

app.mount('#app')
