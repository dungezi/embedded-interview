import { useState } from 'react'
import { questions } from './data/questions'
import { useStudyData } from './hooks/useStudyData'
import Home from './pages/Home'
import Practice from './pages/Practice'
import Profile from './pages/Profile'
import WrongBook from './pages/WrongBook'
import type { Difficulty, Question, QuestionType } from './types/question'
import { isPracticeQuestion, typeNames } from './utils/questions'
import './App.css'

type Page = 'home' | 'practice' | 'wrong' | 'profile'

function App() {
  const [page, setPage] = useState<Page>('home')
  const [types, setTypes] = useState<QuestionType[]>(Object.keys(typeNames) as QuestionType[])
  const [tags, setTags] = useState<string[]>([])
  const [difficulty, setDifficulty] = useState<Difficulty | 'all'>('all')
  const [session, setSession] = useState<{ id: number; questions: Question[] }>({ id: 0, questions: [] })
  const study = useStudyData()
  function start(selected: Question[]) {
    const playable = selected.filter(isPracticeQuestion)
    if (!playable.length) return
    setSession(previous => ({ id: previous.id + 1, questions: playable }))
    setPage('practice')
  }
  const wrongQuestions = questions.filter(question => study.data.wrongIds.includes(question.id) && isPracticeQuestion(question))
  return <div className="app-shell"><header className="app-header"><a className="brand" href="#home" onClick={event => { event.preventDefault(); setPage('home') }}><span className="brand-icon">Ei</span>嵌入式面试</a><nav aria-label="主导航">{([['home', '首页'], ['wrong', '错题本'], ['profile', '学习中心']] as const).map(([id, name]) => <button key={id} className={page === id ? 'active' : ''} aria-current={page === id ? 'page' : undefined} onClick={() => setPage(id)}>{name}</button>)}</nav></header><main>{study.error && <p className="storage-warning" role="alert">{study.error}</p>}{page === 'home' && <Home types={types} onTypesChange={setTypes} tags={tags} difficulty={difficulty} onTagsChange={setTags} onDifficultyChange={setDifficulty} onStart={start} />}{page === 'practice' && <Practice key={session.id} questions={session.questions} favoriteIds={study.data.favoriteIds} onFavorite={study.toggleFavorite} onAnswer={study.recordAnswer} onHome={() => setPage('home')} />}{page === 'wrong' && <WrongBook questions={wrongQuestions} favoriteIds={study.data.favoriteIds} onFavorite={study.toggleFavorite} onStart={start} />}{page === 'profile' && <Profile onClear={study.clearLearningData} data={study.data} onFavorite={study.toggleFavorite} onStart={start} />}</main><footer>嵌入式面试刷题 · 学习记录保存在当前浏览器</footer></div>
}

export default App
