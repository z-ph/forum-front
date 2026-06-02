<script setup lang="ts">
import { ref, computed } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import AdminPageShell from '../../components/admin/AdminPageShell.vue'
import {
  useAdminCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  flattenCategoryTree,
} from '../../hooks/useAdmin'
import type { CategoryTreeVO } from '../../services/categoryApi'

const dialogVisible = ref(false)
const editingRow = ref<CategoryTreeVO | null>(null)
const form = ref({ name: '', parentId: 0, description: '' })
const newChildName = ref('')
const newChildDescription = ref('')
const formRef = ref<FormInstance>()

const rules: FormRules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
}

/** 是否正在添加子分类（非编辑模式下 parentId 不为 0） */
const isAddingChild = computed(() => editingRow.value === null && form.value.parentId !== 0)

const { data, isLoading, isError, refetch } = useAdminCategoriesQuery()
const createMutation = useCreateCategoryMutation()
const updateMutation = useUpdateCategoryMutation()
const deleteMutation = useDeleteCategoryMutation()

const flatList = computed(() => flattenCategoryTree(data.value ?? []))

const dialogTitle = computed(() => {
  if (editingRow.value) {return '编辑分类'}
  if (isAddingChild.value) {return '添加子分类'}
  return '新增顶级分类'
})

/** 当前编辑分类的子分类 */
const childrenOfEditing = computed(() => {
  if (!editingRow.value || !data.value) { return [] }
  const find = (nodes: CategoryTreeVO[]): CategoryTreeVO[] => {
    for (const node of nodes) {
      if (node.id === editingRow.value?.id) { return node.children || [] }
      if (node.children) {
        const found = find(node.children)
        if (found.length) { return found }
      }
    }
    return []
  }
  return find(data.value)
})

/** 表单可选父级分类（编辑时排除自身及子孙） */
const parentOptions = computed(() => {
  if (!editingRow.value) { return flatList.value }
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

function openCreateDialog() {
  editingRow.value = null
  form.value = { name: '', parentId: 0, description: '' }
  newChildName.value = ''
  newChildDescription.value = ''
  dialogVisible.value = true
}

function openAddChildDialog(parentRow: CategoryTreeVO) {
  editingRow.value = null
  form.value = { name: '', parentId: parentRow.id, description: '' }
  newChildName.value = ''
  newChildDescription.value = ''
  dialogVisible.value = true
}

function openEditDialog(row: CategoryTreeVO) {
  editingRow.value = row
  form.value = {
    name: row.name,
    parentId: row.parentId,
    description: row.description || '',
  }
  newChildName.value = ''
  newChildDescription.value = ''
  dialogVisible.value = true
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) {return}

  const payload: { parentId: number; name: string; description?: string } = {
    name: form.value.name.trim(),
    parentId: form.value.parentId,
  }
  if (form.value.description.trim()) {
    payload.description = form.value.description.trim()
  }

  if (editingRow.value) {
    updateMutation.mutate(
      { id: editingRow.value.id, data: payload },
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
    createMutation.mutate(payload, {
      onSuccess: () => {
        ElMessage.success(isAddingChild.value ? '子分类已添加' : '创建成功')
        dialogVisible.value = false
      },
      onError: (error) => {
        ElMessage.error((error as Error)?.message || '操作失败，请重试')
      },
    })
  }
}

function handleAddChild() {
  const name = newChildName.value.trim()
  if (!name || !editingRow.value) {return}
  const payload: { parentId: number; name: string; description?: string } = {
    name,
    parentId: editingRow.value.id,
  }
  const desc = newChildDescription.value.trim()
  if (desc) {
    payload.description = desc
  }
  createMutation.mutate(payload, {
    onSuccess: () => {
      ElMessage.success('子分类已添加')
      newChildName.value = ''
      newChildDescription.value = ''
    },
    onError: (error) => {
      ElMessage.error((error as Error)?.message || '操作失败')
    },
  })
}

function handleDelete(row: CategoryTreeVO) {
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
        新增顶级分类
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

    <template v-else-if="(data ?? []).length > 0">
      <el-table
        :data="data ?? []"
        row-key="id"
        :tree-props="{ children: 'children' }"
        stripe
        style="width: 100%"
      >
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="name" label="名称" min-width="140" />
        <el-table-column
          prop="description"
          label="描述"
          min-width="200"
          show-overflow-tooltip
        />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }: { row: CategoryTreeVO }">
            <el-button
              text
              type="success"
              size="small"
              @click="openAddChildDialog(row)"
            >
              添加子分类
            </el-button>
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

    <!-- 新增 / 编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      class="max-w-[calc(100vw-1.5rem)]"
      :close-on-click-modal="false"
      :aria-label="dialogTitle"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-form-item label="分类名称" prop="name">
          <el-input
            v-model="form.name"
            placeholder="请输入分类名称"
            aria-label="分类名称"
          />
        </el-form-item>
        <el-form-item v-if="!isAddingChild" label="父级分类">
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

      <!-- 编辑模式下：子分类管理 -->
      <div v-if="editingRow" class="mt-4 border-t pt-4">
        <div class="mb-2 text-sm font-medium text-gray-700">子分类</div>

        <div v-if="childrenOfEditing.length > 0" class="mb-3 space-y-1">
          <div
            v-for="child in childrenOfEditing"
            :key="child.id"
            class="flex items-center justify-between rounded bg-gray-50 px-3 py-2"
          >
            <span class="truncate">{{ child.name }}</span>
            <div class="flex shrink-0 gap-1">
              <el-button
                text
                type="primary"
                size="small"
                @click="openEditDialog(child)"
              >
                编辑
              </el-button>
              <el-button
                text
                type="danger"
                size="small"
                @click="handleDelete(child)"
              >
                删除
              </el-button>
            </div>
          </div>
        </div>
        <p v-else class="mb-3 text-sm text-gray-400">暂无子分类</p>

        <div class="flex flex-col gap-2">
          <div class="flex gap-2">
            <el-input
              v-model="newChildName"
              placeholder="子分类名称"
              size="small"
              @keyup.enter="handleAddChild"
            />
            <el-button
              type="primary"
              size="small"
              :loading="createMutation.isPending.value"
              @click="handleAddChild"
            >
              添加
            </el-button>
          </div>
          <el-input
            v-model="newChildDescription"
            placeholder="子分类描述（可选）"
            size="small"
            :maxlength="200"
            show-word-limit
            @keyup.enter="handleAddChild"
          />
        </div>
      </div>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="createMutation.isPending.value || updateMutation.isPending.value"
          @click="handleSubmit"
        >
          确定
        </el-button>
      </template>
    </el-dialog>
  </AdminPageShell>
</template>
