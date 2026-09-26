import type { StudyData } from '../types/study'
import { normalizeStudyData } from './storage'

export const BACKUP_SCHEMA_VERSION = 1

export interface LearningBackup {
  schemaVersion: typeof BACKUP_SCHEMA_VERSION
  exportedAt: string
  data: StudyData
}

function validateIdentifiers(data: StudyData) {
  const ids = [...data.wrongIds, ...data.reviewIds, ...data.favoriteIds, ...data.records.map(record => record.questionId)]
  if (!ids.every(id => Number.isSafeInteger(id) && id > 0)) throw new Error('题目 ID 必须是正整数。')
  if (!data.records.every(record => Number.isFinite(Date.parse(record.answeredAt)))) throw new Error('作答时间格式不合法。')
  const attempts = data.records.flatMap(record => record.attemptId === undefined ? [] : [record.attemptId])
  if (attempts.some(id => !id.trim()) || new Set(attempts).size !== attempts.length) throw new Error('作答标识为空或重复。')
}

export function createLearningBackup(data: StudyData, now = new Date()): LearningBackup {
  const normalized = normalizeStudyData(data)
  validateIdentifiers(normalized)
  return { schemaVersion: BACKUP_SCHEMA_VERSION, exportedAt: now.toISOString(), data: normalized }
}

export function parseLearningBackup(text: string): LearningBackup {
  let value: unknown
  try { value = JSON.parse(text) }
  catch { throw new Error('文件不是有效的 JSON，当前数据未修改。') }
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('备份必须是 JSON 对象。')
  const backup = value as Partial<LearningBackup>
  if (backup.schemaVersion !== BACKUP_SCHEMA_VERSION) throw new Error(`不支持此备份版本，当前仅支持 schemaVersion ${BACKUP_SCHEMA_VERSION}。`)
  if (typeof backup.exportedAt !== 'string' || !Number.isFinite(Date.parse(backup.exportedAt))) throw new Error('备份缺少有效的 exportedAt。')
  if (!backup.data || !Array.isArray(backup.data.reviewIds)) throw new Error('备份缺少学习数据或待复习列表。')
  const data = normalizeStudyData(backup.data)
  validateIdentifiers(data)
  return { schemaVersion: BACKUP_SCHEMA_VERSION, exportedAt: backup.exportedAt, data }
}

export function downloadLearningBackup(data: StudyData, now = new Date()): string {
  const backup = createLearningBackup(data, now)
  const filename = `embedded-interview-backup-${backup.exportedAt.slice(0, 10)}.json`
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  try { anchor.click() }
  finally { anchor.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000) }
  return filename
}

/** 所有验证发生在确认与写入之前；取消不调用保存接口。 */
export function importLearningBackup(text: string, confirm: (backup: LearningBackup) => boolean, replace: (data: StudyData) => string): boolean {
  const backup = parseLearningBackup(text)
  if (!confirm(backup)) return false
  const error = replace(backup.data)
  if (error) throw new Error(error)
  return true
}
