import apiClient from '@/core/apiClient'
import type { ApiResponse } from '@/types/api'

/** GET /attachment/url/{id} - 获取附件预览签名URL */
export async function getAttachmentUrl(id: number): Promise<ApiResponse<string>> {
  const response = await apiClient.get<ApiResponse<string>>('/attachment/url/' + id)
  return response.data
}

/** GET /attachment/download-url/{id} - 获取附件下载签名URL */
export async function getAttachmentDownloadUrl(id: number): Promise<ApiResponse<string>> {
  const response = await apiClient.get<ApiResponse<string>>('/attachment/download-url/' + id)
  return response.data
}

/**
 * 下载附件并触发浏览器下载
 */
export async function downloadAttachment(id: number, fileName: string): Promise<void> {
  const res = await getAttachmentDownloadUrl(id)
  if (res.code !== 1 || !res.data) {
    throw new Error(res.msg || '获取下载地址失败')
  }
  const link = document.createElement('a')
  link.href = res.data
  link.setAttribute('download', fileName)
  link.target = '_blank'
  document.body.appendChild(link)
  link.click()
  link.remove()
}
