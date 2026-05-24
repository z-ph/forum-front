import apiClient from '@/core/apiClient'
import type { ApiResponse, Page } from '@/types/api'

export interface ReplyVO {
  id: number
  topicId: number
  creatorId: number
  creatorNickname: string
  parentReplyId: number
  replyToUserId: number
  replyToUserNickname: string
  content: string
  createTime: string
  updateTime: string
  isDeleted: number
}

export interface ReplyCreateRequest {
  topicId: number
  parentReplyId?: number
  content: string
}

export interface ReplyTopPageQuery {
  topicId: number
  pageNum?: number
  pageSize?: number
}

export interface ReplyChildPageQuery {
  parentReplyId: number
  pageNum?: number
  pageSize?: number
}

/** POST /reply - 新增回复 */
export async function createReply(data: ReplyCreateRequest): Promise<ApiResponse<string>> {
  const response = await apiClient.post<ApiResponse<string>>('/reply', data)
  return response.data
}

/** DELETE /reply/{id} - 删除回复 */
export async function deleteReply(id: number): Promise<ApiResponse<string>> {
  const response = await apiClient.delete<ApiResponse<string>>('/reply/' + id)
  return response.data
}

/** POST /reply/top/page - 分页查询顶级回复（公开） */
export async function getReplyTopPage(data: ReplyTopPageQuery): Promise<ApiResponse<Page<ReplyVO>>> {
  const response = await apiClient.post<ApiResponse<Page<ReplyVO>>>('/reply/top/page', data)
  return response.data
}

/** POST /reply/child/page - 分页查询子回复（公开） */
export async function getReplyChildPage(data: ReplyChildPageQuery): Promise<ApiResponse<Page<ReplyVO>>> {
  const response = await apiClient.post<ApiResponse<Page<ReplyVO>>>('/reply/child/page', data)
  return response.data
}

/** GET /reply/my - 查询当前用户的回复 */
export async function getMyReplies(params: {
  pageNum?: number
  pageSize?: number
}): Promise<ApiResponse<Page<ReplyVO>>> {
  const response = await apiClient.get<ApiResponse<Page<ReplyVO>>>('/reply/my', { params })
  return response.data
}
