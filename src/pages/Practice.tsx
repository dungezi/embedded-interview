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
  const [draft, setDraft] = useState('')
  const [revealed, setRevealed] = useState(false)
  const [result, setResult] = useState<AnswerRecord | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [finished, setFinished] = useState(false)
  const question = questions[index]
  if (!question) return <section className="panel"><h1>暂无可练习题目</h1><button onClick={onHome}>返回首页</button></section>
  if (finished) return <section className="panel completion"><p className="eyebrow">练习完成</p><h1>完成 {questions.length} 道题</h1><p>答对或自评掌握 {correctCount} 道，本轮正确率 {Math.round(correctCount / questions.length * 100)}%。</p><p className="muted">不会的题目已收录，答对或掌握的重练题目已移出错题本。</p><button className="primary" onClick={onHome}>返回首页</button></section>

  const subjective = question.type === 'short_answer' || question.type === 'code'
  const options = question.type === 'true_false' ? [{ id: 'true', text: '正确' }, { id: 'false', text: '错误' }] : question.options ?? []
  const currentAnswer = subjective ? draft : question.type === 'true_false' ? selected.length ? selected[0] === 'true' : '' : question.type === 'multiple' ? selected : selected[0] ?? ''
  const instructions = {
    single: '请选择一个答案',
    multiple: '请选择所有正确答案，少选或多选均判为错误',
    true_false: '请选择“正确”或“错误”',
    short_answer: '先思考或输入答案，再对照参考答案自行标记掌握情况',
    code: '先编写或思考代码，再对照参考代码自行标记掌握情况',
  }

  function choose(id: string) {
    setSelected(question.type === 'multiple' ? selected.includes(id) ? selected.filter(value => value !== id) : [...selected, id] : [id])
  }

  function record(outcome: NonNullable<AnswerRecord['outcome']>) {
    if (result) return
    const correct = outcome === 'correct' || outcome === 'mastered'
    const answerRecord: AnswerRecord = { questionId: question.id, answer: currentAnswer, correct, outcome, answeredAt: new Date().toISOString() }
    setResult(answerRecord)
    setRevealed(true)
    if (correct) setCorrectCount(count => count + 1)
    onAnswer(answerRecord)
  }

  function next() {
    if (!result) return
    if (index === questions.length - 1) setFinished(true)
    else {
      setIndex(index + 1)
      setSelected([])
      setDraft('')
      setResult(null)
      setRevealed(false)
    }
  }

  const resultNames = { correct: '回答正确', incorrect: '回答错误', unknown: '本次标记：不会（计为错误）', mastered: '自评：掌握', unmastered: '自评：不会（计为错误）' }
  return <section className="panel practice">
    <div className="section-heading"><h1>刷题练习</h1><button onClick={onHome}>结束练习</button></div>
    <div className="section-heading"><p>第 {index + 1} / {questions.length} 题</p><button aria-pressed={favoriteIds.includes(question.id)} onClick={() => onFavorite(question.id)}>{favoriteIds.includes(question.id) ? '★ 已收藏' : '☆ 收藏题目'}</button></div>
    <progress value={index + (result ? 1 : 0)} max={questions.length} aria-label="答题进度" />
    <QuestionMeta question={question} />
    <h2 className="question-title">{question.title}</h2>
    <p className="answer-instruction">{instructions[question.type]}</p>
    {subjective ? <label className="draft-label">你的答案（可选）<textarea className={question.type === 'code' ? 'code-input' : ''} rows={question.type === 'code' ? 12 : 6} value={draft} disabled={revealed} onChange={event => setDraft(event.target.value)} placeholder={question.type === 'code' ? '在这里编写代码…' : '写下你的思路…'} /></label> : <fieldset className={`options options-${question.type}`}><legend className="sr-only">{instructions[question.type]}</legend>{options.map(option => <label className={`option ${selected.includes(option.id) ? 'selected' : ''}`} key={option.id}><input type={question.type === 'multiple' ? 'checkbox' : 'radio'} name={`question-${question.id}`} checked={selected.includes(option.id)} disabled={revealed} onChange={() => choose(option.id)} /><span>{question.type !== 'true_false' && `${option.id}. `}{option.text}</span></label>)}</fieldset>}
    {!revealed && <div className="actions">
      {subjective ? <button className="primary" onClick={() => setRevealed(true)}>查看参考答案</button> : <button className="primary" disabled={!selected.length} onClick={() => record(checkAnswer(question, currentAnswer) ? 'correct' : 'incorrect')}>提交答案</button>}
      <button onClick={() => record('unknown')}>不会，查看答案</button>
    </div>}
    {result && <div className={`result ${result.correct ? 'correct' : 'incorrect'}`} role="status"><strong>{resultNames[result.outcome ?? (result.correct ? 'correct' : 'incorrect')]}</strong>{result.answer !== '' && <p className="answer-text">你的答案：{formatAnswer(question, result.answer)}</p>}</div>}
    {revealed && <Explanation question={question} />}
    {revealed && subjective && !result && <div className="self-assessment"><p>对照参考答案后，请标记本题掌握情况以保存记录。</p><div className="actions"><button className="primary" onClick={() => record('mastered')}>掌握</button><button onClick={() => record('unmastered')}>不会</button></div></div>}
    {result && <button className="primary" onClick={next}>{index === questions.length - 1 ? '查看练习结果' : '下一题 →'}</button>}
  </section>
}
