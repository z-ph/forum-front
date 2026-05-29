<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goHome() {
  void router.push({ name: '/(forum)/latest' })
}
</script>

<template>
  <div class="flex items-center justify-center py-20">
    <el-result
      icon="warning"
      title="无权限访问"
      sub-title="当前账号没有管理后台权限。"
    >
      <template #extra>
        <el-button type="primary" @click="goHome">
          返回论坛首页
        </el-button>
      </template>
    </el-result>
  </div>
</template>