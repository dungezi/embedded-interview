import { useState } from 'react'
import QuestionFilters from '../components/QuestionFilters'
import type { QuestionFiltersValue } from '../components/QuestionFilters'
import { Explanation, QuestionMeta } from '../components/QuestionDetails'
import { categories } from '../data/categories'
import { questions } from '../data/questions'
import { filterQuestions, typeNames } from '../utils/questions'
import type { QuestionType } from '../types/question'

interface Props {
  favoriteIds: number[]
  onFavorite: (id: number) => void
}

const PAGE_SIZE = 12

export default function QuestionBank({ favoriteIds, onFavorite }: Props) {
  const [query, setQuery] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [filters, setFilters] = useState<QuestionFiltersValue>({ tags: categories.flatMap(category => category.tags.map(tag => tag.id)), difficulty: 'all', types: Object.keys(typeNames) as QuestionType[] })
  const [page, setPage] = useState(1)
  const filtered = filterQuestions(questions, filters.tags, filters.difficulty, filters.types, { query, categoryId })
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return <section>
    <h1>题库</h1>
    <p className="muted">直接查找和复习知识；浏览答案不计入作答、正确率或错题，可收藏留待复习。</p>
    <div className="panel bank-filters">
      <div className="bank-search">
        <label>搜索题目、知识点与解析<input type="search" value={query} placeholder="例如：volatile、DMA、优先级反转" onChange={event => { setQuery(event.target.value); setPage(1) }} /></label>
        <label>一级分类<select value={categoryId} onChange={event => { setCategoryId(event.target.value); setFilters({ ...filters, tags: categories.filter(category => !event.target.value || category.id === event.target.value).flatMap(category => category.tags.map(tag => tag.id)) }); setPage(1) }}>
          <option value="">全部分类</option>{categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}
        </select></label>
      </div>
      <QuestionFilters categoryId={categoryId} value={filters} onChange={value => { setFilters(value); setPage(1) }} />
    </div>
    <div className="section-heading bank-count"><p aria-live="polite">找到 <strong>{filtered.length}</strong> 道题</p><p className="muted">第 {page}/{pages} 页</p></div>
    {!filtered.length && <div className="panel empty">没有匹配题目，请调整搜索词或筛选条件。</div>}
    <div className="question-list">{visible.map(question => <article className="panel" key={question.id}>
      <QuestionMeta question={question} />
      <details className="bank-question">
        <summary>{question.title}</summary>
        {question.options && <ul className="bank-options">{question.options.map(option => <li key={option.id}>{option.id}. {option.text}</li>)}</ul>}
        <Explanation question={question} showKeyPoints />
      </details>
      <button aria-pressed={favoriteIds.includes(question.id)} onClick={() => onFavorite(question.id)}>{favoriteIds.includes(question.id) ? '★ 已收藏' : '☆ 收藏题目'}</button>
    </article>)}</div>
    {filtered.length > PAGE_SIZE && <nav className="pagination" aria-label="题库分页">
      <button disabled={page === 1} onClick={() => setPage(page - 1)}>上一页</button>
      <span>{page} / {pages}</span>
      <button disabled={page === pages} onClick={() => setPage(page + 1)}>下一页</button>
    </nav>}
  </section>
}
