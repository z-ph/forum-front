# 任务四：Hooks 层适配 — `src/hooks/useForum.ts`

## 说明
当前 hooks 从 `forumMock` 导入，改为从 `forumService` 导入真实 API 函数。同时新增一些 hooks 覆盖之前 mock 中没有的 API。

## 需要变更的 hooks

| 当前 hook | 变更内容 |
|-----------|---------|
| `useForumHomeQuery` | 改为 `getAllCategoriesTreeApi` + `pageTopicsApi` 组合查询，不再依赖单一的 `getForumHome` |
| `useTopicDetailQuery` | 改为调用 `getTopicDetailApi`，并分页加载顶层回复 |
| `useLoginMutation` | 改为调用 `loginApi`，成功后 `localStorage.setItem('token', data)`，再调 `getCurrentUserApi` 获取用户信息 |
| `useRegisterMutation` | 改为调用 `registerApi`，成功后 `localStorage.setItem('token', data)` |
| `useLogoutMutation` | 改为清除 `localStorage.removeItem('token')` 和 `removeItem('user')` |
| `useCreateTopicMutation` | 改为调用 `createTopicApi`，参数适配后端类型 |
| `useCreateReplyMutation` | 改为调用 `createReplyApi`，适配 `parentReplyId` 参数（新增支持回复回复） |

## 新增 hooks

| hook 名 | 说明 |
|---------|------|
| `useTopicPageQuery` | 分页查询主题帖，支持 `parentId`、`categoryId`、`tagId` 筛选参数 |
| `useTopRepliesQuery` | 分页加载主题帖的顶层回复 |
| `useChildRepliesQuery` | 分页加载某回复的子回复 |
| `useCurrentUserQuery` | 获取当前用户信息（从 localStorage 取 token 后自动请求） |
| `useMyTopicsQuery` | 分页查询当前用户的主题帖 |
| `useMyRepliesQuery` | 分页查询当前用户的回复 |
| `useAllCategoriesQuery` | 获取全部分类树 |
| `useAllTagsQuery` | 获取全部标签 |

## 检查点

- [ ] `useLoginMutation` 成功后：token 存入 localStorage，用户信息存入 localStorage 或 query cache
- [ ] `useCurrentUserQuery` 在有 token 时自动启用，无 token 时 disabled
- [ ] 所有 mutation 的 `onSuccess` 中 invalidate 相关 queryKey，保证数据刷新
- [ ] 新建 topic 后 invalidate 首页列表 + 分类列表
- [ ] 新建 reply 后 invalidate 对应 topic 详情 + 回复列表
- [ ] 数据转换：hooks 中调 API 后，通过转换函数将 VO 转为 UI 类型，保持组件层不变
- [ ] 错误处理：API 返回 code !== 0 时，mutation 的 onError 中展示 msg 内容
- [ ] 分页 hooks 返回 `{ data, total, pageNum, pageSize, isLoading, isError }`，与组件模板兼容
- [ ] 清理 `useForumHomeQuery` 中对 mock 独有字段（`pinned`, `solved`, `likes`）的依赖