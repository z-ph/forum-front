# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `pnpm dev` - Start dev server with API proxy
- `pnpm build` - Build for production (typecheck + vite build)
- `pnpm typecheck` - Run TypeScript type check only
- `pnpm preview` - Preview production build locally

Pre-commit hook runs `pnpm typecheck` automatically.

## Architecture

**File-based routing**: Uses `unplugin-vue-router` - routes are auto-generated from `src/pages/**/*.page.vue` files. Follow these conventions:

### File Naming Conventions

| File pattern | Route path | Purpose |
|--------------|------------|---------|
| `index.page.vue` | `/` | Index/home route |
| `about.page.vue` | `/about` | Static route |
| `[id].page.vue` | `/:id` | Dynamic param (required) |
| `[[id]].page.vue` | `/:id?` | Optional param |
| `[...path].page.vue` | `/:path(.*)` | Catch-all (404) |
| `users.page.vue` + `users/` folder | Nested layout | Parent wraps children |

### Key Rules

1. **Route config**: Use `definePage()` macro in `<script setup>` for route-level config (redirect, meta, etc.). Do NOT use `<route>` custom blocks — `definePage` is the canonical approach.

2. **Nested routes**: Place `parent.page.vue` alongside a `parent/` folder to create layout wrapper. Children render in parent's `<RouterView>`.

3. **URL nesting without layout**: Use dot notation (`users.profile.page.vue` → `/users/profile`) when URL should nest but UI shouldn't.

5. **Type-safe navigation**: Import `unplugin-vue-router/client` in entry file to enable typed routes. Use route name strings for params:
   ```ts
   router.push({ name: '/topics/[id]', params: { id: '123' } })
   const route = useRoute('/topics/[id]')
   route.params.id // typed as string
   ```

6. **Typed RouterLink**: `<RouterLink :to="{ name: '/users/[id]', params: { id: userId } }">` provides autocomplete.

7. **Generated types**: `src/typed-router.d.ts` is auto-generated - never edit manually. It updates when page files change.

### Current Structure

```
src/pages/
├── index.page.vue          # /
├── auth.page.vue           # /auth
├── (forum).page.vue        # Layout wrapper for /latest, /categories
├── (forum)/
│   ├── latest.page.vue     # /latest
│   └── categories.page.vue # /categories
└── topics/[id].page.vue    # /topics/:id
```

Parentheses `(forum)` create route groups - shared layout without affecting URL path.

**Data fetching**: TanStack Query (`@tanstack/vue-query`) handles all server state. Query hooks are in `src/hooks/useForum.ts`, mutations invalidate relevant query keys on success.

**State composition**: Complex UI state (like `useForumHomeState.ts`) combines TanStack Query data with Vue Router query params and local refs in a single composable.

**API layer**:
- `src/core/apiClient.ts` - Axios instance with auth interceptor
- `src/services/forumMock.ts` - Mock implementations (in-memory, simulates latency)
- Replace mock functions with real API calls when backend is ready

**Key directories**:
- `src/pages/` - Route pages (`.page.vue` suffix required for auto-routing)
- `src/components/forum/` - Forum-specific components
- `src/hooks/` - Query hooks and state composables
- `src/services/` - API/mock service functions
- `src/types/` - TypeScript interfaces (`forum.ts`)
- `src/core/` - Utilities: apiClient, config, theme, richText

**Environment**: `.env` defines `VITE_BACK_API` (production API URL) and `VITE_API_URL` (dev proxy target).

## UI Libraries

- Element Plus for UI components
- Tailwind CSS v4 for styling
- `md-editor-v3` for Markdown editing/rendering