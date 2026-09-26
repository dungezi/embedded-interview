import { useState } from 'react'
import { questions } from './data/questions'
import { useStudyData } from './hooks/useStudyData'
import Home from './pages/Home'
import QuestionBank from './pages/QuestionBank'
import type { QuestionFiltersValue } from './components/QuestionFilters'
import Practice from './pages/Practice'
import Profile from './pages/Profile'
import WrongBook from './pages/WrongBook'
import type { Question, QuestionType } from './types/question'
import { isPracticeQuestion, typeNames } from './utils/questions'
import './App.css'

type Page = 'home' | 'practice' | 'wrong' | 'profile' | 'bank'

function App() {
  const [page, setPage] = useState<Page>('home')
  const [filters, setFilters] = useState<QuestionFiltersValue>({ tags: [], difficulty: 'all', types: Object.keys(typeNames) as QuestionType[] })
  const [session, setSession] = useState<{ id: number; questions: Question[] }>({ id: 0, questions: [] })
  const study = useStudyData()
  function start(selected: Question[]) {
    const playable = selected.filter(isPracticeQuestion)
    if (!playable.length) return
    setSession(previous => ({ id: previous.id + 1, questions: playable }))
    setPage('practice')
  }
  const wrongQuestions = questions.filter(question => study.data.wrongIds.includes(question.id) && isPracticeQuestion(question))
  const reviewQuestions = questions.filter(question => study.data.reviewIds.includes(question.id))
  return <div className="app-shell"><header className="app-header"><a className="brand" href="#home" onClick={event => { event.preventDefault(); setPage('home') }}><span className="brand-icon">Ei</span>嵌入式面试</a><nav aria-label="主导航">{([['home', '首页'], ['bank', '题库'], ['wrong', '错题本'], ['profile', '学习中心']] as const).map(([id, name]) => <button key={id} className={page === id ? 'active' : ''} aria-current={page === id ? 'page' : undefined} onClick={() => setPage(id)}>{name}</button>)}</nav></header><main>{study.error && <p className="storage-warning" role="alert">{study.error}</p>}{page === 'home' && <Home filters={filters} onFiltersChange={setFilters} onStart={start} onNavigate={setPage} />}{page === 'bank' && <QuestionBank favoriteIds={study.data.favoriteIds} onFavorite={study.toggleFavorite} />}{page === 'practice' && <Practice key={session.id} questions={session.questions} favoriteIds={study.data.favoriteIds} onFavorite={study.toggleFavorite} onAnswer={study.recordAnswer} onHome={() => setPage('home')} />}{page === 'wrong' && <WrongBook reviewQuestions={reviewQuestions} questions={wrongQuestions} favoriteIds={study.data.favoriteIds} onFavorite={study.toggleFavorite} onStart={start} />}{page === 'profile' && <Profile onImport={study.importLearningData} onClear={study.clearLearningData} data={study.data} onFavorite={study.toggleFavorite} onStart={start} />}</main><footer>嵌入式面试刷题 · 学习记录保存在当前浏览器</footer></div>
}

export default App
