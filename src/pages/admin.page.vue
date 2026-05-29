<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useAdminAuth } from '../hooks/useAdmin'
import AdminAccessDenied from '../components/admin/AdminAccessDenied.vue'
import AdminPageShell from '../components/admin/AdminPageShell.vue'
import { downloadValidationData, getValidationStats } from '../core/schemas'

const { isLoading, isError, isAdmin, refetch } = useAdminAuth()

const hasFailures = ref(false)
let checkTimer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  const stats = getValidationStats()
  hasFailures.value = Object.keys(stats).length > 0
  checkTimer = setInterval(() => {
    const s = getValidationStats()
    hasFailures.value = Object.keys(s).length > 0
  }, 10_000)
})
onUnmounted(() => clearInterval(checkTimer))

function handleDownload() {
  downloadValidationData()
  ElMessage.success('校验数据已下载')
}
</script>

<script lang="ts">
const navItems = [
  { path: '/admin/users', label: '用户' },
  { path: '/admin/topics', label: '话题' },
  { path: '/admin/categories', label: '分类' },
  { path: '/admin/tags', label: '标签' },
]
</script>

<template>
  <div class="min-h-screen bg-transparent pb-6">
    <el-skeleton v-if="isLoading" :rows="6" animated />

    <el-result
      v-else-if="isError"
      icon="error"
      title="加载失败"
      sub-title="无法验证身份，请检查网络后重试"
    >
      <template #extra>
        <el-button type="primary" @click="refetch()">重试</el-button>
      </template>
    </el-result>

    <AdminAccessDenied v-else-if="!isAdmin" />

    <template v-else>
      <div
        class="mx-auto w-full border border-t-0 [background:var(--forum-surface)] [border-color:var(--forum-border)]"
      >
        <AdminPageShell
          title="管理后台"
          description="论坛内容管理与维护"
        >
          <template #actions>
            <nav class="flex items-center gap-1" aria-label="管理后台导航">
              <RouterLink
                v-for="item in navItems"
                :key="item.path"
                :to="{ path: item.path }"
                class="inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium [color:var(--forum-text-soft)] transition-colors hover:[background:var(--forum-surface-muted)] hover:[color:var(--forum-text)]"
                active-class="![background:var(--forum-surface-muted)] ![color:var(--forum-text)]"
              >
                {{ item.label }}
              </RouterLink>
            </nav>
            <el-button
              v-if="hasFailures"
              size="small"
              class="ml-2"
              @click="handleDownload"
            >
              导出校验数据
            </el-button>
          </template>

          <RouterView />
        </AdminPageShell>
      </div>
    </template>
  </div>
</template>