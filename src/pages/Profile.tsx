import { Explanation, QuestionMeta } from '../components/QuestionDetails'
import { questions } from '../data/questions'
import type { Question } from '../types/question'
import type { StudyData } from '../types/study'
import { isPracticeQuestion } from '../utils/questions'

interface Props { onClear: () => void; data: StudyData; onFavorite: (id: number) => void; onStart: (questions: Question[]) => void }

export default function Profile({ onClear, data, onFavorite, onStart }: Props) {
  const records = data.records.filter(record => questions.some(question => question.id === record.questionId))
  const completed = new Set(records.map(record => record.questionId)).size
  const accuracy = records.length ? `${Math.round(records.filter(record => record.correct).length / records.length * 100)}%` : '—'
  const favorites = questions.filter(question => data.favoriteIds.includes(question.id))
  const wrongCount = questions.filter(question => data.wrongIds.includes(question.id)).length
  return <section><h1>学习中心</h1><p className="muted">每一次练习，都让知识更扎实。</p><div className="stats">{[['已完成题目', completed], ['正确率', accuracy], ['收藏数量', favorites.length], ['错题数量', wrongCount]].map(([label, value]) => <div className="panel stat" key={label}><p>{label}</p><strong>{value}</strong></div>)}</div><p className="muted">完成数量按不同题目统计；正确率按全部 {records.length} 次作答统计，包含重练与自评；“不会”按错误统计。</p><div className="clear-data"><button className="danger" onClick={() => { if (window.confirm('确定清空全部学习数据？答题记录、错题和收藏将被永久删除，此操作不可恢复。')) onClear() }}>清空学习数据</button><p className="muted">清空所有答题记录、错题和收藏，操作不可恢复。</p></div><h2 className="list-heading">我的收藏</h2>{favorites.length === 0 && <div className="panel empty">暂无收藏，可在刷题时收藏需要复习的题目。</div>}<div className="question-list">{favorites.map(question => <article className="panel" key={question.id}><QuestionMeta question={question} /><h2 className="question-title">{question.title}</h2><div className="actions"><button onClick={() => onFavorite(question.id)}>取消收藏</button>{isPracticeQuestion(question) && <button onClick={() => onStart([question])}>练习此题</button>}</div><details><summary>查看答案与解析</summary><Explanation question={question} /></details></article>)}</div></section>
}
