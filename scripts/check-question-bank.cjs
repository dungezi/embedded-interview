/* 使用项目已有 TypeScript 转译器，不引入测试依赖。 */
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')
const React = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
const cache = new Map()
let states = []
let cursor = 0
const mockReact = {
  ...React,
  useState(initial) {
    const index = cursor++
    if (!(index in states)) states[index] = typeof initial === 'function' ? initial() : initial
    return [states[index], value => { states[index] = typeof value === 'function' ? value(states[index]) : value }]
  },
}
function load(file) {
  file = path.resolve(file)
  if (cache.has(file)) return cache.get(file).exports
  const module = { exports: {} }
  cache.set(file, module)
  const js = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText
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
const { categories } = load('src/data/categories.ts')
const { filterQuestions, shuffleQuestions, typeNames, checkAnswer } = load('src/utils/questions.ts')
const tags = new Set(categories.flatMap(category => category.tags.map(tag => tag.id)))
assert.equal(questions.length, 200)
const newChoices = questions.filter(question => question.id >= 151 && question.id <= 200)
assert.equal(newChoices.length, 50)
assert.ok(newChoices.every(question => question.type === 'single' || question.type === 'multiple'))
for (const question of newChoices) {
  assert.equal(checkAnswer(question, question.answer), true, `Correct answer rejected: ${question.id}`)
  if (question.type === 'multiple') {
    assert.equal(checkAnswer(question, [...question.answer].reverse()), true)
    assert.equal(checkAnswer(question, question.answer.slice(1)), false)
    const extra = question.options.find(option => !question.answer.includes(option.id))
    assert.ok(extra, `Multiple choice must include a distractor: ${question.id}`)
    assert.equal(checkAnswer(question, [...question.answer, extra.id]), false)
  } else {
    for (const option of question.options.filter(option => option.id !== question.answer)) assert.equal(checkAnswer(question, option.id), false)
  }
}
assert.equal(new Set(questions.map(question => question.id)).size, questions.length)
assert.equal(new Set(questions.map(question => question.title.replace(/\s/g, '').toLowerCase())).size, questions.length, 'Duplicate titles')
// 标题三元组相似度用于发现机械改写；不同题型对同一概念的应用题需人工结合内容判断。
function grams(title) {
  const normalized = title.toLowerCase().replace(/[\s\p{P}]/gu, '')
  return new Set(Array.from({ length: Math.max(0, normalized.length - 2) }, (_, index) => normalized.slice(index, index + 3)))
}
const nearDuplicates = []
for (let index = 0; index < questions.length; index++) {
  for (let other = index + 1; other < questions.length; other++) {
    const a = grams(questions[index].title), b = grams(questions[other].title)
    const similarity = 2 * [...a].filter(value => b.has(value)).length / (a.size + b.size)
    if (similarity >= 0.8) nearDuplicates.push([questions[index].id, questions[other].id])
  }
}
assert.deepEqual(nearDuplicates, [], 'Inspect highly similar titles')
for (const question of questions) {
  assert.ok(Number.isInteger(question.id) && question.id > 0)
  assert.ok(question.tags.length && question.tags.every(tag => tags.has(tag)), `Invalid tags: ${question.id}`)
  assert.ok(question.title && question.explanation && question.related?.length, `Missing content: ${question.id}`)
  assert.ok(question.type in typeNames)
  assert.ok(['easy', 'medium', 'hard'].includes(question.difficulty))
  if (question.type === 'short_answer' || question.type === 'code') {
    const evaluation = question.subjectiveEvaluation
    assert.ok(evaluation?.keyPoints.length, `Missing scoring config: ${question.id}`)
    assert.equal(evaluation.keyPoints.reduce((sum, point) => sum + point.weight, 0), 100)
    assert.equal(new Set(evaluation.keyPoints.map(point => point.id)).size, evaluation.keyPoints.length)
    assert.ok(evaluation.keyPoints.every(point => point.description && point.keywords.length && point.keywords.every(keyword => keyword.trim())))
  }
  if (question.type === 'single' || question.type === 'multiple') {
    assert.ok(question.options?.length >= 2)
    const ids = question.options.map(option => option.id)
    assert.equal(new Set(ids).size, ids.length)
    const answers = Array.isArray(question.answer) ? question.answer : [question.answer]
    assert.ok(answers.length && answers.every(answer => ids.includes(answer)), `Invalid answer: ${question.id}`)
    assert.equal(new Set(answers).size, answers.length)
    assert.ok(question.type === 'single' ? typeof question.answer === 'string' : Array.isArray(question.answer))
    for (const option of question.options) assert.ok(option.explanation.length > 15, `Missing explanation: ${question.id}/${option.id}`)
  } else if (question.type === 'true_false') {
    assert.equal(typeof question.answer, 'boolean')
  } else {
    assert.equal(typeof question.answer, 'string')
    if (question.type === 'short_answer') {
      assert.ok(question.answer.includes('面试简答版') && question.answer.includes('详细解释'))
    }
  }
}
for (let id = 1; id <= 200; id++) assert.ok(questions.some(question => question.id === id), `Missing stable ID: ${id}`)
const allTypes = Object.keys(typeNames)
const allTags = [...tags]
assert.equal(filterQuestions(questions, [], 'all').length, 0)
assert.equal(filterQuestions(questions, allTags, 'all', []).length, 0)
assert.equal(filterQuestions(questions, allTags, 'all').length, questions.length)
assert.ok(filterQuestions(questions, allTags, 'all', allTypes, { query: '  VoLaTiLe  ' }).length > 0)
assert.deepEqual(filterQuestions(questions, allTags, 'all', allTypes, { query: '不存在的题目abcdef' }), [])
const combined = filterQuestions(questions, ['stm32', 'freertos'], 'medium', ['short_answer'], { query: 'STM32', categoryId: 'mcu-processors' })
assert.ok(combined.length)
assert.ok(combined.every(question => question.type === 'short_answer' && question.difficulty === 'medium' && question.tags.includes('stm32') && [question.title, ...(question.related ?? []), question.explanation].join(' ').includes('STM32')))
const relatedOnly = { ...questions[0], title: '普通标题', explanation: '普通解析', related: ['UniqueRelatedTerm'] }
assert.equal(filterQuestions([relatedOnly], allTags, 'all', allTypes, { query: 'uniquerelatedterm' }).length, 1)
assert.equal(filterQuestions([{ ...relatedOnly, related: [], explanation: 'UniqueExplanation' }], allTags, 'all', allTypes, { query: 'uniqueexplanation' }).length, 1)
for (const category of categories) {
  const result = filterQuestions(questions, allTags, 'all', allTypes, { categoryId: category.id })
  assert.ok(result.length >= 3, `Sparse category: ${category.name}`)
  assert.ok(result.every(question => category.tags.some(tag => question.tags.includes(tag.id))))
}
for (const difficulty of ['easy', 'medium', 'hard']) assert.ok(filterQuestions(questions, allTags, difficulty).every(question => question.difficulty === difficulty))
for (const type of allTypes) assert.ok(filterQuestions(questions, allTags, 'all', [type]).every(question => question.type === type))
assert.ok(filterQuestions(questions, ['c', 'stm32'], 'all').some(question => question.tags.includes('c') && !question.tags.includes('stm32')))
assert.ok(filterQuestions(questions, ['c', 'stm32'], 'all').some(question => question.tags.includes('stm32') && !question.tags.includes('c')))
const shuffled = shuffleQuestions(combined, () => 0)
assert.notEqual(shuffled, combined)
assert.deepEqual([...shuffled].map(question => question.id).sort(), [...combined].map(question => question.id).sort())
assert.equal(new Set(shuffled.map(question => question.id)).size, shuffled.length)
const Home = load('src/pages/Home.tsx').default
let started = []
const homeFilters = { tags: ['stm32', 'freertos'], difficulty: 'medium', types: ['short_answer'] }
const home = Home({ filters: homeFilters, onFiltersChange() {}, onStart(value) { started = value }, onNavigate() {} })
const randomButton = flatten(home).find(node => node.type === 'button' && node.props.children === '随机刷题')
randomButton.props.onClick()
assert.deepEqual(started.map(question => question.id).sort(), filterQuestions(questions, homeFilters.tags, homeFilters.difficulty, homeFilters.types).map(question => question.id).sort())
assert.equal(new Set(started.map(question => question.id)).size, started.length)
const { scoreSubjectiveAnswer } = load('src/utils/subjectiveScoring.ts')
for (const question of questions.filter(question => question.id >= 121 && ['short_answer', 'code'].includes(question.type))) {
  assert.ok(scoreSubjectiveAnswer(question, question.answer).score >= 60, `Reference answer does not cover its key points: ${question.id}`)
}

const store = new Map()
global.localStorage = { getItem: key => store.get(key) ?? null, setItem: (key, value) => store.set(key, value), removeItem: key => store.delete(key) }
const { saveStudyData, loadStudyData } = load('src/utils/storage.ts')
const legacy = { records: [{ questionId: 1, answer: 'B', correct: true, answeredAt: '2026-09-26' }], wrongIds: [3], favoriteIds: [] }
saveStudyData(legacy)
assert.deepEqual(loadStudyData().data, { ...legacy, reviewIds: [] })
const useStudyData = load('src/hooks/useStudyData.ts').useStudyData
function study() { cursor = 0; return useStudyData() }
let learning = study()
const QuestionBank = load('src/pages/QuestionBank.tsx').default
// 隔离页面自身状态与 Hook 状态；浏览回调只能进入收藏接口。
const hookStates = states
states = []
function bank() { cursor = 0; return QuestionBank({ favoriteIds: learning.data.favoriteIds, onFavorite: learning.toggleFavorite }) }
let tree = bank()
assert.equal(flatten(tree).filter(node => node.type === 'article').length, 12)
const nodes = flatten(tree)
assert.ok(nodes.some(node => node.type === 'details'))
nodes.find(node => node.type === 'input' && node.props.type === 'search').props.onChange({ target: { value: 'volatile' } })
tree = bank()
assert.ok(flatten(tree).filter(node => node.type === 'article').length > 0)
assert.deepEqual(loadStudyData().data, { ...legacy, reviewIds: [] })
const favorite = flatten(tree).find(node => node.type === 'button' && node.props.children === '☆ 收藏题目')
states = hookStates
favorite.props.onClick()
learning = study()
assert.equal(learning.data.favoriteIds.length, 1)
assert.deepEqual(learning.data.records, legacy.records)
assert.deepEqual(learning.data.wrongIds, legacy.wrongIds)
assert.deepEqual(loadStudyData().data.records, legacy.records)
states = []; cursor = 0
assert.ok(renderToStaticMarkup(React.createElement(QuestionBank, { favoriteIds: [], onFavorite() {} })).includes('题库'))
const groupCount = key => Object.fromEntries([...new Set(questions.map(question => question[key]))].map(value => [value, questions.filter(question => question[key] === value).length]))
console.log(JSON.stringify({
  total: questions.length,
  categories: Object.fromEntries(categories.map(category => [category.name, questions.filter(question => category.tags.some(tag => question.tags.includes(tag.id))).length])),
  types: groupCount('type'),
  difficulties: groupCount('difficulty'),
  uncoveredTags: [...tags].filter(tag => !questions.some(question => question.tags.includes(tag))),
  checks: 'Passed: data integrity, search and combined filters, shuffle, old records, browsing and favorites do not change records or wrong book.',
}, null, 2))
