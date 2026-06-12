import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  useCreateTopicMutation,
  useForumHomeQuery,
  useLogoutMutation,
} from './useForum'
import type {
  CreateTopicPayload,
} from '../types/forum'

export function useForumHomeState() {
  const router = useRouter()

  const composeOpen = ref(false)

  const { data, isLoading, isError } = useForumHomeQuery()
  const createTopicMutation = useCreateTopicMutation()
  const logoutMutation = useLogoutMutation()

  const me = computed(() => data.value?.me ?? null)
  const categories = computed(() => data.value?.categories ?? [])
  const availableTags = computed(() => data.value?.availableTags ?? [])
  const totalTopics = computed(() => data.value?.totalTopics ?? 0)
  const isAdmin = computed(() => me.value?.role === 'admin')
  const isCreatingTopic = computed(() => createTopicMutation.isPending.value)

  async function handleCreateTopic(payload: CreateTopicPayload) {
    try {
      const topic = await createTopicMutation.mutateAsync(payload)
      ElMessage.success('主题已发布')
      composeOpen.value = false
      // createTopicReal returns id='pending' because the backend API only
      // returns a success string. While the mutation-triggered refetch is
      // in flight we redirect to the forum home instead of the
      // non-existent /topics/pending route. The new topic will appear in
      // the feed once the refetch completes.
      void router.push(topic.id === 'pending'
        ? { name: '/(forum)/' }
        : { name: '/topics.[id]', params: { id: topic.id } })
    } catch (error) {
      ElMessage.error((error as Error).message)
    }
  }

  async function handleLogout() {
    try {
      await ElMessageBox.confirm('确定退出当前账号吗？', '提示', {
        confirmButtonText: '退出',
        cancelButtonText: '取消',
        type: 'warning',
      })
    } catch {
      return
    }
    await logoutMutation.mutateAsync()
    ElMessage.success('已退出当前账号')
  }

  function handleAuth() {
    void router.push({ name: '/auth' })
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
    me, categories, availableTags, totalTopics, isAdmin,
    isCreatingTopic,
    isLoading, isError,
    composeOpen,
    handleCreateTopic, handleLogout, handleAuth, handleCompose,
  }
}
