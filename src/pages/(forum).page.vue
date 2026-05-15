<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import ForumHeader from '../components/forum/ForumHeader.vue'
import CategorySidebar from '../components/forum/CategorySidebar.vue'
import HomeNavigation from '../components/forum/HomeNavigation.vue'
import TopicComposer from '../components/forum/TopicComposer.vue'
import { useForumHomeState } from '../hooks/useForumHomeState'

const route = useRoute()
const feed = computed<'categories' | 'latest'>(() => (
  route.path === '/categories' ? 'categories' : 'latest'
))

const {
  me,
  categories,
  availableTags,
  totalTopics,
  isAdmin,
  isCreatingTopic,
  isLoading,
  isError,
  composeOpen,
  activeFeed,
  activeCategoryId,
  activeTag,
  summaryTitle,
  summaryHint,
  showCategorySidebar,
  topics,
  emptyDescription,
  updateCategory,
  updateTag,
  openTopic,
  handleCreateTopic,
  handleLogout,
  handleAuth,
  handleSearch,
  handleCompose,
} = useForumHomeState(feed)
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
          @compose="handleCompose"
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
            <RouterView v-slot="{ Component }">
              <component
                :is="Component"
                :topics="topics"
                :empty-description="emptyDescription"
                :is-loading="isLoading"
                :is-error="isError"
                @open-topic="openTopic"
              />
            </RouterView>
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
