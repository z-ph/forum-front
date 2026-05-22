# 任务九：用户认证与个人信息适配

## 说明
当前登录使用 `username`，后端使用 `email`。注册时后端需要 `email` 字段。

## 适配内容

- 登录表单：字段名保持 `username`，实际提交时将值填入 `email` 字段（同时对用户透明）
- 或修改表单标签为"邮箱"，让用户直接输入邮箱
- 注册表单：新增 `email` 字段（必填），与 `username` 分开
- 登录成功后：存储 token + 调用 `GET /user/me` 获取用户信息
- 用户信息展示：使用 `nickname`（显示名）、`username`（账号）、`email`、`avatar`、`role`
- 用户头像上传：`PUT /user/update` + FormData 传 avatar 文件

## 检查点

- [ ] 登录成功后将 token 存入 `localStorage`
- [ ] 应用初始化时（App.vue 或 router 守卫）检查 token 是否存在，存在则自动调用 `GET /user/me`
- [ ] 用户信息存储在 query cache 中，全局共享
- [ ] 退出登录清除 localStorage 中的 token 和 user
- [ ] token 过期（401 响应）时自动清除 token 并跳转登录页
- [ ] axios 响应拦截器添加 401 全局处理
- [ ] 用户头像上传：点击头像触发文件选择 → FormData 提交 → 刷新用户信息
- [ ] 注册表单包含 email、username、password、nickname 四个字段