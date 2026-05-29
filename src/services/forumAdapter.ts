import { getRichTextPreview } from '../core/richText'
import { TopicVOSchema, ReplyVOSchema, UserVOSchema, CategoryVOSchema, tryValidate } from '../core/schemas'
import type { ForumUser, ForumCategory, ForumTopic, ForumTopicDetail, ForumReply } from '../types/forum'
import type { UserVO } from './userApi'
import type { TopicVO } from './topicApi'
import type { ReplyVO } from './replyApi'
import type { CategoryVO } from './categoryApi'

const CATEGORY_PALETTE = ['#2764ff', '#ff7b30', '#0f9d6c', '#7b61ff', '#cf4e8a', '#b88822']

function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-\u4e00-\u9fa5]/g, '')
}

function diceBearAvatar(seed: string): string {
  return `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(seed)}`
}

/** Convert an API UserVO to the UI ForumUser shape. */
export function toForumUser(vo: UserVO): ForumUser {
  const validated = tryValidate(UserVOSchema, vo, 'UserVO')
  if (!validated) {
    return {
      id: String(vo.id ?? 0),
      name: vo.nickname ?? '',
      handle: vo.username ?? '',
      title: '社区成员',
      role: 'member',
      avatar: vo.avatar || diceBearAvatar(vo.username ?? 'unknown'),
    }
  }
  return {
    id: String(validated.id),
    name: validated.nickname,
    handle: validated.username,
    title: validated.role === 'ADMIN' ? '管理员' : '社区成员',
    role: validated.role === 'ADMIN' ? 'admin' : 'member',
    avatar: validated.avatar || diceBearAvatar(validated.username),
  }
}

/** Build a minimal ForumUser from the flat creator fields returned by topic/reply endpoints. */
export function toForumUserFromCreator(creatorId: number, creatorNickname: string): ForumUser {
  return {
    id: String(creatorId),
    name: creatorNickname,
    handle: creatorNickname,
    title: '社区成员',
    role: 'member',
    avatar: diceBearAvatar(creatorNickname),
  }
}

/** Convert an API CategoryVO to the UI ForumCategory shape. */
export function toForumCategory(vo: CategoryVO, topicCount = 0): ForumCategory {
  const validated = tryValidate(CategoryVOSchema, vo, 'CategoryVO')
  if (!validated) {
    const fallbackId = vo.id ?? 0
    const colorIndex = (fallbackId - 1) % CATEGORY_PALETTE.length
    return {
      id: String(fallbackId),
      name: vo.name ?? '',
      slug: slugify(vo.name ?? ''),
      description: vo.description || '',
      accent: CATEGORY_PALETTE[colorIndex],
      topicCount,
    }
  }
  const colorIndex = (validated.id - 1) % CATEGORY_PALETTE.length
  return {
    id: String(validated.id),
    name: validated.name,
    slug: slugify(validated.name),
    description: validated.description || '',
    accent: CATEGORY_PALETTE[colorIndex],
    topicCount,
  }
}

/**
 * Convert an API TopicVO to the UI ForumTopic shape.
 * Uses the provided userMap to resolve author details; falls back to creator fields
 * when the user is not in the map.
 */
export function toForumTopic(vo: TopicVO, userMap: Map<number, ForumUser>): ForumTopic {
  const validated = tryValidate(TopicVOSchema, vo, 'TopicVO')
  if (!validated) {
    const author =
      userMap.get(vo.creatorId) ?? toForumUserFromCreator(vo.creatorId ?? 0, vo.creatorNickname ?? '')
    return {
      id: String(vo.id ?? 0),
      title: vo.title ?? '',
      content: vo.content ?? '',
      categoryId: String(vo.categoryId ?? 0),
      categoryName: vo.categoryName ?? '',
      author,
      createdAt: vo.createTime ?? '',
      updatedAt: vo.updateTime ?? null,
      views: vo.viewCount ?? 0,
      repliesCount: vo.replyCount ?? 0,
      tags: [],
      preview: '',
    }
  }
  const author =
    userMap.get(validated.creatorId) ?? toForumUserFromCreator(validated.creatorId, validated.creatorNickname)

  return {
    id: String(validated.id),
    title: validated.title,
    content: validated.content,
    categoryId: String(validated.categoryId),
    categoryName: validated.categoryName,
    author,
    createdAt: validated.createTime ?? '',
    updatedAt: validated.updateTime,
    views: validated.viewCount,
    repliesCount: validated.replyCount,
    tags: (validated.tags ?? []).map((t) => t.name),
    preview: getRichTextPreview(validated.content),
  }
}

/** Convert an API ReplyVO to the UI ForumReply shape. */
export function toForumReply(vo: ReplyVO, userMap: Map<number, ForumUser>): ForumReply {
  const validated = tryValidate(ReplyVOSchema, vo, 'ReplyVO')
  if (!validated) {
    const author =
      userMap.get(vo.creatorId) ?? toForumUserFromCreator(vo.creatorId ?? 0, vo.creatorNickname ?? '')
    return {
      id: String(vo.id ?? 0),
      author,
      content: vo.content ?? '',
      createdAt: vo.createTime ?? '',
      parentReplyId: vo.parentReplyId ? String(vo.parentReplyId) : undefined,
      replyToUserId: vo.replyToUserId ? String(vo.replyToUserId) : undefined,
      replyToUserNickname: vo.replyToUserNickname || undefined,
      children: [],
    }
  }
  const author =
    userMap.get(validated.creatorId) ?? toForumUserFromCreator(validated.creatorId, validated.creatorNickname)

  return {
    id: String(validated.id),
    author,
    content: validated.content,
    createdAt: validated.createTime,
    parentReplyId: validated.parentReplyId ? String(validated.parentReplyId) : undefined,
    replyToUserId: validated.replyToUserId ? String(validated.replyToUserId) : undefined,
    replyToUserNickname: validated.replyToUserNickname || undefined,
    children: [],
  }
}

/** Assemble a ForumTopicDetail from a TopicVO and a (possibly empty) list of ForumReply items. */
export function toForumTopicDetail(
  topicVO: TopicVO,
  userMap: Map<number, ForumUser>,
  replies: ForumReply[],
): ForumTopicDetail {
  return {
    ...toForumTopic(topicVO, userMap),
    replies,
  }
}

/**
 * Populate a user map from a list of UserVO records, then supplement it with
 * topic creators so we can render author info without an extra API call.
 */
export function buildUserMap(
  users: UserVO[],
  topics: TopicVO[],
): Map<number, ForumUser> {
  const map = new Map<number, ForumUser>()

  for (const u of users) {
    const validated = tryValidate(UserVOSchema, u, 'UserVO') ?? u
    map.set(validated.id, toForumUser(validated))
  }

  for (const t of topics) {
    if (!map.has(t.creatorId)) {
      map.set(t.creatorId, toForumUserFromCreator(t.creatorId, t.creatorNickname))
    }
  }

  return map
}

/**
 * Populate a user map from ReplyVO records (used when fetching replies for a detail page).
 */
export function extendUserMapFromReplies(
  map: Map<number, ForumUser>,
  replies: ReplyVO[],
): void {
  for (const r of replies) {
    if (!map.has(r.creatorId)) {
      const validated = tryValidate(ReplyVOSchema, r, 'ReplyVO') ?? r
      map.set(validated.creatorId, toForumUserFromCreator(validated.creatorId, validated.creatorNickname))
    }
  }
}
