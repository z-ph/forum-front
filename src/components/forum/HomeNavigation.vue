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

// Resolve which parent is currently active (or parent of the active child)
const selectedParentId = computed(() => {
  const id = props.activeCategoryId
  if (id === 'all') { return 'all' }
  const parent = props.categories.find(c => c.id === id)
  if (parent) { return id }
  // activeCategoryId is a child — find its parent
  return props.categories.find(c => c.children?.some(ch => ch.id === id))?.id ?? 'all'
})

const selectedParent = computed(() =>
  props.categories.find(c => c.id === selectedParentId.value),
)

const children = computed(() => selectedParent.value?.children ?? [])

const selectedChildId = computed(() => {
  const id = props.activeCategoryId
  if (id === 'all' || id === selectedParentId.value) { return 'all' }
  return children.value.some(c => c.id === id) ? id : 'all'
})

function onParentChange(parentId: string) {
  // Switching parent resets child selection — filter by parent category
  emit('update:activeCategoryId', parentId)
}

function onChildChange(childId: string) {
  if (childId === 'all') {
    emit('update:activeCategoryId', selectedParentId.value)
  } else {
    emit('update:activeCategoryId', childId)
  }
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
      <el-select :model-value="selectedParentId" aria-label="筛选条件：父类别" class="home-navigation-select min-w-[148px]"
        placeholder="类别" @update:model-value="onParentChange">
        <el-option label="全部类别" value="all" />
        <el-option v-for="category in props.categories" :key="category.id" :label="category.name" :value="category.id" />
      </el-select>

      <el-select v-if="children.length" :model-value="selectedChildId" aria-label="筛选条件：子类别"
        class="home-navigation-select min-w-[148px]" placeholder="子类别" @update:model-value="onChildChange">
        <el-option label="全部子类别" value="all" />
        <el-option v-for="child in children" :key="child.id" :label="child.name" :value="child.id" />
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
