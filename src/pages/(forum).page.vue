<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ForumHeader from '../components/forum/ForumHeader.vue'
import HomeNavigation from '../components/forum/HomeNavigation.vue'
import TopicComposer from '../components/forum/TopicComposer.vue'
import { useForumHomeState } from '../hooks/useForumHomeState'
import { useForumFeed } from '../hooks/useForumFeed'
import type { ForumTopicFeed } from '../types/forum'

const route = useRoute()
const router = useRouter()

function handleAdmin() {
  void router.push({ path: '/admin' })
}

const activeFeed = computed(() => (route.meta.activeFeed as ForumTopicFeed) ?? 'latest')

const {
  data,
  me, categories, availableTags, isAdmin,
  isCreatingTopic, composeOpen,
  handleCreateTopic, handleLogout, handleAuth, handleCompose,
} = useForumHomeState()

const {
  activeCategoryId, activeTag,
  updateCategory, updateTag,
} = useForumFeed(data)
definePage({
  redirect: { name: '/(forum)/categories' }
})
</script>

<template>
  <div class="min-h-screen bg-transparent pb-6">
    <div class="mx-auto w-full border border-t-0 [background:var(--forum-surface)] [border-color:var(--forum-border)]">
      <ForumHeader :me="me" :is-admin="isAdmin" @auth="handleAuth" @compose="handleCompose" @logout="handleLogout"
        @admin="handleAdmin" />

      <main class="flex flex-col">
        <HomeNavigation :categories="categories" :tags="availableTags" :active-category-id="activeCategoryId"
          :active-tag="activeTag" :active-feed="activeFeed" @update:active-category-id="updateCategory"
          @update:active-tag="updateTag" />

        <RouterView />
      </main>
    </div>

    <TopicComposer v-model="composeOpen" :is-admin="isAdmin" :categories="categories" :available-tags="availableTags"
      :loading="isCreatingTopic" @submit="handleCreateTopic" />
  </div>
</template>
