import type { KeyPoint, Misconception } from './question'

export interface SubjectiveScore {
  /** 无规则时为 null，不伪造匹配度。 */
  score: number | null
  matchedKeyPoints: KeyPoint[]
  missedKeyPoints: KeyPoint[]
  detectedMisconceptions: Misconception[]
}
