import type { Question } from '../types/question'
import type { SubjectiveScore } from '../types/subjective'

export function normalizeAnswer(text: string): string {
  return text.normalize('NFKC').toLowerCase().replace(/\s+/gu, '')
}

// 简单否定保护，防止“不能保证线程安全”被当成“保证线程安全”。不声称能理解语义。
function assertsKeyword(text: string, keyword: string): boolean {
  const normalized = normalizeAnswer(keyword)
  if (!normalized) return false
  let offset = text.indexOf(normalized)
  while (offset !== -1) {
    const prefix = text.slice(Math.max(0, offset - 16), offset)
    if (!/(?:不能|并不|无法|不会|不|并非|不是|not|never|cannot|can't|doesn't)(?:一定|完全|自动|直接|必然|能够|能|can|always|fully)?$/u.test(prefix)) return true
    offset = text.indexOf(normalized, offset + 1)
  }
  return false
}

export function scoreSubjectiveAnswer(question: Question, answer: string): SubjectiveScore {
  const evaluation = question.subjectiveEvaluation
  const keyPoints = evaluation?.keyPoints.filter(point => point.weight > 0) ?? []
  const totalWeight = keyPoints.reduce((total, point) => total + point.weight, 0)
  if (!totalWeight) return { score: null, matchedKeyPoints: [], missedKeyPoints: [], detectedMisconceptions: [] }
  const text = normalizeAnswer(answer)
  const matchedKeyPoints = keyPoints.filter(point => point.keywords.some(keyword => {
    const normalized = normalizeAnswer(keyword)
    return normalized.length > 0 && text.includes(normalized)
  }))
  const missedKeyPoints = keyPoints.filter(point => !matchedKeyPoints.includes(point))
  const detectedMisconceptions = (evaluation?.misconceptions ?? []).filter(misconception => misconception.keywords.some(keyword => assertsKeyword(text, keyword)))
  const matchedWeight = matchedKeyPoints.reduce((sum, point) => sum + point.weight, 0)
  const penalty = detectedMisconceptions.reduce((sum, misconception) => sum + Math.max(0, misconception.penalty), 0)
  return { score: Math.max(0, Math.min(100, Math.round(matchedWeight / totalWeight * 100 - penalty))), matchedKeyPoints, missedKeyPoints, detectedMisconceptions }
}
