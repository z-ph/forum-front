import { useMutation, useQuery, useQueryClient, type QueryKey } from '@tanstack/vue-query'
import { ref, type Ref } from 'vue'
import type {
  AuthPayload,
  CreateReplyPayload,
  CreateTopicPayload,
  ForumCategory,
  ForumHomeData,
  ForumReply,
  ForumTopic,
  ForumTopicDetail,
  ForumUser,
  RegisterPayload,
} from '../types/forum'
import {
  buildUserMap,
  extendUserMapFromReplies,
  toForumCategory,
  toForumReply,
  toForumTopic,
  toForumTopicDetail,
  toForumUser,
  toForumUserFromCreator,
} from '../services/forumAdapter'
import type { TagVO } from '../types/api'
import * as categoryApi from '../services/categoryApi'
import { flattenCategoryTree } from '../services/categoryApi'
import * as replyApi from '../services/replyApi'
import * as tagApi from '../services/tagApi'
import * as topicApi from '../services/topicApi'
import * as userApi from '../services/userApi'

export const forumKeys = {
  home: ['forum', 'home'] as const,
  detail: (id: string) => ['forum', 'detail', id] as const,
  childReplies: (parentReplyId: string) => ['forum', 'childReplies', parentReplyId] as const,
}

// ---------- Tag name-to-ID map ----------

const tagMap = ref(new Map<string, number>())

// ---------- Data-fetching functions ----------

async function getForumHome(): Promise<ForumHomeData> {
  const [userRes, categoryRes, tagRes, topicRes] = await Promise.all([
    userApi.getCurrentUser().catch(() => ({ code: 0, msg: '', data: null as unknown as userApi.UserVO })),
    categoryApi.getAllCategoriesTree().catch(() => ({ code: 0, msg: '', data: [] as categoryApi.CategoryTreeVO[] })),
    tagApi.selectAllTags().catch(() => ({ code: 0, msg: '', data: [] as TagVO[] })),
    topicApi.selectAllTopics().catch(() => ({ code: 0, msg: '', data: [] as topicApi.TopicVO[] })),
  ])

  const me = userRes.code === 200 ? toForumUser(userRes.data) : null

  // Update tag map so createTopicReal can resolve tag names to IDs.
  if (tagRes.code === 1 && tagRes.data) {
    const map = new Map<string, number>()
    for (const tag of tagRes.data) {
      map.set(tag.name, tag.id)
    }
    tagMap.value = map
  }

  const rawCategories = categoryRes.code === 1 ? flattenCategoryTree(categoryRes.data ?? []) : []
  const categories: ForumCategory[] = rawCategories.map((c) => toForumCategory(c))

  const availableTags: string[] = tagRes.code === 1 ? (tagRes.data ?? []).map((t) => t.name) : []

  const rawTopics = topicRes.code === 1 ? (topicRes.data ?? []) : []
  const userMap = buildUserMap([], rawTopics)
  const topics: ForumTopic[] = rawTopics.map((t) => toForumTopic(t, userMap))

  return { me, categories, availableTags, topics }
}

async function getTopicDetail(topicId: string): Promise<ForumTopicDetail> {
  const id = Number(topicId)

  const [topicRes, replyRes] = await Promise.all([
    topicApi.getTopicDetail(id),
    replyApi.getReplyTopPage({ topicId: id, pageNum: 1, pageSize: 50 }),
  ])

  if (topicRes.code !== 1) throw new Error(topicRes.msg || '话题不存在')

  const userMap = buildUserMap([], topicRes.data ? [topicRes.data] : [])
  extendUserMapFromReplies(userMap, replyRes.data?.records ?? [])
  const replies: ForumReply[] = (replyRes.data?.records ?? []).map((r) => toForumReply(r, userMap))

  return toForumTopicDetail(topicRes.data, userMap, replies)
}

async function fetchChildReplies(parentReplyId: string): Promise<ForumReply[]> {
  const res = await replyApi.getReplyChildPage({
    parentReplyId: Number(parentReplyId),
    pageNum: 1,
    pageSize: 3,
  })

  if (res.code !== 1) return []

  const userMap = buildUserMap([], [])
  extendUserMapFromReplies(userMap, res.data?.records ?? [])
  return (res.data?.records ?? []).map((r) => toForumReply(r, userMap))
}

async function loginUser(payload: AuthPayload): Promise<ForumUser> {
  const res = await userApi.login({ email: payload.username, password: payload.password })
  if (res.code !== 200) throw new Error(res.msg || '登录失败')

  const userRes = await userApi.getCurrentUser()
  if (userRes.code !== 200) throw new Error('无法获取用户信息')
  return toForumUser(userRes.data)
}

async function registerUser(payload: RegisterPayload): Promise<ForumUser> {
  const res = await userApi.register({
    username: payload.username,
    email: payload.email,
    nickname: payload.nickname,
    password: payload.password,
  })
  if (res.code !== 200) throw new Error(res.msg || '注册失败')

  const userRes = await userApi.getCurrentUser()
  if (userRes.code !== 200) throw new Error('无法获取用户信息')
  return toForumUser(userRes.data)
}

async function logoutUser(): Promise<void> {
  localStorage.removeItem('token')
}

async function createReplyReal(payload: CreateReplyPayload): Promise<ForumReply> {
  const res = await replyApi.createReply({
    topicId: Number(payload.topicId),
    parentReplyId: payload.parentReplyId ? Number(payload.parentReplyId) : undefined,
    content: payload.content,
  })

  if (res.code !== 1) throw new Error(res.msg || '回复失败')

  return {
    id: 'pending',
    author: { id: '0', name: '', handle: '', title: '', role: 'member' as const, avatar: '' },
    content: payload.content,
    createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
  }
}

// ---------- createTopicReal (Task 2) ----------

/**
 * Create a topic via the real backend API.
 * Only title and content are required; category and tags are optional.
 * Returns a fallback ForumTopicDetail with a `pending` id since the API
 * returns only a success string rather than the created topic object.
 */
async function createTopicReal(payload: CreateTopicPayload): Promise<ForumTopicDetail> {
  const categoryId = payload.categoryId ? Number(payload.categoryId) : undefined
  const tagIds: number[] = []

  for (const tagName of payload.tags ?? []) {
    const id = tagMap.value.get(tagName)
    if (id !== undefined) tagIds.push(id)
  }

  const res = await topicApi.createTopic({
    categoryId: categoryId ?? 0,
    title: payload.title,
    content: payload.content,
    tagIds: tagIds.length ? tagIds : undefined,
  })

  if (res.code !== 1) throw new Error(res.msg || '发布失败')

  return {
    id: 'pending',
    title: payload.title,
    content: payload.content,
    categoryId: payload.categoryId,
    categoryName: '',
    author: toForumUserFromCreator(0, '当前用户'),
    createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    views: 0,
    repliesCount: 0,
    tags: payload.tags ?? [],
    preview: payload.content.slice(0, 80),
    replies: [],
  }
}

// ---------- Query hooks ----------

export function useForumHomeQuery() {
  return useQuery({
    queryKey: forumKeys.home,
    queryFn: getForumHome,
  })
}

export function useTopicDetailQuery(topicId: string) {
  return useQuery({
    queryKey: forumKeys.detail(topicId),
    queryFn: () => getTopicDetail(topicId),
    enabled: !!topicId,
  })
}

export function useChildRepliesQuery(parentReplyId: string, enabled: Ref<boolean>) {
  return useQuery({
    queryKey: forumKeys.childReplies(parentReplyId),
    queryFn: () => fetchChildReplies(parentReplyId),
    enabled,
  })
}

// ---------- Mutation factory ----------

function createForumMutation<TData, TVars>(
  mutationFn: (vars: TVars) => Promise<TData>,
  extraInvalidations?: (data: TData, vars: TVars) => QueryKey[],
) {
  return () => {
    const queryClient = useQueryClient()

    return useMutation({
      mutationFn,
      onSuccess: (data, vars) => {
        void queryClient.invalidateQueries({ queryKey: forumKeys.home })
        if (extraInvalidations) {
          for (const key of extraInvalidations(data as TData, vars as TVars)) {
            void queryClient.invalidateQueries({ queryKey: key })
          }
        }
      },
    })
  }
}

export const useLoginMutation = createForumMutation(loginUser)
export const useRegisterMutation = createForumMutation(registerUser)

export function useLogoutMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: forumKeys.home })
    },
  })
}

export const useCreateTopicMutation = createForumMutation(
  (payload: CreateTopicPayload) => createTopicReal(payload),
  (topic) => [forumKeys.detail(topic.id)],
)

export const useCreateReplyMutation = createForumMutation(
  (payload: CreateReplyPayload) => createReplyReal(payload),
  (_, vars) => [forumKeys.detail(vars.topicId)],
)