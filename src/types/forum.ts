export interface ForumUser {
  id: string
  name: string
  handle: string
  title: string
  role: 'admin' | 'member'
  avatar: string
  bio?: string
}

export interface ForumCategory {
  id: string
  name: string
  slug: string
  description: string
  accent: string
  topicCount: number
}

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

export type ForumTopicFeed = 'categories' | 'latest'

export interface ForumTopicDetail extends ForumTopic {
  replies: ForumReply[]
}

export interface AuthPayload {
  username: string
  password: string
}

export interface RegisterPayload extends AuthPayload {
  nickname: string
  email: string
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

export interface ForumHomeData {
  me: ForumUser | null
  categories: ForumCategory[]
  availableTags: string[]
  topics: ForumTopic[]
}