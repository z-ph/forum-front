import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { VueQueryPlugin } from '@tanstack/vue-query'
import router from './router'
import 'md-editor-v3/lib/style.css'
import { applyThemeColor } from './core/theme'
import { setupValidationReporters } from './core/validationNotification'

setupValidationReporters()

const app = createApp(App)
app.use(router)
app.use(VueQueryPlugin)
applyThemeColor()
app.mount('#app')
