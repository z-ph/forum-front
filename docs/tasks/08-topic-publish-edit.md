# 任务八：主题帖发布/编辑页面适配

## 说明
当前发帖使用 `createTopic`，参数中有 `tags: string[]`。后端 `TopicDTO` 使用的是 `tagIds: number[]`。

## 适配内容

- 发帖表单：分类选择器改为从 `GET /category/selectAll` 获取分类列表
- 标签选择器改为从 `GET /tag/selectAll` 获取，选中后提交 tagIds
- 新增主题帖调用 `POST /topic`
- 编辑主题帖调用 `PUT /topic/{id}`
- 删除主题帖调用 `DELETE /topic/{id}`
- 管理员可用 `PUT /topic/{id}/status` 控制显示/隐藏

## 检查点

- [ ] 分类选择器展示两级分类（父分类 → 子分类级联选择）
- [ ] 标签选择器展示从 API 获取的标签列表（多选）
- [ ] 发帖表单提交时，tag 名称转换为 tagIds 数组
- [ ] 发帖成功后跳转到详情页，URL 使用后端返回的 id
- [ ] 编辑页面预填当前 topic 的已有数据
- [ ] 删除主题帖有确认弹窗，删除后跳转回首页
- [ ] 发布中的 loading 状态（防止重复提交）