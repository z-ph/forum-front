<script setup lang="ts">
import { computed, ref } from 'vue'
import { hasRichTextContent } from '../../core/richText'
import RichTextEditor from './RichTextEditor.vue'

defineProps<{
  loading?: boolean
}>()

const emit = defineEmits<{
  submit: [content: string]
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
