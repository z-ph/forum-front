<script setup lang="ts">
import type { ForumTopic } from '../../types/forum'

defineProps<{
  topics: ForumTopic[]
  emptyDescription?: string
}>()

const emit = defineEmits<{
  open: [topicId: string]
}>()
</script>

<template>
  <div>
    <div class="grid items-center gap-[18px] border-b px-[22px] py-2.5 text-[0.76rem] text-[#74839a] [border-color:var(--forum-border)] [grid-template-columns:minmax(0,1.9fr)_160px_72px_72px_118px] max-[900px]:hidden">
      <span>话题</span>
      <span>发布者</span>
      <span>回复</span>
      <span>浏览</span>
      <span class="text-right">最后活动</span>
    </div>

    <div v-if="topics.length" class="flex flex-col">
      <button
        v-for="topic in topics"
        :key="topic.id"
        type="button"
        :data-pinned="topic.pinned"
        class="grid w-full items-center gap-[18px] border-0 border-b bg-transparent px-[22px] py-3.5 text-left transition-colors duration-200 [border-color:var(--forum-border)] [grid-template-columns:minmax(0,1.9fr)_160px_72px_72px_118px] hover:[background:color-mix(in_srgb,var(--forum-surface-muted)_72%,white)] active:[background:color-mix(in_srgb,var(--forum-surface-muted)_92%,white)] focus-visible:relative focus-visible:z-[1] focus-visible:[background:color-mix(in_srgb,var(--forum-surface-muted)_72%,white)] [data-pinned='true']:[box-shadow:inset_2px_0_0_color-mix(in_srgb,var(--forum-primary)_36%,white)] max-[900px]:grid-cols-[minmax(0,1fr)_auto_auto] max-[900px]:gap-x-[14px] max-[900px]:gap-y-3 max-[900px]:px-4"
        @click="emit('open', topic.id)"
      >
        <div class="min-w-0 max-[900px]:col-span-3 max-[900px]:row-start-1">
          <div class="flex flex-wrap items-baseline gap-2">
            <span v-if="topic.pinned" class="inline-flex items-center text-[0.74rem] font-semibold [color:var(--forum-primary)]">置顶</span>
            <span v-if="topic.solved" class="inline-flex items-center text-[0.74rem] font-semibold text-[#1d7f53]">已解决</span>
            <strong class="block text-[0.98rem] leading-6 text-[#192435]">{{ topic.title }}</strong>
          </div>

          <div class="mt-1.5 flex flex-wrap text-[0.78rem] text-[#6c7a91]">
            <span class="font-medium [color:var(--forum-primary)]">{{ topic.categoryName }}</span>
            <span
              v-for="tag in topic.tags.slice(0, 2)"
              :key="tag"
              class="relative ml-2.5 pl-2.5 text-[#6c7a91] before:absolute before:left-0 before:top-1/2 before:h-[3px] before:w-[3px] before:-translate-y-1/2 before:rounded-full before:bg-[#9aa7b7] before:content-['']"
            >
              #{{ tag }}
            </span>
          </div>

          <p class="mt-1.5 text-[0.84rem] leading-[1.55] text-[#5f6f87]">{{ topic.preview }}</p>
        </div>

        <div class="max-[900px]:row-start-2 max-[900px]:min-w-0">
          <strong class="block text-[0.88rem] font-semibold text-[#1d2739]">{{ topic.author.name }}</strong>
          <span class="mt-[3px] block text-[0.78rem] leading-[1.45] text-[#738199]">
            {{ topic.author.title }} · {{ topic.createdAt }}
          </span>
        </div>

        <div class="text-center text-[#72809a] max-[900px]:row-start-2">
          <strong class="block text-[1rem] text-[#182437]">{{ topic.repliesCount }}</strong>
          <span class="mt-0.5 block text-[0.76rem]">回复</span>
        </div>

        <div class="text-center text-[#72809a] max-[900px]:row-start-2">
          <strong class="block text-[1rem] text-[#182437]">{{ topic.views }}</strong>
          <span class="mt-0.5 block text-[0.76rem]">浏览</span>
        </div>

        <div class="text-right text-[0.8rem] leading-[1.45] text-[#6f7d94] max-[900px]:col-span-3 max-[900px]:row-start-3 max-[900px]:text-left">
          {{ topic.updatedAt }}
        </div>
      </button>
    </div>

    <el-empty v-else :description="emptyDescription || '当前还没有主题'" />
  </div>
</template>
