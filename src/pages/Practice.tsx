import { useState } from 'react'
import { Explanation, QuestionMeta } from '../components/QuestionDetails'
import type { Question } from '../types/question'
import type { AnswerRecord } from '../types/study'
import { checkAnswer, formatAnswer } from '../utils/questions'

interface Props {
  questions: Question[]
  favoriteIds: number[]
  onFavorite: (id: number) => void
  onAnswer: (record: AnswerRecord) => void
  onHome: () => void
}

export default function Practice({ questions, favoriteIds, onFavorite, onAnswer, onHome }: Props) {
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<string[]>([])
  const [result, setResult] = useState<boolean | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [finished, setFinished] = useState(false)
  const question = questions[index]
  if (!question) return <section className="panel"><h1>暂无可练习题目</h1><button onClick={onHome}>返回首页</button></section>
  if (finished) return <section className="panel completion"><p className="eyebrow">练习完成</p><h1>完成 {questions.length} 道题</h1><p>答对 {correctCount} 道，本轮正确率 {Math.round(correctCount / questions.length * 100)}%。</p><p className="muted">错题已收录，答对的重练题目已移出错题本。</p><button className="primary" onClick={onHome}>返回首页</button></section>
  const options = question.type === 'true_false' ? [{ id: 'true', text: '正确' }, { id: 'false', text: '错误' }] : question.options ?? []
  function choose(id: string) {
    setSelected(question.type === 'multiple' ? selected.includes(id) ? selected.filter(value => value !== id) : [...selected, id] : [id])
  }
  function submit() {
    if (selected.length === 0 || result !== null) return
    const answer = question.type === 'true_false' ? selected[0] === 'true' : question.type === 'multiple' ? selected : selected[0]
    const correct = checkAnswer(question, answer)
    setResult(correct)
    if (correct) setCorrectCount(count => count + 1)
    onAnswer({ questionId: question.id, answer, correct, answeredAt: new Date().toISOString() })
  }
  function next() {
    if (index === questions.length - 1) setFinished(true)
    else { setIndex(index + 1); setSelected([]); setResult(null) }
  }
  return <section className="panel practice"><div className="section-heading"><h1>刷题练习</h1><button onClick={onHome}>结束练习</button></div><div className="section-heading"><p>第 {index + 1} / {questions.length} 题</p><button aria-pressed={favoriteIds.includes(question.id)} onClick={() => onFavorite(question.id)}>{favoriteIds.includes(question.id) ? '★ 已收藏' : '☆ 收藏题目'}</button></div><progress value={index + (result !== null ? 1 : 0)} max={questions.length} aria-label="答题进度" />
    <QuestionMeta question={question} /><h2 className="question-title">{question.title}</h2>{question.type === 'multiple' && <p className="muted">请选择所有正确选项，少选或多选均判为错误。</p>}
    <fieldset className="options"><legend className="sr-only">选择答案</legend>{options.map(option => <label className={`option ${selected.includes(option.id) ? 'selected' : ''}`} key={option.id}><input type={question.type === 'multiple' ? 'checkbox' : 'radio'} name={`question-${question.id}`} checked={selected.includes(option.id)} disabled={result !== null} onChange={() => choose(option.id)} /><span>{question.type !== 'true_false' && `${option.id}. `}{option.text}</span></label>)}</fieldset>
    {result === null ? <button className="primary" disabled={selected.length === 0} onClick={submit}>提交答案</button> : <><div className={`result ${result ? 'correct' : 'incorrect'}`} role="status">{result ? '回答正确' : '回答错误'}<p>你的答案：{formatAnswer(question, question.type === 'true_false' ? selected[0] === 'true' : question.type === 'multiple' ? selected : selected[0])}</p></div><Explanation question={question} /><button className="primary" onClick={next}>{index === questions.length - 1 ? '查看练习结果' : '下一题 →'}</button></>}
  </section>
}
