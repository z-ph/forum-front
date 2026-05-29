# Bug 汇总

| # | 状态 | 严重度 | 模块 | 问题 | 推测原因 |
|---|------|--------|------|------|---------|
| B1 | ❌ 未修复 | **中** | 分类/标签管理 | 在管理后台 → 分类管理（或标签管理）页面，点击"新增分类"按钮会弹出一个表单弹窗。此时如果点击弹窗底部的"取消"按钮或右上角的 × 关闭按钮，弹窗内容消失了，但**页面被一层半透明灰色遮罩挡住**，什么都点不了。必须按键盘 `Escape` 键才能恢复正常。 |
| B2 | ✅ 已修复 | **低** | 用户管理 | 删除/禁用确认框中用户名显示不完整，显示"22"而非"3322" | 数据源问题，当前已显示正确用户名 |
| B3 | ⚠️ 待重测 | **低** | 话题创建 | 新建话题 API 调用成功但列表未实时刷新 | 代码层已有 `invalidateQueries`，需后端联调确认 |
| B4 | ✅ 已修复 | **低** | 注册 | 注册成功后在 `localStorage` 设了 token，但 `getCurrentUser` 仍报"无法获取用户信息" | 登录判断从 `code === 200` 改为 `isApiSuccess(body)` |

## 代码审查问题（2026-05-29）

| # | 状态 | 严重度 | 模块 | 问题 | 修复 |
|---|------|--------|------|------|------|
| R1 | ✅ | **中** | Auth 拦截器 | 401 强制 `window.location.href` 跳转，丢失应用状态 | 已改用 `router.push({ name: '/auth' })` |
| R2 | ✅ | **低** | useForumFeed | `updateQuery` 没传 `route.name` | `router.replace({ query })` 不传 name 会保留当前路由，设计正确 |
| R3 | ✅ | **低** | 子回复分页 | 未复用已有的 `useChildRepliesQuery` hook | 已使用 `useChildRepliesInfiniteQuery`，功能比原计划更完善（支持分页） |
| R4 | ✅ | **低** | ForumHome | `totalTopics` 语义不准，用 `topics.length` 而非服务端 `total` | 4cdaf1e: 在 `ForumHomeData` 中增加显式 `totalTopics` 字段 |
| R5 | ✅ | **低** | auth.page.vue | 第 95 行附近有开发者注释暴露在 UI | a6acfb3: 移除流程覆盖/数据来源区块，开发注释加 `v-if="isDev"` |
| R6 | ✅ | **低** | 路由 | 缺少 404 catch-all 页面 | 已添加 `src/pages/[...path].page.vue`（commit 410b6a3） |

## 代码审查问题（2026-05-29 #2）

| # | 状态 | 严重度 | 模块 | 问题 | 修复 |
|---|------|--------|------|------|------|
| R7 | ⬜ | **低** | schemas.ts | `apiResponseSchema` / `pageSchema` 泛型工具未使用，死代码 | 可选：若近期无接入计划可删除 |
| R8 | ✅ | **低** | schemas.ts | `CategoryTreeVOSchema` 手动字段级类型注解冗余 | 8153dc6: 替换为 `z.ZodType<unknown>` |
| R9 | ✅ | **低** | main.ts | `sendBeacon` 上报 URL 硬编码 `/api/monitor/validation-error`，不可配置且无文档 | b1182b0: 改为 `VITE_MONITOR_VALIDATION_URL` 环境变量，记录到 `.env.example` |
| R10 | ⬜ | **低** | schemas.ts | `failureCounts` Map 只增不减，长时间 SPA 会累积 | 低优先级：schema 数量有天然上限，当前 schema label 均为固定字符串 |
| R11 | ✅ | **低** | 路由 | 缺少 404 catch-all 页面（延续前两次） | 已确认存在 `src/pages/[...path].page.vue` |
