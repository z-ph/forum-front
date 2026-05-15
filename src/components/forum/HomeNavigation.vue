<script setup lang="ts">
import { computed } from 'vue'
import { EditPen } from '@element-plus/icons-vue'
import type { ForumCategory, ForumTopicFeed } from '../../types/forum'

const props = defineProps<{
  categories: ForumCategory[]
  tags: string[]
  activeCategoryId: string
  activeTag: string
  activeFeed: ForumTopicFeed
  summaryTitle: string
  summaryHint: string
  resultCount: number
}>()

const emit = defineEmits<{
  compose: []
  'update:activeCategoryId': [value: string]
  'update:activeTag': [value: string]
}>()

const feedItems: Array<{ key: ForumTopicFeed; label: string; title: string; path: string }> = [
  { key: 'categories', label: '类别', title: '按类别查看话题', path: '/categories' },
  { key: 'latest', label: '最新', title: '按最后活动查看最新话题', path: '/latest' },
]

function updateCategory(value: string) {
  emit('update:activeCategoryId', value)
}

function updateTag(value: string) {
  emit('update:activeTag', value)
}

const sharedQuery = computed(() => ({
  category: props.activeCategoryId !== 'all' ? props.activeCategoryId : undefined,
  tag: props.activeTag !== 'all' ? props.activeTag : undefined,
}))
</script>

<template>
  <section class="border-b [background:color-mix(in_srgb,var(--forum-surface-muted)_74%,white)] [border-color:var(--forum-border)]">
    <div class="grid gap-3 px-[18px] py-3 md:px-[22px] md:py-[14px]">
      <div class="flex items-end justify-between gap-3 max-[860px]:items-stretch max-[860px]:flex-col">
        <div class="flex flex-wrap items-center gap-2.5 max-[640px]:grid max-[640px]:w-full max-[640px]:grid-cols-1">
          <el-select
            :model-value="props.activeCategoryId"
            aria-label="筛选条件：类别"
            class="home-navigation-select min-w-[148px] max-[640px]:w-full"
            placeholder="类别"
            @update:model-value="updateCategory"
          >
            <el-option label="全部类别" value="all" />
            <el-option
              v-for="category in props.categories"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            />
          </el-select>

          <el-select
            :model-value="props.activeTag"
            aria-label="筛选条件：标签"
            class="home-navigation-select min-w-[148px] max-[640px]:w-full"
            placeholder="标签"
            @update:model-value="updateTag"
          >
            <el-option label="全部标签" value="all" />
            <el-option
              v-for="tag in props.tags"
              :key="tag"
              :label="`#${tag}`"
              :value="tag"
            />
          </el-select>
        </div>

        <el-button class="min-h-11 px-4" type="primary" @click="emit('compose')">
          <el-icon class="mr-1.5">
            <EditPen />
          </el-icon>
          新建话题
        </el-button>
      </div>

      <div class="flex items-start justify-between gap-4 max-[980px]:flex-col">
        <nav class="overflow-x-auto" aria-label="首页话题流">
          <ul class="flex min-w-max list-none items-center gap-1 p-0">
            <li v-for="item in feedItems" :key="item.key">
              <router-link
                :to="{ path: item.path, query: sharedQuery }"
                class="inline-flex min-h-11 items-center rounded-full border px-3.5 py-[7px] text-[0.84rem] font-medium transition-colors duration-200"
                :class="item.key === props.activeFeed
                  ? 'border-[var(--forum-primary)] bg-[color-mix(in_srgb,var(--forum-primary)_10%,white)] text-[#14325f]'
                  : 'border-[var(--forum-border)] bg-[var(--forum-surface)] text-[#5f7088] hover:bg-[color-mix(in_srgb,var(--forum-surface-muted)_84%,white)]'"
                :aria-current="item.key === props.activeFeed ? 'page' : undefined"
                :title="item.title"
              >
                {{ item.label }}
              </router-link>
            </li>
          </ul>
        </nav>

        <div class="flex min-w-0 items-start justify-between gap-4 rounded-[2px] border px-3.5 py-2.5 [background:var(--forum-surface)] [border-color:var(--forum-border)] max-[980px]:w-full">
          <div class="min-w-0">
            <strong class="block text-[0.96rem] font-semibold text-[#172338]">{{ props.summaryTitle }}</strong>
            <span class="mt-1 block text-[0.82rem] leading-6 text-[#5c6d86]">{{ props.summaryHint }}</span>
          </div>
          <span class="mt-0.5 whitespace-nowrap text-[0.82rem] font-medium leading-6 text-[#5c6d86]">
            共 {{ props.resultCount }} 条
          </span>
        </div>
      </div>
    </div>
  </section>
</template>
