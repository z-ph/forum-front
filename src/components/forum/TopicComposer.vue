<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { ForumCategory } from '../../types/forum'
import { hasRichTextContent } from '../../core/richText'
import RichTextEditor from './RichTextEditor.vue'

const props = defineProps<{
  modelValue: boolean
  isAdmin?: boolean
  categories: ForumCategory[]
  availableTags: string[]
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [payload: { title: string; content: string; categoryId: string; tags: string[] }]
}>()

const formRef = ref<FormInstance>()
const form = reactive({
  title: '',
  categoryId: '',
  content: '',
  tags: [] as string[],
})

function resetForm() {
  form.title = ''
  form.categoryId = props.categories[0]?.id ?? ''
  form.content = ''
  form.tags = []
  formRef.value?.clearValidate()
}

const rules: FormRules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }],
  content: [{
    trigger: ['blur', 'change'],
    validator: (_rule, value, callback) => {
      if (hasRichTextContent(String(value ?? ''))) {
        callback()
        return
      }

      callback(new Error('请输入正文'))
    },
  }],
}

watch(
  () => props.modelValue,
  (value) => {
    if (value && !form.categoryId && props.categories.length) {
      form.categoryId = props.categories[0].id
    }

    if (!value) {
      resetForm()
    }
  },
  { immediate: true },
)

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  emit('submit', {
    title: form.title.trim(),
    categoryId: form.categoryId,
    content: form.content.trim(),
    tags: form.tags,
  })
}

function handleClose() {
  resetForm()
  emit('update:modelValue', false)
}
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    title="发布新主题"
    width="720px"
    class="max-w-[calc(100vw-1.5rem)]"
    destroy-on-close
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
      class="space-y-1"
    >
      <el-form-item label="标题" prop="title" class="mb-5">
        <el-input
          v-model="form.title"
          maxlength="80"
          show-word-limit
          placeholder="例如：主控连接后无法识别串口，如何排查？"
        />
      </el-form-item>

      <el-form-item label="分类" prop="categoryId" class="mb-5">
        <el-select
          v-model="form.categoryId"
          :filterable="isAdmin"
          :allow-create="isAdmin"
          :default-first-option="isAdmin"
          placeholder="请选择分类"
        >
          <el-option
            v-for="category in categories"
            :key="category.id"
            :label="category.name"
            :value="category.id"
          />
        </el-select>
        <div class="mt-1.5 text-[0.8rem] leading-6 text-forum-text-soft">
          {{ isAdmin ? '管理员可输入并创建新分类，普通用户只能选择现有分类。' : '分类由管理员维护，普通用户只能选择现有分类。' }}
        </div>
      </el-form-item>

      <el-form-item label="标签" class="mb-5">
        <el-select
          v-model="form.tags"
          multiple
          collapse-tags
          collapse-tags-tooltip
          :filterable="true"
          :allow-create="isAdmin"
          :default-first-option="isAdmin"
          placeholder="请选择标签"
        >
          <el-option
            v-for="tag in availableTags"
            :key="tag"
            :label="tag"
            :value="tag"
          />
        </el-select>
        <div class="mt-1.5 text-[0.8rem] leading-6 text-forum-text-soft">
          {{ isAdmin ? '管理员可创建新标签，普通用户只能从现有标签中选择。' : '标签由管理员维护，普通用户只能选择现有标签。' }}
        </div>
      </el-form-item>

      <el-form-item label="正文" prop="content" class="mb-0">
        <RichTextEditor
          v-model="form.content"
          :rows="12"
          placeholder="写清楚问题现象、已尝试过的步骤和预期结果。"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="flex justify-end">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit">发布主题</el-button>
      </div>
    </template>
  </el-dialog>
</template>
