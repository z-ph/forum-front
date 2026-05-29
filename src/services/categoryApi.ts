import apiClient from '@/core/apiClient'
import type { ApiResponse } from '@/types/api'

export interface CategoryCreateRequest {
  parentId: number
  name: string
  description?: string
}

export interface CategoryVO {
  id: number
  parentId: number
  name: string
  description: string
  creatorId: number
  creatorNickname: string
  createTime: string
  updateTime: string | null
  isDeleted: number
}

export interface CategoryTreeVO extends CategoryVO {
  children: CategoryTreeVO[]
}

export async function createCategory(data: CategoryCreateRequest): Promise<ApiResponse<string>> {
  const response = await apiClient.post<ApiResponse<string>>('/category', data)
  return response.data
}

export async function updateCategory(id: number, data: CategoryCreateRequest): Promise<ApiResponse<string>> {
  const response = await apiClient.put<ApiResponse<string>>('/category/' + id, data)
  return response.data
}

export async function deleteCategory(id: number): Promise<ApiResponse<string>> {
  const response = await apiClient.delete<ApiResponse<string>>('/category/' + id)
  return response.data
}

export async function getParentCategories(): Promise<ApiResponse<CategoryVO[]>> {
  const response = await apiClient.get<ApiResponse<CategoryVO[]>>('/category/parents')
  return response.data
}

export async function getChildCategories(parentId: number): Promise<ApiResponse<CategoryVO[]>> {
  const response = await apiClient.get<ApiResponse<CategoryVO[]>>('/category/children/' + parentId)
  return response.data
}

export async function searchCategories(name: string): Promise<ApiResponse<CategoryVO[]>> {
  const response = await apiClient.get<ApiResponse<CategoryVO[]>>('/category/search', {
    params: { name }
  })
  return response.data
}

export async function getAllCategoriesTree(): Promise<ApiResponse<CategoryTreeVO[]>> {
  const response = await apiClient.get<ApiResponse<CategoryTreeVO[]>>('/category/selectAll')
  return response.data
}

/** Flatten a category tree into a flat array, stripping the children property. */
export function flattenCategoryTree(tree: CategoryTreeVO[]): CategoryVO[] {
  const result: CategoryVO[] = []
  function walk(nodes: CategoryTreeVO[]) {
    for (const node of nodes) {
      const { children, ...category } = node
      result.push(category as CategoryVO)
      if (children && children.length > 0) {
        walk(children)
      }
    }
  }
  walk(tree)
  return result
}
