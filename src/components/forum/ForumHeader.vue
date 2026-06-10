<script setup lang="ts">
import { computed } from 'vue'
import { MoreFilled } from '@element-plus/icons-vue'
import type { ForumUser } from '../../types/forum'
import Logo from '../Logo.vue'

const props = defineProps<{
  me: ForumUser | null
  isAdmin?: boolean
}>()

const emit = defineEmits<{
  compose: []
  logout: []
  auth: []
  admin: []
}>()

type HeaderMenuCommand = 'compose' | 'logout' | 'auth' | 'admin'

const initials = computed(() => props.me?.name.trim().slice(0, 1) || '访')

const avatarLabel = computed(() => {
  if (!props.me) { return '登录或注册' }
  return `${props.me.name} · @${props.me.handle}`
})

function handleMoreCommand(command: HeaderMenuCommand) {
  if (command === 'compose') {
    emit('compose')
    return
  }

  if (command === 'admin') {
    emit('admin')
    return
  }

  if (command === 'logout') {
    emit('logout')
    return
  }

  emit('auth')
}

function handleAvatarClick() {
  if (!props.me) {
    emit('auth')
  }
}
</script>

<template>
  <header class="flex justify-between items-center gap-5 border-b [border-color:var(--forum-border)] px-4 py-3">
    <Logo />
    <div class="flex items-center justify-end gap-2.5 max-[920px]:w-full max-[920px]:justify-start">

      <el-dropdown trigger="click" @command="handleMoreCommand">
        <button
          type="button"
          class="flex h-9 w-9 items-center justify-center rounded-full border text-forum-meta transition-colors [background:color-mix(in_srgb,var(--forum-surface-muted)_68%,white)] [border-color:var(--forum-border)] hover:[background:color-mix(in_srgb,var(--forum-surface-muted)_88%,white)]"
          aria-label="更多操作"
        >
          <el-icon :size="18">
            <MoreFilled />
          </el-icon>
        </button>

        <template #dropdown>
          <el-dropdown-menu>
            <template v-if="me">
              <el-dropdown-item command="compose">发布主题</el-dropdown-item>
              <el-dropdown-item v-if="isAdmin" command="admin">管理后台</el-dropdown-item>
              <el-dropdown-item command="logout">退出登录</el-dropdown-item>
            </template>
            <template v-else>
              <el-dropdown-item command="auth">登录 / 注册</el-dropdown-item>
            </template>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <el-tooltip :content="avatarLabel" placement="bottom">
        <button
          type="button"
          class="flex h-9 w-9 items-center justify-center rounded-full"
          :class="me ? 'cursor-default' : 'cursor-pointer'"
          :aria-label="avatarLabel"
          @click="handleAvatarClick"
        >
          <el-avatar
            :size="36"
            :alt="me?.name ?? '访客'"
            class="font-semibold text-white shadow-[0_10px_24px_rgba(30,97,214,0.18)] [background:linear-gradient(135deg,#1e61d6,#4a86ef)]"
          >
            {{ initials }}
          </el-avatar>
        </button>
      </el-tooltip>
    </div>
  </header>
</template>
