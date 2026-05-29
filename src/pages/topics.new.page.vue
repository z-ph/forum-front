<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useRouter } from 'vue-router'
import RichTextEditor from '../components/forum/RichTextEditor.vue'
import { useCreateTopicMutation, useForumHomeQuery } from '../hooks/useForum'
import { hasRichTextContent } from '../core/richText'

const router = useRouter()
const { data } = useForumHomeQuery()
const createTopic = useCreateTopicMutation()
const isCreatePending = computed(() => createTopic.isPending.value)
const formRef = ref<FormInstance>()

const form = reactive({
  title: '',
  content: '',
  categoryId: '',
  tags: [] as string[],
})

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

async function submitTopic() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) { return }

  try {
    const topic = await createTopic.mutateAsync({
      title: form.title.trim(),
      content: form.content.trim(),
      categoryId: form.categoryId,
      tags: form.tags,
    })
    ElMessage.success('话题已发布')
    await router.push(topic.id === 'pending' ? { name: '/(forum)/latest' } : { name: '/topics.[id]', params: { id: topic.id } })
  } catch (error) {
    ElMessage.error((error as Error).message)
  }
}
</script>

<template>
  <main class="min-h-screen px-4 py-8">
    <section class="mx-auto max-w-[920px] rounded-2xl border border-[var(--forum-border)] bg-[var(--forum-surface)] p-6 shadow-sm">
      <div class="mb-6 flex items-center justify-between gap-4">
        <div>
          <p class="text-sm font-semibold text-[var(--forum-primary)]">新建话题</p>
          <h1 class="mt-1 text-2xl font-bold text-[#162235]">提出你的问题</h1>
          <p class="mt-2 text-sm text-[#72809a]">标题、分类和正文为必填项。</p>
        </div>
        <el-button @click="router.push({ name: '/(forum)/latest' })">返回列表</el-button>
      </div>

      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" maxlength="120" show-word-limit placeholder="用一句话描述你的问题" />
        </el-form-item>

        <el-form-item label="分类" prop="categoryId">
          <el-select v-model="form.categoryId" placeholder="请选择分类">
            <el-option v-for="category in data?.categories ?? []" :key="category.id" :label="category.name" :value="category.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="标签（可选）">
          <el-select v-model="form.tags" multiple clearable filterable placeholder="选择标签">
            <el-option v-for="tag in data?.availableTags ?? []" :key="tag" :label="tag" :value="tag" />
          </el-select>
        </el-form-item>

        <el-form-item label="正文" prop="content">
          <RichTextEditor v-model="form.content" placeholder="描述现象、你尝试过的方法，以及希望别人怎么帮你。" />
        </el-form-item>

        <div class="flex justify-end gap-3">
          <el-button @click="router.push({ name: '/(forum)/latest' })">取消</el-button>
          <el-button type="primary" :loading="isCreatePending" @click="submitTopic">发布话题</el-button>
        </div>
      </el-form>
    </section>
  </main>
</template>