import { questions } from '../data/questions'
import QuestionFilters from '../components/QuestionFilters'
import type { QuestionFiltersValue } from '../components/QuestionFilters'
import type { Question } from '../types/question'
import { filterQuestions, shuffleQuestions } from '../utils/questions'

interface Props {
  filters: QuestionFiltersValue
  onFiltersChange: (filters: QuestionFiltersValue) => void
  onStart: (questions: Question[]) => void
  onNavigate: (page: 'bank' | 'wrong' | 'profile') => void
}

export default function Home({ filters, onFiltersChange, onStart, onNavigate }: Props) {
  const filtered = filterQuestions(questions, filters.tags, filters.difficulty, filters.types)
  return <>
    <section className="hero">
      <p className="eyebrow">EMBEDDED INTERVIEW</p>
      <h1>从一个知识点开始，<br />准备下一场面试。</h1>
      <p>嵌入式面试刷题 Web App · {questions.length} 道题，覆盖编程、处理器、操作系统与硬件。</p>
      <div className="actions home-links">
        <button onClick={() => onNavigate('bank')}>浏览题库</button>
        <button onClick={() => onNavigate('wrong')}>错题本</button>
        <button onClick={() => onNavigate('profile')}>学习中心</button>
      </div>
    </section>
    <section className="panel">
      <QuestionFilters value={filters} onChange={onFiltersChange} />
      <div className="start-bar">
        <p aria-live="polite">可练习 <strong>{filtered.length}</strong> 道题</p>
        <div className="actions">
          <button className="primary" disabled={!filtered.length} onClick={() => onStart(shuffleQuestions(filtered))}>随机刷题</button>
        </div>
      </div>
      <p className="muted">随机刷题会打乱当前筛选结果，不重复抽题。简答与代码题可对照参考答案自评。</p>
      {!filtered.length && <p role="status">当前条件下暂无题目，请调整标签、难度或题型。</p>}
    </section>
  </>
}
