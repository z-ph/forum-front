<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  User, ChatDotRound, Folder, PriceTag, Back,
} from '@element-plus/icons-vue'
import { useAdminAuth } from '../hooks/useAdmin'
import AdminAccessDenied from '../components/admin/AdminAccessDenied.vue'
import { downloadValidationData, getValidationStats, getValidationToastEnabled, setValidationToastEnabled } from '../core/schemas'

const route = useRoute()
const { isLoading, isError, isAdmin, refetch } = useAdminAuth()

const hasFailures = ref(false)
const failureCount = ref(0)
const toastEnabled = ref(getValidationToastEnabled())
let checkTimer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  const stats = getValidationStats()
  failureCount.value = Object.values(stats).reduce((a, b) => a + b, 0)
  hasFailures.value = failureCount.value > 0
  checkTimer = setInterval(() => {
    const s = getValidationStats()
    failureCount.value = Object.values(s).reduce((a, b) => a + b, 0)
    hasFailures.value = failureCount.value > 0
    toastEnabled.value = getValidationToastEnabled()
  }, 10_000)
})
onUnmounted(() => clearInterval(checkTimer))

function handleDownload() {
  downloadValidationData()
  ElMessage.success('校验数据已下载')
}

function toggleToast() {
  toastEnabled.value = !toastEnabled.value
  setValidationToastEnabled(toastEnabled.value)
}

const menuItems = [
  { path: '/admin/users', label: '用户管理', icon: User },
  { path: '/admin/topics', label: '话题管理', icon: ChatDotRound },
  { path: '/admin/categories', label: '分类管理', icon: Folder },
  { path: '/admin/tags', label: '标签管理', icon: PriceTag },
]

const activeMenu = computed(() => route.path)
definePage({
  redirect: { name: '/admin/users' }
})
</script>

<template>
  <div class="min-h-screen bg-transparent">
    <el-skeleton v-if="isLoading" :rows="6" animated />

    <el-result v-else-if="isError" icon="error" title="加载失败" sub-title="无法验证身份，请检查网络后重试">
      <template #extra>
        <el-button type="primary" @click="refetch()">重试</el-button>
      </template>
    </el-result>

    <AdminAccessDenied v-else-if="!isAdmin" />

    <template v-else>
      <div class="flex min-h-screen">
        <!-- Sidebar -->
        <aside
          class="sticky top-0 flex h-screen w-[220px] shrink-0 flex-col border-r [background:var(--forum-surface)] [border-color:var(--forum-border)]">
          <!-- Logo / Title -->
          <div class="border-b px-5 py-5 [border-color:var(--forum-border)]">
            <RouterLink :to="{ name: '/(forum)' }"
              class="block text-base font-bold no-underline [color:var(--forum-text)] hover:opacity-80">
              机器人DIY论坛
            </RouterLink>
            <p class="m-0 mt-1 text-[0.78rem] [color:var(--forum-text-soft)]">
              管理后台
            </p>
          </div>

          <!-- Navigation Menu -->
          <el-menu :default-active="activeMenu" router class="flex-1 !border-r-0">
            <el-menu-item v-for="item in menuItems" :key="item.path" :index="item.path">
              <el-icon>
                <component :is="item.icon" />
              </el-icon>
              <span>{{ item.label }}</span>
            </el-menu-item>
          </el-menu>

          <!-- Sidebar Footer -->
          <div class="border-t px-4 py-3 [border-color:var(--forum-border)]">
            <el-space direction="vertical" :size="6" fill alignment="center" class="mb-2 w-full">
              <el-button size="small" :type="toastEnabled ? 'warning' : 'info'" class="w-full" @click="toggleToast">
                {{ toastEnabled ? '告警弹窗：开' : '告警弹窗：关' }}
              </el-button>
              <el-button size="small" :disabled="!hasFailures" :type="hasFailures ? 'danger' : 'info'" class="w-full"
                @click="handleDownload">
                导出校验{{ failureCount ? ` (${failureCount})` : '' }}
              </el-button>
            </el-space>
            <RouterLink :to="{ path: '/' }"
              class="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[0.84rem] no-underline transition-colors [color:var(--forum-text-soft)] hover:[background:var(--forum-surface-muted)] hover:[color:var(--forum-text)]">
              <el-icon :size="14">
                <Back />
              </el-icon>
              返回论坛
            </RouterLink>
          </div>
        </aside>

        <!-- Main Content -->
        <main class="min-w-0 flex-1 p-6">
          <RouterView />
        </main>
      </div>
    </template>
  </div>
</template>
