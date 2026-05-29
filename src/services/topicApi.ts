import apiClient from '@/core/apiClient'
import type { ApiResponse, AttachmentVO, Page, TagVO } from '@/types/api'

// ---------- Topic Types ----------

export interface TopicVO {
  id: number
  categoryId: number
  categoryName: string
  creatorId: number
  creatorNickname: string
  title: string
  content: string
  status: number
  viewCount: number
  replyCount: number
  createTime: string
  updateTime: string | null
  isDeleted: number
  tags: TagVO[]
  attachments?: AttachmentVO[]
}

export interface TopicCreateRequest {
  categoryId: number
  title: string
  content: string
  tagIds?: number[]
}

export interface TopicUpdateRequest {
  categoryId?: number
  title?: string
  content?: string
  tagIds?: number[]
  deleteAttachmentIds?: number[]
}

export interface TopicPageQuery {
  parentId?: number
  categoryId?: number
  tagId?: number
  pageNum?: number
  pageSize?: number
}

// ---------- API Functions ----------

/** Convert topic create request to multipart/form-data */
function toTopicCreateFormData(data: TopicCreateRequest): FormData {
  const fd = new FormData()
  fd.append('topic.categoryId', String(data.categoryId))
  fd.append('topic.title', data.title)
  fd.append('topic.content', data.content)
  if (data.tagIds?.length) {
    for (const id of data.tagIds) {
      fd.append('topic.tagIds', String(id))
    }
  }
  return fd
}

/** Convert topic update request to multipart/form-data */
function toTopicUpdateFormData(data: TopicUpdateRequest): FormData {
  const fd = new FormData()
  if (data.categoryId !== undefined) { fd.append('topic.categoryId', String(data.categoryId)) }
  if (data.title !== undefined) { fd.append('topic.title', data.title) }
  if (data.content !== undefined) { fd.append('topic.content', data.content) }
  if (data.tagIds?.length) {
    for (const id of data.tagIds) {
      fd.append('topic.tagIds', String(id))
    }
  }
  if (data.deleteAttachmentIds?.length) {
    for (const id of data.deleteAttachmentIds) {
      fd.append('deleteAttachmentIds', String(id))
    }
  }
  return fd
}

/** POST /topic - 新增话题 (multipart/form-data) */
export async function createTopic(data: TopicCreateRequest): Promise<ApiResponse<string>> {
  const formData = toTopicCreateFormData(data)
  const response = await apiClient.post<ApiResponse<string>>('/topic', formData)
  return response.data
}

/** DELETE /topic/{id} - 删除话题 */
export async function deleteTopic(id: number): Promise<ApiResponse<string>> {
  const response = await apiClient.delete<ApiResponse<string>>('/topic/' + id)
  return response.data
}

/** PUT /topic/{id} - 修改话题 (multipart/form-data) */
export async function updateTopic(id: number, data: TopicUpdateRequest): Promise<ApiResponse<string>> {
  const formData = toTopicUpdateFormData(data)
  const response = await apiClient.put<ApiResponse<string>>('/topic/' + id, formData)
  return response.data
}

/** GET /topic/selectAll - 查询所有话题（公开） */
export async function selectAllTopics(): Promise<ApiResponse<TopicVO[]>> {
  const response = await apiClient.get<ApiResponse<TopicVO[]>>('/topic/selectAll')
  return response.data
}

/** POST /topic/page - 分页查询话题（公开） */
export async function pageTopics(data: TopicPageQuery): Promise<ApiResponse<Page<TopicVO>>> {
  const response = await apiClient.post<ApiResponse<Page<TopicVO>>>('/topic/page', data)
  return response.data
}

/** GET /topic/detail/{id} - 查询话题详情（公开） */
export async function getTopicDetail(id: number): Promise<ApiResponse<TopicVO>> {
  const response = await apiClient.get<ApiResponse<TopicVO>>('/topic/detail/' + id)
  return response.data
}

/** PUT /topic/{id}/status - 修改话题状态（公开） */
export async function updateTopicStatus(id: number, status: boolean): Promise<ApiResponse<string>> {
  const response = await apiClient.put<ApiResponse<string>>('/topic/' + id + '/status', null, {
    params: { status },
  })
  return response.data
}

/** GET /topic/my - 查询我的话题 */
export async function getMyTopics(
  pageNum = 1,
  pageSize = 10,
): Promise<ApiResponse<Page<TopicVO>>> {
  const response = await apiClient.get<ApiResponse<Page<TopicVO>>>('/topic/my', {
    params: { pageNum, pageSize },
  })
  return response.data
}
