import apiClient from '@/core/apiClient'
import type { ApiResponse, TagVO } from '@/types/api'

export interface TagCreateRequest {
  name: string
}

// ---------- API Functions ----------

/** POST /tag - 新增标签 */
export async function createTag(data: TagCreateRequest): Promise<ApiResponse<string>> {
  const response = await apiClient.post<ApiResponse<string>>('/tag', data)
  return response.data
}

/** DELETE /tag/{id} - 删除标签 */
export async function deleteTag(id: number): Promise<ApiResponse<string>> {
  const response = await apiClient.delete<ApiResponse<string>>('/tag/' + id)
  return response.data
}

/** PUT /tag/{id} - 修改标签 */
export async function updateTag(id: number, data: TagCreateRequest): Promise<ApiResponse<string>> {
  const response = await apiClient.put<ApiResponse<string>>('/tag/' + id, data)
  return response.data
}

/** GET /tag/selectAll - 查询所有标签（公开） */
export async function selectAllTags(): Promise<ApiResponse<TagVO[]>> {
  const response = await apiClient.get<ApiResponse<TagVO[]>>('/tag/selectAll')
  return response.data
}

/** GET /tag/search - 按名称搜索标签（公开） */
export async function searchTags(name: string): Promise<ApiResponse<TagVO[]>> {
  const response = await apiClient.get<ApiResponse<TagVO[]>>('/tag/search', {
    params: { name }
  })
  return response.data
}