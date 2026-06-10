<script setup lang="ts">
import { computed } from 'vue'
import { useForumFeed, sortByCategory } from '../../hooks/useForumFeed'
import CategorySidebar from '../../components/forum/CategorySidebar.vue'
import TopicList from '../../components/forum/TopicList.vue'

defineEmits<{
  compose: []
}>()

definePage({
  meta: { activeFeed: 'categories' },
})

const {
  topics: filtered, isLoading, isError, refetch,
  categories, totalTopics, activeCategoryId, updateCategory,
} = useForumFeed()

const topics = computed(() => sortByCategory(filtered.value))
</script>

<template>
  <div class="grid h-full [grid-template-columns:296px_minmax(0,1fr)] max-[1080px]:grid-cols-1">
    <section class="overflow-y-auto border-r [border-color:var(--forum-border)] max-[1080px]:border-r-0 max-[1080px]:border-b max-[1080px]:max-h-[50vh]">
      <CategorySidebar
        :categories="categories"
        :active-category-id="activeCategoryId"
        :total-topics="totalTopics"
        @select="updateCategory"
      />
    </section>

    <section class="min-w-0 overflow-y-auto">
      <el-skeleton v-if="isLoading" animated :rows="9" />
      <el-result
        v-else-if="isError"
        icon="warning"
        title="加载失败"
        sub-title="数据加载失败，请稍后重试。"
      >
        <template #extra>
          <el-button type="primary" @click="refetch">重试</el-button>
        </template>
      </el-result>
      <TopicList
        v-else
        :topics="topics"
        empty-description="当前还没有可按类别展示的话题。"
        @compose="$emit('compose')"
      />
    </section>
  </div>
</template>