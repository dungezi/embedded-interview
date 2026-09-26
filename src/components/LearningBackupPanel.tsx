import { useRef, useState } from 'react'
import type { StudyData } from '../types/study'
import { downloadLearningBackup, importLearningBackup, parseLearningBackup } from '../utils/backup'
import type { LearningBackup } from '../utils/backup'

interface Props { data: StudyData; onImport: (data: StudyData) => string }

export default function LearningBackupPanel({ data, onImport }: Props) {
  const [pending, setPending] = useState<{ text: string; backup: LearningBackup; filename: string } | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [reading, setReading] = useState(false)
  const requestId = useRef(0)

  async function readFile(file: File | undefined) {
    if (!file) return
    const id = ++requestId.current
    setPending(null); setMessage(''); setError(''); setReading(true)
    try {
      const text = await file.text()
      const backup = parseLearningBackup(text)
      if (id === requestId.current) setPending({ text, backup, filename: file.name })
    } catch (cause) {
      if (id === requestId.current) setError(cause instanceof Error ? cause.message : '无法读取备份文件。')
    } finally {
      if (id === requestId.current) setReading(false)
    }
  }

  function restore() {
    if (!pending) return
    setError(''); setMessage('')
    try {
      const imported = importLearningBackup(pending.text, () => window.confirm('确定覆盖当前学习数据？当前答题记录、错题、待复习和收藏将被该备份替换，操作不可撤销。建议先导出当前数据。'), onImport)
      setMessage(imported ? '学习数据已恢复，统计和列表已更新。' : '已取消导入，当前数据未修改。')
      setPending(null)
    } catch (cause) { setError(cause instanceof Error ? cause.message : '导入失败，当前数据未修改。') }
  }

  return <section className="panel backup-panel">
    <h2>学习数据备份</h2>
    <p className="muted">下载 JSON 保存答案、评分、自评、错题、待复习和收藏。导入仅支持覆盖，不合并；文件在本地读取，不上传服务器。</p>
    <div className="actions">
      <button onClick={() => {
        try { const filename = downloadLearningBackup(data); setError(''); setMessage(`已生成备份：${filename}`) }
        catch (cause) { setError(cause instanceof Error ? cause.message : '无法导出学习数据。') }
      }}>导出学习数据</button>
      <label className="file-button">导入学习数据<input type="file" accept=".json,application/json" disabled={reading} onChange={event => { const file = event.target.files?.[0]; event.target.value = ''; void readFile(file) }} /></label>
    </div>
    {reading && <p role="status">正在读取并校验文件…</p>}
    {pending && <div className="backup-preview">
      <h3>备份预览：{pending.filename}</h3>
      <p>导出时间：{new Date(pending.backup.exportedAt).toLocaleString()}</p>
      <p>作答 {pending.backup.data.records.length} 条 · 错题 {pending.backup.data.wrongIds.length} 道 · 待复习 {pending.backup.data.reviewIds.length} 道 · 收藏 {pending.backup.data.favoriteIds.length} 道</p>
      <p>确认后将覆盖当前学习数据。</p>
      <div className="actions"><button className="danger" onClick={restore}>覆盖当前数据并导入</button><button onClick={() => { setPending(null); setMessage('已取消导入，当前数据未修改。') }}>取消导入</button></div>
    </div>}
    {message && <p role="status">{message}</p>}
    {error && <p className="storage-warning" role="alert">{error}</p>}
  </section>
}
