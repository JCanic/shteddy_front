import { createApp } from 'vue'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import Login from './components/Login.vue'
import Overview from './components/Overview.vue'
import BootstrapVue3 from 'bootstrap-vue-3';
import './assets/main.css'
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue-3/dist/bootstrap-vue-3.css';
import VueApexCharts from "vue3-apexcharts";


const routes = [
    { path: '/', component: Login },
    { path: '/overview/:user', component: Overview, name: 'overview' }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router

const app = createApp(App)
app.use(VueApexCharts);
app.use(router)
app.use(BootstrapVue3);
app.mount('#app')
