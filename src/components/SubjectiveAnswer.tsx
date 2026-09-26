import { useState } from 'react'
import { Explanation } from './QuestionDetails'
import SubjectiveFeedback from './SubjectiveFeedback'
import type { Question } from '../types/question'
import type { AnswerRecord, SelfAssessment } from '../types/study'
import { scoreSubjectiveAnswer } from '../utils/subjectiveScoring'
import { getRecordDisposition } from '../utils/study'

interface Props { question: Question; onAnswer: (record: AnswerRecord) => void; onNext: () => void; last: boolean }

const assessments: [SelfAssessment, string][] = [['mastered', '掌握'], ['partial', '部分掌握'], ['unknown', '不会'], [null, '跳过自评']]

export default function SubjectiveAnswer({ question, onAnswer, onNext, last }: Props) {
  const [draft, setDraft] = useState('')
  const [record, setRecord] = useState<AnswerRecord | null>(null)
  const [assessed, setAssessed] = useState(false)

  function submit(unknown = false) {
    if (record) return
    const next: AnswerRecord = {
      attemptId: crypto.randomUUID(), questionId: question.id, answer: draft,
      kind: 'subjective', correct: false, answeredAt: new Date().toISOString(),
      subjectiveScore: scoreSubjectiveAnswer(question, draft), selfAssessment: unknown ? 'unknown' : null,
    }
    setRecord(next)
    setAssessed(unknown)
    onAnswer(next)
  }

  function assess(value: SelfAssessment) {
    if (!record) return
    const next = { ...record, selfAssessment: value }
    setRecord(next)
    setAssessed(true)
    onAnswer(next)
  }

  const disposition = record ? getRecordDisposition(record) : null
  return <>
    <p className="answer-instruction">先输入答案，再提交查看关键点匹配、参考答案和自评。不会时可直接查看答案。</p>
    <label className="draft-label">你的答案<textarea
      className={question.type === 'code' ? 'code-input' : ''}
      rows={question.type === 'code' ? 12 : 6}
      value={draft} disabled={record !== null}
      onChange={event => setDraft(event.target.value)}
      placeholder={question.type === 'code' ? '在这里编写代码…' : '写下你的回答和思路…'}
    /></label>
    {!record && <div className="actions">
      <button className="primary" disabled={!draft.trim()} onClick={() => submit()}>提交答案</button>
      <button onClick={() => submit(true)}>不会，查看答案</button>
    </div>}
    {record && <>
      <SubjectiveFeedback result={record.subjectiveScore!} />
      <Explanation question={question} />
      <section className="self-assessment">
        <h3>你认为自己掌握了吗？</h3>
        <p className="muted">评分已保存。自评可修改；跳过或直接继续均保留评分，不自动标记掌握。</p>
        <div className="actions">{assessments.map(([value, label]) => <button key={label} aria-pressed={assessed && record.selfAssessment === value} className={assessed && record.selfAssessment === value ? 'selected' : ''} onClick={() => assess(value)}>{label}</button>)}</div>
        <p role="status">{assessed ? `自评：${assessments.find(([value]) => value === record.selfAssessment)?.[1]}` : '尚未自评；直接继续按跳过保存。'}{disposition?.inWrongBook ? ' · 已加入错题' : ''}{disposition?.inReview ? ' · 已加入待复习' : ''}</p>
      </section>
      <button className="primary next-button" onClick={onNext}>{last ? '查看练习结果' : assessed ? '下一题 →' : '跳过自评并下一题 →'}</button>
    </>}
  </>
}
