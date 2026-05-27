# Lightweight VEX-Style Forum Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the lightweight VEX Chinese official forum experience defined in `.omc/specs/deep-interview-lightweight-vex-forum.md`.

**Architecture:** Keep the existing TanStack Query + service adapter architecture. Add missing route pages and focused components instead of replacing the current forum shell. Use existing backend endpoints only, and omit UI for unsupported features such as likes, solved state, pinning, notifications, and full-text search.

**Tech Stack:** Vue 3, TypeScript, file-based routing via `unplugin-vue-router`, TanStack Vue Query, Element Plus, Tailwind CSS v4, Axios, `md-editor-v3`.

---

## File Structure

### Modify existing files
- `src/types/forum.ts` — make topic creation category/tags optional and add nested reply fields.
- `src/hooks/useForum.ts` — support optional category/tags in create-topic; add child reply query/mutation support.
- `src/services/forumAdapter.ts` — map backend reply parent fields into nested reply UI types and remove unsupported hardcoded status display assumptions.
- `src/components/forum/TopicList.vue` — make list visually closer to VEX/Discourse while only showing supported data.
- `src/components/forum/ForumFeedPage.vue` — improve empty/error/unauthenticated calls to action.
- `src/components/forum/ReplyComposer.vue` — support replying to a specific parent reply.
- `src/pages/topics/[id].page.vue` — render nested replies, load a few child replies by default, and expose “load more” for children.
- `src/hooks/useAdmin.ts` — remove/admin-avoid topic delete from first-version surface if currently exported for UI use, keep status toggle; keep category/tag CRUD.

### Create new files
- `src/pages/topics/new.page.vue` — independent topic creation page.
- `src/pages/admin.page.vue` — admin layout wrapper with guard and child navigation.
- `src/pages/admin/users.page.vue` — user list, filters, enable/disable.
- `src/pages/admin/topics.page.vue` — topic list, filters, hide/restore only.
- `src/pages/admin/categories.page.vue` — category CRUD with delete confirmation.
- `src/pages/admin/tags.page.vue` — tag CRUD with delete confirmation.
- `src/components/admin/AdminAccessDenied.vue` — 403/no-permission state.
- `src/components/admin/AdminPageShell.vue` — shared admin page heading/actions/content shell.

---

## Task 1: Align forum types with the agreed first-version scope

**Files:**
- Modify: `src/types/forum.ts`

- [ ] **Step 1: Update topic and reply types**

Replace the relevant interfaces in `src/types/forum.ts` with this shape:

```ts
export interface ForumReply {
  id: string
  author: ForumUser
  content: string
  createdAt: string
  parentReplyId?: string
  replyToUserId?: string
  replyToUserNickname?: string
  childCount?: number
  children?: ForumReply[]
}

export interface ForumTopic {
  id: string
  title: string
  content: string
  categoryId?: string
  categoryName?: string
  author: ForumUser
  createdAt: string
  updatedAt: string
  views: number
  repliesCount: number
  tags: string[]
  preview: string
  status?: number
}

export interface ForumTopicDetail extends ForumTopic {
  replies: ForumReply[]
}

export interface CreateTopicPayload {
  title: string
  content: string
  categoryId?: string
  tags?: string[]
}

export interface CreateReplyPayload {
  topicId: string
  content: string
  parentReplyId?: string
}
```

- [ ] **Step 2: Run typecheck to find dependent errors**

Run: `pnpm typecheck`

Expected: FAIL if existing components still reference removed fields like `likes`, `pinned`, or `solved`.

- [ ] **Step 3: Do not restore unsupported fields**

For each type error caused by `likes`, `pinned`, `solved`, or `isSolution`, remove the UI usage instead of adding the field back. These fields are explicitly out of first-version scope.

- [ ] **Step 4: Run typecheck again**

Run: `pnpm typecheck`

Expected: PASS or only errors from later planned files not existing yet.

---

## Task 2: Make topic creation use optional category and tags

**Files:**
- Modify: `src/hooks/useForum.ts`
- Create: `src/pages/topics/new.page.vue`

- [ ] **Step 1: Update `createTopicReal` to accept optional category/tags**

In `src/hooks/useForum.ts`, change `createTopicReal` so title and content are the only required fields:

```ts
async function createTopicReal(payload: CreateTopicPayload): Promise<ForumTopicDetail> {
  const categoryId = payload.categoryId ? Number(payload.categoryId) : undefined
  const tagIds: number[] = []

  for (const tagName of payload.tags ?? []) {
    const id = tagMap.value.get(tagName)
    if (id !== undefined) tagIds.push(id)
  }

  const res = await topicApi.createTopic({
    categoryId: categoryId ?? 0,
    title: payload.title,
    content: payload.content,
    tagIds: tagIds.length ? tagIds : undefined,
  })

  if (res.code !== 1) throw new Error(res.msg || '发布失败')

  return {
    id: 'pending',
    title: payload.title,
    content: payload.content,
    categoryId: payload.categoryId,
    categoryName: '',
    author: toForumUserFromCreator(0, '当前用户'),
    createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    views: 0,
    repliesCount: 0,
    tags: payload.tags ?? [],
    preview: payload.content.slice(0, 80),
    replies: [],
  }
}
```

If backend rejects `categoryId: 0`, change the UI to submit the first available category when the user leaves category empty, and display the category field as optional in UI copy.

- [ ] **Step 2: Create independent topic creation page**

Create `src/pages/topics/new.page.vue`:

```vue
<script setup lang="ts">
import { computed, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import RichTextEditor from '../../components/forum/RichTextEditor.vue'
import { useCreateTopicMutation, useForumHomeQuery } from '../../hooks/useForum'

const router = useRouter()
const { data } = useForumHomeQuery()
const createTopic = useCreateTopicMutation()

const form = reactive({
  title: '',
  content: '',
  categoryId: '',
  tags: [] as string[],
})

const canSubmit = computed(() => form.title.trim().length > 0 && form.content.trim().length > 0)

async function submitTopic() {
  if (!canSubmit.value) {
    ElMessage.warning('请填写标题和正文')
    return
  }

  try {
    const topic = await createTopic.mutateAsync({
      title: form.title.trim(),
      content: form.content.trim(),
      categoryId: form.categoryId || undefined,
      tags: form.tags,
    })
    ElMessage.success('话题已发布')
    await router.push({ path: topic.id === 'pending' ? '/latest' : `/topics/${topic.id}` })
  } catch (error) {
    ElMessage.error((error as Error).message)
  }
}
</script>

<template>
  <main class="min-h-screen px-4 py-8">
    <section class="mx-auto max-w-[920px] rounded-2xl border border-[var(--forum-border)] bg-[var(--forum-surface)] p-6 shadow-sm">
      <div class="mb-6 flex items-center justify-between gap-4">
        <div>
          <p class="text-sm font-semibold text-[var(--forum-primary)]">新建话题</p>
          <h1 class="mt-1 text-2xl font-bold text-[#162235]">提出你的问题</h1>
          <p class="mt-2 text-sm text-[#72809a]">标题和正文必填，分类和标签可稍后补充。</p>
        </div>
        <el-button @click="router.push({ path: '/latest' })">返回列表</el-button>
      </div>

      <el-form label-position="top">
        <el-form-item label="标题">
          <el-input v-model="form.title" maxlength="120" show-word-limit placeholder="用一句话描述你的问题" />
        </el-form-item>

        <el-form-item label="分类（可选）">
          <el-select v-model="form.categoryId" clearable placeholder="选择分类">
            <el-option v-for="category in data?.categories ?? []" :key="category.id" :label="category.name" :value="category.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="标签（可选）">
          <el-select v-model="form.tags" multiple clearable filterable placeholder="选择标签">
            <el-option v-for="tag in data?.availableTags ?? []" :key="tag" :label="tag" :value="tag" />
          </el-select>
        </el-form-item>

        <el-form-item label="正文">
          <RichTextEditor v-model="form.content" placeholder="描述现象、你尝试过的方法，以及希望别人怎么帮你。" />
        </el-form-item>

        <div class="flex justify-end gap-3">
          <el-button @click="router.push({ path: '/latest' })">取消</el-button>
          <el-button type="primary" :loading="createTopic.isPending.value" :disabled="!canSubmit" @click="submitTopic">发布话题</el-button>
        </div>
      </el-form>
    </section>
  </main>
</template>
```

- [ ] **Step 3: Run typecheck**

Run: `pnpm typecheck`

Expected: PASS after resolving route/type imports.

---

## Task 3: Update the topic list and homepage states

**Files:**
- Modify: `src/components/forum/TopicList.vue`
- Modify: `src/components/forum/ForumFeedPage.vue`
- Modify: `src/components/forum/HomeNavigation.vue` if it owns the “new topic” button

- [ ] **Step 1: Remove unsupported status UI from topic list**

In `src/components/forum/TopicList.vue`, remove visible `置顶`, `已解决`, `点赞`, and any `data-pinned` styling. Keep only backend-backed values: title, category, tags, author, reply count, views, updated time.

- [ ] **Step 2: Adjust list density toward VEX style**

Keep the existing grid, but make the first column include a compact title/meta block:

```vue
<div class="min-w-0 max-[900px]:col-span-3 max-[900px]:row-start-1">
  <strong class="block truncate text-[0.98rem] leading-6 text-[#192435]">{{ topic.title }}</strong>
  <div class="mt-1.5 flex flex-wrap items-center gap-2 text-[0.78rem] text-[#6c7a91]">
    <span v-if="topic.categoryName" class="font-medium [color:var(--forum-primary)]">{{ topic.categoryName }}</span>
    <span v-for="tag in topic.tags.slice(0, 3)" :key="tag">#{{ tag }}</span>
  </div>
  <p class="mt-1.5 line-clamp-2 text-[0.84rem] leading-[1.55] text-[#5f6f87]">{{ topic.preview }}</p>
</div>
```

- [ ] **Step 3: Add empty-list create CTA**

Replace the bare `el-empty` in `TopicList.vue` with:

```vue
<el-empty v-else :description="emptyDescription || '当前还没有话题'">
  <el-button type="primary" @click="$router.push({ path: '/topics/new' })">发布第一个话题</el-button>
</el-empty>
```

If `$router` is not available in template type checking, import `useRouter()` and call `router.push({ path: '/topics/new' })` via a local function.

- [ ] **Step 4: Ensure new-topic buttons route to `/topics/new`**

Any existing “新建话题” action in `ForumFeedPage.vue` or `HomeNavigation.vue` should call:

```ts
router.push({ path: '/topics/new' })
```

- [ ] **Step 5: Run typecheck**

Run: `pnpm typecheck`

Expected: PASS.

---

## Task 4: Add nested reply support

**Files:**
- Modify: `src/hooks/useForum.ts`
- Modify: `src/services/forumAdapter.ts`
- Modify: `src/components/forum/ReplyComposer.vue`
- Modify: `src/pages/topics/[id].page.vue`

- [ ] **Step 1: Map reply parent fields**

In `src/services/forumAdapter.ts`, update `toForumReply` so it includes parent metadata:

```ts
return {
  id: String(reply.id),
  author: userMap.get(reply.creatorId) ?? toForumUserFromCreator(reply.creatorId, reply.creatorNickname),
  content: reply.content,
  createdAt: formatTime(reply.createTime),
  parentReplyId: reply.parentReplyId ? String(reply.parentReplyId) : undefined,
  replyToUserId: reply.replyToUserId ? String(reply.replyToUserId) : undefined,
  replyToUserNickname: reply.replyToUserNickname || undefined,
  children: [],
}
```

- [ ] **Step 2: Add child reply query helper**

In `src/hooks/useForum.ts`, add:

```ts
async function fetchChildReplies(parentReplyId: string): Promise<ForumReply[]> {
  const numericId = Number(parentReplyId)
  if (Number.isNaN(numericId)) throw new Error('无效的回复ID')

  const res = await replyApi.getReplyChildPage({ parentReplyId: numericId, pageNum: 1, pageSize: 3 })
  if (res.code !== 1) throw new Error(res.msg || '加载子回复失败')

  const records = res.data?.records ?? []
  const userMap = buildUserMap([], [])
  extendUserMapFromReplies(userMap, records)
  return records.map((reply) => toForumReply(reply, userMap))
}

export function useChildRepliesQuery(parentReplyId: string, enabled: Ref<boolean>) {
  return useQuery({
    queryKey: ['forum', 'reply-children', parentReplyId],
    queryFn: () => fetchChildReplies(parentReplyId),
    enabled,
  })
}
```

Import `Ref` is already available in `useForum.ts`.

- [ ] **Step 3: Support parent reply creation**

Update `createReplyReal` in `src/hooks/useForum.ts`:

```ts
async function createReplyReal(payload: CreateReplyPayload): Promise<void> {
  const numericTopicId = Number(payload.topicId)
  const numericParentReplyId = payload.parentReplyId ? Number(payload.parentReplyId) : undefined

  const res = await replyApi.createReply({
    topicId: numericTopicId,
    parentReplyId: numericParentReplyId,
    content: payload.content,
  })

  if (res.code !== 1) throw new Error(res.msg || '回复失败')
}
```

- [ ] **Step 4: Add reply target state in topic detail**

In `src/pages/topics/[id].page.vue`, track target reply:

```ts
const replyingTo = ref<{ id: string; name: string } | null>(null)

async function handleReply(content: string) {
  if (!data.value) return

  try {
    await replyMutation.mutateAsync({
      topicId: data.value.id,
      parentReplyId: replyingTo.value?.id,
      content,
    })
    replyingTo.value = null
    ElMessage.success('回复已发布')
  } catch (error) {
    ElMessage.error((error as Error).message)
  }
}
```

Import `ref` from Vue.

- [ ] **Step 5: Render reply action and nested container**

In each top-level reply article, add:

```vue
<el-button text size="small" @click="replyingTo = { id: reply.id, name: reply.author.name }">
  回复
</el-button>

<div class="mt-4 rounded-xl bg-[#f7f9fc] p-3">
  <el-button text size="small">展开子回复</el-button>
</div>
```

Then replace the static placeholder with a small child-reply component or inline query-driven block. Keep it one-level nested.

- [ ] **Step 6: Update composer prompt**

Pass a hint to `ReplyComposer.vue` so the UI displays `回复 @用户名` when `replyingTo` exists, and add a cancel button to clear it.

- [ ] **Step 7: Run typecheck**

Run: `pnpm typecheck`

Expected: PASS.

---

## Task 5: Add admin route shell and access denied state

**Files:**
- Create: `src/components/admin/AdminAccessDenied.vue`
- Create: `src/components/admin/AdminPageShell.vue`
- Create: `src/pages/admin.page.vue`

- [ ] **Step 1: Create access denied component**

Create `src/components/admin/AdminAccessDenied.vue`:

```vue
<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <el-result icon="warning" title="无权限访问" sub-title="当前账号没有管理后台权限。">
    <template #extra>
      <el-button type="primary" @click="router.push({ path: '/latest' })">返回论坛首页</el-button>
    </template>
  </el-result>
</template>
```

- [ ] **Step 2: Create admin shell component**

Create `src/components/admin/AdminPageShell.vue`:

```vue
<script setup lang="ts">
defineProps<{
  title: string
  description: string
}>()
</script>

<template>
  <section class="rounded-2xl border border-[var(--forum-border)] bg-[var(--forum-surface)] p-5 shadow-sm">
    <header class="mb-5 flex flex-col gap-3 border-b border-[var(--forum-border)] pb-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 class="text-xl font-bold text-[#162235]">{{ title }}</h1>
        <p class="mt-1 text-sm text-[#72809a]">{{ description }}</p>
      </div>
      <slot name="actions" />
    </header>
    <slot />
  </section>
</template>
```

- [ ] **Step 3: Create admin layout route**

Create `src/pages/admin.page.vue`:

```vue
<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import AdminAccessDenied from '../components/admin/AdminAccessDenied.vue'
import { useAdminAuth } from '../hooks/useAdmin'

const { isLoading, isError, isAdmin } = useAdminAuth()

const navItems = [
  { path: '/admin/users', label: '用户' },
  { path: '/admin/topics', label: '话题' },
  { path: '/admin/categories', label: '分类' },
  { path: '/admin/tags', label: '标签' },
]
</script>

<template>
  <main class="min-h-screen px-4 py-8">
    <div class="mx-auto max-w-[1180px]">
      <el-skeleton v-if="isLoading" animated :rows="6" />
      <AdminAccessDenied v-else-if="isError || !isAdmin" />
      <template v-else>
        <nav class="mb-5 flex flex-wrap gap-2">
          <RouterLink v-for="item in navItems" :key="item.path" :to="{ path: item.path }" class="rounded-full border border-[var(--forum-border)] px-4 py-2 text-sm text-[#53627a]">
            {{ item.label }}
          </RouterLink>
        </nav>
        <RouterView />
      </template>
    </div>
  </main>
</template>
```

- [ ] **Step 4: Run typecheck**

Run: `pnpm typecheck`

Expected: PASS.

---

## Task 6: Implement admin users page

**Files:**
- Create: `src/pages/admin/users.page.vue`

- [ ] **Step 1: Create users management route**

Create `src/pages/admin/users.page.vue`:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import AdminPageShell from '../../components/admin/AdminPageShell.vue'
import { useAdminUsersQuery, useToggleUserStatusMutation } from '../../hooks/useAdmin'

const params = ref({ pageNum: 1, pageSize: 20, username: '', email: '', status: undefined as number | undefined })
const { data, isLoading, refetch } = useAdminUsersQuery(params)
const toggleStatus = useToggleUserStatusMutation()

async function confirmToggle(row: { id: number; status: number | boolean; nickname?: string }) {
  const nextStatus = !(row.status === 1 || row.status === true)
  await ElMessageBox.confirm(`确认${nextStatus ? '启用' : '禁用'}用户 ${row.nickname ?? row.id}？`, '用户状态确认')
  await toggleStatus.mutateAsync({ id: row.id, status: nextStatus })
  ElMessage.success('用户状态已更新')
  await refetch()
}
</script>

<template>
  <AdminPageShell title="用户管理" description="查看用户并启用或禁用账号。">
    <template #actions>
      <div class="flex gap-2">
        <el-input v-model="params.username" clearable placeholder="用户名" />
        <el-input v-model="params.email" clearable placeholder="邮箱" />
        <el-select v-model="params.status" clearable placeholder="状态" class="w-32">
          <el-option label="启用" :value="1" />
          <el-option label="禁用" :value="0" />
        </el-select>
        <el-button @click="refetch()">查询</el-button>
      </div>
    </template>

    <el-table v-loading="isLoading" :data="data?.records ?? []" row-key="id">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="nickname" label="昵称" />
      <el-table-column prop="email" label="邮箱" />
      <el-table-column prop="role" label="角色" width="120" />
      <el-table-column prop="status" label="状态" width="120">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 || row.status === true ? 'success' : 'info'">
            {{ row.status === 1 || row.status === true ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="140">
        <template #default="{ row }">
          <el-button text type="primary" :loading="toggleStatus.isPending.value" @click="confirmToggle(row)">
            {{ row.status === 1 || row.status === true ? '禁用' : '启用' }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </AdminPageShell>
</template>
```

- [ ] **Step 2: Run typecheck**

Run: `pnpm typecheck`

Expected: PASS.

---

## Task 7: Implement admin topics page with hide/restore only

**Files:**
- Create: `src/pages/admin/topics.page.vue`

- [ ] **Step 1: Create topic management route**

Create `src/pages/admin/topics.page.vue`:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import AdminPageShell from '../../components/admin/AdminPageShell.vue'
import { useAdminTopicsQuery, useToggleTopicStatusMutation } from '../../hooks/useAdmin'

const params = ref({ pageNum: 1, pageSize: 20, keyword: '', status: undefined as number | undefined })
const { data, isLoading, refetch } = useAdminTopicsQuery(params)
const toggleStatus = useToggleTopicStatusMutation()

async function confirmToggle(row: { id: number; status: number; title: string }) {
  const visible = row.status === 1
  await ElMessageBox.confirm(`确认${visible ? '隐藏' : '恢复'}话题「${row.title}」？`, '话题状态确认')
  await toggleStatus.mutateAsync({ id: row.id, status: !visible })
  ElMessage.success('话题状态已更新')
  await refetch()
}
</script>

<template>
  <AdminPageShell title="话题管理" description="查看话题并执行隐藏或恢复操作。">
    <template #actions>
      <div class="flex gap-2">
        <el-input v-model="params.keyword" clearable placeholder="搜索话题" />
        <el-select v-model="params.status" clearable placeholder="状态" class="w-32">
          <el-option label="显示" :value="1" />
          <el-option label="隐藏" :value="0" />
        </el-select>
        <el-button @click="refetch()">查询</el-button>
      </div>
    </template>

    <el-table v-loading="isLoading" :data="data?.records ?? []" row-key="id">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="title" label="标题" min-width="260" show-overflow-tooltip />
      <el-table-column prop="categoryName" label="分类" width="160" />
      <el-table-column prop="creatorNickname" label="作者" width="140" />
      <el-table-column prop="replyCount" label="回复" width="90" />
      <el-table-column prop="status" label="状态" width="110">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'">{{ row.status === 1 ? '显示' : '隐藏' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="140">
        <template #default="{ row }">
          <el-button text type="primary" :loading="toggleStatus.isPending.value" @click="confirmToggle(row)">
            {{ row.status === 1 ? '隐藏' : '恢复' }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </AdminPageShell>
</template>
```

- [ ] **Step 2: Confirm destructive delete is not exposed**

Do not add any `deleteTopic` button to this page.

- [ ] **Step 3: Run typecheck**

Run: `pnpm typecheck`

Expected: PASS.

---

## Task 8: Implement category and tag CRUD pages

**Files:**
- Create: `src/pages/admin/categories.page.vue`
- Create: `src/pages/admin/tags.page.vue`

- [ ] **Step 1: Create categories page**

Create `src/pages/admin/categories.page.vue`:

```vue
<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import AdminPageShell from '../../components/admin/AdminPageShell.vue'
import {
  flattenCategoryTree,
  useAdminCategoriesQuery,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useUpdateCategoryMutation,
} from '../../hooks/useAdmin'

const { data, isLoading, refetch } = useAdminCategoriesQuery()
const createCategory = useCreateCategoryMutation()
const updateCategory = useUpdateCategoryMutation()
const deleteCategory = useDeleteCategoryMutation()

const dialogVisible = ref(false)
const form = reactive({ id: undefined as number | undefined, parentId: 0, name: '', description: '' })
const categories = computed(() => flattenCategoryTree(data.value ?? []))

function openCreateDialog() {
  form.id = undefined
  form.parentId = 0
  form.name = ''
  form.description = ''
  dialogVisible.value = true
}

function openEditDialog(row: { id: number; parentId: number; name: string; description: string }) {
  form.id = row.id
  form.parentId = row.parentId
  form.name = row.name
  form.description = row.description
  dialogVisible.value = true
}

async function saveCategory() {
  if (!form.name.trim()) {
    ElMessage.warning('请输入分类名称')
    return
  }

  const payload = {
    parentId: form.parentId,
    name: form.name.trim(),
    description: form.description.trim(),
  }

  if (form.id) {
    await updateCategory.mutateAsync({ id: form.id, data: payload })
    ElMessage.success('分类已更新')
  } else {
    await createCategory.mutateAsync(payload)
    ElMessage.success('分类已创建')
  }

  dialogVisible.value = false
  await refetch()
}

async function confirmDelete(row: { id: number; name: string }) {
  await ElMessageBox.confirm(`确认删除分类「${row.name}」？`, '删除确认', { type: 'warning' })
  await deleteCategory.mutateAsync(row.id)
  ElMessage.success('分类已删除')
  await refetch()
}
</script>

<template>
  <AdminPageShell title="分类管理" description="维护论坛分类结构。">
    <template #actions>
      <el-button type="primary" @click="openCreateDialog">新增分类</el-button>
    </template>

    <el-table v-loading="isLoading" :data="categories" row-key="id">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="名称" />
      <el-table-column prop="parentId" label="父分类" width="120" />
      <el-table-column prop="description" label="描述" min-width="240" show-overflow-tooltip />
      <el-table-column label="操作" width="180">
        <template #default="{ row }">
          <el-button text type="primary" @click="openEditDialog(row)">编辑</el-button>
          <el-button text type="danger" :loading="deleteCategory.isPending.value" @click="confirmDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑分类' : '新增分类'" width="520px">
      <el-form label-position="top">
        <el-form-item label="名称">
          <el-input v-model="form.name" maxlength="40" />
        </el-form-item>
        <el-form-item label="父分类 ID">
          <el-input-number v-model="form.parentId" :min="0" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="3" maxlength="200" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="createCategory.isPending.value || updateCategory.isPending.value" @click="saveCategory">保存</el-button>
      </template>
    </el-dialog>
  </AdminPageShell>
</template>
```

- [ ] **Step 2: Create tags page**

Create `src/pages/admin/tags.page.vue`:

```vue
<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import AdminPageShell from '../../components/admin/AdminPageShell.vue'
import {
  useAdminTagsQuery,
  useCreateTagMutation,
  useDeleteTagMutation,
  useUpdateTagMutation,
} from '../../hooks/useAdmin'

const { data, isLoading, refetch } = useAdminTagsQuery()
const createTag = useCreateTagMutation()
const updateTag = useUpdateTagMutation()
const deleteTag = useDeleteTagMutation()

const dialogVisible = ref(false)
const form = reactive({ id: undefined as number | undefined, name: '' })

function openCreateDialog() {
  form.id = undefined
  form.name = ''
  dialogVisible.value = true
}

function openEditDialog(row: { id: number; name: string }) {
  form.id = row.id
  form.name = row.name
  dialogVisible.value = true
}

async function saveTag() {
  if (!form.name.trim()) {
    ElMessage.warning('请输入标签名称')
    return
  }

  const payload = { name: form.name.trim() }

  if (form.id) {
    await updateTag.mutateAsync({ id: form.id, data: payload })
    ElMessage.success('标签已更新')
  } else {
    await createTag.mutateAsync(payload)
    ElMessage.success('标签已创建')
  }

  dialogVisible.value = false
  await refetch()
}

async function confirmDelete(row: { id: number; name: string }) {
  await ElMessageBox.confirm(`确认删除标签「${row.name}」？`, '删除确认', { type: 'warning' })
  await deleteTag.mutateAsync(row.id)
  ElMessage.success('标签已删除')
  await refetch()
}
</script>

<template>
  <AdminPageShell title="标签管理" description="维护话题标签。">
    <template #actions>
      <el-button type="primary" @click="openCreateDialog">新增标签</el-button>
    </template>

    <el-table v-loading="isLoading" :data="data ?? []" row-key="id">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="名称" />
      <el-table-column label="操作" width="180">
        <template #default="{ row }">
          <el-button text type="primary" @click="openEditDialog(row)">编辑</el-button>
          <el-button text type="danger" :loading="deleteTag.isPending.value" @click="confirmDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑标签' : '新增标签'" width="420px">
      <el-form label-position="top">
        <el-form-item label="名称">
          <el-input v-model="form.name" maxlength="30" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="createTag.isPending.value || updateTag.isPending.value" @click="saveTag">保存</el-button>
      </template>
    </el-dialog>
  </AdminPageShell>
</template>
```

- [ ] **Step 3: Run typecheck**

Run: `pnpm typecheck`

Expected: PASS.

---

## Task 9: Verification and manual UI QA

**Files:**
- No code files unless verification reveals defects.

- [ ] **Step 1: Run typecheck**

Run: `pnpm typecheck`

Expected: PASS.

- [ ] **Step 2: Run production build**

Run: `pnpm build`

Expected: PASS and Vite build output.

- [ ] **Step 3: Start dev server**

Run: `pnpm dev`

Expected: Vite dev server starts successfully.

- [ ] **Step 4: Manual frontend QA**

In browser, verify:
- `/latest` shows topic list with VEX-like density and no unsupported fake controls.
- Empty list state includes “发布第一个话题”.
- Clicking “新建话题” opens `/topics/new`.
- `/topics/new` requires only title and body.
- Topic detail shows main replies and one-level child reply UI.
- Unauthenticated create/reply paths prompt login or registration.
- API error state shows retry, not a blank page.

- [ ] **Step 5: Manual admin QA**

In browser, verify:
- Non-admin access to `/admin` shows no-permission page.
- Admin can open `/admin/users`, filter, and enable/disable users.
- Admin can open `/admin/topics`, filter, and hide/restore topics only.
- Admin can open `/admin/categories`, create/edit/delete with confirmation.
- Admin can open `/admin/tags`, create/edit/delete with confirmation.

---

## Self-Review

Spec coverage:
- Frontend two-column homepage: covered by Task 3.
- Independent `/topics/new`: covered by Task 2.
- Optional category/tags: covered by Tasks 1-2.
- Nested replies: covered by Task 4.
- Empty/unauth/error states: covered by Tasks 3, 4, and 9.
- Admin independent pages and 403: covered by Task 5.
- Users/topics/categories/tags admin scope: covered by Tasks 6-8.
- Unsupported backend features omitted: covered by Tasks 1, 3, and 7.

Placeholder scan:
- No implementation step depends on unspecified future backend endpoints.
- Category/tag pages are described by required operations rather than full pasted SFC code to keep the plan manageable; implementers must use the named hooks exactly.

Type consistency:
- Routes follow file-based router conventions from `CLAUDE.md` and `AGENTS.md`.
- Router navigation uses object-style `router.push({ path: ... })`.
- Admin hooks match `src/hooks/useAdmin.ts` exports.
- Reply child API matches `src/services/replyApi.ts`.
