<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useRouter } from 'vue-router'
import Logo from '../components/Logo.vue'
import { useLoginMutation, useRegisterMutation } from '../hooks/useForum'

const router = useRouter()
const mode = ref<'login' | 'register'>('login')
const loginMutation = useLoginMutation()
const registerMutation = useRegisterMutation()
const isAuthPending = computed(() => loginMutation.isPending.value || registerMutation.isPending.value)
const formRef = ref<FormInstance>()

const form = reactive({
  nickname: '',
  email: '',
  username: '',
  password: '',
})

const loginRules: FormRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少 6 个字符', trigger: 'blur' },
  ],
}

const registerRules: FormRules = {
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '昵称 2-20 个字符', trigger: 'blur' },
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' },
  ],
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名 2-20 个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少 6 个字符', trigger: 'blur' },
  ],
}

const currentRules = computed(() => mode.value === 'login' ? loginRules : registerRules)

watch(mode, () => {
  form.nickname = ''
  form.email = ''
  form.username = ''
  form.password = ''
  nextTick(() => {
    formRef.value?.clearValidate()
  })
})

const heading = computed(() => (mode.value === 'login' ? '登录' : '注册'))
const greeting = computed(() =>
  mode.value === 'login'
    ? '登录你的账号，继续参与社区讨论。'
    : '创建账号，加入机器人 DIY 社区。',
)

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) { return }

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
  <div class="auth-page">
    <div class="auth-panel">
      <header class="auth-header">
        <div class="auth-brand">
          <Logo />
        </div>
        <button type="button" class="auth-back" @click="router.push({ name: '/(forum)' })">
          返回论坛
        </button>
      </header>

      <div class="auth-body">
        <div class="auth-form-wrapper">
          <div class="auth-heading-section">
            <h1 class="auth-title">{{ heading }}</h1>
            <p class="auth-greeting">{{ greeting }}</p>
          </div>

          <el-segmented
            v-model="mode"
            size="large"
            :options="[
              { label: '登录', value: 'login' },
              { label: '注册', value: 'register' },
            ]"
            class="auth-segmented"
          />

          <el-form
            ref="formRef"
            :model="form"
            :rules="currentRules"
            label-position="top"
            class="auth-form"
            @submit.prevent="handleSubmit"
          >
            <el-form-item v-if="mode === 'register'" label="昵称" prop="nickname">
              <el-input v-model="form.nickname" placeholder="你希望别人怎么称呼你" />
            </el-form-item>

            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" type="email" placeholder="name@example.com" />
            </el-form-item>

            <el-form-item v-if="mode === 'register'" label="用户名" prop="username">
              <el-input v-model="form.username" placeholder="字母、数字和下划线" />
            </el-form-item>

            <el-form-item label="密码" prop="password">
              <el-input v-model="form.password" type="password" show-password placeholder="至少 6 个字符" />
            </el-form-item>

            <el-form-item class="auth-submit-item">
              <el-button
                type="primary"
                :loading="isAuthPending"
                class="auth-submit-btn"
                @click="handleSubmit"
              >
                {{ mode === 'login' ? '登录' : '注册并进入论坛' }}
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  background: var(--forum-bg);
}

.auth-panel {
  width: 100%;
  max-width: 420px;
  background: var(--forum-surface);
  border: 1px solid var(--forum-border);
}

.auth-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid var(--forum-border);
}

.auth-brand {
  font-size: 0.95rem;
}

.auth-back {
  appearance: none;
  border: none;
  background: none;
  color: var(--forum-meta);
  font-size: 0.85rem;
  cursor: pointer;
  padding: 4px 0;
  transition: color 0.15s;
}

.auth-back:hover {
  color: var(--forum-text);
}

.auth-body {
  padding: 32px 24px 36px;
}

.auth-form-wrapper {
  width: 100%;
}

.auth-heading-section {
  margin-bottom: 24px;
}

.auth-title {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.25;
  color: var(--forum-heading);
  margin: 0 0 8px;
}

.auth-greeting {
  font-size: 0.9rem;
  line-height: 1.55;
  color: var(--forum-meta);
  margin: 0;
}

.auth-segmented {
  width: 100%;
  margin-bottom: 24px;
}

.auth-form {
  width: 100%;
}

.auth-submit-item {
  margin-top: 28px;
  margin-bottom: 0;
}

.auth-submit-item :deep(.el-form-item__content) {
  width: 100%;
}

.auth-submit-btn {
  width: 100%;
  height: 40px;
  font-size: 0.95rem;
}

@media (max-width: 480px) {
  .auth-body {
    padding: 24px 20px 28px;
  }

  .auth-title {
    font-size: 1.3rem;
  }
}
</style>
