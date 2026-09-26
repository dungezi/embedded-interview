import { categories } from '../data/categories'
import { questions } from '../data/questions'
import type { Difficulty, Question, QuestionType } from '../types/question'
import { difficultyNames, filterQuestions, typeNames } from '../utils/questions'

interface Props {
  types: QuestionType[]
  onTypesChange: (types: QuestionType[]) => void
  tags: string[]
  difficulty: Difficulty | 'all'
  onTagsChange: (tags: string[]) => void
  onDifficultyChange: (difficulty: Difficulty | 'all') => void
  onStart: (questions: Question[]) => void
}

export default function Home({ types, onTypesChange, tags, difficulty, onTagsChange, onDifficultyChange, onStart }: Props) {
  const filtered = filterQuestions(questions, tags, difficulty, types)
  function toggle(id: string) {
    onTagsChange(tags.includes(id) ? tags.filter(tag => tag !== id) : [...tags, id])
  }
  return <>
    <section className="hero"><p className="eyebrow">EMBEDDED INTERVIEW</p><h1>从一个知识点开始，<br />准备下一场面试。</h1><p>嵌入式面试刷题 Web App · 选择学习方向，边做题边补齐知识。</p></section>
    <section className="panel"><div className="section-heading"><div><h2>选择学习方向</h2><p className="muted">多标签按任意匹配筛选；未选择标签时包含全部方向。</p></div><div className="actions"><button onClick={() => onTagsChange(categories.flatMap(category => category.tags.map(tag => tag.id)))}>全选</button><button onClick={() => onTagsChange([])}>清空</button></div></div>
      <div className="category-grid">{categories.map(category => <fieldset key={category.id}><legend>{category.name}</legend><div className="chips">{category.tags.map(tag => <label className={`tag ${tags.includes(tag.id) ? 'selected' : ''}`} key={tag.id}><input type="checkbox" checked={tags.includes(tag.id)} onChange={() => toggle(tag.id)} />{tag.name}</label>)}</div></fieldset>)}</div>
      <fieldset className="type-filter"><legend>选择题型</legend><div className="chips">{(Object.keys(typeNames) as QuestionType[]).map(type => <label className={`tag ${types.includes(type) ? 'selected' : ''}`} key={type}><input type="checkbox" checked={types.includes(type)} onChange={() => onTypesChange(types.includes(type) ? types.filter(value => value !== type) : [...types, type])} />{typeNames[type]}</label>)}</div></fieldset>
      <div className="start-bar"><label>题目难度 <select value={difficulty} onChange={event => onDifficultyChange(event.target.value as Difficulty | 'all')}><option value="all">全部难度</option>{Object.entries(difficultyNames).map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label><p aria-live="polite">可练习 <strong>{filtered.length}</strong> 道题</p><button className="primary" disabled={filtered.length === 0} onClick={() => onStart(filtered)}>开始刷题 →</button></div>
      <p className="muted">简答题与代码题支持参考答案和自行标记掌握情况。</p>{filtered.length === 0 && <p role="status">当前条件下暂无可练题目，请调整标签或难度。</p>}
    </section>
  </>
}
