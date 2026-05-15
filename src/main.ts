import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { VueQueryPlugin } from '@tanstack/vue-query'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'md-editor-v3/lib/style.css'
import { applyThemeColor } from './core/theme'

const app = createApp(App)
app.use(router)
app.use(VueQueryPlugin)
app.use(ElementPlus)
applyThemeColor()
app.mount('#app')
