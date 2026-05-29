<script setup lang="ts">
import { computed } from 'vue'
import { useForumFeed } from '../../hooks/useForumFeed'
import ForumFeedPage from '../../components/forum/ForumFeedPage.vue'

const feed = computed(() => 'latest' as const)
const { topics, isLoading, isError, emptyDescription, openTopic } = useForumFeed(feed)
</script>

<template>
  <ForumFeedPage
    :topics="topics"
    :empty-description="emptyDescription"
    :is-loading="isLoading"
    :is-error="isError"
    @open-topic="openTopic"
  />
</template>
