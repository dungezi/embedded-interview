import type { Question } from './question'

export interface AnswerRecord {
  questionId: number
  answer: Question['answer']
  correct: boolean
  /** 缺省表示旧版本的自动判分记录。 */
  outcome?: 'correct' | 'incorrect' | 'unknown' | 'mastered' | 'unmastered'
  answeredAt: string
}

export interface StudyData {
  records: AnswerRecord[]
  wrongIds: number[]
  favoriteIds: number[]
}
