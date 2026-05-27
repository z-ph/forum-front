<script setup lang="ts">
import { computed, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import RichTextEditor from '../../components/forum/RichTextEditor.vue'
import { useCreateTopicMutation, useForumHomeQuery } from '../../hooks/useForum'

const router = useRouter()
const { data } = useForumHomeQuery()
const createTopic = useCreateTopicMutation()
const isCreatePending = computed(() => createTopic.isPending.value)

const form = reactive({
  title: '',
  content: '',
  categoryId: '',
  tags: [] as string[],
})

const canSubmit = computed(() => form.title.trim().length > 0 && form.content.trim().length > 0)

async function submitTopic() {
  if (!canSubmit.value) {
    ElMessage.warning('请填写标题和正文')
    return
  }

  try {
    const topic = await createTopic.mutateAsync({
      title: form.title.trim(),
      content: form.content.trim(),
      categoryId: form.categoryId || undefined,
      tags: form.tags,
    })
    ElMessage.success('话题已发布')
    await router.push({ path: topic.id === 'pending' ? '/latest' : `/topics/${topic.id}` })
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
          <p class="mt-2 text-sm text-[#72809a]">标题和正文必填，分类和标签可稍后补充。</p>
        </div>
        <el-button @click="router.push({ path: '/latest' })">返回列表</el-button>
      </div>

      <el-form label-position="top">
        <el-form-item label="标题">
          <el-input v-model="form.title" maxlength="120" show-word-limit placeholder="用一句话描述你的问题" />
        </el-form-item>

        <el-form-item label="分类（可选）">
          <el-select v-model="form.categoryId" clearable placeholder="选择分类">
            <el-option v-for="category in data?.categories ?? []" :key="category.id" :label="category.name" :value="category.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="标签（可选）">
          <el-select v-model="form.tags" multiple clearable filterable placeholder="选择标签">
            <el-option v-for="tag in data?.availableTags ?? []" :key="tag" :label="tag" :value="tag" />
          </el-select>
        </el-form-item>

        <el-form-item label="正文">
          <RichTextEditor v-model="form.content" placeholder="描述现象、你尝试过的方法，以及希望别人怎么帮你。" />
        </el-form-item>

        <div class="flex justify-end gap-3">
          <el-button @click="router.push({ path: '/latest' })">取消</el-button>
          <el-button type="primary" :loading="isCreatePending" :disabled="!canSubmit" @click="submitTopic">发布话题</el-button>
        </div>
      </el-form>
    </section>
  </main>
</template>