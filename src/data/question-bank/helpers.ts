import type { Difficulty, Question } from '../../types/question'

// 工厂仅统一书写结构；答案、错误原因和知识点均由每道题显式提供。
export function short(id: number, tags: string[], difficulty: Difficulty, title: string, brief: string, detail: string, explanation: string, related: string[]): Question {
  return { id, tags, type: 'short_answer', difficulty, title, answer: `1. 面试简答版\n${brief}\n\n2. 详细解释\n${detail}`, explanation: `${brief}\n\n${explanation}`, related }
}

export function choice(id: number, tags: string[], difficulty: Difficulty, title: string, type: 'single' | 'multiple', answer: string | string[], options: [string, string][], explanation: string, related: string[]): Question {
  return { id, tags, type, difficulty, title, answer, options: options.map(([text, explanation], index) => ({ id: String.fromCharCode(65 + index), text, explanation })), explanation, related }
}

export function judgment(id: number, tags: string[], difficulty: Difficulty, title: string, answer: boolean, explanation: string, related: string[]): Question {
  return { id, tags, type: 'true_false', difficulty, title, answer, explanation, related }
}

export function code(id: number, tags: string[], difficulty: Difficulty, title: string, answer: string, explanation: string, related: string[]): Question {
  return { id, tags, type: 'code', difficulty, title, answer, explanation, related }
}
