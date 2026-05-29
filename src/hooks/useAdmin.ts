import { useMutation, useQuery, useQueryClient, type QueryKey } from '@tanstack/vue-query'
import { computed, type Ref } from 'vue'
import * as userApi from '../services/userApi'
import * as topicApi from '../services/topicApi'
import * as categoryApi from '../services/categoryApi'
import * as tagApi from '../services/tagApi'
import type { AdminUserQuery, AdminTopicQuery } from '../types/admin'
import { forumKeys } from './useForum'
import { isApiSuccess } from '../core/apiClient'

// ── Query key factory ──────────────────────────────────────

export const adminKeys = {
  users: (params: AdminUserQuery) => ['admin', 'users', params] as const,
  topics: (params: AdminTopicQuery) => ['admin', 'topics', params] as const,
  categories: ['admin', 'categories'] as const,
  tags: ['admin', 'tags'] as const,
}

// ── Query: Admin Users ─────────────────────────────────────

export function useAdminUsersQuery(params: Ref<AdminUserQuery>) {
  return useQuery({
    queryKey: computed(() => adminKeys.users(params.value)),
    queryFn: async () => {
      const res = await userApi.getUserPage(params.value)
      if (!isApiSuccess(res)) {throw new Error(res.msg || '加载用户列表失败')}
      return res.data
    },
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  })
}

// ── Query: Admin Topics ────────────────────────────────────

export function useAdminTopicsQuery(params: Ref<AdminTopicQuery>) {
  return useQuery({
    queryKey: computed(() => adminKeys.topics(params.value)),
    queryFn: async () => {
      const res = await topicApi.pageTopics(params.value)
      if (!isApiSuccess(res)) {throw new Error(res.msg || '加载话题列表失败')}
      return res.data
    },
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  })
}

// ── Query: Admin Categories ────────────────────────────────

export function useAdminCategoriesQuery() {
  return useQuery({
    queryKey: adminKeys.categories,
    queryFn: async () => {
      const res = await categoryApi.getAllCategoriesTree()
      if (!isApiSuccess(res)) {throw new Error(res.msg || '加载分类列表失败')}
      return res.data
    },
    staleTime: 30_000,
  })
}

// ── Query: Admin Tags ──────────────────────────────────────

export function useAdminTagsQuery() {
  return useQuery({
    queryKey: adminKeys.tags,
    queryFn: async () => {
      const res = await tagApi.selectAllTags()
      if (!isApiSuccess(res)) {throw new Error(res.msg || '加载标签列表失败')}
      return res.data
    },
    staleTime: 30_000,
  })
}

// ── Mutation factory ───────────────────────────────────────

function createAdminMutation<TData, TVars>(
  mutationFn: (vars: TVars) => Promise<TData>,
  invalidations: (data: TData, vars: TVars) => QueryKey[],
) {
  return () => {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn,
      onSuccess: (data, vars) => {
        void queryClient.invalidateQueries({ queryKey: forumKeys.home })
        for (const key of invalidations(data as TData, vars as TVars)) {
          void queryClient.invalidateQueries({ queryKey: key })
        }
      },
    })
  }
}

// ── User Mutations ─────────────────────────────────────────

export const useToggleUserStatusMutation = createAdminMutation(
  (vars: { id: number; status: boolean }) => userApi.updateUserStatus(vars),
  () => [['admin', 'users']],
)

// ── Topic Mutations ────────────────────────────────────────

export const useToggleTopicStatusMutation = createAdminMutation(
  (vars: { id: number; status: boolean }) => topicApi.updateTopicStatus(vars.id, vars.status),
  () => [['admin', 'topics']],
)

export const useDeleteTopicMutation = createAdminMutation(
  (id: number) => topicApi.deleteTopic(id),
  () => [['admin', 'topics']],
)

// ── Category Mutations ─────────────────────────────────────

export const useCreateCategoryMutation = createAdminMutation(
  (data: categoryApi.CategoryCreateRequest) => categoryApi.createCategory(data),
  () => [['admin', 'categories']],
)

export const useUpdateCategoryMutation = createAdminMutation(
  (vars: { id: number; data: categoryApi.CategoryCreateRequest }) =>
    categoryApi.updateCategory(vars.id, vars.data),
  () => [['admin', 'categories']],
)

export const useDeleteCategoryMutation = createAdminMutation(
  (id: number) => categoryApi.deleteCategory(id),
  () => [['admin', 'categories']],
)

// ── Tag Mutations ──────────────────────────────────────────

export const useCreateTagMutation = createAdminMutation(
  (data: tagApi.TagCreateRequest) => tagApi.createTag(data),
  () => [['admin', 'tags']],
)

export const useUpdateTagMutation = createAdminMutation(
  (vars: { id: number; data: tagApi.TagCreateRequest }) => tagApi.updateTag(vars.id, vars.data),
  () => [['admin', 'tags']],
)

export const useDeleteTagMutation = createAdminMutation(
  (id: number) => tagApi.deleteTag(id),
  () => [['admin', 'tags']],
)

// ── Auth Guard ─────────────────────────────────────────────

export function useAdminAuth() {
  const { data: user, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'auth'],
    queryFn: async () => {
      const res = await userApi.getCurrentUser()
      if (!isApiSuccess(res) || !res.data) {throw new Error('未登录')}
      return res.data
    },
    staleTime: 60_000,
    retry: false,
  })

  const isAdmin = computed(() => user.value?.role === 'ADMIN')

  return { user, isLoading, isError, refetch, isAdmin }
}

export { flattenCategoryTree } from '../services/categoryApi'
