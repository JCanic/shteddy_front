import { createApp } from 'vue'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import Login from './components/Login.vue'
import Overview from './components/Overview.vue'

import './assets/main.css'

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
app.use(router)
app.mount('#app')
