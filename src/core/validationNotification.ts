import { h } from 'vue'
import {
  addValidationReporter,
  getValidationToastEnabled,
  setValidationToastEnabled,
  type ValidationIssue,
} from './schemas'

const detailLabelStyle: Record<string, string> = {
  margin: '0 0 6px 0',
  fontWeight: '600',
  fontSize: '13px',
  color: '#303133',
}
const issueRowStyle: Record<string, string> = {
  marginBottom: '6px',
  fontSize: '13px',
  lineHeight: '1.5',
  paddingLeft: '4px',
  borderLeft: '2px solid var(--el-color-warning-light-5)',
}
const codeStyle: Record<string, string> = {
  padding: '1px 5px',
  borderRadius: '3px',
  background: 'var(--el-color-warning-light-9)',
  color: 'var(--el-color-warning-dark-2)',
  fontFamily: 'monospace',
  fontSize: '12px',
}
const typeInfoStyle: Record<string, string> = {
  color: '#909399',
  fontSize: '12px',
}
const dismissBtnStyle: Record<string, string> = {
  display: 'inline-block',
  marginTop: '8px',
  padding: '0',
  border: 'none',
  background: 'none',
  color: 'var(--el-color-primary)',
  cursor: 'pointer',
  fontSize: '12px',
}

export function setupValidationReporters() {
  if (import.meta.env.DEV) {
    import('element-plus').then(({ ElNotification }) => {
      addValidationReporter((report) => {
        if (!getValidationToastEnabled()) { return }

        const renderIssue = (issue: ValidationIssue) => {
          const children = [
            h('code', { style: codeStyle }, issue.path),
            h('span', { style: { margin: '0 6px', color: '#909399' } }, '—'),
            h('span', null, issue.message),
          ]
          if (issue.code === 'invalid_type' && issue.expected && issue.received) {
            children.push(
              h('span', { style: typeInfoStyle }, ` (期望类型: ${issue.expected}, 实际类型: ${issue.received})`),
            )
          }
          return h('div', { style: issueRowStyle }, children)
        }

        const notification = ElNotification({
          title: `数据校验失败: ${report.schema}`,
          message: h('div', [
            h('p', { style: detailLabelStyle }, '校验详情:'),
            ...report.issues.map(renderIssue),
            h(
              'button',
              {
                style: dismissBtnStyle,
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
  addValidationReporter((report) => {
    const url = import.meta.env.VITE_MONITOR_VALIDATION_URL
    if (!url) { return }
    navigator.sendBeacon?.(url, JSON.stringify(report))
  })
}
