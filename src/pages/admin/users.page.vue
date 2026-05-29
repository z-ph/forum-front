<script setup lang="ts">
import { reactive, computed } from 'vue'
import AdminPageShell from '../../components/admin/AdminPageShell.vue'
import {
  useAdminUsersQuery,
  useToggleUserStatusMutation,
} from '../../hooks/useAdmin'
import type { AdminUserQuery } from '../../types/admin'
import type { UserVO } from '../../services/userApi'

const filterParams = reactive<
  AdminUserQuery & { pageNum: number; pageSize: number }
>({
  username: undefined,
  email: undefined,
  status: undefined,
  pageNum: 1,
  pageSize: 10,
})

const queryParams = computed<AdminUserQuery>(() => ({
  username: filterParams.username || undefined,
  email: filterParams.email || undefined,
  status: filterParams.status !== undefined && filterParams.status !== null
    ? filterParams.status
    : undefined,
  pageNum: filterParams.pageNum,
  pageSize: filterParams.pageSize,
}))

const { data, isLoading, isError, refetch } = useAdminUsersQuery(queryParams)
const toggleStatusMutation = useToggleUserStatusMutation()

function handleToggleStatus(row: UserVO) {
  const isCurrentlyEnabled = row.status === 1
  const actionLabel = isCurrentlyEnabled ? '禁用' : '启用'

  ElMessageBox.confirm(
    `确定${actionLabel}用户「${row.username}」吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    },
  )
    .then(() => {
      toggleStatusMutation.mutate(
        { id: row.id, status: !isCurrentlyEnabled },
        {
          onSuccess: () => {
            ElMessage.success(`${actionLabel}成功`)
          },
        },
      )
    })
    .catch(() => {
      /* cancelled */
    })
}

function handleSearch() {
  filterParams.pageNum = 1
}

function handlePageChange(page: number) {
  filterParams.pageNum = page
}

function handleSizeChange(size: number) {
  filterParams.pageSize = size
  filterParams.pageNum = 1
}

const pagination = computed(() => ({
  currentPage: filterParams.pageNum,
  pageSize: filterParams.pageSize,
  total: data.value?.total ?? 0,
  layout: 'total, sizes, prev, pager, next, jumper' as const,
  pageSizes: [10, 20, 50, 100] as number[],
}))

function formatRole(role: UserVO['role']): string {
  return role === 'ADMIN' ? '管理员' : '用户'
}
</script>

<template>
  <AdminPageShell
    title="用户管理"
    description="查看用户并启用或禁用账号。"
  >
    <template #actions>
      <el-input
        v-model="filterParams.username"
        placeholder="用户名"
        clearable
        style="width: 140px"
        aria-label="搜索用户名"
        @keyup.enter="handleSearch"
        @clear="handleSearch"
      />
      <el-input
        v-model="filterParams.email"
        placeholder="邮箱"
        clearable
        style="width: 180px"
        aria-label="搜索邮箱"
        @keyup.enter="handleSearch"
        @clear="handleSearch"
      />
      <el-select
        v-model="filterParams.status"
        placeholder="状态"
        clearable
        style="width: 100px"
        aria-label="按状态筛选"
        @change="handleSearch"
      >
        <el-option label="启用" :value="1" />
        <el-option label="禁用" :value="0" />
      </el-select>
    </template>

    <el-skeleton v-if="isLoading" :rows="8" animated />

    <el-result
      v-else-if="isError"
      icon="error"
      title="加载失败"
      sub-title="无法加载用户列表，请重试"
    >
      <template #extra>
        <el-button type="primary" @click="refetch()">重试</el-button>
      </template>
    </el-result>

    <template v-else-if="data && data.records.length > 0">
      <el-table
        :data="data.records"
        stripe
        style="width: 100%"
      >
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column label="用户" min-width="160">
          <template #default="{ row }: { row: UserVO }">
            <div class="flex items-center gap-2">
              <el-avatar :size="28" :src="row.avatar" />
              <div class="min-w-0 leading-tight">
                <div class="truncate font-medium [color:var(--forum-text)]">
                  {{ row.nickname || row.username }}
                </div>
                <div
                  v-if="row.nickname"
                  class="truncate text-xs [color:var(--forum-text-soft)]"
                >
                  {{ row.username }}
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column label="角色" width="100">
          <template #default="{ row }: { row: UserVO }">
            <el-tag
              :type="row.role === 'ADMIN' ? 'danger' : 'info'"
              size="small"
            >
              {{ formatRole(row.role) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template #default="{ row }: { row: UserVO }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="90" fixed="right">
          <template #default="{ row }: { row: UserVO }">
            <el-button
              :type="row.status === 1 ? 'danger' : 'primary'"
              size="small"
              :loading="
                toggleStatusMutation.isPending.value &&
                toggleStatusMutation.variables.value?.id === row.id
              "
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 1 ? '禁用' : '启用' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="mt-4 flex justify-center">
        <el-pagination
          v-bind="pagination"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </template>

    <el-empty
      v-else
      description="暂无用户"
    />
  </AdminPageShell>
</template>