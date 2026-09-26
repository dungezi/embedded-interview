import type { AnswerRecord, StudyData } from '../types/study'

export const STORAGE_KEY = 'embedded-interview:study:v1'
export const emptyStudyData = (): StudyData => ({ records: [], wrongIds: [], favoriteIds: [] })

function isIds(value: unknown): value is number[] {
  return Array.isArray(value) && value.every(id => Number.isInteger(id))
}

function isRecord(value: unknown): value is AnswerRecord {
  if (!value || typeof value !== 'object') return false
  const record = value as Partial<AnswerRecord>
  return Number.isInteger(record.questionId) && typeof record.correct === 'boolean'
    && typeof record.answeredAt === 'string'
    && (typeof record.answer === 'string' || typeof record.answer === 'boolean'
      || (Array.isArray(record.answer) && record.answer.every(id => typeof id === 'string')))
}

export function loadStudyData(): { data: StudyData; error: string } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { data: emptyStudyData(), error: '' }
    const value: unknown = JSON.parse(raw)
    if (!value || typeof value !== 'object') throw new Error('Invalid data')
    const data = value as Partial<StudyData>
    if (!Array.isArray(data.records) || !data.records.every(isRecord)
      || !isIds(data.wrongIds) || !isIds(data.favoriteIds)) throw new Error('Invalid data')
    return { data: { records: data.records, wrongIds: [...new Set(data.wrongIds)], favoriteIds: [...new Set(data.favoriteIds)] }, error: '' }
  } catch {
    return { data: emptyStudyData(), error: '无法读取本地学习数据，本次将从空记录开始。' }
  }
}

export function saveStudyData(data: StudyData): string {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    return ''
  } catch {
    return '本地保存失败，本次记录仍在当前页面保留，刷新后可能丢失。'
  }
}
