import { categories } from '../data/categories'
import type { Difficulty, Question, QuestionType } from '../types/question'

export const difficultyNames = { easy: '简单', medium: '中等', hard: '困难' }
export const typeNames = { single: '单选题', multiple: '多选题', true_false: '判断题', short_answer: '简答题', code: '代码题' }
export const tagNames = Object.fromEntries(categories.flatMap(category => category.tags.map(tag => [tag.id, tag.name])))

export function isPracticeQuestion(question: Question) {
  return question.type in typeNames
}

export function filterQuestions(questions: Question[], tags: string[], difficulty: Difficulty | 'all', types: QuestionType[] = Object.keys(typeNames) as QuestionType[], search: { query?: string; categoryId?: string } = {}) {
  const category = categories.find(item => item.id === search.categoryId)
  const keyword = search.query?.trim().toLocaleLowerCase() ?? ''
  return questions.filter(question => types.includes(question.type)
    && (!search.categoryId || Boolean(category?.tags.some(tag => question.tags.includes(tag.id))))
    && [question.title, ...(question.related ?? []), question.explanation].join('\n').toLocaleLowerCase().includes(keyword)
    && question.tags.some(tag => tags.includes(tag))
    && (difficulty === 'all' || question.difficulty === difficulty))
}

export function checkAnswer(question: Question, answer: Question['answer']) {
  if (question.type === 'multiple') {
    return Array.isArray(answer) && Array.isArray(question.answer)
      && answer.length === question.answer.length
      && new Set(answer).size === answer.length
      && question.answer.every(id => answer.includes(id))
  }
  return question.answer === answer
}

export function formatAnswer(question: Question, answer = question.answer): string {
  if (typeof answer === 'boolean') return answer ? '正确' : '错误'
  const ids = Array.isArray(answer) ? answer : [answer]
  return ids.map(id => {
    const option = question.options?.find(item => item.id === id)
    return option ? `${id}. ${option.text}` : id
  }).join('；')
}

/** Fisher–Yates：保留筛选集合，仅随机化顺序，不修改原题库。 */
export function shuffleQuestions(questions: Question[], random: () => number = Math.random): Question[] {
  const shuffled = [...questions]
  for (let index = shuffled.length - 1; index > 0; index--) {
    const target = Math.floor(random() * (index + 1))
    ;[shuffled[index], shuffled[target]] = [shuffled[target], shuffled[index]]
  }
  return shuffled
}

export function isSubjectiveQuestion(question: Question): boolean {
  return question.type === 'short_answer' || question.type === 'code'
}
