# 任务六：主题帖详情页适配

## 说明
当前详情页一次性加载所有 reply（扁平数组），后端的 replies 是分页的（顶层 + 子回复两层），需改为分页加载。

## 新数据流

```
进入详情页时：
  1. GET /topic/detail/{id} → 主题帖信息
  2. POST /reply/top/page { topicId, pageNum: 1, pageSize: 10 } → 顶层回复列表

用户展开某回复的子回复时：
  3. POST /reply/child/page { parentReplyId, pageNum: 1, pageSize: 10 } → 子回复列表
```

## 检查点

- [ ] 主题帖详情和顶层回复并发加载
- [ ] 顶层回复支持分页滚动加载（"加载更多"按钮或滚动触发）
- [ ] 子回复默认折叠，点击"展开回复"后按需加载
- [ ] 回复组件展示：`creatorNickname`、`content`、`createTime`
- [ ] 子回复显示 `replyToUserNickname`（"回复 @xxx"）
- [ ] 新增回复时支持 `parentReplyId`：回复主题帖传 0，回复某条评论传对应 replyId
- [ ] 新增回复成功后，刷新顶层回复分页或子回复分页
- [ ] 无回复时展示空状态提示