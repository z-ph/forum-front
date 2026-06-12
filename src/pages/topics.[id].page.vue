<script setup lang="ts">
import { computed, ref } from 'vue'
import { ArrowLeft } from '@element-plus/icons-vue'
import { useRoute, useRouter } from 'vue-router'
import ReplyChildSection from '../components/forum/ReplyChildSection.vue'
import ReplyComposer from '../components/forum/ReplyComposer.vue'
import RichTextRenderer from '../components/forum/RichTextRenderer.vue'
import { useCreateReplyMutation, useForumHomeQuery, useTopicDetailQuery } from '../hooks/useForum'
import type { ForumReply } from '../types/forum'

const route = useRoute('/topics.[id]')
const router = useRouter()
const topicId = computed(() => route.params.id)

const { data, isLoading, isError } = useTopicDetailQuery(topicId)
const { data: homeData } = useForumHomeQuery()
const me = computed(() => homeData.value?.me ?? null)
const replyMutation = useCreateReplyMutation()
const isReplyPending = computed(() => replyMutation.isPending.value)

const replyingTo = ref<{ id: string; name: string } | null>(null)

const expandedReplies = ref<Record<string, boolean>>({})

async function handleReply(content: string) {
  if (!data.value) {
    return
  }

  try {
    await replyMutation.mutateAsync({
      topicId: data.value.id,
      content,
      parentReplyId: replyingTo.value?.id,
    })
    ElMessage.success('回复已发布')
    replyingTo.value = null
  } catch (error) {
    ElMessage.error((error as Error).message)
  }
}

function cancelReply() {
  replyingTo.value = null
}

function setReplyingTo(reply: ForumReply) {
  replyingTo.value = { id: reply.id, name: reply.author.name }
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
        @click="router.push({ name: '/(forum)' })"
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
          <el-tag @click="router.push({ name: '/(forum)' })" class="cursor-pointer">
            {{ data.categoryName }}
          </el-tag>

          <h1 class="my-[14px] mb-4 text-[clamp(1.8rem,2.2vw,2.45rem)] leading-[1.25] text-forum-heading">
            {{ data.title }}
          </h1>

          <div
            class="flex flex-col items-start justify-between gap-[18px] border-b border-[var(--forum-border)] pb-[18px] md:flex-row md:items-center"
          >
            <div class="flex items-center gap-3">
              <el-avatar :size="42" :src="data.author.avatar" :alt="data.author.name" />
              <div>
                <strong class="block text-forum-heading">{{ data.author.name }}</strong>
                <span class="block text-[0.86rem] text-forum-meta">
                  {{ data.author.title }} · 发布于 {{ data.createdAt }}
                </span>
              </div>
            </div>

            <div class="flex gap-3.5 text-[0.86rem] text-forum-meta">
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
            <h2 class="m-0 text-[1.05rem] text-forum-heading">回复</h2>
            <span class="text-[0.84rem] text-forum-meta-light">{{ data.replies.length }} 条讨论</span>
          </div>

          <article
            v-for="(reply, index) in data.replies"
            :key="reply.id"
            class="border-t border-[var(--forum-border)] px-5 py-5 md:px-8"
          >
            <div class="grid grid-cols-1 gap-3.5 md:grid-cols-[200px_minmax(0,1fr)] md:gap-6">
              <div class="flex items-start gap-3">
                <el-avatar :size="38" :src="reply.author.avatar" :alt="reply.author.name" />
                <div>
                  <strong class="block text-forum-heading">{{ reply.author.name }}</strong>
                  <span class="mt-[3px] block text-[0.84rem] text-forum-meta-light">
                    {{ reply.author.title }}
                  </span>
                  <em class="mt-[3px] block text-[0.84rem] not-italic text-forum-meta-light">
                    #{{ index + 1 }}
                  </em>
                </div>
              </div>

              <div>
                <div class="flex flex-col items-start justify-between gap-3.5 md:flex-row md:items-center">
                  <div>
                    <strong class="block text-[0.9rem] text-forum-heading-soft">{{ reply.createdAt }}</strong>
                  </div>
                </div>

                <div class="mt-[14px]">
                  <RichTextRenderer :content="reply.content" />
                </div>

                <div class="mt-2 flex items-center gap-4">
                  <el-button
                    text
                    size="small"
                    class="text-[0.84rem]"
                    @click="setReplyingTo(reply)"
                  >
                    回复
                  </el-button>
                </div>
              </div>
            </div>

            <!-- Child reply section (TanStack Query useInfiniteQuery) -->
            <div class="ml-12 mt-3 md:ml-[216px]">
              <el-button
                v-if="reply.childCount && !expandedReplies[reply.id]"
                text
                size="small"
                class="text-[0.84rem]"
                @click="expandedReplies[reply.id] = true"
              >
                展开 {{ reply.childCount }} 条子回复
              </el-button>
              <ReplyChildSection
                v-else-if="expandedReplies[reply.id]"
                :parent-reply-id="reply.id"
                :expanded="!!expandedReplies[reply.id]"
              />
            </div>
          </article>
        </section>

        <ReplyComposer
          :me="me"
          :loading="isReplyPending"
          :replying-to="replyingTo"
          @submit="handleReply"
          @cancel-reply="cancelReply"
        />
      </template>
    </div>
  </div>
</template>
