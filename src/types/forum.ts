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
  likes: number
  isSolution?: boolean
}

export interface ForumTopic {
  id: string
  title: string
  content: string
  categoryId: string
  categoryName: string
  author: ForumUser
  createdAt: string
  updatedAt: string
  views: number
  likes: number
  repliesCount: number
  tags: string[]
  pinned?: boolean
  solved?: boolean
  preview: string
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
}

export interface CreateTopicPayload {
  title: string
  content: string
  categoryId: string
  tags: string[]
}

export interface CreateReplyPayload {
  topicId: string
  content: string
}

export interface ForumHomeData {
  me: ForumUser | null
  categories: ForumCategory[]
  availableTags: string[]
  topics: ForumTopic[]
}
