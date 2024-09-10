import { createApp } from 'vue';

import './assets/main.css';
//import 'primevue/resources/themes/aura-light-green/theme.css'
//import 'primevue/resources/themes/saga-blue/theme.css'       //theme
//import 'primevue/resources/primevue.min.css'                 //core css



import App from './App.vue';
import router from './router';

import PrimeVue from 'primevue/config';

import Panel from "primevue/panel";
import Lara from "@/presets/lara";

import ToastService from 'primevue/toastservice';

import  InputText  from "primevue/inputtext";
import  Password  from "primevue/password";
import  Button  from "primevue/button";
import  Toast  from "primevue/toast";
import  Card  from "primevue/card";
import MultiSelect  from 'primevue/multiselect';
import InputSwitch from 'primevue/inputswitch';

import Textarea from 'primevue/textarea';
import Calendar from 'primevue/calendar';
import Checkbox from 'primevue/checkbox';
import Chips  from 'primevue/chips';
import ConfirmDialog from 'primevue/confirmdialog';
import RadioButton from 'primevue/RadioButton';

import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Dialog from 'primevue/dialog';
import Chip from 'primevue/chip';
import InputNumber from 'primevue/inputnumber';
import Dropdown from 'primevue/dropdown';
import TabPanel from 'primevue/tabpanel';
import TabView from 'primevue/TabView';
import Toolbar from 'primevue/Toolbar';
import InputIcon from 'primevue/InputIcon';
import FileUpload from 'primevue/FileUpload';
import IconField from 'primevue/IconField';
import Rating from 'primevue/Rating';
import ProgressBar from 'primevue/ProgressBar';
import Tag from 'primevue/Tag';
import SplitButton from 'primevue/SplitButton';



import ConfirmationService from 'primevue/confirmationservice'

const app = createApp(App);
app.use(PrimeVue, {
    unstyled: true,
    pt: Lara,
    ripple: true,
    inputStyle: "filled",
    zIndex: {
        modal: 9999,        //dialog, sidebar
        overlay: 9999,      //dropdown, overlaypanel
        menu: 1000,         //overlay menus
        tooltip: 1100,       //tooltip
        toast: 9999
    }
});
app.use(ConfirmationService)
app.use(ToastService);
app.use(router)



app.component('InputText', InputText);
app.component('Button', Button);
app.component('Password', Password);
app.component('Toast', Toast);
app.component('Card', Card);
app.component('MultiSelect', MultiSelect);
app.component('InputSwitch', InputSwitch);
app.component('Textarea', Textarea);
app.component('Calendar', Calendar );
app.component('Checkbox', Checkbox);
app.component('DataTable', DataTable);
app.component('Column', Column);
app.component('Dialog', Dialog);
app.component('Chip', Chip);
app.component('Chips', Chips);
app.component('ConfirmDialog', ConfirmDialog);
app.component('InputNumber', InputNumber);
app.component('Dropdown', Dropdown);
app.component('TabPanel', TabPanel);
app.component('TabView', TabView);
app.component('Toolbar', Toolbar);
app.component('InputIcon', InputIcon);
app.component('FileUpload', FileUpload);
app.component('IconField', IconField);
app.component('Rating', Rating);
app.component('ProgressBar', ProgressBar);
app.component('Tag', Tag);
app.component('RadioButton', RadioButton);
app.component('SplitButton', SplitButton);

app.mount('#app')
