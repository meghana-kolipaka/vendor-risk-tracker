import { riskLevel } from '../types'

export default function RiskBadge({ score }: { score: number }) {
  const level = riskLevel(score)
  // Text + number, never colour alone, so the meaning survives colour-blindness.
  return (
    <span className={`badge badge-${level.toLowerCase()}`}>
      {level} risk <span className="badge-score">{score}</span>
    </span>
  )
}
