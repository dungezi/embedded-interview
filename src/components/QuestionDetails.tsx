import type { Question } from '../types/question'
import { difficultyNames, formatAnswer, tagNames, typeNames } from '../utils/questions'

export function QuestionMeta({ question }: { question: Question }) {
  return <div className="chips"><span className="badge">{typeNames[question.type]}</span><span className="badge">{difficultyNames[question.difficulty]}</span>{question.tags.map(tag => <span className="badge" key={tag}>{tagNames[tag] ?? tag}</span>)}</div>
}

export function Explanation({ question }: { question: Question }) {
  return <div className="explanation"><h3>参考答案</h3><p className="answer-text">{formatAnswer(question)}</p><h3>解析</h3><p>{question.explanation}</p>{question.related && <p className="muted">相关知识：{question.related.join(' · ')}</p>}</div>
}
