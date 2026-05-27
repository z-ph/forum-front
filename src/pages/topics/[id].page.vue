<script setup lang="ts">
import { computed, ref, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { useRoute, useRouter } from 'vue-router'
import ReplyComposer from '../../components/forum/ReplyComposer.vue'
import RichTextRenderer from '../../components/forum/RichTextRenderer.vue'
import { useCreateReplyMutation, useTopicDetailQuery } from '../../hooks/useForum'
import * as replyApi from '../../services/replyApi'
import {
  buildUserMap,
  extendUserMapFromReplies,
  toForumReply,
} from '../../services/forumAdapter'
import type { ForumReply } from '../../types/forum'

const route = useRoute()
const router = useRouter()
const topicId = computed(() => {
  const params = route.params as { id?: string }
  return params.id ?? ''
})

const { data, isLoading, isError } = useTopicDetailQuery(topicId.value)
const replyMutation = useCreateReplyMutation()
const isReplyPending = computed(() => replyMutation.isPending.value)

const replyingTo = ref<{ id: string; name: string } | null>(null)

const expandedReplies = ref<Record<string, boolean>>({})
const childRepliesMap = ref<Record<string, ForumReply[]>>({})
const childTotalMap = ref<Record<string, number>>({})
const childPagesMap = ref<Record<string, number>>({})

let isMounted = true
onUnmounted(() => {
  isMounted = false
})

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

async function expandReplies(replyId: string) {
  expandedReplies.value[replyId] = true
  childPagesMap.value[replyId] = 1

  try {
    const res = await replyApi.getReplyChildPage({
      parentReplyId: Number(replyId),
      pageNum: 1,
      pageSize: 3,
    })
    if (!isMounted) {return}
    if (res.code === 1 && res.data) {
      const userMap = buildUserMap([], [])
      extendUserMapFromReplies(userMap, res.data.records)
      childRepliesMap.value[replyId] = res.data.records.map((r) => toForumReply(r, userMap))
      childTotalMap.value[replyId] = res.data.total
    }
  } catch {
    // silently ignore
  }
}

async function loadMoreChildReplies(replyId: string) {
  const nextPage = (childPagesMap.value[replyId] || 1) + 1
  childPagesMap.value[replyId] = nextPage

  try {
    const res = await replyApi.getReplyChildPage({
      parentReplyId: Number(replyId),
      pageNum: nextPage,
      pageSize: 3,
    })
    if (!isMounted) {return}
    if (res.code === 1 && res.data) {
      const userMap = buildUserMap([], [])
      extendUserMapFromReplies(userMap, res.data.records)
      const newReplies = res.data.records.map((r) => toForumReply(r, userMap))
      childRepliesMap.value[replyId] = [
        ...(childRepliesMap.value[replyId] || []),
        ...newReplies,
      ]
      childTotalMap.value[replyId] = res.data.total
    }
  } catch {
    // silently ignore
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
            class="border-t border-[var(--forum-border)] px-5 py-5 md:px-8"
          >
            <div class="grid grid-cols-1 gap-3.5 md:grid-cols-[200px_minmax(0,1fr)] md:gap-6">
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

            <!-- Child reply section -->
            <div class="ml-12 mt-3 md:ml-[216px]">
              <el-button
                v-if="!expandedReplies[reply.id]"
                text
                size="small"
                class="text-[0.84rem]"
                @click="expandReplies(reply.id)"
              >
                展开子回复
              </el-button>

              <div v-else class="border-l-2 border-[var(--forum-border)] pl-4">
                <template v-if="childRepliesMap[reply.id]?.length">
                  <div
                    v-for="child in childRepliesMap[reply.id]"
                    :key="child.id"
                    class="mb-3 border-b border-[var(--forum-border)] pb-3 last:mb-0 last:border-b-0"
                  >
                    <div class="flex items-start gap-2">
                      <el-avatar :size="28" :src="child.author.avatar" />
                      <div class="min-w-0 flex-1">
                        <div class="flex items-center gap-2">
                          <strong class="text-[0.84rem] text-[#172235]">
                            {{ child.author.name }}
                          </strong>
                          <span
                            v-if="child.replyToUserNickname"
                            class="text-[0.78rem] text-[#75839a]"
                          >
                            回复 @{{ child.replyToUserNickname }}
                          </span>
                        </div>
                        <div class="mt-1 text-[0.9rem] text-[#1b2738]">
                          <RichTextRenderer :content="child.content" />
                        </div>
                        <div class="mt-1 text-[0.78rem] text-[#75839a]">
                          {{ child.createdAt }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    v-if="childTotalMap[reply.id] > (childRepliesMap[reply.id]?.length || 0)"
                    class="mt-2"
                  >
                    <el-button
                      text
                      size="small"
                      class="text-[0.84rem]"
                      @click="loadMoreChildReplies(reply.id)"
                    >
                      加载更多
                    </el-button>
                  </div>
                </template>

                <div
                  v-else
                  class="py-2 text-[0.84rem] text-[#75839a]"
                >
                  暂无子回复
                </div>
              </div>
            </div>
          </article>
        </section>

        <ReplyComposer
          :loading="isReplyPending"
          :replying-to="replyingTo"
          @submit="handleReply"
          @cancel-reply="cancelReply"
        />
      </template>
    </div>
  </div>
</template>
