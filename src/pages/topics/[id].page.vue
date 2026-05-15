<script setup lang="ts">
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { useRoute, useRouter } from 'vue-router'
import ReplyComposer from '../../components/forum/ReplyComposer.vue'
import RichTextRenderer from '../../components/forum/RichTextRenderer.vue'
import { useCreateReplyMutation, useTopicDetailQuery } from '../../hooks/useForum'

const route = useRoute()
const router = useRouter()
const topicId = computed(() => {
  const params = route.params as { id?: string }
  return params.id ?? ''
})

const { data, isLoading, isError } = useTopicDetailQuery(topicId.value)
const replyMutation = useCreateReplyMutation()

async function handleReply(content: string) {
  if (!data.value) return

  try {
    await replyMutation.mutateAsync({
      topicId: data.value.id,
      content,
    })
    ElMessage.success('回复已发布')
  } catch (error) {
    ElMessage.error((error as Error).message)
  }
}
</script>

<template>
  <div class="min-h-screen bg-transparent px-4 pb-10">
    <div
      class="mx-auto w-full max-w-[1080px] bg-[var(--forum-surface)] pb-10 md:border-x md:border-[var(--forum-border)]"
    >
      <el-button
        text
        class="ml-3 mt-[18px] mb-1.5 md:ml-6"
        @click="router.push({ path: '/' })"
      >
        <el-icon><ArrowLeft /></el-icon>
        返回论坛首页
      </el-button>

      <el-skeleton v-if="isLoading" animated :rows="8" />

      <el-result
        v-else-if="isError || !data"
        icon="warning"
        title="主题不存在"
        sub-title="请返回列表重新选择一个主题。"
      />

      <template v-else>
        <section class="border-b border-[var(--forum-border)] px-5 py-[18px] pb-6 md:px-8">
          <div class="flex flex-wrap gap-2">
            <span
              class="inline-flex border border-[var(--forum-border)] bg-[var(--forum-surface)] px-2 py-[3px] text-[0.78rem] font-bold text-[var(--forum-primary)]"
            >
              {{ data.categoryName }}
            </span>
            <span
              v-if="data.solved"
              class="inline-flex border border-[#cfe6d7] bg-[#eef8f2] px-2 py-[3px] text-[0.78rem] font-bold text-[#1d8f5a]"
            >
              已解决
            </span>
          </div>

          <h1 class="my-[14px] mb-4 text-[clamp(1.8rem,2.2vw,2.45rem)] leading-[1.25] text-[#162235]">
            {{ data.title }}
          </h1>

          <div
            class="flex flex-col items-start justify-between gap-[18px] border-b border-[var(--forum-border)] pb-[18px] md:flex-row md:items-center"
          >
            <div class="flex items-center gap-3">
              <el-avatar :size="42" :src="data.author.avatar" />
              <div>
                <strong class="block text-[#192437]">{{ data.author.name }}</strong>
                <span class="block text-[0.86rem] text-[#72809a]">
                  {{ data.author.title }} · 发布于 {{ data.createdAt }}
                </span>
              </div>
            </div>

            <div class="flex gap-3.5 text-[0.86rem] text-[#72809a]">
              <span class="inline-flex items-center">{{ data.replies.length }} 回复</span>
              <span class="inline-flex items-center">{{ data.views }} 浏览</span>
            </div>
          </div>

          <div class="mt-[18px]">
            <RichTextRenderer :content="data.content" />
          </div>
        </section>

        <section class="bg-[var(--forum-surface)]">
          <div class="flex items-center justify-between gap-3 px-5 py-[18px] pb-3 md:px-8">
            <strong class="text-[1.05rem] text-[#182437]">回复</strong>
            <span class="text-[0.84rem] text-[#74839a]">{{ data.replies.length }} 条讨论</span>
          </div>

          <article
            v-for="(reply, index) in data.replies"
            :key="reply.id"
            class="grid grid-cols-1 gap-3.5 border-t border-[var(--forum-border)] px-5 py-5 md:grid-cols-[200px_minmax(0,1fr)] md:gap-6 md:px-8"
            :class="reply.isSolution ? 'shadow-[inset_3px_0_0_rgba(29,143,90,0.24)]' : ''"
          >
            <div class="flex items-start gap-3">
              <el-avatar :size="38" :src="reply.author.avatar" />
              <div>
                <strong class="block text-[#172235]">{{ reply.author.name }}</strong>
                <span class="mt-[3px] block text-[0.84rem] text-[#75839a]">
                  {{ reply.author.title }}
                </span>
                <em class="mt-[3px] block text-[0.84rem] not-italic text-[#75839a]">
                  #{{ index + 1 }}
                </em>
              </div>
            </div>

            <div>
              <div class="flex flex-col items-start justify-between gap-3.5 md:flex-row md:items-center">
                <div>
                  <strong class="block text-[0.9rem] text-[#1b2738]">{{ reply.createdAt }}</strong>
                  <span class="mt-[3px] block text-[0.8rem] text-[#748299]">
                    {{ reply.likes }} 人点赞
                  </span>
                </div>
                <span
                  v-if="reply.isSolution"
                  class="inline-flex border border-[#cfe6d7] bg-[#eef8f2] px-2 py-[3px] text-[0.78rem] font-bold text-[#1d8f5a]"
                >
                  最佳答案
                </span>
              </div>

              <div class="mt-[14px]">
                <RichTextRenderer :content="reply.content" />
              </div>
            </div>
          </article>
        </section>

        <ReplyComposer :loading="replyMutation.isPending.value" @submit="handleReply" />
      </template>
    </div>
  </div>
</template>
