import type { Question } from '../types/question'
import { difficultyNames, formatAnswer, tagNames, typeNames } from '../utils/questions'

export function QuestionMeta({ question }: { question: Question }) {
  return <div className="chips"><strong className="question-type">【{typeNames[question.type]}】</strong><span className="badge">{difficultyNames[question.difficulty]}</span>{question.tags.map(tag => <span className="badge" key={tag}>{tagNames[tag] ?? tag}</span>)}</div>
}

export function Explanation({ question, showKeyPoints = false }: { question: Question; showKeyPoints?: boolean }) {
  const subjective = question.type === 'short_answer' || question.type === 'code'
  const answerIds = Array.isArray(question.answer) ? question.answer : [question.answer]
  return <div className="explanation">
    <h3>{subjective ? '参考答案' : '正确答案'}</h3>
    {question.type === 'code' ? <pre className="code-block"><code>{formatAnswer(question)}</code></pre> : <p className="answer-text">{formatAnswer(question)}</p>}
    {(question.type === 'single' || question.type === 'multiple') && <><h3>选项解析</h3><ul className="option-explanations">{question.options?.map(option => <li key={option.id}><strong>{option.id} {answerIds.includes(option.id) ? '✅ 正确选项' : '❌ 错误选项'} · {option.text}</strong><p>{option.explanation}</p></li>)}</ul></>}
    <h3>知识点总结</h3><p>{question.explanation}</p>
    {showKeyPoints && question.subjectiveEvaluation && <><h3>参考关键点</h3><ul>{question.subjectiveEvaluation.keyPoints.map(point => <li key={point.id}>{point.description}（权重 {point.weight}）</li>)}</ul></>}
    {question.related && <p className="muted">相关知识：{question.related.join(' · ')}</p>}
  </div>
}
