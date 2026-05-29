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
  url: z.string().nullable(),
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
  tags: z.array(TagVOSchema).nullable(),
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

/** Single validation issue with full field-level context */
export interface ValidationIssue {
  /** Dot-separated field path, e.g. "title", "tags.0.name" */
  path: string
  /** Human-readable error message */
  message: string
  /** Zod error code, e.g. "invalid_type", "too_small" */
  code: string
  /** Expected type (present for invalid_type errors) */
  expected?: string
  /** Received type (present for invalid_type errors) */
  received?: string
}

export interface ValidationReport {
  schema: string
  issues: ValidationIssue[]
  data: unknown
  timestamp: number
}

/** Per-schema failure counter for diagnostics */
const failureCounts = new Map<string, number>()

/** Ring buffer of recent reports (last 200) for export/download */
const MAX_HISTORY = 200
const reportHistory: ValidationReport[] = []

/** External reporter callbacks — configure via addValidationReporter */
const externalReporters: Array<(report: ValidationReport) => void> = []

/**
 * Add a custom reporter for validation failures.
 * Called for every failed validation. Use for toast notifications, HTTP telemetry, logging, etc.
 */
export function addValidationReporter(fn: (report: ValidationReport) => void): void {
  externalReporters.push(fn)
}

/** @deprecated use addValidationReporter instead */
export function configureValidationReporter(fn: (report: ValidationReport) => void): void {
  addValidationReporter(fn)
}

/** Get current failure statistics per schema */
export function getValidationStats(): Record<string, number> {
  return Object.fromEntries(failureCounts)
}

const TOAST_STORAGE_KEY = '__forum_validation_toast_enabled'

/** Whether validation failure toast notifications are enabled */
export function getValidationToastEnabled(): boolean {
  try {
    const stored = localStorage.getItem(TOAST_STORAGE_KEY)
    return stored !== null ? stored === 'true' : true // default: enabled
  } catch { return true }
}

/** Toggle validation failure toast on/off */
export function setValidationToastEnabled(enabled: boolean): void {
  try { localStorage.setItem(TOAST_STORAGE_KEY, String(enabled)) } catch { /* noop */ }
}

/** Get recent validation reports */
export function getValidationReports(): ValidationReport[] {
  return [...reportHistory]
}

/** Download all accumulated validation data as a JSON file */
export function downloadValidationData(): void {
  const data = {
    exportedAt: new Date().toISOString(),
    stats: Object.fromEntries(failureCounts),
    totalFailures: reportHistory.length,
    reports: reportHistory,
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `validation-data-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// Make validation diagnostics accessible from browser console
if (typeof window !== 'undefined') {
  ;(window as unknown as Record<string, unknown>).__forumValidation = {
    stats: getValidationStats,
    reports: getValidationReports,
    download: downloadValidationData,
  }
}

/** Internal: report a validation failure through all channels */
function reportFailure(schema: string, data: unknown, issues: ValidationIssue[]) {
  // Track count
  failureCounts.set(schema, (failureCounts.get(schema) ?? 0) + 1)

  const report: ValidationReport = {
    schema,
    issues,
    data,
    timestamp: Date.now(),
  }

  // Always log to console with structured format
  const count = failureCounts.get(schema) ?? 0
  const issueSummary = issues
    .map((i) => {
      const typeInfo = i.expected ? ` (期望 ${i.expected}, 实际 ${i.received})` : ''
      return `${i.path || '(root)'}: ${i.message}${typeInfo}`
    })
    .join('\n    ')
  console.warn(
    `[Validation] %c${schema}%c failed (x${count})`,
    'font-weight:bold;color:#e74c3c',
    'font-weight:normal',
    `\n  Issues:\n    ${issueSummary}`,
  )

  // Store in ring buffer
  reportHistory.push(report)
  if (reportHistory.length > MAX_HISTORY) {reportHistory.shift()}

  // Call external reporters (toast, HTTP telemetry, etc.)
  for (const reporter of externalReporters) {
    reporter(report)
  }
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
    const issues: ValidationIssue[] = result.error.issues.map((i) => {
      const extra = i as unknown as { expected?: string; received?: string }
      return {
        path: i.path.join('.') || '(root)',
        message: i.message,
        code: i.code,
        expected: extra.expected,
        received: extra.received,
      }
    })
    reportFailure(label, data, issues)
    const fieldDetails = issues
      .map((i) => `${i.path}: ${i.message}`)
      .join('; ')
    throw new Error(`数据校验失败 [${label}]: ${fieldDetails}`)
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
    const issues: ValidationIssue[] = result.error.issues.map((i) => {
      const extra = i as unknown as { expected?: string; received?: string }
      return {
        path: i.path.join('.') || '(root)',
        message: i.message,
        code: i.code,
        expected: extra.expected,
        received: extra.received,
      }
    })
    reportFailure(label, data, issues)
    return null
  }
  return result.data
}
