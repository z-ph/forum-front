<script setup lang="ts">
import { ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import AdminPageShell from '../../components/admin/AdminPageShell.vue'
import {
  useAdminTagsQuery,
  useCreateTagMutation,
  useUpdateTagMutation,
  useDeleteTagMutation,
} from '../../hooks/useAdmin'
import type { TagVO } from '@/types/api'

const dialogVisible = ref(false)
const form = ref({ name: '' })
const formRef = ref<FormInstance>()

const rules: FormRules = {
  name: [{ required: true, message: '请输入标签名称', trigger: 'blur' }],
}

/** 内联编辑状态 */
const editingId = ref<number | null>(null)
const editingName = ref('')

const { data, isLoading, isError, refetch } = useAdminTagsQuery()
const createMutation = useCreateTagMutation()
const updateMutation = useUpdateTagMutation()
const deleteMutation = useDeleteTagMutation()

function openCreateDialog() {
  form.value = { name: '' }
  dialogVisible.value = true
}

function startInlineEdit(row: TagVO) {
  editingId.value = row.id
  editingName.value = row.name
}

async function saveInlineEdit() {
  const name = editingName.value.trim()
  if (!name || editingId.value === null) {return}
  updateMutation.mutate(
    { id: editingId.value, data: { name } },
    {
      onSuccess: () => {
        ElMessage.success('编辑成功')
        editingId.value = null
      },
      onError: (error) => {
        ElMessage.error((error as Error)?.message || '操作失败，请重试')
      },
    },
  )
}

function cancelInlineEdit() {
  editingId.value = null
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) {return}

  const name = form.value.name.trim()
  createMutation.mutate({ name }, {
    onSuccess: () => {
      ElMessage.success('创建成功')
      dialogVisible.value = false
    },
    onError: (error) => {
      ElMessage.error((error as Error)?.message || '操作失败，请重试')
    },
  })
}

function handleDelete(row: TagVO) {
  ElMessageBox.confirm(
    `确定删除标签「${row.name}」吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    },
  )
    .then(() => {
      deleteMutation.mutate(row.id, {
        onSuccess: () => {
          ElMessage.success('删除成功')
        },
        onError: (error) => {
          ElMessage.error((error as Error)?.message || '操作失败，请重试')
        },
      })
    })
    .catch(() => {
      /* cancelled */
    })
}
</script>

<template>
  <AdminPageShell
    title="标签管理"
    description="维护话题标签。"
  >
    <template #actions>
      <el-button type="primary" @click="openCreateDialog">
        新增标签
      </el-button>
    </template>

    <el-skeleton v-if="isLoading" :rows="8" animated />

    <el-result
      v-else-if="isError"
      icon="error"
      title="加载失败"
      sub-title="无法加载标签列表，请重试"
    >
      <template #extra>
        <el-button type="primary" @click="refetch()">重试</el-button>
      </template>
    </el-result>

    <template v-else-if="data && data.length > 0">
      <el-table
        :data="data"
        stripe
        style="width: 100%"
      >
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column label="名称" min-width="200">
          <template #default="{ row }: { row: TagVO }">
            <el-input
              v-if="editingId === row.id"
              v-model="editingName"
              size="small"
              @keyup.enter="saveInlineEdit"
              @keyup.escape="cancelInlineEdit"
            />
            <span v-else>{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }: { row: TagVO }">
            <template v-if="editingId === row.id">
              <el-button
                text
                type="primary"
                size="small"
                :loading="updateMutation.isPending.value && updateMutation.variables.value?.id === row.id"
                @click="saveInlineEdit"
              >
                保存
              </el-button>
              <el-button
                text
                size="small"
                :disabled="updateMutation.isPending.value"
                @click="cancelInlineEdit"
              >
                取消
              </el-button>
            </template>
            <template v-else>
              <el-button
                text
                type="primary"
                size="small"
                @click="startInlineEdit(row)"
              >
                编辑
              </el-button>
              <el-button
                text
                type="danger"
                size="small"
                :loading="
                  deleteMutation.isPending.value &&
                  deleteMutation.variables.value === row.id
                "
                @click="handleDelete(row)"
              >
                删除
              </el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
    </template>

    <el-empty
      v-else
      description="暂无标签"
    />

    <el-dialog
      v-model="dialogVisible"
      title="新增标签"
      width="480px"
      class="max-w-[calc(100vw-1.5rem)]"
      :close-on-click-modal="false"
      aria-label="新增标签"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-form-item label="标签名称" prop="name">
          <el-input
            v-model="form.name"
            placeholder="请输入标签名称"
            :maxlength="30"
            aria-label="标签名称"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="createMutation.isPending.value" @click="handleSubmit">
          创建
        </el-button>
      </template>
    </el-dialog>
  </AdminPageShell>
</template>