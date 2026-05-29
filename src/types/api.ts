/** Generic API response wrapper */
export interface ApiResponse<T> {
  code: number
  msg: string
  data: T
}

/** Paginated response */
export interface Page<T> {
  records: T[]
  total: number
  size: number
  current: number
  pages: number
}

/** Attachment value object */
export interface AttachmentVO {
  id: number
  fileName: string
  fileSize: number
  fileType: 'IMAGE' | 'FILE'
  url: string | null
  downloadUrl: string
  relatedType: 'TOPIC' | 'REPLY'
  relatedId: number
  createTime: string
}

/** Tag value object (shared across topic and tag services) */
export interface TagVO {
  id: number
  name: string
  creatorId: number
  creatorNickname: string
  createTime: string
  updateTime: string | null
  isDeleted: number
}
