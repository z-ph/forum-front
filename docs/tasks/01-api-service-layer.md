# 任务一：API 服务层 — 创建 `src/services/forumApi.ts`

## 说明
基于 openapi.json，将每个接口封装为独立的 async 函数，使用 `apiClient`（已配置 axios 实例，含 Bearer token 拦截器）。

## 接口清单

### 用户模块

| 函数名 | 方法 | 路径 | 说明 |
|--------|------|------|------|
| `loginApi` | POST | `/user/login` | 登录，请求体 `{ email, password }`，返回 `data` 为 token 字符串 |
| `registerApi` | POST | `/user/register` | 注册，请求体 `{ username, email, password }`，返回 `data` 为 token 字符串 |
| `getCurrentUserApi` | GET | `/user/me` | 获取当前用户信息，返回 `data` 为 UserVO |
| `updateUserApi` | PUT | `/user/update` | 修改用户信息，query: `id, nickname?, email?`，form-data: `avatar?` |
| `updateUserStatusApi` | PUT | `/user/{id}/status` | 修改用户状态，path: `id`，query: `status` (true/false) |
| `pageUsersApi` | POST | `/user/page` | 管理员分页查用户，请求体 `UserPageQueryDTO` |

### 分类模块

| 函数名 | 方法 | 路径 | 说明 |
|--------|------|------|------|
| `createCategoryApi` | POST | `/category` | 新增分类，请求体 `{ parentId, name, description? }` |
| `updateCategoryApi` | PUT | `/category/{id}` | 编辑分类，path: `id`，请求体 `CategoryDTO` |
| `deleteCategoryApi` | DELETE | `/category/{id}` | 删除分类，path: `id` |
| `getParentCategoriesApi` | GET | `/category/parents` | 查询所有父分类，返回树形结构 |
| `getChildCategoriesApi` | GET | `/category/children/{parentId}` | 通过父分类 ID 查子分类 |
| `searchCategoryApi` | GET | `/category/search?name=` | 按名称模糊搜索分类 |
| `getAllCategoriesTreeApi` | GET | `/category/selectAll` | 查询所有分类树 |

### 标签模块

| 函数名 | 方法 | 路径 | 说明 |
|--------|------|------|------|
| `createTagApi` | POST | `/tag` | 新增标签，请求体 `{ name }` |
| `updateTagApi` | PUT | `/tag/{id}` | 修改标签，path: `id`，请求体 `{ name }` |
| `deleteTagApi` | DELETE | `/tag/{id}` | 删除标签，path: `id` |
| `getAllTagsApi` | GET | `/tag/selectAll` | 查询所有标签 |
| `searchTagApi` | GET | `/tag/search?name=` | 按名称模糊搜索标签 |

### 主题帖模块

| 函数名 | 方法 | 路径 | 说明 |
|--------|------|------|------|
| `createTopicApi` | POST | `/topic` | 新增主题帖，请求体 `{ categoryId, title, content, tagIds? }` |
| `deleteTopicApi` | DELETE | `/topic/{id}` | 删除主题帖，path: `id` |
| `updateTopicApi` | PUT | `/topic/{id}` | 修改主题帖，path: `id`，请求体 `TopicDTO` |
| `getAllTopicsApi` | GET | `/topic/selectAll` | 查询所有主题帖 |
| `pageTopicsApi` | POST | `/topic/page` | 分页查询，请求体 `TopicQueryDTO` |
| `getTopicDetailApi` | GET | `/topic/detail/{id}` | 查询主题帖详情 |
| `updateTopicStatusApi` | PUT | `/topic/{id}/status` | 修改主题帖状态，query: `status` (true/false) |
| `getMyTopicsApi` | GET | `/topic/my?pageNum=&pageSize=` | 查询当前用户主题帖 |

### 回复模块

| 函数名 | 方法 | 路径 | 说明 |
|--------|------|------|------|
| `createReplyApi` | POST | `/reply` | 新增回复，请求体 `{ topicId, parentReplyId?, content }` |
| `deleteReplyApi` | DELETE | `/reply/{id}` | 删除回复，path: `id` |
| `pageTopRepliesApi` | POST | `/reply/top/page` | 分页查询顶层回复，请求体 `ReplyTopQueryDTO` |
| `pageChildRepliesApi` | POST | `/reply/child/page` | 分页查询子回复，请求体 `ReplyChildQueryDTO` |
| `getMyRepliesApi` | GET | `/reply/my?pageNum=&pageSize=` | 查询当前用户回复 |

## 检查点

- [ ] 每个函数正确处理响应中的 `{ code, msg, data }` 封装：code !== 0 时 throw Error(msg)
- [ ] 全部函数挂载到 `apiClient`（自动携带 Bearer token），无需手动处理 token
- [ ] 登录/注册成功后，前端手动将 token 存入 `localStorage.setItem('token', data)` —— 在调用方处理
- [ ] 分页接口的 PageVO 分页参数使用后端返回的 `records/total/size/current` 字段
- [ ] 上传头像使用 `multipart/form-data` 格式，通过 `FormData` 构造
- [ ] 每个函数有完整的 TypeScript 类型标注，入参与 openapi 的 DTO 一致