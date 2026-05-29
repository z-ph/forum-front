<script setup lang="ts">
import { computed, watch } from 'vue'
import { MdEditor, type ToolbarNames, type UploadImgEvent } from 'md-editor-v3'

const props = withDefaults(defineProps<{
  modelValue: string
  rows?: number
  placeholder?: string
  disabled?: boolean
  validateEvent?: boolean
}>(), {
  rows: 10,
  placeholder: '输入内容',
  disabled: false,
  validateEvent: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: []
}>()

const { formItem } = useFormItem()

const toolbarsExclude: ToolbarNames[] = [
  'save',
  'github',
  'catalog',
  'htmlPreview',
  'previewOnly',
]

const editorHeight = computed(() => `${Math.max(props.rows * 26 + 130, 320)}px`)

watch(
  () => props.modelValue,
  (next, previous) => {
    if (!props.validateEvent || next === previous) {
      return
    }

    const validate = formItem?.validate

    if (!validate) {
      return
    }

    void validate('change').catch(() => undefined)
  },
)

function updateValue(value: string) {
  emit('update:modelValue', value)
}

function handleBlur() {
  emit('blur')

  if (!props.validateEvent) {
    return
  }

  const validate = formItem?.validate

  if (!validate) {
    return
  }

  void validate('blur').catch(() => undefined)
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      resolve(typeof reader.result === 'string' ? reader.result : '')
    }

    reader.onerror = () => {
      reject(reader.error ?? new Error('图片读取失败'))
    }

    reader.readAsDataURL(file)
  })
}

const handleUploadImg: UploadImgEvent = (files, callback) => {
  void Promise.all(
    files.map(async (file) => ({
      url: await readFileAsDataUrl(file),
      alt: file.name.replace(/\.[^.]+$/, '') || 'image',
      title: file.name,
    })),
  ).then((uploads) => {
    callback(uploads)
  }).catch(() => undefined)
}
</script>

<template>
  <section class="rich-editor">
    <MdEditor
      :model-value="modelValue"
      :theme="'light'"
      :preview-theme="'github'"
      :code-theme="'atom'"
      :language="'zh-CN'"
      :placeholder="placeholder"
      :disabled="disabled"
      :read-only="disabled"
      :toolbars-exclude="toolbarsExclude"
      :on-upload-img="handleUploadImg"
      :on-blur="handleBlur"
      :style="{ height: editorHeight }"
      @update:model-value="updateValue"
    />

    <p class="rich-editor__hint">
      使用 Markdown 排版，支持拖放或粘贴图片，图片会直接以内嵌地址插入正文。
    </p>
  </section>
</template>

<style scoped>
.rich-editor {
  display: grid;
  gap: 0.65rem;
}

.rich-editor__hint {
  margin: 0;
  color: var(--forum-text-soft);
  font-size: 0.8rem;
  line-height: 1.65;
}

.rich-editor :deep(.md-editor) {
  border: 1px solid var(--forum-border);
  border-radius: 2px;
  --md-color: var(--forum-text);
  --md-bk-color: var(--forum-surface);
  --md-bk-color-outstand: var(--forum-surface-muted);
  --md-border-color: var(--forum-border);
  --md-hover-color: color-mix(in srgb, var(--forum-primary) 8%, white);
  --md-bk-hover-color: color-mix(in srgb, var(--forum-primary) 9%, white);
  --md-bk-color-toolbar: var(--forum-surface-muted);
  --md-scrollbar-bg-color: var(--forum-surface-muted);
  --md-scrollbar-thumb-color: #c1cad6;
}

.rich-editor :deep(.md-editor-toolbar) {
  border-bottom-color: var(--forum-border);
}

.rich-editor :deep(.md-editor-toolbar-item svg),
.rich-editor :deep(.md-editor-toolbar-item i) {
  color: #51627a;
}

.rich-editor :deep(.md-editor-toolbar-item:hover),
.rich-editor :deep(.md-editor-toolbar-item.active) {
  background: color-mix(in srgb, var(--forum-primary) 8%, white);
}

.rich-editor :deep(.md-editor-input-wrapper),
.rich-editor :deep(.md-editor-preview-wrapper) {
  font-family: var(--font-sans);
}

.rich-editor :deep(.md-editor-input) {
  color: var(--forum-text);
  font-size: 0.96rem;
  line-height: 1.7;
}

.rich-editor :deep(.md-editor-preview-wrapper) {
  background: #fbfcfd;
}

.rich-editor :deep(.md-editor-footer) {
  border-top-color: var(--forum-border);
}
</style>
