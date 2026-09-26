import LearningBackupPanel from '../components/LearningBackupPanel'
import { Explanation, QuestionMeta } from '../components/QuestionDetails'
import { questions } from '../data/questions'
import type { Question } from '../types/question'
import type { StudyData } from '../types/study'
import { getStudyStatistics } from '../utils/study'

interface Props { onImport: (data: StudyData) => string; onClear: () => void; data: StudyData; onFavorite: (id: number) => void; onStart: (questions: Question[]) => void }

function Stats({ values }: { values: [string, string | number][] }) {
  return <div className="stats">{values.map(([label, value]) => <div className="panel stat" key={label}><p>{label}</p><strong>{value}</strong></div>)}</div>
}

export default function Profile({ onImport, onClear, data, onFavorite, onStart }: Props) {
  const stats = getStudyStatistics(data.records, questions)
  const favorites = questions.filter(question => data.favoriteIds.includes(question.id))
  const wrongCount = questions.filter(question => data.wrongIds.includes(question.id)).length
  const reviewCount = questions.filter(question => data.reviewIds.includes(question.id)).length
  return <section>
    <h1>学习中心</h1><p className="muted">客观判分与主观匹配分开统计，关键词匹配度不代表语义正确率。</p>
    <Stats values={[[ '已完成题目', stats.completed], ['收藏数量', favorites.length], ['错题数量', wrongCount], ['待复习数量', reviewCount]]} />
    <h2>客观题</h2>
    <Stats values={[[ '已作答题目', stats.objectiveCompleted], ['作答次数', stats.objectiveAttempts], ['正确率', stats.objectiveAccuracy === null ? '—' : `${stats.objectiveAccuracy}%`]]} />
    <p className="muted">客观正确率仅按单选、多选、判断题的全部作答次数计算，包含重练和“不会”。</p>
    <h2 className="list-heading">主观题</h2>
    <Stats values={[
      ['已完成主观题', stats.subjectiveCompleted], ['平均关键点匹配度', stats.subjectiveAverage === null ? '—' : `${stats.subjectiveAverage}%`],
      ['掌握数量', stats.mastered], ['部分掌握数量', stats.partial], ['不会数量', stats.unknown], ['跳过自评数量', stats.skipped],
    ]} />
    <p className="muted">主观题按每道题最新一次记录统计，重练会更新掌握情况；平均值基于 {stats.scoredSubjective} 道有评分记录的题目。旧记录无评分时不计入平均值。</p>
    <LearningBackupPanel data={data} onImport={onImport} />
    <div className="clear-data"><button className="danger" onClick={() => { if (window.confirm('确定清空全部学习数据？答题记录、错题、待复习和收藏将被永久删除，此操作不可恢复。')) onClear() }}>清空学习数据</button><p className="muted">清空所有答题、错题、待复习和收藏，操作不可恢复。</p></div>
    <h2 className="list-heading">我的收藏</h2>
    {!favorites.length && <div className="panel empty">暂无收藏，可在刷题或题库浏览时收藏题目。</div>}
    <div className="question-list">{favorites.map(question => <article className="panel" key={question.id}>
      <QuestionMeta question={question} /><h2 className="question-title">{question.title}</h2>
      <div className="actions"><button onClick={() => onFavorite(question.id)}>取消收藏</button><button onClick={() => onStart([question])}>练习此题</button></div>
      <details><summary>查看答案与解析</summary><Explanation question={question} /></details>
    </article>)}</div>
  </section>
}
