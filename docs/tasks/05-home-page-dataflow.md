# 任务五：首页数据流重构

## 说明
当前首页 `getForumHome` 一次性返回 分类+标签+主题帖+当前用户。后端需分离调用。

## 新数据流

```
首页加载时并发请求：
  1. GET /category/selectAll → 分类树（展平为 ForumCategory[]）
  2. GET /tag/selectAll → 所有标签
  3. POST /topic/page { pageNum: 1, pageSize: 20 } → 主题帖列表
  4. GET /user/me → 当前用户（有 token 时）
```

## 检查点

- [ ] 首页初始化时并发请求 3-4 个接口，不形成请求瀑布
- [ ] 每个接口独立 loading 状态，部分加载完成即展示
- [ ] 分类树展平：后端返回嵌套结构，前端展平为扁平列表用于侧边栏展示
- [ ] 缓存策略：分类和标签列表缓存时间较长（staleTime: 5min），主题帖列表缓存较短（staleTime: 30s）
- [ ] 分类选中后，重新查询 `POST /topic/page { categoryId: xxx }`，带筛选参数
- [ ] 切换 Feed 模式（最新/分类）时只切换 topic 列表的 queryKey，不重新加载分类/标签