import apiClient, { isApiSuccess } from '@/core/apiClient'
import type { ApiResponse, Page } from '@/types/api'

export type UserRole = 'USER' | 'ADMIN'

export interface UserVO {
  id: number
  username: string
  email: string
  nickname: string
  avatar: string
  role: UserRole
  status: number
  createTime: string
  updateTime: string | null
}

export interface RegisterRequest {
  username: string
  email: string
  nickname: string
  password: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface UpdateUserRequest {
  id: number
  avatar: File
  nickname?: string
  email?: string
}

export interface UpdateUserStatusRequest {
  id: number
  status: boolean
}

export interface UserPageQuery {
  username?: string
  email?: string
  status?: number
  createTimeStart?: string
  createTimeEnd?: string
  pageNum?: number
  pageSize?: number
}

export async function register(payload: RegisterRequest): Promise<ApiResponse<string>> {
  const response = await apiClient.post<ApiResponse<string>>('/user/register', payload)
  return response.data
}

export async function login(payload: LoginRequest): Promise<ApiResponse<string>> {
  const response = await apiClient.post<ApiResponse<string>>('/user/login', payload)
  const body = response.data
  if (isApiSuccess(body)) {
    localStorage.setItem('token', body.data)
  }
  return body
}

export async function getCurrentUser(): Promise<ApiResponse<UserVO>> {
  const response = await apiClient.get<ApiResponse<UserVO>>('/user/me')
  return response.data
}

export async function updateUser(payload: UpdateUserRequest): Promise<ApiResponse<string>> {
  const formData = new FormData()
  formData.append('id', String(payload.id))
  formData.append('avatar', payload.avatar)
  if (payload.nickname !== undefined) {
    formData.append('nickname', payload.nickname)
  }
  if (payload.email !== undefined) {
    formData.append('email', payload.email)
  }
  const response = await apiClient.put<ApiResponse<string>>('/user/update', formData)
  return response.data
}

export async function updateUserStatus(payload: UpdateUserStatusRequest): Promise<ApiResponse<string>> {
  const response = await apiClient.put<ApiResponse<string>>(
    `/user/${payload.id}/status`,
    null,
    { params: { status: payload.status } },
  )
  return response.data
}

export async function getUserPage(query: UserPageQuery): Promise<ApiResponse<Page<UserVO>>> {
  const response = await apiClient.post<ApiResponse<Page<UserVO>>>('/user/page', query)
  return response.data
}
