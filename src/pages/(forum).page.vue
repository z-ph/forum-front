<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import ForumHeader from '../components/forum/ForumHeader.vue'
import CategorySidebar from '../components/forum/CategorySidebar.vue'
import HomeNavigation from '../components/forum/HomeNavigation.vue'
import TopicComposer from '../components/forum/TopicComposer.vue'
import { useForumHomeState } from '../hooks/useForumHomeState'
import { useForumFeed } from '../hooks/useForumFeed'

const route = useRoute()
const feed = computed<'categories' | 'latest'>(() => (
  route.name === '/(forum)/categories' ? 'categories' : 'latest'
))

const {
  data,
  me, categories, availableTags, totalTopics, isAdmin,
  isCreatingTopic, composeOpen, showCategorySidebar,
  activeFeed,
  handleCreateTopic, handleLogout, handleAuth, handleSearch, handleCompose,
} = useForumHomeState(feed)

const {
  topics, summaryTitle, summaryHint,
  activeCategoryId, activeTag,
  updateCategory, updateTag,
} = useForumFeed(feed, data)
</script>

<template>
  <div class="min-h-screen bg-transparent pb-6">
    <div class="mx-auto w-full border border-t-0 [background:var(--forum-surface)] [border-color:var(--forum-border)]">
      <ForumHeader
        :me="me"
        @auth="handleAuth"
        @search="handleSearch"
        @compose="handleCompose"
        @logout="handleLogout"
      />

      <main class="flex flex-col">
        <HomeNavigation
          :categories="categories"
          :tags="availableTags"
          :active-category-id="activeCategoryId"
          :active-tag="activeTag"
          :active-feed="activeFeed"
          :summary-title="summaryTitle"
          :summary-hint="summaryHint"
          :result-count="topics.length"
          @update:active-category-id="updateCategory"
          @update:active-tag="updateTag"
        />

        <div
          class="grid items-start"
          :class="showCategorySidebar
            ? '[grid-template-columns:296px_minmax(0,1fr)] max-[1080px]:grid-cols-1'
            : 'grid-cols-1'"
        >
          <section
            v-if="showCategorySidebar"
            class="min-w-0 border-r [border-color:var(--forum-border)] max-[1080px]:border-r-0 max-[1080px]:border-b"
          >
            <CategorySidebar
              :categories="categories"
              :active-category-id="activeCategoryId"
              :total-topics="totalTopics"
              @select="updateCategory"
            />
          </section>

          <section class="min-w-0">
            <RouterView />
          </section>
        </div>
      </main>
    </div>

    <TopicComposer
      v-model="composeOpen"
      :is-admin="isAdmin"
      :categories="categories"
      :available-tags="availableTags"
      :loading="isCreatingTopic"
      @submit="handleCreateTopic"
    />
  </div>
</template>
