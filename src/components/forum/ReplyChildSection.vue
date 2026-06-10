<script setup lang="ts">
import { computed } from 'vue'
import { useChildRepliesInfiniteQuery } from '../../hooks/useForum'
import RichTextRenderer from './RichTextRenderer.vue'

const props = defineProps<{
  parentReplyId: string
  expanded: boolean
}>()

const enabled = computed(() => props.expanded)

const {
  data,
  fetchNextPage,
  isFetchingNextPage,
} = useChildRepliesInfiniteQuery(props.parentReplyId, enabled)

const flatReplies = computed(() =>
  data.value?.pages.flatMap((page) => page.replies) ?? [],
)

const childTotal = computed(() => {
  if (!data.value?.pages.length) {return 0}
  return data.value.pages[data.value.pages.length - 1].total
})

const hasMore = computed(() =>
  flatReplies.value.length < childTotal.value,
)
</script>

<template>
  <div v-if="expanded" class="border-l-2 border-[var(--forum-border)] pl-4">
    <el-skeleton v-if="!data" animated :rows="3" />
    <template v-else-if="flatReplies.length">
      <div
        v-for="child in flatReplies"
        :key="child.id"
        class="mb-3 border-b border-[var(--forum-border)] pb-3 last:mb-0 last:border-b-0"
      >
        <div class="flex items-start gap-2">
          <el-avatar :size="28" :src="child.author.avatar" :alt="child.author.name" />
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <strong class="text-[0.84rem] text-forum-heading">
                {{ child.author.name }}
              </strong>
              <span
                v-if="child.replyToUserNickname"
                class="text-[0.78rem] text-forum-meta-light"
              >
                回复 @{{ child.replyToUserNickname }}
              </span>
            </div>
            <div class="mt-1 text-[0.9rem] text-forum-heading-soft">
              <RichTextRenderer :content="child.content" />
            </div>
            <div class="mt-1 text-[0.78rem] text-forum-meta-light">
              {{ child.createdAt }}
            </div>
          </div>
        </div>
      </div>

      <div v-if="hasMore" class="mt-2">
        <el-button
          text
          size="small"
          class="text-[0.84rem]"
          :loading="isFetchingNextPage"
          @click="fetchNextPage()"
        >
          加载更多
        </el-button>
      </div>
    </template>

    <div v-else class="py-2 text-[0.84rem] text-forum-meta-light">
      暂无子回复
    </div>
  </div>
</template>
