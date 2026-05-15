import { computed, ref, type ComputedRef } from 'vue'
import { ElMessage } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import {
  useCreateTopicMutation,
  useForumHomeQuery,
  useLogoutMutation,
} from './useForum'
import type {
  CreateTopicPayload,
  ForumCategory,
  ForumTopic,
  ForumTopicFeed,
} from '../types/forum'

function parseForumDate(value: string) {
  return new Date(value.replace(' ', 'T')).getTime()
}

function sortLatest(topics: ForumTopic[]) {
  return [...topics].sort((left, right) => {
    if (!!left.pinned !== !!right.pinned) return Number(!!right.pinned) - Number(!!left.pinned)
    return parseForumDate(right.updatedAt) - parseForumDate(left.updatedAt)
  })
}

function sortByCategory(topics: ForumTopic[]) {
  return [...topics].sort((left, right) => {
    const categoryCompare = left.categoryName.localeCompare(right.categoryName, 'zh-CN')
    if (categoryCompare !== 0) return categoryCompare
    return parseForumDate(right.updatedAt) - parseForumDate(left.updatedAt)
  })
}

export function useForumHomeState(feed: ComputedRef<ForumTopicFeed>) {
  const route = useRoute()
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

  const activeCategoryId = computed(() => {
    const value = route.query.category
    return typeof value === 'string' && value ? value : 'all'
  })

  const activeTag = computed(() => {
    const value = route.query.tag
    return typeof value === 'string' && value ? value : 'all'
  })

  const activeCategory = computed<ForumCategory | null>(() => {
    if (activeCategoryId.value === 'all') return null
    return categories.value.find((item) => item.id === activeCategoryId.value) ?? null
  })

  const activeTagLabel = computed(() => (
    activeTag.value === 'all' ? '' : `#${activeTag.value}`
  ))

  const topics = computed(() => {
    let next = data.value?.topics ?? []

    if (activeCategoryId.value !== 'all') {
      next = next.filter((topic) => topic.categoryId === activeCategoryId.value)
    }

    if (activeTag.value !== 'all') {
      next = next.filter((topic) => topic.tags.includes(activeTag.value))
    }

    return feed.value === 'categories' ? sortByCategory(next) : sortLatest(next)
  })

  const summaryTitle = computed(() => {
    const categoryText = activeCategory.value?.name ?? '全部类别'
    const tagText = activeTagLabel.value

    if (feed.value === 'categories') {
      return tagText ? `${categoryText} · ${tagText}` : `${categoryText} · 按类别查看`
    }

    return tagText ? `${categoryText} · ${tagText} · 最新` : `${categoryText} · 最新`
  })

  const summaryHint = computed(() => {
    const categoryHint = activeCategory.value
      ? `当前仅显示 ${activeCategory.value.name} 里的话题`
      : '当前显示全部版块的话题'

    if (feed.value === 'categories') {
      return `${categoryHint}，并按所属类别聚合排序。`
    }

    return `${categoryHint}，按最后活动时间查看最近讨论。`
  })

  const emptyDescription = computed(() => {
    if (activeCategory.value || activeTag.value !== 'all') {
      return '当前筛选条件下还没有匹配的话题，试试切换类别或标签。'
    }

    return feed.value === 'categories'
      ? '当前还没有可按类别展示的话题。'
      : '这里还没有最新话题。'
  })

  function updateQuery(next: { category?: string; tag?: string }) {
    router.replace({
      path: route.path,
      query: {
        category: next.category && next.category !== 'all' ? next.category : undefined,
        tag: next.tag && next.tag !== 'all' ? next.tag : undefined,
      },
    })
  }

  function updateCategory(category: string) {
    updateQuery({ category, tag: activeTag.value })
  }

  function updateTag(tag: string) {
    updateQuery({ category: activeCategoryId.value, tag })
  }

  function openTopic(topicId: string) {
    router.push({ path: `/topics/${topicId}` })
  }

  async function handleCreateTopic(payload: CreateTopicPayload) {
    try {
      const topic = await createTopicMutation.mutateAsync(payload)
      ElMessage.success('主题已发布')
      composeOpen.value = false
      router.push({ path: `/topics/${topic.id}` })
    } catch (error) {
      ElMessage.error((error as Error).message)
    }
  }

  async function handleLogout() {
    await logoutMutation.mutateAsync()
    ElMessage.success('已退出当前账号')
  }

  function handleAuth() {
    router.push({ path: '/auth' })
  }

  function handleSearch() {
    ElMessage.info('搜索入口已预留，后续可接入搜索页或筛选框')
  }

  function handleCompose() {
    if (!me.value) {
      router.push({ path: '/auth' })
      return
    }

    composeOpen.value = true
  }

  return {
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
    activeCategoryId,
    activeTag,
    summaryTitle,
    summaryHint,
    showCategorySidebar,
    topics,
    emptyDescription,
    updateCategory,
    updateTag,
    openTopic,
    handleCreateTopic,
    handleLogout,
    handleAuth,
    handleSearch,
    handleCompose,
  }
}
