import { useState } from 'react'
import { Explanation } from './QuestionDetails'
import type { Question } from '../types/question'
import type { AnswerRecord } from '../types/study'
import { checkAnswer, formatAnswer } from '../utils/questions'

interface Props { question: Question; onAnswer: (record: AnswerRecord) => void; onNext: () => void; last: boolean }

export default function ObjectiveAnswer({ question, onAnswer, onNext, last }: Props) {
  const [selected, setSelected] = useState<string[]>([])
  const [record, setRecord] = useState<AnswerRecord | null>(null)
  const options = question.type === 'true_false' ? [{ id: 'true', text: '正确' }, { id: 'false', text: '错误' }] : question.options ?? []
  const instruction = question.type === 'multiple' ? '请选择所有正确答案，少选或多选均判为错误' : question.type === 'true_false' ? '请选择“正确”或“错误”' : '请选择一个答案'

  function choose(id: string) {
    setSelected(question.type === 'multiple' ? selected.includes(id) ? selected.filter(value => value !== id) : [...selected, id] : [id])
  }
  function submit(unknown = false) {
    if (record) return
    const answer = !selected.length ? '' : question.type === 'true_false' ? selected[0] === 'true' : question.type === 'multiple' ? selected : selected[0]
    const correct = !unknown && checkAnswer(question, answer)
    const next: AnswerRecord = { attemptId: crypto.randomUUID(), kind: 'objective', questionId: question.id, answer, correct, outcome: unknown ? 'unknown' : correct ? 'correct' : 'incorrect', answeredAt: new Date().toISOString() }
    setRecord(next)
    onAnswer(next)
  }
  return <>
    <p className="answer-instruction">{instruction}</p>
    <fieldset className={`options options-${question.type}`}><legend className="sr-only">{instruction}</legend>
      {options.map(option => <label className={`option ${selected.includes(option.id) ? 'selected' : ''}`} key={option.id}>
        <input type={question.type === 'multiple' ? 'checkbox' : 'radio'} name={`question-${question.id}`} checked={selected.includes(option.id)} disabled={record !== null} onChange={() => choose(option.id)} />
        <span>{question.type !== 'true_false' && `${option.id}. `}{option.text}</span>
      </label>)}
    </fieldset>
    {!record ? <div className="actions"><button className="primary" disabled={!selected.length} onClick={() => submit()}>提交答案</button><button onClick={() => submit(true)}>不会，查看答案</button></div> : <>
      <div className={`result ${record.correct ? 'correct' : 'incorrect'}`} role="status"><strong>{record.outcome === 'unknown' ? '本次标记：不会（计为错误）' : record.correct ? '回答正确' : '回答错误'}</strong>{record.answer !== '' && <p>你的答案：{formatAnswer(question, record.answer)}</p>}</div>
      <Explanation question={question} />
      <button className="primary" onClick={onNext}>{last ? '查看练习结果' : '下一题 →'}</button>
    </>}
  </>
}
