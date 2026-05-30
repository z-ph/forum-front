<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { EditPen } from '@element-plus/icons-vue'
import type { ForumCategory, ForumTopicFeed } from '../../types/forum'

const props = defineProps<{
  categories: ForumCategory[]
  tags: string[]
  activeCategoryId: string
  activeTag: string
  activeFeed: ForumTopicFeed
}>()

const emit = defineEmits<{
  'update:activeCategoryId': [value: string]
  'update:activeTag': [value: string]
}>()

const router = useRouter()

const feedItems = [
  { key: 'categories' as ForumTopicFeed, label: '类别', name: '/(forum)/categories' as const },
  { key: 'latest' as ForumTopicFeed, label: '最新', name: '/(forum)/latest' as const },
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
  <section
    class="flex items-center justify-between gap-3 border-b px-[18px] py-3 md:px-[22px] md:py-[14px] [background:color-mix(in_srgb,var(--forum-surface-muted)_74%,white)] [border-color:var(--forum-border)]">
    <div class="flex items-center gap-2.5">
      <el-select :model-value="props.activeCategoryId" aria-label="筛选条件：类别" class="home-navigation-select min-w-[148px]"
        placeholder="类别" @update:model-value="updateCategory">
        <el-option label="全部类别" value="all" />
        <template v-for="category in props.categories" :key="category.id">
          <el-option-group v-if="category.children?.length" :label="category.name">
            <el-option :label="category.name" :value="category.id" />
            <el-option v-for="child in category.children" :key="child.id" :label="child.name" :value="child.id" />
          </el-option-group>
          <el-option v-else :label="category.name" :value="category.id" />
        </template>
      </el-select>

      <el-select :model-value="props.activeTag" aria-label="筛选条件：标签" class="home-navigation-select min-w-[148px]"
        placeholder="标签" @update:model-value="updateTag">
        <el-option label="全部标签" value="all" />
        <el-option v-for="tag in props.tags" :key="tag" :label="`#${tag}`" :value="tag" />
      </el-select>
      <nav aria-label="首页话题流" class="shrink-0">
        <el-radio-group :model-value="props.activeFeed" @change="(val: string | number | boolean | undefined) => {
          if (!val) return
          const item = feedItems.find(i => i.key === val)
          if (item) router.push({ name: item.name, query: sharedQuery })
        }">
          <el-radio-button v-for="item in feedItems" :key="item.key" :value="item.key">
            {{ item.label }}
          </el-radio-button>
        </el-radio-group>
      </nav>
    </div>



    <el-button class="min-h-11 px-4" type="primary" @click="router.push({ name: '/topics.new' })">
      <el-icon class="mr-1.5">
        <EditPen />
      </el-icon>
      新建话题
    </el-button>
  </section>
</template>
