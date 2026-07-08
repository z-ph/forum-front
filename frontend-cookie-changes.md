# 前端适配说明 · Cookie 存储 JWT

后端已修改登录接口，登录成功后自动通过 `Set-Cookie` 将 JWT 写入浏览器 Cookie。前端不再需要手动读写 Cookie，只需配合做好以下调整。

---

## 后端改动内容（供参考）

### 改动的文件

| 文件 | 改动 |
|---|---|
| `UserController.java` | 登录接口返回 JWT 的同时写 Cookie 到浏览器；新增 `/user/logout` 接口清除 Cookie |
| `JwtInterceptor.java` | 新增 `resolveToken()` 方法，优先读 Authorization Header，没有则从 Cookie 读 |
| `WebMvcConfiguration.java` | CORS 改 `allowedOriginPatterns("*")` + `allowCredentials(true)`；排除 `/user/logout` 路径 |

### 登录接口写 Cookie 代码

```java
@PostMapping("/login")
public Result<String> login(@Valid @RequestBody LoginDTO dto, HttpServletResponse response) {
    String token = userService.login(dto);

    Cookie cookie = new Cookie("token", token);
    cookie.setPath("/");
    cookie.setHttpOnly(true);
    cookie.setSecure(true);
    cookie.setAttribute("SameSite", "Lax");
    cookie.setMaxAge((int) (jwtExpire / 1000));
    response.addCookie(cookie);

    return Result.success("登录成功");
}
```

### JWT 拦截器读取逻辑

```java
private String resolveToken(HttpServletRequest request) {
    // 1. 优先从 Authorization Header 取
    String auth = request.getHeader("Authorization");
    if (auth != null && auth.startsWith("Bearer ")) {
        return auth.substring(7);
    }
    // 2. 没有 Header，从 Cookie 取
    Cookie[] cookies = request.getCookies();
    if (cookies != null) {
        for (Cookie cookie : cookies) {
            if ("token".equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
    }
    return null;
}
```

### 登出接口

```java
@PostMapping("/logout")
public Result<String> logout(HttpServletResponse response) {
    Cookie cookie = new Cookie("token", null);
    cookie.setPath("/");
    cookie.setMaxAge(0);
    response.addCookie(cookie);
    return Result.success("已退出");
}
```

---

## 改动概述

| 改动点 | 说明 |
|---|---|
| 前端写 Cookie | 不需要，后端 Set-Cookie 自动写入，且带 HttpOnly 更安全 |
| 前端读 Cookie | 不需要，浏览器自动发送，JS 也读不到（HttpOnly） |
| 请求带 Cookie | 需要，Axios 开启 withCredentials: true |
| Authorization Header | 可保留可删除，后端同时支持 Header 和 Cookie |
| 401 处理 | 保留，登录过期跳转登录页 |

---

## 登录接口变更

**请求**（不变）：

```
POST /user/login
Content-Type: application/json

{
  "email": "xxx@xxx.com",
  "password": "123456"
}
```

**响应**（已变更）：

```
HTTP/1.1 200
Set-Cookie: token=eyJhbG...; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400

{"code":1,"msg":"登录成功"}
```

JWT 不再通过响应体返回，改为 Set-Cookie 头写入 Cookie，浏览器自动保存，前端无需任何操作。

---

## 前端需要改动的代码

### 1. 删除手动写 Cookie 的逻辑

以下代码可以删除或废弃：

- `src/core/token.ts` 中的 `setToken()` —— 不需要，后端 Set-Cookie 自动写
- `src/core/token.ts` 中的 `removeToken()` —— 不需要，调 /user/logout 自动清除
- `src/services/userApi.ts` 中登录后调 `setToken()` —— 删除
- `src/hooks/useForum.ts` 中注册后写 Cookie —— 删除

### 2. Axios 开启 withCredentials

```
src/core/config.ts

axios.defaults.withCredentials = true;
```

这样才能在跨域请求（开发环境）时自动携带 Cookie。

### 3. Authorization Header（按需决定）

两种情况都可以，后端都支持：

- **选项 A**（推荐，过渡平滑）：保留现在的 Authorization Header 逻辑不变，后端优先读 Header。前端代码完全不用改

- **选项 B**（彻底迁移到 Cookie）：移除请求拦截器中组装 Authorization Header 的代码，完全依赖浏览器自动发 Cookie

建议先选 A，等联调稳定后再切到 B。

### 4. 401 处理（保留不变）

```
src/core/apiClient.ts

响应拦截器中 401 的处理逻辑保留：
- 跳转到登录页
- （可选）调 /user/logout 确保 Cookie 清除
```

### 5. 登出

```
POST /user/logout
```

后端会返回 `Set-Cookie: token=; Max-Age=0` 清除 Cookie。前端跳转到登录页即可。

---

## 最终前端行为

| 场景 | 行为 |
|---|---|
| 登录 | 提交账号密码，后端返回 Set-Cookie，浏览器自动存 Cookie |
| 后续请求 | 浏览器自动带 Cookie，后端从 Cookie 读 JWT 鉴权 |
| 401 过期 | 跳转登录页，用户重新登录 |
| 登出 | 调 /user/logout，后端清除 Cookie，跳转登录页 |

---

## 开发环境注意

前后端不同端口时，前端需要：

1. Axios 开启 `withCredentials: true`
2. 后端 CORS 已配置 `allowCredentials(true)` + `allowedOriginPatterns("*")`（已改好）

生产环境同域访问，不需要任何额外配置。
