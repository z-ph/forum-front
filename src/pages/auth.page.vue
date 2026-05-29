<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { useLoginMutation, useRegisterMutation } from '../hooks/useForum'

const router = useRouter()
const mode = ref<'login' | 'register'>('login')
const loginMutation = useLoginMutation()
const registerMutation = useRegisterMutation()
const isAuthPending = computed(() => loginMutation.isPending.value || registerMutation.isPending.value)

const form = reactive({
  nickname: '',
  email: '',
  username: '',
  password: '',
})

const title = computed(() => (mode.value === 'login' ? '登录论坛' : '注册账号'))
const subtitle = computed(() =>
  mode.value === 'login'
    ? '继续参与讨论、收藏主题并跟踪回复。'
    : '先创建一个账号，再进入完整的论坛使用流程。',
)

async function handleSubmit() {
  if (!form.email || !form.password || (mode.value === 'register' && (!form.username || !form.nickname))) {
    ElMessage.warning('请先补全表单')
    return
  }

  try {
    if (mode.value === 'login') {
      await loginMutation.mutateAsync({
        email: form.email,
        password: form.password,
      })
      ElMessage.success('登录成功')
    } else {
      await registerMutation.mutateAsync({
        nickname: form.nickname,
        email: form.email,
        username: form.username,
        password: form.password,
      })
      ElMessage.success('注册成功，已自动登录')
    }

    void router.push({ name: '/(forum)' })
  } catch (error) {
    ElMessage.error((error as Error).message || '提交失败，请稍后重试')
  }
}
</script>

<template>
  <div class="min-h-screen bg-transparent px-4 pb-10">
    <div
      class="mx-auto grid w-full max-w-[1040px] grid-cols-1 bg-[var(--forum-surface)] md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] md:border-x md:border-[var(--forum-border)]"
    >
      <header
        class="col-span-full flex items-center justify-between gap-4 border-b border-[var(--forum-border)] px-5 py-6 md:px-8"
      >
        <div>
          <strong class="block text-[1.2rem] text-[#182437]">社区论坛</strong>
          <span class="mt-1 block text-[0.82rem] text-[#74839a]">账号入口</span>
        </div>
        <el-button text @click="router.push({ name: '/(forum)' })">返回论坛</el-button>
      </header>

      <section
        class="border-b border-[var(--forum-border)] bg-[var(--forum-surface-muted)] px-5 py-6 md:border-r md:border-b-0 md:border-[var(--forum-border)] md:px-8 md:py-7"
      >
        <h1 class="m-0 mb-3.5 text-[clamp(1.9rem,2.8vw,2.8rem)] leading-[1.16] text-[#162134]">
          登录后继续浏览、发帖和回复。
        </h1>
        <p class="m-0 leading-[1.8] text-[#60718b]">
          账号页保持和论坛首页一致的扁平结构，不额外做展示型包装，重点仍然是尽快进入核心讨论流程。
        </p>

        <dl class="mt-6 border-y border-[var(--forum-border)]">
          <div class="border-t-0 py-3.5 first:border-t-0 [&+div]:border-t [&+div]:border-[var(--forum-border)]">
            <dt class="text-[0.78rem] text-[#75839a]">当前模式</dt>
            <dd class="mt-1 text-[0.94rem] text-[#1d2738]">
              {{ mode === 'login' ? '登录已有账号' : '创建新账号' }}
            </dd>
          </div>
          <div class="py-3.5 [&+div]:border-t [&+div]:border-[var(--forum-border)]">
            <dt class="text-[0.78rem] text-[#75839a]">流程覆盖</dt>
            <dd class="mt-1 text-[0.94rem] text-[#1d2738]">注册、登录、发帖、跟帖</dd>
          </div>
          <div class="py-3.5">
            <dt class="text-[0.78rem] text-[#75839a]">数据来源</dt>
            <dd class="mt-1 text-[0.94rem] text-[#1d2738]">Mock 数据</dd>
          </div>
        </dl>
      </section>

      <section class="flex flex-col px-5 py-6 md:px-8 md:py-7">
        <div>
          <el-segmented
            v-model="mode"
            :options="[
              { label: '登录', value: 'login' },
              { label: '注册', value: 'register' },
            ]"
          />
        </div>

        <div class="my-5 mb-3">
          <h2 class="m-0 mb-2 text-[1.7rem] text-[#1a2435]">{{ title }}</h2>
          <p class="m-0 leading-[1.7] text-[#70809a]">{{ subtitle }}</p>
        </div>

        <el-form label-position="top" @submit.prevent="handleSubmit">
          <el-form-item v-if="mode === 'register'" label="昵称">
            <el-input v-model="form.nickname" placeholder="例如：周可" />
          </el-form-item>

          <el-form-item label="邮箱">
            <el-input v-model="form.email" type="email" placeholder="例如：zhouke@example.com" />
          </el-form-item>

          <el-form-item v-if="mode === 'register'" label="用户名">
            <el-input v-model="form.username" placeholder="例如：zhouke" />
          </el-form-item>

          <el-form-item label="密码">
            <el-input v-model="form.password" type="password" show-password placeholder="请输入密码" />
          </el-form-item>

          <div class="mt-2.5 flex flex-col items-stretch justify-between gap-2.5 sm:flex-row sm:items-center">
<el-button text @click="router.push({ name: '/(forum)' })">返回论坛</el-button>
            <el-button
              type="primary"
              :loading="isAuthPending"
              @click="handleSubmit"
            >
              {{ mode === 'login' ? '登录' : '注册并进入论坛' }}
            </el-button>
          </div>
        </el-form>
      </section>
    </div>
  </div>
</template>
