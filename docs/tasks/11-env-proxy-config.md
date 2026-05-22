# 任务十一：环境配置与代理设置

## 说明
当前 `config.ts` 中 `baseURL` 在 DEV 模式为 `/asdfasdf`（无意义值），需配置正确的代理指向后端服务。

## 检查点

- [ ] `.env` 中的 `VITE_API_URL` 改为开发环境后端地址
- [ ] `.env` 中的 `VITE_BACK_API` 保持为生产环境后端地址
- [ ] `vite.config.ts` 配置 dev proxy，将 API 请求代理到后端
- [ ] 代理正确转发所有 `/user/*`、`/category/*`、`/tag/*`、`/topic/*`、`/reply/*` 路径
- [ ] 验证 CORS 配置：或后端允许前端域名，或通过代理绕过