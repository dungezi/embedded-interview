import { Explanation, QuestionMeta } from '../components/QuestionDetails'
import type { Question } from '../types/question'

interface Props {
  questions: Question[]
  favoriteIds: number[]
  onFavorite: (id: number) => void
  onStart: (questions: Question[]) => void
}

export default function WrongBook({ questions, favoriteIds, onFavorite, onStart }: Props) {
  return <section><div className="section-heading"><div><h1>错题本</h1><p className="muted">共 {questions.length} 道错题。重练答对后自动移出。</p></div><button className="primary" disabled={!questions.length} onClick={() => onStart(questions)}>重练全部错题</button></div>{questions.length === 0 && <div className="panel empty"><h2>还没有错题</h2><p>练习中答错的题目会收录在这里。</p></div>}
    <div className="question-list">{questions.map(question => <article className="panel" key={question.id}><QuestionMeta question={question} /><h2 className="question-title">{question.title}</h2><div className="actions"><button onClick={() => onStart([question])}>重新练习</button><button aria-pressed={favoriteIds.includes(question.id)} onClick={() => onFavorite(question.id)}>{favoriteIds.includes(question.id) ? '★ 已收藏' : '☆ 收藏'}</button></div><details><summary>查看答案与解析</summary><Explanation question={question} /></details></article>)}</div>
  </section>
}
