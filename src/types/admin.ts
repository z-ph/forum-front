import type { UserPageQuery } from '../services/userApi'
import type { AdminTopicPageQuery } from '../services/topicApi'

/** Admin user list query — extends UserPageQuery with search/filter fields */
export interface AdminUserQuery extends UserPageQuery {
  keyword?: string
  role?: string
}

/** Admin topic list query — uses AdminTopicPageQuery from backend */
export interface AdminTopicQuery extends AdminTopicPageQuery {
  keyword?: string
}

/** Admin category create/edit form */
export interface AdminCategoryForm {
  id?: number
  parentId: number
  name: string
  description: string
}

/** Admin tag create/edit form */
export interface AdminTagForm {
  id?: number
  name: string
}
