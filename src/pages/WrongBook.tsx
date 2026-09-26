import { Explanation, QuestionMeta } from '../components/QuestionDetails'
import type { Question } from '../types/question'

interface Props {
  questions: Question[]
  reviewQuestions: Question[]
  favoriteIds: number[]
  onFavorite: (id: number) => void
  onStart: (questions: Question[]) => void
}

export default function WrongBook({ questions, reviewQuestions, favoriteIds, onFavorite, onStart }: Props) {
  function list(items: Question[], label: string) {
    return <div className="question-list">{items.map(question => <article className="panel" key={`${label}-${question.id}`}>
      <QuestionMeta question={question} /><h3 className="question-title">{question.title}</h3>
      <div className="actions"><button onClick={() => onStart([question])}>重新练习</button><button aria-pressed={favoriteIds.includes(question.id)} onClick={() => onFavorite(question.id)}>{favoriteIds.includes(question.id) ? '★ 已收藏' : '☆ 收藏'}</button></div>
      <details><summary>查看答案与解析</summary><Explanation question={question} /></details>
    </article>)}</div>
  }
  return <section>
    <h1>错题与待复习</h1>
    <p className="muted">客观题答错收录；主观题匹配度低于 60 或自评不会收录。部分掌握进入待复习；低分且部分掌握会同时出现在两处。</p>
    <div className="section-heading"><h2>错题 · {questions.length}</h2><button className="primary" disabled={!questions.length} onClick={() => onStart(questions)}>重练全部错题</button></div>
    {!questions.length && <div className="panel empty">暂无错题。</div>}
    {list(questions, 'wrong')}
    <div className="section-heading list-heading"><h2>待复习 · {reviewQuestions.length}</h2><button disabled={!reviewQuestions.length} onClick={() => onStart(reviewQuestions)}>练习待复习题目</button></div>
    {!reviewQuestions.length && <div className="panel empty">暂无待复习题目。</div>}
    {list(reviewQuestions, 'review')}
  </section>
}
