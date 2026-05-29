import { useInfiniteQuery, useMutation, useQuery, useQueryClient, type QueryKey } from '@tanstack/vue-query'
import { computed, ref, toValue, type MaybeRef, type Ref } from 'vue'
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
  toForumCategoryTree,
  toForumReply,
  toForumTopic,
  toForumTopicDetail,
  toForumUser,
  toForumUserFromCreator,
} from '../services/forumAdapter'
import type { TagVO } from '../types/api'
import * as categoryApi from '../services/categoryApi'
import * as replyApi from '../services/replyApi'
import * as tagApi from '../services/tagApi'
import * as topicApi from '../services/topicApi'
import * as userApi from '../services/userApi'
import { isApiSuccess } from '../core/apiClient'

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

  const me = isApiSuccess(userRes) ? toForumUser(userRes.data) : null

  // Update tag map so createTopicReal can resolve tag names to IDs.
  if (isApiSuccess(tagRes) && tagRes.data) {
    const map = new Map<string, number>()
    for (const tag of tagRes.data) {
      map.set(tag.name, tag.id)
    }
    tagMap.value = map
  }

  const categories: ForumCategory[] = isApiSuccess(categoryRes)
    ? toForumCategoryTree(categoryRes.data ?? [])
    : []

  const availableTags: string[] = isApiSuccess(tagRes) ? (tagRes.data ?? []).map((t) => t.name) : []

  const rawTopics = isApiSuccess(topicRes) ? (topicRes.data ?? []) : []
  const userMap = buildUserMap([], rawTopics)
  const topics: ForumTopic[] = rawTopics.map((t) => toForumTopic(t, userMap))

  return { me, categories, availableTags, topics, totalTopics: topics.length }
}

async function getTopicDetail(topicId: string): Promise<ForumTopicDetail> {
  const id = Number(topicId)

  const [topicRes, replyRes] = await Promise.all([
    topicApi.getTopicDetail(id),
    replyApi.getReplyTopPage({ topicId: id, pageNum: 1, pageSize: 50 }),
  ])

  if (!isApiSuccess(topicRes)) {throw new Error(topicRes.msg || '话题不存在')}

  const userMap = buildUserMap([], topicRes.data ? [topicRes.data] : [])
  extendUserMapFromReplies(userMap, replyRes.data?.records ?? [])
  const replies: ForumReply[] = (replyRes.data?.records ?? []).map((r) => toForumReply(r, userMap))

  return toForumTopicDetail(topicRes.data, userMap, replies)
}

async function loginUser(payload: AuthPayload): Promise<ForumUser> {
  const res = await userApi.login({ email: payload.email, password: payload.password })
  if (!isApiSuccess(res)) {throw new Error(res.msg || '登录失败')}

  const userRes = await userApi.getCurrentUser()
  if (!isApiSuccess(userRes)) {throw new Error('无法获取用户信息')}
  return toForumUser(userRes.data)
}

async function registerUser(payload: RegisterPayload): Promise<ForumUser> {
  const res = await userApi.register({
    username: payload.username,
    email: payload.email,
    nickname: payload.nickname,
    password: payload.password,
  })
  if (!isApiSuccess(res)) {throw new Error(res.msg || '注册失败')}
  localStorage.setItem('token', res.data)

  const userRes = await userApi.getCurrentUser()
  if (!isApiSuccess(userRes)) {throw new Error('无法获取用户信息')}
  return toForumUser(userRes.data)
}

async function logoutUser(): Promise<void> {
  localStorage.removeItem('token')
}

/**
 * Create a reply via the real backend API.
 *
 * Note: The backend `createReply` endpoint returns only a success string
 * (ApiResponse<string>), not the created ReplyVO with its generated ID.
 * Therefore we return a placeholder ForumReply with id = 'pending'.
 * The mutation's onSuccess handler invalidates forumKeys.home and
 * forumKeys.detail(topicId), which triggers a refetch of the topic detail
 * page — at that point the reply will appear with its real server-assigned ID.
 */
async function createReplyReal(payload: CreateReplyPayload): Promise<ForumReply> {
  const res = await replyApi.createReply({
    topicId: Number(payload.topicId),
    parentReplyId: payload.parentReplyId ? Number(payload.parentReplyId) : undefined,
    content: payload.content,
  })

  if (!isApiSuccess(res)) {throw new Error(res.msg || '回复失败')}

  // Backend returns ApiResponse<string>, not the created object.
  // Placeholder id='pending' until the invalidation-triggered refetch resolves.
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
 *
 * NOTE — pending ID: The backend `createTopic` endpoint returns
 * ApiResponse<string> (a success message) rather than the created
 * TopicVO with its server-generated ID. We therefore return a
 * placeholder ForumTopicDetail with id = 'pending'.
 *
 * The mutation's onSuccess handler invalidates forumKeys.home, which
 * triggers a background refetch. After refetch, the new topic appears
 * in the home feed with its real ID. Until then, consumers (e.g.
 * useForumHomeState.handleCreateTopic) redirect conditionally based on
 * the 'pending' sentinel value.
 */
async function createTopicReal(payload: CreateTopicPayload): Promise<ForumTopicDetail> {
  const categoryId = payload.categoryId ? Number(payload.categoryId) : undefined
  const tagIds: number[] = []

  for (const tagName of payload.tags ?? []) {
    const id = tagMap.value.get(tagName)
    if (id !== undefined) {tagIds.push(id)}
  }

  const res = await topicApi.createTopic({
    categoryId: categoryId ?? 0,
    title: payload.title,
    content: payload.content,
    tagIds: tagIds.length ? tagIds : undefined,
  })

  if (!isApiSuccess(res)) {throw new Error(res.msg || '发布失败')}

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

export function useTopicDetailQuery(topicId: MaybeRef<string>) {
  return useQuery({
    queryKey: computed(() => forumKeys.detail(toValue(topicId))),
    queryFn: () => getTopicDetail(toValue(topicId)),
    enabled: computed(() => !!toValue(topicId)),
  })
}

export function useChildRepliesInfiniteQuery(parentReplyId: string, enabled: Ref<boolean>) {
  return useInfiniteQuery({
    queryKey: forumKeys.childReplies(parentReplyId),
    queryFn: async ({ pageParam = 1 }) => {
      const res = await replyApi.getReplyChildPage({
        parentReplyId: Number(parentReplyId),
        pageNum: pageParam as number,
        pageSize: 3,
      })
      if (!isApiSuccess(res) || !res.data) {
        return { replies: [], total: 0 }
      }
      const userMap = buildUserMap([], [])
      extendUserMapFromReplies(userMap, res.data.records ?? [])
      return {
        replies: (res.data.records ?? []).map((r) => toForumReply(r, userMap)),
        total: res.data.total,
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const loadedCount = allPages.reduce((sum, page) => sum + page.replies.length, 0)
      return loadedCount < lastPage.total ? allPages.length + 1 : undefined
    },
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