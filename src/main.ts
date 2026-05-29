import { createApp, h } from 'vue'
import './style.css'
import App from './App.vue'
import { VueQueryPlugin } from '@tanstack/vue-query'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'md-editor-v3/lib/style.css'
import { applyThemeColor } from './core/theme'
import { configureValidationReporter, getValidationToastEnabled, setValidationToastEnabled } from './core/schemas'

if (import.meta.env.DEV) {
  import('element-plus').then(({ ElNotification }) => {
    configureValidationReporter((report) => {
      if (!getValidationToastEnabled()) { return }
      const notification = ElNotification({
        title: `数据校验失败: ${report.schema}`,
        message: h('div', [
          h('span', report.issues.join('; ')),
          h(
            'button',
            {
              style: {
                display: 'inline-block',
                marginTop: '8px',
                padding: '0',
                border: 'none',
                background: 'none',
                color: 'var(--el-color-primary)',
                cursor: 'pointer',
                fontSize: '12px',
              },
              onClick: () => {
                setValidationToastEnabled(false)
                notification.close()
              },
            },
            '不再弹窗',
          ),
        ]),
        type: 'warning',
        duration: 6000,
      })
    })
  })
}

// Production: POST to monitoring endpoint (configurable via VITE_MONITOR_VALIDATION_URL)
configureValidationReporter((report) => {
  const url = import.meta.env.VITE_MONITOR_VALIDATION_URL
  if (!url) { return }
  const body = JSON.stringify(report)
  navigator.sendBeacon?.(url, body)
})

const app = createApp(App)
app.use(router)
app.use(VueQueryPlugin)
app.use(ElementPlus)
applyThemeColor()
app.mount('#app')
