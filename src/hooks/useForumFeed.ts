import { computed, type ComputedRef, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useForumHomeQuery } from './useForum'
import type { ForumHomeData, ForumTopic } from '../types/forum'

function parseForumDate(value: string | null | undefined): number {
  if (!value) {return 0}
  return new Date(value.replace(' ', 'T')).getTime()
}

function sortLatest(topics: ForumTopic[]) {
  return [...topics].sort((left, right) => {
    return parseForumDate(right.updatedAt) - parseForumDate(left.updatedAt)
  })
}

function sortByCategory(topics: ForumTopic[]) {
  return [...topics].sort((left, right) => {
    const categoryCompare = (left.categoryName ?? '').localeCompare(right.categoryName ?? '', 'zh-CN')

    if (categoryCompare !== 0) {
      return categoryCompare
    }

    return parseForumDate(right.updatedAt) - parseForumDate(left.updatedAt)
  })
}

/**
 * @param feedType - 'categories' or 'latest' feed mode
 * @param homeData - Optional pre-fetched ForumHomeData. When provided (e.g. from
 *   useForumHomeState), the internal useForumHomeQuery call is skipped, eliminating
 *   redundant query registration in the page tree.
 */
export function useForumFeed(
  feedType: ComputedRef<'categories' | 'latest'>,
  homeData?: Ref<ForumHomeData | undefined>,
) {
  const route = useRoute()
  const router = useRouter()

  // When homeData is provided by the caller (e.g. the forum layout already has it),
  // we skip the internal query and derive loading/error states as settled.
  // Otherwise we call useForumHomeQuery internally — TanStack Query deduplicates
  // any concurrent calls to the same queryKey, so this is still performant.
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

  const activeTagLabel = computed(() => activeTag.value === 'all' ? '' : `#${activeTag.value}`)

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

    return feedType.value === 'categories' ? sortByCategory(next) : sortLatest(next)
  })

  const summaryTitle = computed(() => {
    const categoryText = activeCategory.value?.name ?? '全部类别'
    const tagText = activeTagLabel.value

    if (feedType.value === 'categories')
      {return tagText ? `${categoryText} · ${tagText}` : `${categoryText} · 按类别查看`}

    return tagText ? `${categoryText} · ${tagText} · 最新` : `${categoryText} · 最新`
  })

  const summaryHint = computed(() => {
    const categoryHint = activeCategory.value
      ? `当前仅显示 ${activeCategory.value.name} 里的话题`
      : '当前显示全部版块的话题'

    if (feedType.value === 'categories')
      {return `${categoryHint}，并按所属类别聚合排序。`}

    return `${categoryHint}，按最后活动时间查看最近讨论。`
  })

  const emptyDescription = computed(() => {
    if (activeCategory.value || activeTag.value !== 'all')
      {return '当前筛选条件下还没有匹配的话题，试试切换类别或标签。'}

    return feedType.value === 'categories'
      ? '当前还没有可按类别展示的话题。'
      : '这里还没有最新话题。'
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

  return {
    topics, isLoading, isError, emptyDescription, refetch,
    summaryTitle, summaryHint,
    activeCategoryId, activeTag, activeCategory,
    updateCategory, updateTag, openTopic,
  }
}
