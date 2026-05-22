# 任务三：Service 入口 — 创建 `src/services/forumService.ts`

## 说明
创建一个统一的服务入口文件，按功能模块导出所有 API 函数。这是 hooks 层调用的唯一入口。

采取策略：**新建 `forumService.ts` 导出统一对象，hooks 层切换导入来源**。

```typescript
// forumService.ts - 导出所有 API 函数
export {
  loginApi, registerApi, getCurrentUserApi, ...
  createTopicApi, pageTopicsApi, getTopicDetailApi, ...
  createReplyApi, pageTopRepliesApi, pageChildRepliesApi, ...
  getAllCategoriesTreeApi, getParentCategoriesApi, ...
  getAllTagsApi, ...
} from './forumApi'
```

## 检查点

- [ ] 文件不包含任何业务逻辑，仅做 re-export
- [ ] 各模块函数命名统一前缀：auth、user、topic、reply、category、tag