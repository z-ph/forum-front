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

/** Tag value object (shared across topic and tag services) */
export interface TagVO {
  id: number
  name: string
  creatorId: number
  creatorNickname: string
  createTime: string
  updateTime: string
  isDeleted: number
}
