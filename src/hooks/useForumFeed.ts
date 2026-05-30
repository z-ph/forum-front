import { computed, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useForumHomeQuery } from './useForum'
import type { ForumHomeData, ForumTopic } from '../types/forum'

function parseForumDate(value: string | null | undefined): number {
  if (!value) {return 0}
  return new Date(value.replace(' ', 'T')).getTime()
}

export function sortLatest(topics: ForumTopic[]) {
  return [...topics].sort((left, right) => {
    return parseForumDate(right.updatedAt) - parseForumDate(left.updatedAt)
  })
}

export function sortByCategory(topics: ForumTopic[]) {
  return [...topics].sort((left, right) => {
    const categoryCompare = (left.categoryName ?? '').localeCompare(right.categoryName ?? '', 'zh-CN')

    if (categoryCompare !== 0) {
      return categoryCompare
    }

    return parseForumDate(right.updatedAt) - parseForumDate(left.updatedAt)
  })
}

/**
 * @param homeData - Optional pre-fetched ForumHomeData. When provided (e.g. from
 *   useForumHomeState), the internal useForumHomeQuery call is skipped, eliminating
 *   redundant query registration in the page tree.
 */
export function useForumFeed(homeData?: Ref<ForumHomeData | undefined>) {
  const route = useRoute()
  const router = useRouter()

  const externalData = homeData
  const internalQuery = externalData ? null : useForumHomeQuery()

  function refetch() {
    return internalQuery?.refetch()
  }

  const data = computed(() => externalData?.value ?? internalQuery?.data.value)
  const isLoading = computed(() => externalData ? false : (internalQuery?.isLoading.value ?? false))
  const isError = computed(() => externalData ? false : (internalQuery?.isError.value ?? false))

  const activeCategoryId = computed(() => {
    const value = route.query.category
    return typeof value === 'string' && value ? value : 'all'
  })

  const activeTag = computed(() => {
    const value = route.query.tag
    return typeof value === 'string' && value ? value : 'all'
  })

  const activeCategory = computed(() => {
    if (activeCategoryId.value === 'all') {return null}
    const all = data.value?.categories ?? []
    for (const cat of all) {
      if (cat.id === activeCategoryId.value) {return cat}
      const child = cat.children?.find(c => c.id === activeCategoryId.value)
      if (child) {return child}
    }
    return null
  })

  const topics = computed(() => {
    let next = data.value?.topics ?? []

    if (activeCategoryId.value !== 'all') {
      const selectedId = activeCategoryId.value
      const selectedCategory = (data.value?.categories ?? []).find(c => c.id === selectedId)
      const childIds = selectedCategory?.children?.map(c => c.id) ?? []
      const matchIds = [selectedId, ...childIds]
      next = next.filter(topic => matchIds.includes(topic.categoryId ?? ''))
    }

    if (activeTag.value !== 'all')
      {next = next.filter(topic => topic.tags.includes(activeTag.value))}

    return next
  })

  function updateQuery(next: { category?: string; tag?: string }) {
    void router.replace({
      query: {
        category: next.category && next.category !== 'all' ? next.category : undefined,
        tag: next.tag && next.tag !== 'all' ? next.tag : undefined,
      },
    })
  }

  function updateCategory(category: string) { updateQuery({ category, tag: activeTag.value }) }
  function updateTag(tag: string) { updateQuery({ category: activeCategoryId.value, tag }) }

  function openTopic(topicId: string) {
    void router.push({ name: '/topics.[id]', params: { id: topicId } })
  }

  const categories = computed(() => data.value?.categories ?? [])
  const totalTopics = computed(() => data.value?.totalTopics ?? 0)

  return {
    topics, isLoading, isError, refetch,
    categories, totalTopics,
    activeCategoryId, activeTag, activeCategory,
    updateCategory, updateTag, openTopic,
  }
}
