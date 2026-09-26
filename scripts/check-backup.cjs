/* 验证真实备份 utility、存储 Hook 和组件事件；仅使用项目已有依赖。 */
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')
const React = require('react')
const cache = new Map()
let states = [], cursor = 0
const mockReact = { ...React,
  useState(initial) {
    const index = cursor++
    if (!(index in states)) states[index] = typeof initial === 'function' ? initial() : initial
    return [states[index], value => { states[index] = typeof value === 'function' ? value(states[index]) : value }]
  },
  useRef(initial) {
    const index = cursor++
    if (!(index in states)) states[index] = { current: initial }
    return states[index]
  },
}
function load(file) {
  file = path.resolve(file)
  if (cache.has(file)) return cache.get(file).exports
  const module = { exports: {} }; cache.set(file, module)
  const js = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText
  new Function('require', 'exports', 'module', js)(id => {
    if (id === 'react') return mockReact
    if (!id.startsWith('.')) return require(id)
    const base = path.resolve(path.dirname(file), id)
    return load(base + (fs.existsSync(base + '.ts') ? '.ts' : '.tsx'))
  }, module.exports, module)
  return module.exports
}
function flatten(node) {
  if (!node || typeof node !== 'object') return []
  return [node, ...React.Children.toArray(node.props?.children).flatMap(flatten)]
}
const { createLearningBackup, parseLearningBackup, importLearningBackup, downloadLearningBackup } = load('src/utils/backup.ts')
const { STORAGE_KEY, normalizeStudyData, loadStudyData, saveStudyData, emptyStudyData } = load('src/utils/storage.ts')
const { questions } = load('src/data/questions.ts')
const { scoreSubjectiveAnswer } = load('src/utils/subjectiveScoring.ts')
const { getStudyStatistics } = load('src/utils/study.ts')
const store = new Map([['other-app:secret', 'must-not-export-or-delete']])
let failSave = false
global.localStorage = {
  getItem: key => store.get(key) ?? null,
  setItem: (key, value) => { if (failSave) throw new Error('quota'); store.set(key, value) },
  removeItem: key => store.delete(key),
}
const legacy = { records: [{ questionId: 1, answer: 'B', correct: true, answeredAt: '2026-09-26' }], wrongIds: [3], favoriteIds: [10] }
const source = {
  records: [...legacy.records, ...['mastered', 'partial', 'unknown', null].map((selfAssessment, index) => ({
    questionId: 35, answer: '编译器优化 每次读取 不保证线程安全', correct: false,
    kind: 'subjective', attemptId: `test-${index}`, answeredAt: `2026-09-26T0${index}:00:00.000Z`,
    subjectiveScore: scoreSubjectiveAnswer(questions.find(question => question.id === 35), '编译器优化 每次读取 不保证线程安全'),
    selfAssessment, inWrongBook: selfAssessment === 'unknown', inReview: selfAssessment === 'partial',
  }))], wrongIds: [3, 35], reviewIds: [35], favoriteIds: [10, 149],
}
const now = new Date('2026-09-26T00:00:00.000Z')
const envelope = createLearningBackup({ ...source, unrelatedSecret: 'not-exported' }, now)
const text = JSON.stringify(envelope)
assert.equal(envelope.schemaVersion, 1)
assert.deepEqual(parseLearningBackup(text).data, source)
assert.ok(!text.includes('not-exported') && !text.includes('must-not-export'))
assert.deepEqual(createLearningBackup(legacy, now).data, { ...legacy, reviewIds: [] })
assert.deepEqual(normalizeStudyData(legacy), { ...legacy, reviewIds: [] })
const useStudyData = load('src/hooks/useStudyData.ts').useStudyData
saveStudyData(legacy)
function study() { cursor = 0; return useStudyData() }
let hook = study()
const before = JSON.stringify(hook.data)
let confirmations = 0, writes = 0
const confirm = () => { confirmations++; return true }
const replace = data => { writes++; return hook.importLearningData(data) }
const invalids = [
  '{', 'null', '[]', JSON.stringify({ ...envelope, schemaVersion: 2 }),
  JSON.stringify({ ...envelope, exportedAt: 'invalid' }), JSON.stringify({ ...envelope, data: { ...source, reviewIds: undefined } }),
  JSON.stringify({ ...envelope, data: { ...source, wrongIds: ['3'] } }),
  JSON.stringify({ ...envelope, data: { ...source, favoriteIds: [-1] } }),
  JSON.stringify({ ...envelope, data: { ...source, records: [{ ...source.records[1], selfAssessment: 'invented' }] } }),
  JSON.stringify({ ...envelope, data: { ...source, records: [{ ...source.records[1], subjectiveScore: { ...source.records[1].subjectiveScore, score: 101 } }] } }),
  JSON.stringify({ ...envelope, data: { ...source, records: [{ ...source.records[0], answeredAt: 'invalid' }] } }),
  JSON.stringify({ ...envelope, data: { ...source, records: [source.records[1], source.records[1]] } }),
]
for (const invalid of invalids) assert.throws(() => importLearningBackup(invalid, confirm, replace))
assert.equal(confirmations, 0); assert.equal(writes, 0)
assert.equal(JSON.stringify(study().data), before)
assert.equal(importLearningBackup(text, () => false, replace), false)
assert.equal(writes, 0); assert.equal(JSON.stringify(study().data), before)
failSave = true
assert.throws(() => importLearningBackup(text, confirm, replace), /无法保存/)
assert.equal(JSON.stringify(study().data), before)
assert.deepEqual(loadStudyData().data, { ...legacy, reviewIds: [] })
failSave = false
assert.equal(importLearningBackup(text, confirm, replace), true)
hook = study()
assert.deepEqual(hook.data, source)
assert.deepEqual(loadStudyData().data, source)
const statistics = getStudyStatistics(hook.data.records, questions)
assert.ok(statistics)
hook.clearLearningData(); hook = study()
assert.deepEqual(hook.data, emptyStudyData())
assert.equal(importLearningBackup(text, confirm, data => hook.importLearningData(data)), true)
hook = study()
assert.deepEqual(hook.data, source)
assert.deepEqual(getStudyStatistics(hook.data.records, questions), statistics)
assert.equal(store.get('other-app:secret'), 'must-not-export-or-delete')
// 未知题目 ID 不丢弃，以便保留未来或其他版本的记录。
assert.deepEqual(parseLearningBackup(JSON.stringify({ ...envelope, data: { ...source, favoriteIds: [9999] } })).data.favoriteIds, [9999])

async function main() {
  let captured, clicked = 0, removed = 0, revoked = 0
  global.URL = { createObjectURL: blob => { captured = blob; return 'blob:local-test' }, revokeObjectURL: () => { revoked++ } }
  const anchor = { click() { clicked++ }, remove() { removed++ } }
  global.document = { createElement: tag => { assert.equal(tag, 'a'); return anchor }, body: { appendChild: value => assert.equal(value, anchor) } }
  global.setTimeout = callback => { callback(); return 1 }
  const filename = downloadLearningBackup(source, now)
  assert.equal(filename, 'embedded-interview-backup-2026-09-26.json')
  assert.equal(anchor.download, filename)
  assert.deepEqual(parseLearningBackup(await captured.text()).data, source)
  assert.equal(clicked, 1); assert.equal(removed, 1); assert.equal(revoked, 1)

  const Panel = load('src/components/LearningBackupPanel.tsx').default
  states = []; cursor = 0
  let imports = 0
  const props = { data: source, onImport(data) { imports++; assert.deepEqual(data, source); return '' } }
  function panel() { cursor = 0; return Panel(props) }
  const button = (tree, label) => flatten(tree).find(node => node.type === 'button' && node.props.children === label)
  const upload = (tree, content) => flatten(tree).find(node => node.type === 'input').props.onChange({ target: { files: [{ name: 'backup.json', text: async () => content }], value: 'selected' } })
  const tick = async () => { await Promise.resolve(); await Promise.resolve() }
  let tree = panel()
  upload(tree, '{'); await tick(); tree = panel()
  assert.ok(flatten(tree).some(node => node.props?.role === 'alert'))
  assert.equal(imports, 0)
  upload(tree, text); await tick(); tree = panel()
  assert.ok(button(tree, '覆盖当前数据并导入'))
  button(tree, '取消导入').props.onClick(); tree = panel()
  assert.equal(imports, 0); assert.ok(!button(tree, '覆盖当前数据并导入'))
  upload(tree, text); await tick(); tree = panel()
  global.window = { confirm: () => false }
  button(tree, '覆盖当前数据并导入').props.onClick(); tree = panel()
  assert.equal(imports, 0)
  upload(tree, text); await tick(); tree = panel()
  global.window.confirm = () => true
  button(tree, '覆盖当前数据并导入').props.onClick(); tree = panel()
  assert.equal(imports, 1)
  assert.ok(flatten(tree).some(node => node.props?.children === '学习数据已恢复，统计和列表已更新。'))
  console.log('Passed: JSON/schema/fields validation, subjective details, export whitelist/download, cancelled import, quota failure preservation, immediate hook update, clear and restore, legacy data, unknown IDs, panel file preview/confirmation.')
}
main().catch(error => { console.error(error); process.exitCode = 1 })

