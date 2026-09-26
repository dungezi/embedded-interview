import type { AnswerRecord, StudyData } from '../types/study'
import type { KeyPoint, Misconception } from '../types/question'
import type { SubjectiveScore } from '../types/subjective'

export const STORAGE_KEY = 'embedded-interview:study:v1'
export const emptyStudyData = (): StudyData => ({ records: [], wrongIds: [], favoriteIds: [], reviewIds: [] })

function isIds(value: unknown): value is number[] {
  return Array.isArray(value) && value.every(id => Number.isInteger(id))
}

function isPoint(value: unknown): value is KeyPoint {
  if (!value || typeof value !== 'object') return false
  const point = value as Partial<KeyPoint>
  return typeof point.id === 'string' && typeof point.description === 'string'
    && typeof point.weight === 'number' && Number.isFinite(point.weight) && point.weight > 0
    && Array.isArray(point.keywords) && point.keywords.every(keyword => typeof keyword === 'string')
}

function isMisconception(value: unknown): value is Misconception {
  if (!value || typeof value !== 'object') return false
  const item = value as Partial<Misconception>
  return typeof item.id === 'string' && typeof item.message === 'string'
    && typeof item.penalty === 'number' && Number.isFinite(item.penalty) && item.penalty >= 0
    && Array.isArray(item.keywords) && item.keywords.every(keyword => typeof keyword === 'string')
}

function isScore(value: unknown): value is SubjectiveScore {
  if (!value || typeof value !== 'object') return false
  const score = value as Partial<SubjectiveScore>
  return (score.score === null || (typeof score.score === 'number' && Number.isFinite(score.score) && score.score >= 0 && score.score <= 100))
    && Array.isArray(score.matchedKeyPoints) && score.matchedKeyPoints.every(isPoint)
    && Array.isArray(score.missedKeyPoints) && score.missedKeyPoints.every(isPoint)
    && Array.isArray(score.detectedMisconceptions) && score.detectedMisconceptions.every(isMisconception)
}

function isRecord(value: unknown): value is AnswerRecord {
  if (!value || typeof value !== 'object') return false
  const record = value as Partial<AnswerRecord>
  return Number.isInteger(record.questionId) && typeof record.correct === 'boolean'
    && typeof record.answeredAt === 'string'
    && (record.outcome === undefined || ['correct', 'incorrect', 'unknown', 'mastered', 'unmastered'].includes(record.outcome))
    && (record.kind === undefined || record.kind === 'subjective' || record.kind === 'objective')
    && (record.attemptId === undefined || typeof record.attemptId === 'string')
    && (record.selfAssessment === undefined || record.selfAssessment === null || ['mastered', 'partial', 'unknown'].includes(record.selfAssessment))
    && (record.subjectiveScore === undefined || isScore(record.subjectiveScore))
    && (record.inWrongBook === undefined || typeof record.inWrongBook === 'boolean')
    && (record.inReview === undefined || typeof record.inReview === 'boolean')
    && (typeof record.answer === 'string' || typeof record.answer === 'boolean'
      || (Array.isArray(record.answer) && record.answer.every(id => typeof id === 'string')))
}

/** 存储与备份共用归一化；旧格式缺省 reviewIds，新记录字段保持可选。 */
export function normalizeStudyData(value: unknown): StudyData {
  if (!value || typeof value !== 'object') throw new Error('学习数据必须是对象。')
  const data = value as Partial<StudyData>
  if (!Array.isArray(data.records) || !data.records.every(isRecord)
    || !isIds(data.wrongIds) || !isIds(data.favoriteIds)
    || (data.reviewIds !== undefined && !isIds(data.reviewIds))) throw new Error('学习记录或错题、待复习、收藏字段格式不合法。')
  const records = data.records.map(record => ({
    questionId: record.questionId, answer: Array.isArray(record.answer) ? [...record.answer] : record.answer,
    correct: record.correct, answeredAt: record.answeredAt,
    ...(record.outcome !== undefined ? { outcome: record.outcome } : {}),
    ...(record.kind !== undefined ? { kind: record.kind } : {}),
    ...(record.attemptId !== undefined ? { attemptId: record.attemptId } : {}),
    ...(record.selfAssessment !== undefined ? { selfAssessment: record.selfAssessment } : {}),
    ...(record.inWrongBook !== undefined ? { inWrongBook: record.inWrongBook } : {}),
    ...(record.inReview !== undefined ? { inReview: record.inReview } : {}),
    ...(record.subjectiveScore ? { subjectiveScore: {
      score: record.subjectiveScore.score,
      matchedKeyPoints: record.subjectiveScore.matchedKeyPoints.map(point => ({ id: point.id, description: point.description, keywords: [...point.keywords], weight: point.weight })),
      missedKeyPoints: record.subjectiveScore.missedKeyPoints.map(point => ({ id: point.id, description: point.description, keywords: [...point.keywords], weight: point.weight })),
      detectedMisconceptions: record.subjectiveScore.detectedMisconceptions.map(item => ({ id: item.id, keywords: [...item.keywords], message: item.message, penalty: item.penalty })),
    } } : {}),
  }))
  return { records, wrongIds: [...new Set(data.wrongIds)], favoriteIds: [...new Set(data.favoriteIds)], reviewIds: [...new Set(data.reviewIds ?? [])] }
}

export function loadStudyData(): { data: StudyData; error: string } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return { data: raw ? normalizeStudyData(JSON.parse(raw)) : emptyStudyData(), error: '' }
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

export function clearStudyData(): string {
  try {
    localStorage.removeItem(STORAGE_KEY)
    return ''
  } catch {
    return '清空失败，学习数据仍保留，请检查浏览器存储权限后重试。'
  }
}
