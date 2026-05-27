<script setup lang="ts">
import { computed, ref } from 'vue'
import { hasRichTextContent } from '../../core/richText'
import RichTextEditor from './RichTextEditor.vue'

defineProps<{
  loading?: boolean
  replyingTo?: { id: string; name: string } | null
}>()

const emit = defineEmits<{
  submit: [content: string]
  'cancel-reply': []
}>()

const content = ref('')
const canSubmit = computed(() => hasRichTextContent(content.value))

function handleSubmit() {
  if (!canSubmit.value) {
    return
  }

  emit('submit', content.value.trim())
  content.value = ''
}

function handleCancelReply() {
  emit('cancel-reply')
}
</script>

<template>
  <section
    class="border-t border-forum-border bg-forum-surface px-5 pt-5 md:px-8"
  >
    <div class="mb-3.5">
      <strong class="block text-[1.04rem] text-[#182437]">参与讨论</strong>
      <span class="mt-1.5 block text-forum-text-soft">
        写下你的排查过程、补充说明或最终答案。
      </span>
    </div>

    <div
      v-if="replyingTo"
      class="mb-3 flex items-center gap-2 rounded bg-[var(--forum-primary-light)] px-3 py-2 text-[0.88rem] text-[var(--forum-primary)]"
    >
      <span>回复 @{{ replyingTo.name }}</span>
      <el-button
        text
        size="small"
        class="ml-auto"
        aria-label="取消回复"
        @click="handleCancelReply"
      >
        取消
      </el-button>
    </div>

    <RichTextEditor
      v-model="content"
      :rows="8"
      placeholder="输入回复内容"
    />

    <div class="mt-3.5 flex justify-end pb-2">
      <el-button type="primary" :loading="loading" :disabled="!canSubmit" @click="handleSubmit">
        发布回复
      </el-button>
    </div>
  </section>
</template>
