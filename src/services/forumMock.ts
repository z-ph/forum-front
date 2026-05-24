import type {
  AuthPayload,
  CreateReplyPayload,
  CreateTopicPayload,
  ForumCategory,
  ForumHomeData,
  ForumReply,
  ForumTopic,
  ForumTopicDetail,
  ForumUser,
  RegisterPayload,
} from '../types/forum'
import { getRichTextPreview } from '../core/richText'

const wait = (ms = 240) => new Promise((resolve) => setTimeout(resolve, ms))

const users: ForumUser[] = [
  {
    id: 'u1',
    name: '林一舟',
    handle: 'linyizhou',
    title: '社区维护者',
    role: 'admin',
    avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=linyizhou',
  },
  {
    id: 'u2',
    name: '周可',
    handle: 'zhouke',
    title: '硬件爱好者',
    role: 'member',
    avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=zhouke',
  },
  {
    id: 'u3',
    name: '陈未',
    handle: 'chenwei',
    title: '竞赛队教练',
    role: 'member',
    avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=chenwei',
  },
  {
    id: 'u4',
    name: '沈南',
    handle: 'shennan',
    title: '新注册成员',
    role: 'member',
    avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=shennan',
  },
]

const categories: ForumCategory[] = [
  {
    id: 'c1',
    name: '公告发布',
    slug: 'announcements',
    description: '版本更新、活动说明与社区规则在这里统一发布。',
    accent: '#2764ff',
    topicCount: 0,
  },
  {
    id: 'c2',
    name: '通用讨论',
    slug: 'general',
    description: '一般交流、经验分享和非问题型讨论集中在这里。',
    accent: '#ff7b30',
    topicCount: 0,
  },
  {
    id: 'c3',
    name: '硬件问答',
    slug: 'hardware',
    description: '主控、接口、供电、连线与设备兼容问题。',
    accent: '#0f9d6c',
    topicCount: 0,
  },
  {
    id: 'c4',
    name: '软件开发',
    slug: 'software',
    description: '编程、调试、目录结构、工具链和前端实现。',
    accent: '#7b61ff',
    topicCount: 0,
  },
]

let currentUser: ForumUser | null = users[3]

let topics: ForumTopicDetail[] = [
  {
    id: 't1',
    title: '欢迎来到新论坛：这里先约定几个发帖习惯',
    content:
      '这是一个面向真实社区论坛体验的静态原型。\n\n- 发帖前先选择最匹配的分类\n- 标题尽量写清楚问题场景\n- 回复时优先补充有效信息，而不是简单顶帖',
    categoryId: 'c1',
    categoryName: '公告发布',
    author: users[0],
    createdAt: '2026-05-14 09:20',
    updatedAt: '2026-05-15 08:40',
    views: 320,
    likes: 28,
    repliesCount: 2,
    tags: ['公告', '规则'],
    pinned: true,
    solved: false,
    preview: '发帖前先选择最匹配的分类，标题尽量写清楚问题场景。',
    replies: [
      {
        id: 'r1',
        author: users[2],
        content: '建议把“如何提问”拆成固定模版，新用户更容易上手。',
        createdAt: '2026-05-14 11:10',
        likes: 6,
      },
      {
        id: 'r2',
        author: users[0],
        content: '已记录，后续会补一版标准提问模版。',
        createdAt: '2026-05-14 13:05',
        likes: 9,
      },
    ],
  },
  {
    id: 't2',
    title: '主控连接后无法识别串口，排查顺序怎么做更稳？',
    content:
      '当前现象是设备管理器偶尔闪现端口，但很快消失。\n\n已经换过数据线，怀疑是驱动或者供电问题，想整理一个新手也能照着走的排查顺序。',
    categoryId: 'c3',
    categoryName: '硬件问答',
    author: users[1],
    createdAt: '2026-05-15 08:10',
    updatedAt: '2026-05-15 10:06',
    views: 148,
    likes: 11,
    repliesCount: 3,
    tags: ['主控', '串口', '排障'],
    solved: true,
    preview: '当前现象是设备管理器偶尔闪现端口，但很快消失。',
    replies: [
      {
        id: 'r3',
        author: users[2],
        content:
          '先排电源，再排驱动，最后排板载接口。不要一开始就怀疑线材，优先确认系统层有没有稳定识别记录。',
        createdAt: '2026-05-15 09:00',
        likes: 5,
      },
      {
        id: 'r4',
        author: users[0],
        content:
          '建议顺序：换 USB 口 -> 查看设备管理器 -> 卸载残留驱动 -> 重新上电 -> 最后再换主控。这样最省时间。',
        createdAt: '2026-05-15 09:18',
        likes: 12,
        isSolution: true,
      },
      {
        id: 'r5',
        author: users[1],
        content: '按这个顺序排掉后，确实是驱动残留问题，已解决。',
        createdAt: '2026-05-15 10:06',
        likes: 7,
      },
    ],
  },
  {
    id: 't3',
    title: '有没有适合新手的项目结构示例，最好能分清页面、hooks 和服务层',
    content:
      '准备把一个简单论坛前端先搭起来，想确认目录结构应该怎么分，尤其是页面、组件、mock hooks 和服务的职责边界。',
    categoryId: 'c4',
    categoryName: '软件开发',
    author: users[2],
    createdAt: '2026-05-14 16:30',
    updatedAt: '2026-05-15 09:00',
    views: 214,
    likes: 19,
    repliesCount: 2,
    tags: ['vue', 'tanstack-query', '目录结构'],
    preview: '准备把一个简单论坛前端先搭起来，想确认目录结构应该怎么分。',
    replies: [
      {
        id: 'r6',
        author: users[0],
        content:
          '先按 pages、components、hooks、services、types 分层是合理的。mock 阶段把副作用收敛在 hooks 和 services，后续接真接口时替换成本最低。',
        createdAt: '2026-05-14 18:20',
        likes: 10,
      },
      {
        id: 'r7',
        author: users[3],
        content: '如果需要，我可以补一个最小论坛脚手架示例。',
        createdAt: '2026-05-15 09:00',
        likes: 8,
      },
    ],
  },
]

function toListItem(topic: ForumTopicDetail): ForumTopic {
  return {
    ...topic,
    repliesCount: topic.replies.length,
  }
}

function getAvailableTags() {
  return [...new Set(topics.flatMap((topic) => topic.tags))].sort((a, b) => a.localeCompare(b))
}

function slugifyCategoryName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-\u4e00-\u9fa5]/g, '')
}

function getNextCategoryAccent() {
  const palette = ['#2764ff', '#ff7b30', '#0f9d6c', '#7b61ff', '#cf4e8a', '#b88822']
  return palette[categories.length % palette.length]
}

export async function getForumHome(): Promise<ForumHomeData> {
  await wait()

  return {
    me: currentUser,
    categories: categories.map((category) => ({
      ...category,
      topicCount: topics.filter((topic) => topic.categoryId === category.id).length,
    })),
    availableTags: getAvailableTags(),
    topics: topics.map(toListItem).sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned)),
  }
}

export async function getTopicDetail(topicId: string): Promise<ForumTopicDetail> {
  await wait()
  const topic = topics.find((item) => item.id === topicId)

  if (!topic) {
    throw new Error('话题不存在')
  }

  topic.views += 1
  return structuredClone(topic)
}

export async function login(payload: AuthPayload): Promise<ForumUser> {
  await wait()

  const normalizedHandle = payload.username.trim().toLowerCase()
  const existingUser = users.find((user) => user.handle === normalizedHandle)

  currentUser = existingUser ?? {
    id: `u-${normalizedHandle}`,
    name: payload.username,
    handle: normalizedHandle,
    title: '活跃成员',
    role: 'member',
    avatar: `https://api.dicebear.com/9.x/thumbs/svg?seed=${payload.username}`,
  }

  if (!existingUser) {
    users.push(currentUser)
  }

  return currentUser
}

export async function register(payload: RegisterPayload): Promise<ForumUser> {
  await wait()

  const normalizedHandle = payload.username.trim().toLowerCase()
  currentUser = {
    id: `u-${normalizedHandle}`,
    name: payload.nickname,
    handle: normalizedHandle,
    title: '新注册成员',
    role: 'member',
    avatar: `https://api.dicebear.com/9.x/thumbs/svg?seed=${payload.username}`,
  }

  users.push(currentUser)
  return currentUser
}

export async function logout() {
  await wait(120)
  currentUser = null
}

export async function createTopic(payload: CreateTopicPayload): Promise<ForumTopicDetail> {
  await wait()

  if (!currentUser) {
    throw new Error('请先登录')
  }

  const isAdmin = currentUser.role === 'admin'
  const categoryValue = payload.categoryId.trim()

  if (!categoryValue) {
    throw new Error('请选择分类')
  }

  let category = categories.find((item) => item.id === categoryValue)
  if (!category) {
    if (!isAdmin) {
      throw new Error('普通用户只能选择现有分类')
    }

    category = {
      id: `c${categories.length + 1}`,
      name: categoryValue,
      slug: slugifyCategoryName(categoryValue),
      description: `${categoryValue} 相关讨论`,
      accent: getNextCategoryAccent(),
      topicCount: 0,
    }
    categories.push(category)
  }

  const normalizedTags = [...new Set(payload.tags.map((tag) => tag.trim()).filter(Boolean))]
  if (!isAdmin) {
    const availableTags = getAvailableTags()
    const invalidTags = normalizedTags.filter((tag) => !availableTags.includes(tag))
    if (invalidTags.length) {
      throw new Error('普通用户只能选择现有标签')
    }
  }

  const now = new Date().toLocaleString('sv-SE').replace('T', ' ')
  const topic: ForumTopicDetail = {
    id: `t${topics.length + 1}`,
    title: payload.title,
    content: payload.content,
    categoryId: category.id,
    categoryName: category.name,
    author: currentUser,
    createdAt: now,
    updatedAt: now,
    views: 1,
    likes: 0,
    repliesCount: 0,
    tags: normalizedTags,
    preview: getRichTextPreview(payload.content),
    replies: [],
  }

  topics = [topic, ...topics]
  return structuredClone(topic)
}

export async function createReply(payload: CreateReplyPayload): Promise<ForumReply> {
  await wait()

  if (!currentUser) {
    throw new Error('请先登录')
  }

  const topic = topics.find((item) => item.id === payload.topicId)

  if (!topic) {
    throw new Error('话题不存在')
  }

  const reply: ForumReply = {
    id: `r-${Date.now()}`,
    author: currentUser,
    content: payload.content,
    createdAt: new Date().toLocaleString('sv-SE').replace('T', ' '),
    likes: 0,
  }

  topic.replies = [...topic.replies, reply]
  topic.repliesCount = topic.replies.length
  topic.updatedAt = reply.createdAt
  topic.preview = getRichTextPreview(payload.content)

  return structuredClone(reply)
}
