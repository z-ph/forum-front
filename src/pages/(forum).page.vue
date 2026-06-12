<script setup lang="ts">
import { useRouter } from 'vue-router'
import ForumHeader from '../components/forum/ForumHeader.vue'
import HomeNavigation from '../components/forum/HomeNavigation.vue'
import TopicComposer from '../components/forum/TopicComposer.vue'
import { useForumHomeState } from '../hooks/useForumHomeState'
import { useForumFeed } from '../hooks/useForumFeed'

const router = useRouter()

function handleAdmin() {
  void router.push({ path: '/admin' })
}

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
</script>

<template>
  <div role="document" class="flex h-screen flex-col overflow-hidden bg-transparent">
    <div class="mx-auto flex w-full flex-1 flex-col overflow-hidden border border-t-0 [background:var(--forum-surface)] [border-color:var(--forum-border)]">
      <ForumHeader :me="me" :is-admin="isAdmin" @auth="handleAuth" @compose="handleCompose" @logout="handleLogout"
        @admin="handleAdmin" />

      <main id="main-content" class="flex min-h-0 flex-1 flex-col">
        <HomeNavigation :categories="categories" :tags="availableTags" :active-category-id="activeCategoryId"
          :active-tag="activeTag" @update:active-category-id="updateCategory"
          @update:active-tag="updateTag" @compose="handleCompose" />

        <div class="relative min-h-0 flex-1">
          <RouterView class="absolute inset-0" @compose="handleCompose" />
        </div>
      </main>
    </div>

    <TopicComposer v-model="composeOpen" :is-admin="isAdmin" :categories="categories" :available-tags="availableTags"
      :loading="isCreatingTopic" @submit="handleCreateTopic" />
  </div>
</template>