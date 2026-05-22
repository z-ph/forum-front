# 任务十四：组件兼容性检查与调整

## 说明
转换数据后需验证所有组件正常运行。

## 涉及的组件

| 组件 | 调整内容 |
|------|---------|
| `ForumHeader.vue` | 用户信息改用 `nickname` + `avatar` + `role` |
| `CategorySidebar.vue` | 分类展示从扁平改为树形，移除 `accent`/`slug` 字段 |
| `TopicList.vue` | 作者展示改用 `creatorNickname`，移除 `pinned`/`solved`/`likes` 字段 |
| `TopicComposer.vue` | 分类选择器适配层级分类，标签选择改为 tagIds |
| `RichTextEditor.vue` | 无变化 |
| `RichTextRenderer.vue` | 无变化 |
| `ReplyComposer.vue` | 新增 `parentReplyId` 参数支持 |
| `HomeNavigation.vue` | Feed 模式切换适配 |

## 检查点

- [ ] 所有组件在数据转换后正确渲染，无 undefined 错误
- [ ] 移除的字段（pinned、solved、likes、accent、slug）不在模板中引用
- [ ] 组件中使用 `author.name` → 改用转换后的 `author.name`（从 nickname 映射）
- [ ] 头像字段后端返回的完整 URL 可直接用于 `<img>`
- [ ] 时间格式统一处理，避免服务端返回格式差异导致显示异常