import { computed, ref, type ComputedRef } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import {
  useCreateTopicMutation,
  useForumHomeQuery,
  useLogoutMutation,
} from './useForum'
import type {
  CreateTopicPayload,
  ForumTopicFeed,
} from '../types/forum'

export function useForumHomeState(feed: ComputedRef<ForumTopicFeed>) {
  const router = useRouter()

  const composeOpen = ref(false)

  const { data, isLoading, isError } = useForumHomeQuery()
  const createTopicMutation = useCreateTopicMutation()
  const logoutMutation = useLogoutMutation()

  const me = computed(() => data.value?.me ?? null)
  const categories = computed(() => data.value?.categories ?? [])
  const availableTags = computed(() => data.value?.availableTags ?? [])
  const totalTopics = computed(() => data.value?.topics.length ?? 0)
  const isAdmin = computed(() => me.value?.role === 'admin')
  const isCreatingTopic = computed(() => createTopicMutation.isPending.value)
  const showCategorySidebar = computed(() => feed.value === 'categories')

  async function handleCreateTopic(payload: CreateTopicPayload) {
    try {
      const topic = await createTopicMutation.mutateAsync(payload)
      ElMessage.success('主题已发布')
      composeOpen.value = false
      // createTopicReal returns id='pending' because the backend API only
      // returns a success string. While the mutation-triggered refetch is
      // in flight we redirect to /latest instead of the non-existent
      // /topics/pending route. The new topic will appear in the feed
      // once the refetch completes.
      void router.push(topic.id === 'pending'
        ? { name: '/(forum)/latest' }
        : { name: '/topics.[id]', params: { id: topic.id } })
    } catch (error) {
      ElMessage.error((error as Error).message)
    }
  }

  async function handleLogout() {
    await logoutMutation.mutateAsync()
    ElMessage.success('已退出当前账号')
  }

  function handleAuth() {
    void router.push({ name: '/auth' })
  }

  function handleSearch() {
    ElMessage.info('搜索入口已预留，后续可接入搜索页或筛选框')
  }

  function handleCompose() {
    if (!me.value) {
      void router.push({ name: '/auth' })
      return
    }

    composeOpen.value = true
  }

  return {
    data,
    me,
    categories,
    availableTags,
    totalTopics,
    isAdmin,
    isCreatingTopic,
    isLoading,
    isError,
    composeOpen,
    activeFeed: feed,
    showCategorySidebar,
    handleCreateTopic,
    handleLogout,
    handleAuth,
    handleSearch,
    handleCompose,
  }
}
