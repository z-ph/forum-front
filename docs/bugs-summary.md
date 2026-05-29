# Bug 汇总

| # | 严重度 | 模块 | 问题 | 推测原因 |
|---|--------|------|------|---------|
| B1 | **中** | 分类/标签管理 | Dialog 点"取消"或 × 按钮后不关闭，`is-closing` 状态卡住，仅 Escape 可关闭 | Element Plus dialog 的 `close-on-click-modal="false"` 可能与过渡动画冲突 |
| B2 | **低** | 用户管理 | 删除/禁用确认框中用户名显示不完整，显示"22"而非"3322" | `ElMessageBox.confirm` 取的 `username` 值实际为 ID 或截断字段 |
| B3 | **低** | 话题创建 | 新建话题 API 调用成功但列表未实时刷新 | TanStack Query invalidation 时机或 queryKey 不匹配 |
| B4 | **低** | 注册 | 注册成功后在 `localStorage` 设了 token，但 `getCurrentUser` 仍报"无法获取用户信息" | Mock/后端未正确识别刚写入的 token |

## 代码审查问题（2026-05-29）

| # | 状态 | 严重度 | 模块 | 问题 | 修复 |
|---|------|--------|------|------|------|
| R1 | ✅ | **中** | Auth 拦截器 | 401 强制 `window.location.href` 跳转，丢失应用状态 | 已改用 `router.push({ name: '/auth' })` |
| R2 | ✅ | **低** | useForumFeed | `updateQuery` 没传 `route.name` | `router.replace({ query })` 不传 name 会保留当前路由，设计正确 |
| R3 | ✅ | **低** | 子回复分页 | 未复用已有的 `useChildRepliesQuery` hook | 已使用 `useChildRepliesInfiniteQuery`，功能比原计划更完善（支持分页） |
| R4 | ✅ | **低** | ForumHome | `totalTopics` 语义不准，用 `topics.length` 而非服务端 `total` | 4cdaf1e: 在 `ForumHomeData` 中增加显式 `totalTopics` 字段 |
| R5 | ✅ | **低** | auth.page.vue | 第 95 行附近有开发者注释暴露在 UI | a6acfb3: 移除流程覆盖/数据来源区块，开发注释加 `v-if="isDev"` |
| R6 | ✅ | **低** | 路由 | 缺少 404 catch-all 页面 | 已添加 `src/pages/[...path].page.vue`（commit 410b6a3） |
