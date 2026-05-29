<script setup lang="ts">
import type { ForumCategory } from '../../types/forum'

defineProps<{
  categories: ForumCategory[]
  activeCategoryId: string
  totalTopics: number
}>()

const emit = defineEmits<{
  select: [categoryId: string]
}>()
</script>

<template>
  <aside class="flex flex-col [background:var(--forum-surface)]">
    <div class="grid items-center gap-3 border-b px-[18px] py-[11px] text-[0.76rem] text-[#728199] [border-color:var(--forum-border)] [grid-template-columns:minmax(0,1fr)_auto] md:px-5">
      <span>类别</span>
      <span>话题</span>
    </div>

    <button
      type="button"
      :aria-pressed="activeCategoryId === 'all'"
      class="group relative grid w-full items-start gap-3.5 border-0 border-b px-[18px] py-3.5 text-left transition-colors duration-200 [border-color:var(--forum-border)] [grid-template-columns:minmax(0,1fr)_auto] hover:[background:color-mix(in_srgb,var(--forum-surface-muted)_76%,white)] [aria-pressed='true']:[background:color-mix(in_srgb,var(--forum-surface-muted)_76%,white)] md:px-5"
      @click="emit('select', 'all')"
    >
      <span
        aria-hidden="true"
        class="pointer-events-none absolute inset-y-0 left-0 w-0.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100 [background:var(--forum-primary)]"
        :style="{ opacity: activeCategoryId === 'all' ? 1 : undefined }"
      />
      <div>
        <strong class="mb-1 block text-[0.94rem] font-semibold text-[#1c2738]">全部主题</strong>
        <p class="m-0 text-[0.82rem] leading-[1.55] text-[#6f7e95]">查看全部最近讨论</p>
      </div>
      <em class="self-center text-[0.84rem] font-semibold not-italic text-[#4e5f76]">{{ totalTopics }}</em>
    </button>

    <template v-for="category in categories" :key="category.id">
      <button
        type="button"
        :aria-pressed="activeCategoryId === category.id"
        class="group relative grid w-full items-start gap-3.5 border-0 border-b px-[18px] py-3.5 text-left transition-colors duration-200 [border-color:var(--forum-border)] [grid-template-columns:minmax(0,1fr)_auto] hover:[background:color-mix(in_srgb,var(--forum-surface-muted)_76%,white)] [aria-pressed='true']:[background:color-mix(in_srgb,var(--forum-surface-muted)_76%,white)] md:px-5"
        @click="emit('select', category.id)"
      >
        <span
          aria-hidden="true"
          class="pointer-events-none absolute inset-y-0 left-0 w-0.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          :style="{ background: category.accent, opacity: activeCategoryId === category.id ? 1 : undefined }"
        />
        <div>
          <strong class="mb-1 block text-[0.94rem] font-semibold text-[#1c2738]">{{ category.name }}</strong>
          <p class="m-0 text-[0.82rem] leading-[1.55] text-[#6f7e95]">{{ category.description }}</p>
        </div>
        <em class="self-center text-[0.84rem] font-semibold not-italic text-[#4e5f76]">{{ category.topicCount }}</em>
      </button>

      <button
        v-for="child in category.children ?? []"
        :key="child.id"
        type="button"
        :aria-pressed="activeCategoryId === child.id"
        class="group relative grid w-full items-start gap-3.5 border-0 border-b pl-[34px] pr-[18px] py-2.5 text-left transition-colors duration-200 [border-color:var(--forum-border)] [grid-template-columns:minmax(0,1fr)_auto] hover:[background:color-mix(in_srgb,var(--forum-surface-muted)_76%,white)] [aria-pressed='true']:[background:color-mix(in_srgb,var(--forum-surface-muted)_76%,white)] md:pl-[30px] md:pr-5"
        @click="emit('select', child.id)"
      >
        <span
          aria-hidden="true"
          class="pointer-events-none absolute inset-y-0 left-0 w-0.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          :style="{ background: category.accent, opacity: activeCategoryId === child.id ? 1 : undefined }"
        />
        <div>
          <strong class="mb-0.5 block text-[0.88rem] font-medium text-[#1c2738]">{{ child.name }}</strong>
          <p class="m-0 text-[0.78rem] leading-[1.45] text-[#6f7e95]">{{ child.description }}</p>
        </div>
        <em class="self-center text-[0.82rem] font-medium not-italic text-[#4e5f76]">{{ child.topicCount }}</em>
      </button>
    </template>
  </aside>
</template>
