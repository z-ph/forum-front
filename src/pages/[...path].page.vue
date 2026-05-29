<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-transparent px-4">
    <div class="text-center">
      <p class="text-[6rem] font-bold leading-none text-[#162134]">404</p>
      <p class="mt-3 text-[1.5rem] font-semibold text-[#1d2738]">页面未找到</p>
      <p class="mt-2 text-[0.94rem] text-[#70809a]">您访问的页面不存在或已被移除。</p>
      <div class="mt-6">
        <el-button type="primary" @click="router.push({ name: '/(forum)' })">
          返回首页
        </el-button>
      </div>
    </div>
  </div>
</template>
