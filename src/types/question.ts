export type QuestionType =
  | 'single'
  | 'multiple'
  | 'true_false'
  | 'short_answer'
  | 'code'

export type Difficulty = 'easy' | 'medium' | 'hard'

export interface Option {
  id: string
  text: string
  explanation: string
}

export interface Question {
  id: number
  /** 保存 categories 中的二级标签 ID；多标签筛选默认采用任意匹配（OR）。 */
  tags: string[]
  type: QuestionType
  difficulty: Difficulty
  title: string
  options?: Option[]
  /** 单选为选项 ID，多选为 ID 数组，判断为布尔值，简答和代码为参考答案。 */
  answer: string | string[] | boolean
  explanation: string
  related?: string[]
}
