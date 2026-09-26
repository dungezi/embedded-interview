import { useState } from 'react'
import type { AnswerRecord, StudyData } from '../types/study'
import { clearStudyData, emptyStudyData, loadStudyData, saveStudyData } from '../utils/storage'

export function useStudyData() {
  const [state, setState] = useState(loadStudyData)

  function update(data: StudyData) {
    const error = saveStudyData(data)
    setState({ data, error })
  }

  function recordAnswer(record: AnswerRecord) {
    const wrongIds = state.data.wrongIds.filter(id => id !== record.questionId)
    if (!record.correct) wrongIds.push(record.questionId)
    update({ ...state.data, records: [...state.data.records, record], wrongIds })
  }

  function toggleFavorite(id: number) {
    const favoriteIds = state.data.favoriteIds.includes(id)
      ? state.data.favoriteIds.filter(value => value !== id)
      : [...state.data.favoriteIds, id]
    update({ ...state.data, favoriteIds })
  }

  function clearLearningData() {
    const error = clearStudyData()
    setState({ data: error ? state.data : emptyStudyData(), error })
  }

  return { ...state, recordAnswer, toggleFavorite, clearLearningData }
}
