import { categories } from '../data/categories'
import type { Difficulty, QuestionType } from '../types/question'
import { difficultyNames, typeNames } from '../utils/questions'

export interface QuestionFiltersValue {
  tags: string[]
  difficulty: Difficulty | 'all'
  types: QuestionType[]
}

interface Props {
  value: QuestionFiltersValue
  onChange: (value: QuestionFiltersValue) => void
  categoryId?: string
}

export default function QuestionFilters({ value, onChange, categoryId }: Props) {
  const shown = categories.filter(category => !categoryId || category.id === categoryId)
  function toggleTag(id: string) {
    onChange({ ...value, tags: value.tags.includes(id) ? value.tags.filter(tag => tag !== id) : [...value.tags, id] })
  }
  return <>
    <div className="section-heading">
      <div><h2>学习方向</h2><p className="muted">方向按 OR 匹配；至少选择一个方向后才显示题目。</p></div>
      <div className="actions">
        <button onClick={() => onChange({ ...value, tags: shown.flatMap(category => category.tags.map(tag => tag.id)) })}>全选</button>
        <button onClick={() => onChange({ ...value, tags: [] })}>清空</button>
      </div>
    </div>
    <div className="category-grid">
      {shown.map(category => <details className="category-group" key={category.id}>
        <summary>{category.name}<span className="muted"> {category.tags.filter(tag => value.tags.includes(tag.id)).length}/{category.tags.length}</span></summary>
        <div className="chips">{category.tags.map(tag => <label className={`tag ${value.tags.includes(tag.id) ? 'selected' : ''}`} key={tag.id}>
          <input type="checkbox" checked={value.tags.includes(tag.id)} onChange={() => toggleTag(tag.id)} />{tag.name}
        </label>)}</div>
      </details>)}
    </div>
    <fieldset className="type-filter"><legend>题型</legend><div className="chips">
      {(Object.keys(typeNames) as QuestionType[]).map(type => <label className={`tag ${value.types.includes(type) ? 'selected' : ''}`} key={type}>
        <input type="checkbox" checked={value.types.includes(type)} onChange={() => onChange({ ...value, types: value.types.includes(type) ? value.types.filter(item => item !== type) : [...value.types, type] })} />{typeNames[type]}
      </label>)}
    </div></fieldset>
    <label className="difficulty-filter">题目难度 <select value={value.difficulty} onChange={event => onChange({ ...value, difficulty: event.target.value as Difficulty | 'all' })}>
      <option value="all">全部难度</option>{Object.entries(difficultyNames).map(([id, name]) => <option key={id} value={id}>{name}</option>)}
    </select></label>
  </>
}
