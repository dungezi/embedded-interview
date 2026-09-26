import type { Question } from './question'

export interface AnswerRecord {
  questionId: number
  answer: Question['answer']
  correct: boolean
  answeredAt: string
}

export interface StudyData {
  records: AnswerRecord[]
  wrongIds: number[]
  favoriteIds: number[]
}
