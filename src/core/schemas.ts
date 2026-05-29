import { z, type ZodType } from 'zod'

// ============================================================
// Base VO Schemas — exact runtime mirrors of the TS interfaces
// ============================================================

/** AttachmentVO schema from openapi/attachment.yaml */
export const AttachmentVOSchema = z.object({
  id: z.number(),
  fileName: z.string(),
  fileSize: z.number(),
  fileType: z.enum(['IMAGE', 'FILE']),
  url: z.string(),
  downloadUrl: z.string(),
  relatedType: z.enum(['TOPIC', 'REPLY']),
  relatedId: z.number(),
  createTime: z.string(),
})

/** Shared TagVO schema (used by TopicVO and standalone) */
export const TagVOSchema = z.object({
  id: z.number(),
  name: z.string(),
  creatorId: z.number(),
  creatorNickname: z.string(),
  createTime: z.string(),
  updateTime: z.string().nullable(),
  isDeleted: z.number(),
})

/** TopicVO schema from src/services/topicApi.ts */
export const TopicVOSchema = z.object({
  id: z.number(),
  categoryId: z.number(),
  categoryName: z.string(),
  creatorId: z.number(),
  creatorNickname: z.string(),
  title: z.string(),
  content: z.string(),
  status: z.number(),
  viewCount: z.number(),
  replyCount: z.number(),
  createTime: z.string(),
  updateTime: z.string().nullable(),
  isDeleted: z.number(),
  tags: z.array(TagVOSchema),
  attachments: z.array(AttachmentVOSchema).nullable().optional(),
})

/** ReplyVO schema from src/services/replyApi.ts */
export const ReplyVOSchema = z.object({
  id: z.number(),
  topicId: z.number(),
  creatorId: z.number(),
  creatorNickname: z.string(),
  parentReplyId: z.number(),
  replyToUserId: z.number(),
  replyToUserNickname: z.string(),
  content: z.string(),
  createTime: z.string(),
  updateTime: z.string().nullable(),
  isDeleted: z.number(),
  attachments: z.array(AttachmentVOSchema).nullable().optional(),
})

/** UserVO schema from src/services/userApi.ts */
export const UserVOSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string(),
  nickname: z.string(),
  avatar: z.string(),
  role: z.enum(['USER', 'ADMIN']),
  status: z.number(),
  createTime: z.string(),
  updateTime: z.string().nullable(),
})

/** CategoryVO schema from src/services/categoryApi.ts */
export const CategoryVOSchema = z.object({
  id: z.number(),
  parentId: z.number(),
  name: z.string(),
  description: z.string(),
  creatorId: z.number(),
  creatorNickname: z.string(),
  createTime: z.string(),
  updateTime: z.string().nullable(),
  isDeleted: z.number(),
})

/** CategoryTreeVO — recursive schema using z.lazy() */
export const CategoryTreeVOSchema: z.ZodType<unknown> = z.object({
  id: z.number(),
  parentId: z.number(),
  name: z.string(),
  description: z.string(),
  creatorId: z.number(),
  creatorNickname: z.string(),
  createTime: z.string(),
  updateTime: z.string().nullable(),
  isDeleted: z.number(),
  children: z.array(z.lazy(() => CategoryTreeVOSchema)),
})

// ============================================================
// Generic wrapper helpers
// ============================================================

/**
 * Create an ApiResponse schema for a given data schema.
 * Usage: const schema = apiResponseSchema(TopicVOSchema)
 */
export function apiResponseSchema<T extends ZodType>(dataSchema: T) {
  return z.object({
    code: z.number(),
    msg: z.string(),
    data: dataSchema,
  })
}

/**
 * Create a Page schema for a given item schema.
 * Usage: const schema = pageSchema(TopicVOSchema)
 */
export function pageSchema<T extends ZodType>(itemSchema: T) {
  return z.object({
    records: z.array(itemSchema),
    total: z.number(),
    size: z.number(),
    current: z.number(),
    pages: z.number(),
  })
}

// ============================================================
// Validation alerting system
// ============================================================

export interface ValidationReport {
  schema: string
  issues: string[]
  data: unknown
  timestamp: number
}

/** Per-schema failure counter for diagnostics */
const failureCounts = new Map<string, number>()

/** External reporter callback — configure via configureValidationReporter */
let externalReporter: ((report: ValidationReport) => void) | null = null

/**
 * Configure a custom reporter for validation failures.
 * Called for every failed validation. Use for HTTP telemetry, logging, etc.
 */
export function configureValidationReporter(fn: (report: ValidationReport) => void): void {
  externalReporter = fn
}

/** Get current failure statistics per schema */
export function getValidationStats(): Record<string, number> {
  return Object.fromEntries(failureCounts)
}

/** Internal: report a validation failure through all channels */
function reportFailure(schema: string, data: unknown, issues: { path: string; message: string }[]) {
  // Track count
  failureCounts.set(schema, (failureCounts.get(schema) ?? 0) + 1)

  const report: ValidationReport = {
    schema,
    issues: issues.map((i) => i.message),
    data,
    timestamp: Date.now(),
  }

  // Always log to console with structured format
  const count = failureCounts.get(schema) ?? 0
  console.warn(
    `[Validation] %c${schema}%c failed (x${count})`,
    'font-weight:bold;color:#e74c3c',
    'font-weight:normal',
    `\n  Issues: ${report.issues.join('; ')}`,
  )

  // Call external reporter (HTTP telemetry, etc.)
  externalReporter?.(report)
}

// ============================================================
// Validation helpers
// ============================================================

/**
 * Parse and validate data against a Zod schema at runtime.
 * Throws on failure — use for critical data paths.
 */
export function validateWithSchema<T>(schema: ZodType<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data)
  if (!result.success) {
    const issues = result.error.issues.map((i) => ({
      path: i.path.join('.'),
      message: i.message,
    }))
    reportFailure(label, data, issues)
    throw new Error(`Data validation failed for ${label}: ${issues.map((i) => i.message).join('; ')}`)
  }
  return result.data
}

/**
 * Non-throwing variant — returns null on mismatch.
 * Use in adapter functions for graceful degradation.
 */
export function tryValidate<T>(schema: ZodType<T>, data: unknown, label: string): T | null {
  const result = schema.safeParse(data)
  if (!result.success) {
    const issues = result.error.issues.map((i) => ({
      path: i.path.join('.'),
      message: i.message,
    }))
    reportFailure(label, data, issues)
    return null
  }
  return result.data
}
