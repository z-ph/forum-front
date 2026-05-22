# 任务十：回复功能适配（支持回复层级）

## 说明
当前回复只有一层（回复主题帖），后端支持两层（回复帖子的回复）。

## 适配内容

- 回复主题帖：`POST /reply { topicId, parentReplyId: 0, content }`
- 回复某条回复：`POST /reply { topicId, parentReplyId: 某回复ID, content }`
- 评论框区域增加"回复 @xxx"的提示
- 删除回复：`DELETE /reply/{id}`，仅创建者可删除

## 检查点

- [ ] 主题帖底部回复框：提交时 `parentReplyId` 不传或传 0
- [ ] 每条回复下方的"回复"按钮：点击后打开内嵌回复框，`parentReplyId` 传该回复的 id
- [ ] 子回复列表中展示 `replyToUserNickname`（"回复 @xxx"）
- [ ] 只在自己的回复上显示删除按钮
- [ ] 删除回复后刷新对应回复列表
- [ ] 空回复内容校验，不允许提交空字符串