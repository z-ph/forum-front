<script setup lang="ts">
import { useRouter } from 'vue-router'
import { EditPen } from '@element-plus/icons-vue'
import type { ForumTopic } from '../../types/forum'

defineProps<{
  topics: ForumTopic[]
  emptyDescription?: string
}>()

const emit = defineEmits<{
  open: [topicId: string]
}>()

const router = useRouter()

function avatarLetter(name: string): string {
  return name.charAt(0).toUpperCase()
}

function avatarColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash) % 360
  const lightness = hue >= 40 && hue <= 80 ? 32 : 38
  return `hsl(${hue}, 50%, ${lightness}%)`
}
</script>

<template>
  <div>
    <!-- Header row -->
    <div class="grid items-center gap-[14px] border-b px-[18px] py-2 text-[0.75rem] font-medium tracking-wide uppercase text-[#74839a] [border-color:var(--forum-border)] [grid-template-columns:44px_minmax(0,1fr)_140px_64px_64px_110px] max-[900px]:hidden">
      <span />
      <span>话题</span>
      <span>发布者</span>
      <span class="text-center">回复</span>
      <span class="text-center">浏览</span>
      <span class="text-right">最后活动</span>
    </div>

    <!-- Topic rows -->
    <div v-if="topics.length" class="flex flex-col">
      <button
        v-for="topic in topics"
        :key="topic.id"
        type="button"
        class="group grid w-full items-center gap-[14px] border-0 border-b bg-transparent px-[18px] py-2.5 text-left transition-colors duration-150 [border-color:var(--forum-border)] [grid-template-columns:44px_minmax(0,1fr)_140px_64px_64px_110px] hover:[background:color-mix(in_srgb,var(--forum-surface-muted)_72%,white)] active:[background:color-mix(in_srgb,var(--forum-surface-muted)_92%,white)] focus-visible:relative focus-visible:z-[1] focus-visible:[background:color-mix(in_srgb,var(--forum-surface-muted)_72%,white)] max-[900px]:grid-cols-[40px_minmax(0,1fr)_auto_auto] max-[900px]:gap-x-[10px] max-[900px]:gap-y-2 max-[900px]:px-3"
        @click="emit('open', topic.id)"
      >
        <!-- Avatar column -->
        <div class="flex items-start justify-center pt-0.5 max-[900px]:row-span-3 max-[900px]:row-start-1">
          <div
            class="flex h-[32px] w-[32px] flex-shrink-0 items-center justify-center rounded-full text-[0.8rem] font-bold text-white select-none"
            :style="{ background: avatarColor(topic.author.name) }"
            :title="topic.author.name"
          >
            {{ avatarLetter(topic.author.name) }}
          </div>
        </div>

        <!-- Title / meta block -->
        <div class="min-w-0 max-[900px]:col-span-3 max-[900px]:row-start-1">
          <div class="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <strong class="block truncate text-[0.92rem] font-semibold leading-6 text-[#1a273a] group-hover:[color:var(--forum-primary)] transition-colors">{{ topic.title }}</strong>
          </div>

          <div class="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.78rem]">
            <!-- Category as colored label -->
            <span
              v-if="topic.categoryName"
              class="inline-flex items-center rounded-full px-2 py-[1px] text-[0.72rem] font-medium leading-[1.4] [background:color-mix(in_srgb,var(--forum-primary)_12%,white)] [color:var(--forum-primary)]"
            >
              {{ topic.categoryName }}
            </span>

            <!-- Tags inline -->
            <span
              v-for="tag in topic.tags.slice(0, 2)"
              :key="tag"
              class="inline-flex items-center gap-0.5 text-[#6c7a91]"
            >
              <span class="text-[0.65rem] leading-none">#</span>{{ tag }}
            </span>
          </div>

          <!-- Preview text -->
          <p class="mt-1 truncate text-[0.8rem] leading-[1.45] text-[#5f6f87] max-[900px]:hidden">{{ topic.preview }}</p>
        </div>

        <!-- Author column -->
        <div class="max-[900px]:col-span-2 max-[900px]:row-start-2 max-[900px]:min-w-0">
          <span class="block truncate text-[0.85rem] font-medium text-[#1d2739]">{{ topic.author.name }}</span>
          <span class="mt-[1px] block truncate text-[0.72rem] leading-[1.4] text-[#738199]">
            {{ topic.createdAt }}
          </span>
        </div>

        <!-- Replies count -->
        <div class="text-center text-[#72809a] max-[900px]:row-start-2 max-[900px]:self-center">
          <strong class="block text-[0.95rem] font-semibold text-[#182437]">{{ topic.repliesCount }}</strong>
          <span class="mt-0.5 hidden text-[0.68rem] sm:block">回复</span>
        </div>

        <!-- Views count -->
        <div class="text-center text-[#72809a] max-[900px]:row-start-2 max-[900px]:self-center">
          <strong class="block text-[0.95rem] font-semibold text-[#182437]">{{ topic.views }}</strong>
          <span class="mt-0.5 hidden text-[0.68rem] sm:block">浏览</span>
        </div>

        <!-- Last activity -->
        <div class="self-center text-right text-[0.75rem] leading-[1.4] text-[#6f7d94] max-[900px]:col-span-4 max-[900px]:row-start-3 max-[900px]:text-left">
          {{ topic.updatedAt }}
        </div>
      </button>
    </div>

    <!-- Empty state with CTA -->
    <div v-else class="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full [background:color-mix(in_srgb,var(--forum-primary)_10%,white)]">
        <el-icon class="text-[1.6rem] [color:var(--forum-primary)]">
          <EditPen />
        </el-icon>
      </div>
      <p class="mb-2 text-[0.95rem] font-medium text-[#2a374a]">{{ emptyDescription || '当前还没有话题' }}</p>
      <p class="mb-6 max-w-[340px] text-[0.82rem] leading-[1.55] text-[#6f7d94]">成为第一个发起讨论的人，分享你的想法或问题。</p>
      <el-button type="primary" size="large" @click="router.push({ name: '/topics.new' })">
        发布第一个话题
      </el-button>
    </div>
  </div>
</template>
