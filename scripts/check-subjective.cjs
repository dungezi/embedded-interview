const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')
const React = require('react')
const cache = new Map()
let states = [], cursor = 0
const mockReact = { ...React, useState(initial) {
  const index = cursor++
  if (!(index in states)) states[index] = typeof initial === 'function' ? initial() : initial
  return [states[index], value => { states[index] = typeof value === 'function' ? value(states[index]) : value }]
} }
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
const { questions } = load('src/data/questions.ts')
const { scoreSubjectiveAnswer } = load('src/utils/subjectiveScoring.ts')
const { applyAnswerRecord, getRecordDisposition, getStudyStatistics } = load('src/utils/study.ts')
const { emptyStudyData, loadStudyData, saveStudyData, STORAGE_KEY } = load('src/utils/storage.ts')
const q = questions.find(question => question.id === 35)
const high = 'counter++ 是读改写操作，volatile 限制编译器优化，但不能保证线程安全，也不能保证原子性，应使用临界区保护。'
const partial = 'volatile 限制编译器优化。'
const wrong = 'volatile 保证线程安全和保证原子性。'
const scores = [high, partial, wrong, ''].map(answer => scoreSubjectiveAnswer(q, answer))
assert.equal(scores[0].score, 100)
assert.equal(scores[0].detectedMisconceptions.length, 0)
assert.equal(scores[1].score, 35)
assert.equal(scores[2].score, 0)
assert.equal(scores[2].detectedMisconceptions.length, 1)
assert.equal(scores[3].score, 0)
assert.equal(scores[3].missedKeyPoints.length, 3)
assert.equal(scoreSubjectiveAnswer(q, '读 改 写 编译器优化 临 界 区').score, 100)
const codeQuestion = questions.find(question => question.id === 10)
assert.equal(scoreSubjectiveAnswer(codeQuestion, 'SYNC_STAGE1 <= x; always @(POSEDGE clk) // 窄 脉 冲').score, 100)
assert.equal(scoreSubjectiveAnswer({ ...q, subjectiveEvaluation: undefined }, high).score, null)
const base = { attemptId: 's1', questionId: q.id, answer: high, kind: 'subjective', correct: false, subjectiveScore: scores[0], selfAssessment: null, answeredAt: '2026-09-26T12:00:00Z' }
for (const assessment of ['mastered', 'partial', 'unknown', null]) {
  const record = { ...base, selfAssessment: assessment }
  const result = applyAnswerRecord(emptyStudyData(), record)
  assert.equal(result.wrongIds.includes(q.id), assessment === 'unknown')
  assert.equal(result.reviewIds.includes(q.id), assessment === 'partial')
  assert.equal(result.records[0].selfAssessment, assessment)
  assert.equal(result.records[0].subjectiveScore.score, 100)
}
for (const assessment of ['mastered', 'partial', 'unknown', null]) {
  assert.equal(getRecordDisposition({ ...base, selfAssessment: assessment, subjectiveScore: scores[1] }).inWrongBook, true)
}
assert.equal(getRecordDisposition({ ...base, subjectiveScore: { ...scores[0], score: 60 } }).inWrongBook, false)
assert.equal(getRecordDisposition({ ...base, subjectiveScore: { ...scores[0], score: 59 } }).inWrongBook, true)
let data = applyAnswerRecord(emptyStudyData(), { ...base, subjectiveScore: scores[1] })
assert.ok(data.wrongIds.includes(q.id))
data = applyAnswerRecord(data, { ...base, subjectiveScore: scores[1], selfAssessment: 'partial' })
assert.equal(data.records.length, 1)
assert.ok(data.reviewIds.includes(q.id))
// 真正重练用新 attemptId，旧评分保留，集合与统计切换到最新状态。
data = applyAnswerRecord(data, { ...base, attemptId: 's2', selfAssessment: null })
assert.equal(data.records.length, 2)
assert.deepEqual(data.wrongIds, [])
assert.deepEqual(data.reviewIds, [])
let stats = getStudyStatistics(data.records, questions)
assert.equal(stats.subjectiveCompleted, 1)
assert.equal(stats.subjectiveAverage, 100)
assert.equal(stats.skipped, 1)
assert.equal(stats.objectiveAccuracy, null)
const objective = { questionId: 1, kind: 'objective', correct: true, answer: 'B', answeredAt: base.answeredAt }
data = applyAnswerRecord(data, objective)
stats = getStudyStatistics(data.records, questions)
assert.equal(stats.objectiveAccuracy, 100)
assert.equal(stats.objectiveAttempts, 1)
data = applyAnswerRecord(data, { ...objective, attemptId: 'o2', correct: false, outcome: 'unknown' })
assert.equal(getStudyStatistics(data.records, questions).objectiveAccuracy, 50)
const store = new Map()
global.localStorage = { getItem: key => store.get(key) ?? null, setItem: (key, value) => store.set(key, value), removeItem: key => store.delete(key) }
const legacy = { records: [{ questionId: 8, answer: '旧答案', correct: true, outcome: 'mastered', answeredAt: base.answeredAt }, objective], wrongIds: [3], favoriteIds: [8] }
store.set(STORAGE_KEY, JSON.stringify(legacy))
assert.equal(loadStudyData().error, '')
assert.deepEqual(loadStudyData().data.reviewIds, [])
stats = getStudyStatistics(loadStudyData().data.records, questions)
assert.equal(stats.mastered, 1)
assert.equal(stats.subjectiveAverage, null)
assert.equal(stats.objectiveAccuracy, 100)
saveStudyData(data)
assert.deepEqual(loadStudyData().data, data)
const SubjectiveAnswer = load('src/components/SubjectiveAnswer.tsx').default
states = []; let saved = emptyStudyData(), advanced = 0
function render() { cursor = 0; return SubjectiveAnswer({ question: q, onAnswer(record) { saved = applyAnswerRecord(saved, record) }, onNext() { advanced++ }, last: false }) }
let tree = render()
assert.equal(flatten(tree).find(node => node.type === 'button' && node.props.children === '提交答案').props.disabled, true)
flatten(tree).find(node => node.type === 'textarea').props.onChange({ target: { value: high } })
tree = render()
flatten(tree).find(node => node.type === 'button' && node.props.children === '提交答案').props.onClick()
tree = render()
assert.equal(saved.records.length, 1)
assert.equal(saved.records[0].selfAssessment, null)
assert.equal(saved.records[0].subjectiveScore.score, 100)
for (const [label, value] of [['掌握', 'mastered'], ['部分掌握', 'partial'], ['不会', 'unknown'], ['跳过自评', null]]) {
  flatten(tree).find(node => node.type === 'button' && node.props.children === label).props.onClick()
  tree = render()
  assert.equal(saved.records.length, 1)
  assert.equal(saved.records[0].selfAssessment, value)
}
assert.deepEqual(saved.wrongIds, [])
assert.deepEqual(saved.reviewIds, [])
flatten(tree).find(node => node.type === 'button' && node.props.children === '下一题 →').props.onClick()
assert.equal(advanced, 1)
// 空答案的不会入口也合法并立即写入错题。
states = []; saved = emptyStudyData(); tree = render()
flatten(tree).find(node => node.type === 'button' && node.props.children === '不会，查看答案').props.onClick()
tree = render()
assert.equal(saved.records[0].subjectiveScore.score, 0)
assert.equal(saved.records[0].selfAssessment, 'unknown')
assert.ok(saved.wrongIds.includes(q.id))

const custom = { ...q, subjectiveEvaluation: { keyPoints: [{ id: 'a', description: 'A', keywords: ['alpha'], weight: 1 }, { id: 'b', description: 'B', keywords: ['beta'], weight: 3 }], misconceptions: [{ id: 'bad', keywords: ['bad'], message: 'bad concept', penalty: 200 }] } }
assert.equal(scoreSubjectiveAnswer(custom, 'AL PHA').score, 25)
assert.equal(scoreSubjectiveAnswer(custom, 'alpha beta bad').score, 0)
const ObjectiveAnswer = load('src/components/ObjectiveAnswer.tsx').default
function checkObjective(questionId, choices, expected) {
  states = []; let attempt = null
  const question = questions.find(item => item.id === questionId)
  function renderObjective() { cursor = 0; return ObjectiveAnswer({ question, onAnswer: record => { attempt = record }, onNext() {}, last: true }) }
  let tree = renderObjective()
  for (const choice of choices) {
    flatten(tree).filter(node => node.type === 'input')[choice].props.onChange()
    tree = renderObjective()
  }
  flatten(tree).find(node => node.type === 'button' && node.props.children === '提交答案').props.onClick()
  assert.equal(attempt.correct, expected)
  assert.equal(attempt.kind, 'objective')
  assert.equal(attempt.subjectiveScore, undefined)
}
checkObjective(1, [1], true)
checkObjective(1, [0], false)
checkObjective(3, [0, 1, 3], true)
checkObjective(3, [0, 1], false)
checkObjective(4, [0], true)
checkObjective(4, [1], false)

console.log(JSON.stringify({ shortAnswerTests: { high: scores[0].score, partial: scores[1].score, incorrect: scores[2].score, empty: scores[3].score }, checks: 'Passed: normalization, misconception negation, code matching, score bounds, four assessments, skip persistence, repeat/self-assessment upsert, latest statistics, old storage, objective accuracy isolation, component submit/self-assessment/unknown flow.' }, null, 2))
