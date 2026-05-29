import apiClient from '@/core/apiClient'

/** GET /attachment/view/{id} - 附件在线预览（图片） */
export function getAttachmentViewUrl(id: number): string {
  const token = localStorage.getItem('token')
  const baseUrl = apiClient.defaults.baseURL ?? ''
  const params = token ? `?token=${encodeURIComponent(token)}` : ''
  return `${baseUrl}/attachment/view/${id}${params}`
}

/** GET /attachment/download/{id} - 附件下载 */
export function getAttachmentDownloadUrl(id: number): string {
  const token = localStorage.getItem('token')
  const baseUrl = apiClient.defaults.baseURL ?? ''
  const params = token ? `?token=${encodeURIComponent(token)}` : ''
  return `${baseUrl}/attachment/download/${id}${params}`
}

/**
 * 下载附件并触发浏览器下载
 */
export async function downloadAttachment(id: number, fileName: string): Promise<void> {
  const response = await apiClient.get(`/attachment/download/${id}`, {
    responseType: 'blob',
  })

  const url = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', fileName)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}
