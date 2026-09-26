import { useState } from 'react'
import { QuestionMeta } from '../components/QuestionDetails'
import ObjectiveAnswer from '../components/ObjectiveAnswer'
import SubjectiveAnswer from '../components/SubjectiveAnswer'
import type { Question } from '../types/question'
import type { AnswerRecord } from '../types/study'
import { isSubjectiveQuestion } from '../utils/questions'
import { getStudyStatistics } from '../utils/study'

interface Props {
  questions: Question[]
  favoriteIds: number[]
  onFavorite: (id: number) => void
  onAnswer: (record: AnswerRecord) => void
  onHome: () => void
}

export default function Practice({ questions, favoriteIds, onFavorite, onAnswer, onHome }: Props) {
  const [index, setIndex] = useState(0)
  const [records, setRecords] = useState<AnswerRecord[]>([])
  const [finished, setFinished] = useState(false)
  const question = questions[index]

  function save(record: AnswerRecord) {
    setRecords(previous => [...previous.filter(item => item.attemptId !== record.attemptId), record])
    onAnswer(record)
  }
  function next() {
    if (index === questions.length - 1) setFinished(true)
    else setIndex(index + 1)
  }

  if (!question) return <section className="panel"><h1>暂无可练习题目</h1><button onClick={onHome}>返回首页</button></section>
  if (finished) {
    const stats = getStudyStatistics(records, questions)
    return <section className="panel completion"><p className="eyebrow">练习完成</p><h1>完成 {records.length} 道题</h1>
      <p>客观题作答 {stats.objectiveAttempts} 次，正确率 {stats.objectiveAccuracy === null ? '—' : `${stats.objectiveAccuracy}%`}。</p>
      <p>主观题完成 {stats.subjectiveCompleted} 道，平均关键点匹配度 {stats.subjectiveAverage === null ? '—' : `${stats.subjectiveAverage}%`}。</p>
      <p className="muted">自评掌握 {stats.mastered} · 部分掌握 {stats.partial} · 不会 {stats.unknown} · 跳过 {stats.skipped}</p>
      <button className="primary" onClick={onHome}>返回首页</button>
    </section>
  }
  return <section className="panel practice">
    <div className="section-heading"><h1>刷题练习</h1><button onClick={onHome}>结束练习</button></div>
    <div className="section-heading"><p>第 {index + 1} / {questions.length} 题</p><button aria-pressed={favoriteIds.includes(question.id)} onClick={() => onFavorite(question.id)}>{favoriteIds.includes(question.id) ? '★ 已收藏' : '☆ 收藏题目'}</button></div>
    <progress value={records.length} max={questions.length} aria-label="答题进度" />
    <QuestionMeta question={question} /><h2 className="question-title">{question.title}</h2>
    {isSubjectiveQuestion(question)
      ? <SubjectiveAnswer key={question.id} question={question} onAnswer={save} onNext={next} last={index === questions.length - 1} />
      : <ObjectiveAnswer key={question.id} question={question} onAnswer={save} onNext={next} last={index === questions.length - 1} />}
  </section>
}
