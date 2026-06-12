import { createWebHistory,createRouter } from "vue-router";
import { routes } from "vue-router/auto-routes";

const router = createRouter({
    history: createWebHistory(),
    routes,
})
router.afterEach((to) => {
  const titleMap: Record<string, string> = {
    '/(forum)': '首页',
    '/topics/[id]': '话题详情',
    '/auth': '登录 / 注册',
    '/admin': '管理后台',
  }
  const subtitle = titleMap[to.name as string] ?? ''
  document.title = subtitle ? `${subtitle} - 机器人DIY论坛` : '机器人DIY论坛'
})
export default router
