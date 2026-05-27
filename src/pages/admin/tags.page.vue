<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import AdminPageShell from '../../components/admin/AdminPageShell.vue'
import {
  useAdminTagsQuery,
  useCreateTagMutation,
  useUpdateTagMutation,
  useDeleteTagMutation,
} from '../../hooks/useAdmin'
import type { TagVO } from '@/types/api'

const dialogVisible = ref(false)
const editingRow = ref<TagVO | null>(null)
const form = ref({ name: '' })

const { data, isLoading, isError, refetch } = useAdminTagsQuery()
const createMutation = useCreateTagMutation()
const updateMutation = useUpdateTagMutation()
const deleteMutation = useDeleteTagMutation()

const dialogTitle = computed(() =>
  editingRow.value ? '编辑标签' : '新增标签',
)

function openCreateDialog() {
  editingRow.value = null
  form.value = { name: '' }
  dialogVisible.value = true
}

function openEditDialog(row: TagVO) {
  editingRow.value = row
  form.value = { name: row.name }
  dialogVisible.value = true
}

function handleSubmit() {
  const name = form.value.name.trim()
  if (!name) {
    ElMessage.warning('请输入标签名称')
    return
  }

  if (editingRow.value) {
    updateMutation.mutate(
      { id: editingRow.value.id, data: { name } },
      {
        onSuccess: () => {
          ElMessage.success('编辑成功')
          dialogVisible.value = false
        },
        onError: (error) => {
          ElMessage.error((error as Error)?.message || '操作失败，请重试')
        },
      },
    )
  } else {
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
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="名称" min-width="200" />
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }: { row: TagVO }">
            <el-button
              text
              type="primary"
              size="small"
              @click="openEditDialog(row)"
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
        </el-table-column>
      </el-table>
    </template>

    <el-empty
      v-else
      description="暂无标签"
    />

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="480px"
      :close-on-click-modal="false"
      :aria-label="dialogTitle"
    >
      <el-form label-position="top">
        <el-form-item label="标签名称" required>
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
        <el-button type="primary" :loading="createMutation.isPending.value || updateMutation.isPending.value" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </AdminPageShell>
</template>