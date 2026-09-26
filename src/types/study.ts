import type { Question } from './question'
import type { SubjectiveScore } from './subjective'

export type SelfAssessment = 'mastered' | 'partial' | 'unknown' | null

export interface AnswerRecord {
  questionId: number
  answer: Question['answer']
  /** 仅客观题用此字段计算正确率；主观题保留 false 兼容旧格式。 */
  correct: boolean
  outcome?: 'correct' | 'incorrect' | 'unknown' | 'mastered' | 'unmastered'
  answeredAt: string
  /** 一次提交与后续自评共享 ID，重练产生新的 ID。 */
  attemptId?: string
  kind?: 'objective' | 'subjective'
  subjectiveScore?: SubjectiveScore
  selfAssessment?: SelfAssessment
  inWrongBook?: boolean
  inReview?: boolean
}

export interface StudyData {
  records: AnswerRecord[]
  wrongIds: number[]
  favoriteIds: number[]
  /** 旧格式缺省时归一化为空数组。 */
  reviewIds: number[]
}
