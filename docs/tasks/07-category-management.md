# 任务七：分类管理页面适配

## 说明
当前分类侧边栏使用 mock 中的扁平 `categories` 数组。后端分类有父子层级。

## 适配内容

- 分类树从 `GET /category/selectAll` 获取
- 侧边栏渲染：父分类为一级，子分类缩进或分组展示
- 选中父分类 → `POST /topic/page { parentId }`
- 选中子分类 → `POST /topic/page { categoryId }`
- 支持分类搜索（管理员用）：`GET /category/search?name=`
- 新增/编辑分类调用对应的 POST/PUT 接口
- 删除分类调用 `DELETE /category/{id}`

## 检查点

- [ ] 分类树正确渲染两级结构
- [ ] 点击父分类或子分类时传递正确的查询参数
- [ ] 新增分类表单：必填 `parentId`（选择父分类）、`name`，可选 `description`
- [ ] 编辑分类只能修改 `name` 和 `description`，`parentId` 不可变
- [ ] 删除分类后有二次确认弹窗
- [ ] 分类 CUD 操作后刷新分类树和主题帖列表