<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import AdminPageShell from '../../components/admin/AdminPageShell.vue'
import {
  useAdminCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  flattenCategoryTree,
} from '../../hooks/useAdmin'
import type { CategoryVO } from '../../services/categoryApi'

const dialogVisible = ref(false)
const editingRow = ref<CategoryVO | null>(null)
const form = ref({ name: '', parentId: 0, description: '' })

const { data, isLoading, isError, refetch } = useAdminCategoriesQuery()
const createMutation = useCreateCategoryMutation()
const updateMutation = useUpdateCategoryMutation()
const deleteMutation = useDeleteCategoryMutation()

const flatList = computed(() => flattenCategoryTree(data.value ?? []))

/** id → 分类名称 映射，用于在表格中显示父级分类名 */
const categoryNameMap = computed(() => {
  const map = new Map<number, string>()
  for (const cat of flatList.value) {
    map.set(cat.id, cat.name)
  }
  return map
})

/** 表单可选父级分类（编辑时排除自身及子孙，避免循环引用） */
const parentOptions = computed(() => {
  if (!editingRow.value) { return flatList.value }
  // 收集当前分类及其所有子孙 ID
  const excludeIds = new Set<number>()
  excludeIds.add(editingRow.value.id)
  function collectDescendants(parentId: number) {
    for (const cat of flatList.value) {
      if (cat.parentId === parentId && !excludeIds.has(cat.id)) {
        excludeIds.add(cat.id)
        collectDescendants(cat.id)
      }
    }
  }
  collectDescendants(editingRow.value.id)
  return flatList.value.filter((cat) => !excludeIds.has(cat.id))
})

const dialogTitle = computed(() =>
  editingRow.value ? '编辑分类' : '新增分类',
)

function openCreateDialog() {
  editingRow.value = null
  form.value = { name: '', parentId: 0, description: '' }
  dialogVisible.value = true
}

function openEditDialog(row: CategoryVO) {
  editingRow.value = row
  form.value = {
    name: row.name,
    parentId: row.parentId,
    description: row.description || '',
  }
  dialogVisible.value = true
}

function handleSubmit() {
  const name = form.value.name.trim()
  if (!name) {
    ElMessage.warning('请输入分类名称')
    return
  }

  const data: { parentId: number; name: string; description?: string } = {
    name,
    parentId: form.value.parentId,
  }
  if (form.value.description) {
    data.description = form.value.description
  }

  if (editingRow.value) {
    updateMutation.mutate(
      { id: editingRow.value.id, data },
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
    createMutation.mutate(data, {
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

function handleDelete(row: CategoryVO) {
  ElMessageBox.confirm(
    `确定删除分类「${row.name}」吗？`,
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
    title="分类管理"
    description="维护论坛分类结构。"
  >
    <template #actions>
      <el-button type="primary" @click="openCreateDialog">
        新增分类
      </el-button>
    </template>

    <el-skeleton v-if="isLoading" :rows="8" animated />

    <el-result
      v-else-if="isError"
      icon="error"
      title="加载失败"
      sub-title="无法加载分类列表，请重试"
    >
      <template #extra>
        <el-button type="primary" @click="refetch()">重试</el-button>
      </template>
    </el-result>

    <template v-else-if="flatList.length > 0">
      <el-table
        :data="flatList"
        stripe
        style="width: 100%"
      >
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="name" label="名称" min-width="140" />
        <el-table-column label="父级分类" width="120">
          <template #default="{ row }: { row: CategoryVO }">
            {{ row.parentId === 0 ? '顶级分类' : (categoryNameMap.get(row.parentId) || '未知') }}
          </template>
        </el-table-column>
        <el-table-column
          prop="description"
          label="描述"
          min-width="200"
          show-overflow-tooltip
        />
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }: { row: CategoryVO }">
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
      description="暂无分类"
    />

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="480px"
      class="max-w-[calc(100vw-1.5rem)]"
      :close-on-click-modal="false"
      :aria-label="dialogTitle"
    >
      <el-form label-position="top">
        <el-form-item label="分类名称" required>
          <el-input
            v-model="form.name"
            placeholder="请输入分类名称"
            aria-label="分类名称"
          />
        </el-form-item>
        <el-form-item label="父级分类">
          <el-select
            v-model="form.parentId"
            filterable
            clearable
            placeholder="留空表示顶级分类"
            style="width: 100%"
            aria-label="父级分类"
          >
            <el-option label="顶级分类（无）" :value="0" />
            <el-option
              v-for="cat in parentOptions"
              :key="cat.id"
              :label="cat.name"
              :value="cat.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            :maxlength="200"
            show-word-limit
            placeholder="请输入分类描述"
            aria-label="分类描述"
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