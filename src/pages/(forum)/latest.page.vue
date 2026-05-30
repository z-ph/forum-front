<script setup lang="ts">
import { computed } from 'vue'
import { useForumFeed, sortLatest } from '../../hooks/useForumFeed'
import TopicList from '../../components/forum/TopicList.vue'

definePage({
  meta: { activeFeed: 'latest' },
})

const { topics: filtered, isLoading, isError, openTopic, refetch } = useForumFeed()
const topics = computed(() => sortLatest(filtered.value))
</script>

<template>
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
    empty-description="这里还没有最新话题。"
    @open="openTopic"
  />
</template>
