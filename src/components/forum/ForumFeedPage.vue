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
    sub-title="数据加载失败，请稍后重试。"
  />
  <TopicList
    v-else
    :topics="topics"
    :empty-description="emptyDescription"
    @open="emit('openTopic', $event)"
  />
</template>
