<script setup lang="ts">
import { MdPreview } from 'md-editor-v3'

const props = withDefaults(defineProps<{
  content: string
  emptyText?: string
}>(), {
  emptyText: '暂无内容',
})

let previewSeed = 0

function nextPreviewId() {
  previewSeed += 1
  return `forum-md-preview-${previewSeed}`
}

const previewId = nextPreviewId()
</script>

<template>
  <div class="rich-text-renderer">
    <MdPreview
      v-if="props.content"
      :id="previewId"
      :model-value="props.content"
      :theme="'light'"
      :preview-theme="'github'"
      :code-theme="'atom'"
      class="rich-text-renderer__markdown"
    />
    <p v-else class="rich-text-renderer__empty">{{ props.emptyText }}</p>
  </div>
</template>

<style scoped>
.rich-text-renderer {
  min-width: 0;
}

.rich-text-renderer__empty {
  margin: 0;
  color: var(--forum-text-soft);
  font-size: 0.9rem;
}

.rich-text-renderer :deep(.md-editor) {
  background: transparent;
}

.rich-text-renderer :deep(.md-editor-preview) {
  color: #4d5d73;
  font-family: var(--font-sans);
  font-size: 0.98rem;
  line-height: 1.85;
}

.rich-text-renderer :deep(.md-editor-preview h1),
.rich-text-renderer :deep(.md-editor-preview h2),
.rich-text-renderer :deep(.md-editor-preview h3),
.rich-text-renderer :deep(.md-editor-preview h4),
.rich-text-renderer :deep(.md-editor-preview h5),
.rich-text-renderer :deep(.md-editor-preview h6) {
  color: #172235;
}

.rich-text-renderer :deep(.md-editor-preview img) {
  max-width: min(100%, 720px);
  border: 1px solid var(--forum-border);
}

.rich-text-renderer :deep(.md-editor-preview blockquote) {
  color: #536277;
  border-left-color: color-mix(in srgb, var(--forum-primary) 28%, white);
}
</style>
