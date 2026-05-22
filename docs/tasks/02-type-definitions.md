# 任务二：类型定义重构 — `src/types/api.ts`

## 说明
当前 `src/types/forum.ts` 与 mock 数据结构深度耦合，需适配后端 VO 结构。新建 `src/types/api.ts` 存放后端 VO 类型，保留 `forum.ts` 作为前端 UI 层类型，在 service 层做数据转换。

## 后端 VO 与前端类型的核心差异

| 字段 | Mock（前端类型） | 后端 VO | 转换说明 |
|------|-----------------|---------|---------|
| `ForumUser.id` | `string` (e.g. "u1") | `number` (int64) | 数字→字符串 |
| `ForumUser.name` | 用户展示名 | `nickname` 字段 | 映射 nickname→name |
| `ForumUser.handle` | 用户标识 | `username` | 映射 username→handle |
| `ForumUser.title` | 头衔 | 无此字段 | 后端无，UI 层可选/默认 |
| `ForumUser.bio` | 简介 | 无此字段 | 后端无 |
| `ForumUser.avatar` | 头像 URL | `avatar` | 一致 |
| `ForumUser.role` | 'admin' \| 'member' | "USER" \| "ADMIN" 字符串 | 映射 "USER"→"member", "ADMIN"→"admin" |
| `ForumCategory.id` | string | number | 数字→字符串 |
| `ForumCategory.slug` | 分类标识 | 无此字段 | 用 name 或 id 替代 |
| `ForumCategory.accent` | 颜色 | 无此字段 | 前端硬编码轮播色 |
| `ForumCategory.topicCount` | 帖子数 | 无此字段 | 从 topics 统计或忽略 |
| `ForumTopic.author` | ForumUser 对象 | `creatorId` + `creatorNickname` 分开 | 组装为 { id, name } 对象 |
| `ForumTopic.tags` | string[] | TagVO[] 对象数组 | 映射为 tag names 数组 |
| `ForumTopic.pinned` | boolean | 无此字段 | 无此功能 |
| `ForumTopic.solved` | boolean | 无此字段 | 无此功能 |
| `ForumTopic.likes` | number | 无此字段 | 无此功能 |
| `ForumTopic.preview` | 内容预览 | 无此字段 | 从 content 截取 |
| `ForumReply.author` | ForumUser | `creatorId` + `creatorNickname` | 组装为对象 |
| `ForumReply.likes` | number | 无此字段 | 无此功能 |
| `ForumReply.isSolution` | boolean | 无此字段 | 无此功能 |
| 回复层级 | 扁平数组全部加载 | 顶层分页 + 子回复分页 | 需改为懒加载 |
| 分页参数 | 无 | pageNum/pageSize, records/total/size/current | 适配 |

## 检查点

- [ ] 新建 `src/types/api.ts`，定义与 openapi.json 严格对应的后端 VO 类型（UserVO, CategoryVO, CategoryTreeVO, TagVO, TopicVO, ReplyVO, 各 DTO, 各 Result 包装）
- [ ] 保持 `src/types/forum.ts` 中的 UI 类型不动（避免大面积修改组件）
- [ ] 新增转换函数：`apiUserToForumUser(vo: UserVO): ForumUser`、`apiTopicToForumTopic(vo: TopicVO): ForumTopic`、`apiTopicDetailToForumDetail(vo: TopicVO): ForumTopicDetail`、`apiReplyToForumReply(vo: ReplyVO): ForumReply`、`apiCategoryToForumCategory(vo: CategoryVO): ForumCategory`
- [ ] 转换函数放在 `src/services/forumApi.ts` 或独立 `src/services/dataTransform.ts` 中
- [ ] 处理 null/undefined 边界：后端某些字段可能为空，转换时给出默认值
- [ ] 时间格式处理：后端返回 ISO 格式字符串，按 UI 需要格式化