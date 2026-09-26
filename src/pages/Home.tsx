import { categories } from '../data/categories'
import { questions } from '../data/questions'
import type { Difficulty, Question } from '../types/question'
import { difficultyNames, filterQuestions } from '../utils/questions'

interface Props {
  tags: string[]
  difficulty: Difficulty | 'all'
  onTagsChange: (tags: string[]) => void
  onDifficultyChange: (difficulty: Difficulty | 'all') => void
  onStart: (questions: Question[]) => void
}

export default function Home({ tags, difficulty, onTagsChange, onDifficultyChange, onStart }: Props) {
  const filtered = filterQuestions(questions, tags, difficulty)
  function toggle(id: string) {
    onTagsChange(tags.includes(id) ? tags.filter(tag => tag !== id) : [...tags, id])
  }
  return <>
    <section className="hero"><p className="eyebrow">EMBEDDED INTERVIEW</p><h1>从一个知识点开始，<br />准备下一场面试。</h1><p>嵌入式面试刷题 Web App · 选择学习方向，边做题边补齐知识。</p></section>
    <section className="panel"><div className="section-heading"><div><h2>选择学习方向</h2><p className="muted">多标签按任意匹配筛选；未选择标签时包含全部方向。</p></div><div className="actions"><button onClick={() => onTagsChange(categories.flatMap(category => category.tags.map(tag => tag.id)))}>全选</button><button onClick={() => onTagsChange([])}>清空</button></div></div>
      <div className="category-grid">{categories.map(category => <fieldset key={category.id}><legend>{category.name}</legend><div className="chips">{category.tags.map(tag => <label className={`tag ${tags.includes(tag.id) ? 'selected' : ''}`} key={tag.id}><input type="checkbox" checked={tags.includes(tag.id)} onChange={() => toggle(tag.id)} />{tag.name}</label>)}</div></fieldset>)}</div>
      <div className="start-bar"><label>题目难度 <select value={difficulty} onChange={event => onDifficultyChange(event.target.value as Difficulty | 'all')}><option value="all">全部难度</option>{Object.entries(difficultyNames).map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label><p aria-live="polite">可练习 <strong>{filtered.length}</strong> 道题</p><button className="primary" disabled={filtered.length === 0} onClick={() => onStart(filtered)}>开始刷题 →</button></div>
      <p className="muted">第一版支持单选、多选和判断题。简答题与代码题暂不计入可练题目。</p>{filtered.length === 0 && <p role="status">当前条件下暂无可练题目，请调整标签或难度。</p>}
    </section>
  </>
}
