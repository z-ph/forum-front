# JWT 存储方式改造说明（Cookie + HttpOnly）

## 背景

前端已将 JWT 鉴权方式改造为：由后端通过 `Set-Cookie` 将 JWT 写入浏览器 Cookie（`HttpOnly; Secure; SameSite=Lax`），前端不再手动读写 Cookie。浏览器在后续请求中自动携带 Cookie，后端从 Cookie 中读取 token 完成鉴权。

## 前端改动摘要

| 文件 | 变更 |
|---|---|
| `src/core/config.ts` | Axios 配置增加 `withCredentials: true`，请求自动携带 Cookie。 |
| `src/core/apiClient.ts` | 移除请求拦截器中的 `Authorization` header 组装；401 时仅跳转到登录页（HttpOnly Cookie 前端无法清除）。 |
| `src/services/userApi.ts` | 登录接口不再手动写 Cookie；新增 `logout()` 调用后端 `/user/logout`。 |
| `src/hooks/useForum.ts` | 注册成功后不再写 Cookie；登出时调用 `userApi.logout()`。 |
| `src/core/token.ts` | 已删除。前端不再手动读写 Cookie。 |

## 登录流程

1. 前端提交账号密码到 `POST /user/login`。
2. 后端校验通过后，在响应头中返回：
   ```
   Set-Cookie: token=<jwt>; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=...
   ```
3. 浏览器自动保存 Cookie。
4. 后续请求由浏览器自动携带 `Cookie: token=...`，Axios 的 `withCredentials: true` 保证跨域时也生效。

## 登出流程

1. 前端调用 `POST /user/logout`。
2. 后端返回 `Set-Cookie: token=; Max-Age=0` 清除 Cookie。
3. 前端跳转登录页。

## 开发环境注意

- 后端 CORS 已配置 `allowCredentials(true)` 和 `allowedOriginPatterns("*")`。
- 前端 `withCredentials: true` 已开启。
- 如果前后端跨域且使用 HTTPS，`Secure; SameSite=Lax` 可正常工作。
- 开发环境若前端通过 `/api` 代理访问后端，通常无需额外 CORS 配置。

## 回退说明

改造完成后，前端不再读取 `localStorage` 中的 `token`，也不再发送 `Authorization` header。若需要回退到旧方案，需同时回滚前端上述文件并调整后端鉴权逻辑。
