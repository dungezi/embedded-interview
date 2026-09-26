import type { SubjectiveScore } from '../types/subjective'

export default function SubjectiveFeedback({ result }: { result: SubjectiveScore }) {
  return <section className="scoring-feedback" aria-label="主观题评分反馈">
    <h3>关键点匹配度：{result.score === null ? '暂无评分规则' : `${result.score}%`}</h3>
    <p className="muted">仅按关键词匹配提供参考，不代表答案语义正确或代码可以运行。代码不会被编译或执行。</p>
    {result.score !== null && <>
      <h3>已覆盖知识点</h3>
      {result.matchedKeyPoints.length ? <ul>{result.matchedKeyPoints.map(point => <li key={point.id}>✓ {point.description}（权重 {point.weight}）</li>)}</ul> : <p>暂未匹配到关键点。</p>}
      <h3>遗漏知识点</h3>
      {result.missedKeyPoints.length ? <ul>{result.missedKeyPoints.map(point => <li key={point.id}>{point.description}（权重 {point.weight}）</li>)}</ul> : <p>已匹配全部配置的关键点，仍请对照参考答案检查语义。</p>}
    </>}
    <h3>检测到的错误概念</h3>
    {result.detectedMisconceptions.length ? <ul className="misconceptions">{result.detectedMisconceptions.map(item => <li key={item.id}>{item.message}（扣 {item.penalty} 分）</li>)}</ul> : <p className="muted">未匹配到配置的错误概念，不等于答案没有错误。</p>}
  </section>
}
