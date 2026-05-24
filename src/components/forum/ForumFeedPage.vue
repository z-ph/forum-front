<script setup lang="ts">
import TopicList from './TopicList.vue'
import type { ForumTopic } from '../../types/forum'

defineProps<{
  topics: ForumTopic[]
  emptyDescription: string
  isLoading: boolean
  isError: boolean
}>()

const emit = defineEmits<{
  openTopic: [topicId: string]
}>()
</script>

<template>
  <el-skeleton v-if="isLoading" animated :rows="9" />
  <el-result
    v-else-if="isError"
    icon="warning"
    title="加载失败"
    sub-title="当前是 mock 数据层，刷新通常即可恢复。"
  />
  <TopicList
    v-else
    :topics="topics"
    :empty-description="emptyDescription"
    @open="emit('openTopic', $event)"
  />
</template>
