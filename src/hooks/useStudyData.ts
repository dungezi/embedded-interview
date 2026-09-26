import { useState } from 'react'
import { applyAnswerRecord } from '../utils/study'
import type { AnswerRecord, StudyData } from '../types/study'
import { clearStudyData, emptyStudyData, loadStudyData, normalizeStudyData, saveStudyData } from '../utils/storage'

export function useStudyData() {
  const [state, setState] = useState(loadStudyData)

  function update(data: StudyData) {
    const error = saveStudyData(data)
    setState({ data, error })
  }

  function recordAnswer(record: AnswerRecord) {
    update(applyAnswerRecord(state.data, record))
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

  function importLearningData(value: StudyData): string {
    let data: StudyData
    try { data = normalizeStudyData(value) }
    catch { return '导入失败：学习数据格式不合法，当前数据未修改。' }
    const error = saveStudyData(data)
    if (error) return '导入失败：无法保存到浏览器，当前学习数据未修改。'
    setState({ data, error: '' })
    return ''
  }

  return { ...state, recordAnswer, toggleFavorite, clearLearningData, importLearningData }
}
