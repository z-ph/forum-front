import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { VueQueryPlugin } from '@tanstack/vue-query'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'md-editor-v3/lib/style.css'
import { applyThemeColor } from './core/theme'
import { configureValidationReporter } from './core/schemas'

if (import.meta.env.DEV) {
  // Dev: notify via Element Plus toast for instant visibility
  import('element-plus').then(({ ElNotification }) => {
    configureValidationReporter((report) => {
      ElNotification({
        title: `数据校验失败: ${report.schema}`,
        message: report.issues.join('; '),
        type: 'warning',
        duration: 6000,
      })
    })
  })
} else {
  // Production: POST to monitoring endpoint (configurable via VITE_MONITOR_VALIDATION_URL)
  configureValidationReporter((report) => {
    const url = import.meta.env.VITE_MONITOR_VALIDATION_URL
    if (!url) { return }
    const body = JSON.stringify(report)
    // Use sendBeacon for reliable delivery (doesn't block page unload)
    navigator.sendBeacon?.(url, body)
  })
}

const app = createApp(App)
app.use(router)
app.use(VueQueryPlugin)
app.use(ElementPlus)
applyThemeColor()
app.mount('#app')
