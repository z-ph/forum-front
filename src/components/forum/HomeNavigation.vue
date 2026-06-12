<script setup lang="ts">
import { computed } from 'vue'
import { EditPen } from '@element-plus/icons-vue'
import type { ForumCategory } from '../../types/forum'

const props = defineProps<{
  categories: ForumCategory[]
  activeCategoryId: string
  tags: string[]
  activeTag: string
}>()

const emit = defineEmits<{
  'update:activeCategoryId': [value: string]
  'update:activeTag': [value: string]
  'compose': []
}>()

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
</script>

<template>
  <section
    class="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b px-[18px] py-3 md:flex-nowrap md:px-[22px] md:py-[14px] [background:color-mix(in_srgb,var(--forum-surface-muted)_74%,white)] [border-color:var(--forum-border)]">
    <div class="flex flex-wrap items-center gap-2 md:flex-nowrap md:gap-2.5">
      <el-select :model-value="selectedParentId" aria-label="筛选条件：父类别" class="home-navigation-select min-w-[120px] max-[640px]:min-w-[100px] md:min-w-[148px]"
        placeholder="类别" @update:model-value="onParentChange">
        <el-option label="全部类别" value="all" />
        <el-option v-for="category in props.categories" :key="category.id" :label="category.name" :value="category.id" />
      </el-select>

      <el-select v-if="children.length" :model-value="selectedChildId" aria-label="筛选条件：子类别"
        class="home-navigation-select min-w-[120px] max-[640px]:min-w-[100px] md:min-w-[148px]" placeholder="子类别" @update:model-value="onChildChange">
        <el-option label="全部子类别" value="all" />
        <el-option v-for="child in children" :key="child.id" :label="child.name" :value="child.id" />
      </el-select>

      <el-select :model-value="props.activeTag" aria-label="筛选条件：标签" class="home-navigation-select min-w-[120px] max-[640px]:min-w-[100px] md:min-w-[148px]"
        placeholder="标签" @update:model-value="updateTag">
        <el-option label="全部标签" value="all" />
        <el-option v-for="tag in props.tags" :key="tag" :label="`#${tag}`" :value="tag" />
      </el-select>
    </div>

    <el-button class="min-h-11 w-full px-4 sm:w-auto" type="primary" @click="emit('compose')">
      <el-icon class="mr-1.5">
        <EditPen />
      </el-icon>
      新建话题
    </el-button>
  </section>
</template>