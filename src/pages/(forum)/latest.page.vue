<script setup lang="ts">
import ForumFeedPage from '../../components/forum/ForumFeedPage.vue'
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
  <ForumFeedPage
    :topics="topics"
    :empty-description="emptyDescription"
    :is-loading="isLoading"
    :is-error="isError"
    @open-topic="emit('openTopic', $event)"
  />
</template>
