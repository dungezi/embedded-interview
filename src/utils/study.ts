import type { AnswerRecord, SelfAssessment, StudyData } from '../types/study'
import type { Question } from '../types/question'
import { isSubjectiveQuestion } from './questions'

export function getRecordDisposition(record: AnswerRecord): { inWrongBook: boolean; inReview: boolean } {
  if (record.kind !== 'subjective') return { inWrongBook: !record.correct, inReview: false }
  const score = record.subjectiveScore?.score ?? null
  return {
    inWrongBook: (score !== null && score < 60) || record.selfAssessment === 'unknown',
    inReview: record.selfAssessment === 'partial' || (score === null && record.selfAssessment == null),
  }
}

/** 后续自评替换本次提交；重练追加历史，并按最新结果更新错题/待复习集合。 */
export function applyAnswerRecord(data: StudyData, record: AnswerRecord): StudyData {
  const disposition = getRecordDisposition(record)
  const saved = { ...record, ...disposition }
  const existingIndex = record.attemptId ? data.records.findIndex(item => item.attemptId === record.attemptId) : -1
  const records = [...data.records]
  if (existingIndex === -1) records.push(saved)
  else records[existingIndex] = saved
  const wrongIds = data.wrongIds.filter(id => id !== record.questionId)
  const reviewIds = (data.reviewIds ?? []).filter(id => id !== record.questionId)
  if (disposition.inWrongBook) wrongIds.push(record.questionId)
  if (disposition.inReview) reviewIds.push(record.questionId)
  return { ...data, records, wrongIds, reviewIds }
}

function assessmentOf(record: AnswerRecord): SelfAssessment {
  if (record.selfAssessment !== undefined) return record.selfAssessment
  if (record.outcome === 'mastered') return 'mastered'
  if (record.outcome === 'unmastered' || record.outcome === 'unknown') return 'unknown'
  return null
}

export function getStudyStatistics(records: AnswerRecord[], questions: Question[]) {
  const byId = new Map(questions.map(question => [question.id, question]))
  const valid = records.filter(record => byId.has(record.questionId))
  const subjective = valid.filter(record => record.kind === 'subjective' || isSubjectiveQuestion(byId.get(record.questionId)!))
  const objective = valid.filter(record => !subjective.includes(record))
  const latest = new Map<number, AnswerRecord>()
  for (const record of subjective) latest.set(record.questionId, record)
  const latestSubjective = [...latest.values()]
  const scored = latestSubjective.filter(record => typeof record.subjectiveScore?.score === 'number')
  return {
    completed: new Set(valid.map(record => record.questionId)).size,
    objectiveCompleted: new Set(objective.map(record => record.questionId)).size,
    objectiveAttempts: objective.length,
    objectiveAccuracy: objective.length ? Math.round(objective.filter(record => record.correct).length / objective.length * 100) : null,
    subjectiveCompleted: latestSubjective.length,
    scoredSubjective: scored.length,
    subjectiveAverage: scored.length ? Math.round(scored.reduce((sum, record) => sum + record.subjectiveScore!.score!, 0) / scored.length) : null,
    mastered: latestSubjective.filter(record => assessmentOf(record) === 'mastered').length,
    partial: latestSubjective.filter(record => assessmentOf(record) === 'partial').length,
    unknown: latestSubjective.filter(record => assessmentOf(record) === 'unknown').length,
    skipped: latestSubjective.filter(record => assessmentOf(record) === null).length,
  }
}
