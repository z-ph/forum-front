<script setup lang="ts">
import { reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import AdminPageShell from '../../components/admin/AdminPageShell.vue'
import {
  useAdminTopicsQuery,
  useToggleTopicStatusMutation,
} from '../../hooks/useAdmin'
import type { AdminTopicQuery } from '../../types/admin'

const filterParams = reactive<
  AdminTopicQuery & { pageNum: number; pageSize: number }
>({
  keyword: undefined,
  status: undefined,
  pageNum: 1,
  pageSize: 10,
})

/** Params sent to backend — keyword is excluded since the API doesn't support it. */
const queryParams = computed<AdminTopicQuery>(() => ({
  status:
    filterParams.status !== undefined && filterParams.status !== null
      ? filterParams.status
      : undefined,
  pageNum: filterParams.pageNum,
  pageSize: filterParams.pageSize,
}))

const { data, isLoading, isError, refetch } = useAdminTopicsQuery(queryParams)
const toggleStatusMutation = useToggleTopicStatusMutation()

/** Locally filter records by keyword (case-insensitive title match). */
const filteredRecords = computed(() => {
  const records = data.value?.records ?? []
  const kw = filterParams.keyword?.trim()
  if (!kw) return records
  return records.filter((r) =>
    r.title.toLowerCase().includes(kw.toLowerCase()),
  )
})

/** Whether a non-empty keyword filter is active — hides pagination when true. */
const hasKeyword = computed(() => !!(filterParams.keyword?.trim()))

function handleToggleStatus(row: { id: number; status: number; title: string }) {
  const isCurrentlyVisible = row.status === 1
  const actionLabel = isCurrentlyVisible ? '隐藏' : '恢复'

  ElMessageBox.confirm(
    `确定${actionLabel}话题「${row.title}」吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    },
  )
    .then(() => {
      toggleStatusMutation.mutate(
        { id: row.id, status: !isCurrentlyVisible },
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
</script>

<template>
  <AdminPageShell
    title="话题管理"
    description="查看话题并执行隐藏或恢复操作。"
  >
    <template #actions>
      <el-input
        v-model="filterParams.keyword"
        placeholder="搜索话题标题"
        clearable
        style="width: 180px"
        aria-label="搜索话题标题"
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
        <el-option label="显示" :value="1" />
        <el-option label="隐藏" :value="0" />
      </el-select>
    </template>

    <el-skeleton v-if="isLoading" :rows="8" animated />

    <el-result
      v-else-if="isError"
      icon="error"
      title="加载失败"
      sub-title="无法加载话题列表，请重试"
    >
      <template #extra>
        <el-button type="primary" @click="refetch()">重试</el-button>
      </template>
    </el-result>

    <template v-else-if="data && data.records.length > 0">
      <el-table
        :data="filteredRecords"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column
          prop="title"
          label="标题"
          min-width="240"
          show-overflow-tooltip
        />
        <el-table-column prop="categoryName" label="分类" width="120" />
        <el-table-column prop="creatorNickname" label="创建者" width="120" />
        <el-table-column prop="replyCount" label="回复" width="70" align="center" />
        <el-table-column label="状态" width="80">
          <template #default="{ row }: { row: { status: number } }">
            <el-tag
              :type="row.status === 1 ? 'success' : 'danger'"
              size="small"
            >
              {{ row.status === 1 ? '显示' : '隐藏' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="90" fixed="right">
          <template #default="{ row }: { row: { id: number; status: number; title: string } }">
            <el-button
              :type="row.status === 1 ? 'warning' : 'primary'"
              size="small"
              :loading="
                toggleStatusMutation.isPending.value &&
                toggleStatusMutation.variables.value?.id === row.id
              "
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 1 ? '隐藏' : '恢复' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!--
        Keyword filter is client-side only (API does not support keyword search).
        Pagination is hidden when keyword is active to avoid showing a misleading
        total count that reflects unfiltered backend data.
      -->
      <div v-if="hasKeyword" class="mt-2 text-sm text-gray-400 text-center">
        当前关键词筛选仅作用于本页 ({{ filteredRecords.length }} 条结果)
      </div>

      <div v-else class="mt-4 flex justify-center">
        <el-pagination
          v-bind="pagination"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </template>

    <el-empty
      v-else
      description="暂无话题"
    />
  </AdminPageShell>
</template>