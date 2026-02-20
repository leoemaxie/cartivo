/**
 * Cartivo Confidence™ — Confidence Index Aggregator
 *
 * Merges three signal streams — compatibility, visual fit, and budget — into
 * a single, explainable Confidence Index™ that gives buyers a measurable
 * decision metric.
 */

export interface ConfidenceInput {
  /** 0–100: product compatibility score from the existing engine */
  compatibilityScore: number
  /** 0–100: visual fit score from the Visual Fit Engine */
  visualFitScore: number
  /** 0–100: budget alignment score (100 = fully within budget) */
  budgetScore: number
}

export interface ConfidenceResult {
  compatibilityScore: number
  visualFitScore: number
  budgetScore: number
  /** Weighted aggregate: the Confidence Index™ */
  confidenceIndex: number
  /** One-sentence plain-language summary */
  explanationSummary: string
}

// ── Scoring weights ──────────────────────────────────────────────────────────

const WEIGHTS = {
  compatibility: 0.5,
  visualFit: 0.3,
  budget: 0.2,
} as const

// ── Summary generator ────────────────────────────────────────────────────────

function generateSummary(result: Omit<ConfidenceResult, 'explanationSummary'>): string {
  const { compatibilityScore, visualFitScore, budgetScore, confidenceIndex } = result

  const compatLabel =
    compatibilityScore >= 80 ? 'strong stylistic compatibility'
    : compatibilityScore >= 55 ? 'reasonable stylistic alignment'
    : 'limited product compatibility'

  const visualLabel =
    visualFitScore >= 75 ? 'high visual alignment'
    : visualFitScore >= 50 ? 'moderate visual alignment'
    : 'low visual alignment'

  const budgetLabel =
    budgetScore >= 90 ? 'full budget compliance'
    : budgetScore >= 65 ? 'good budget fit'
    : 'some budget pressure'

  const indexLabel =
    confidenceIndex >= 80 ? 'an excellent confidence score'
    : confidenceIndex >= 60 ? 'a solid confidence score'
    : confidenceIndex >= 40 ? 'a moderate confidence score'
    : 'a low confidence score'

  return (
    `This bundle achieves ${compatLabel} and ${visualLabel}, with ${budgetLabel} — ` +
    `resulting in ${indexLabel} of ${confidenceIndex}/100.`
  )
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Derives a budget score from setup builder figures.
 *
 * @param remainingBudget  Leftover budget after bundle cost
 * @param maxBudget        Original max budget entered by the user
 */
export function deriveBudgetScore(remainingBudget: number, maxBudget: number): number {
  if (maxBudget <= 0) return 100
  const ratio = Math.max(0, remainingBudget) / maxBudget
  // Score 100 at 0% spent-over, scales down; if over budget score = 0
  return Math.round(Math.min(100, Math.max(0, ratio * 100 + 60)))
}

/**
 * Derives a compatibility score from the setup builder result.
 *
 * @param isCompatible     Whether all products in the bundle are compatible
 * @param avgRating        Average product rating (0–5)
 * @param avgDurability    Average durability score (0–100)
 */
export function deriveCompatibilityScore(
  isCompatible: boolean,
  avgRating: number,
  avgDurability: number
): number {
  const base = isCompatible ? 70 : 30
  const ratingBonus = (avgRating / 5) * 15        // up to 15 pts
  const durabilityBonus = (avgDurability / 100) * 15  // up to 15 pts
  return Math.round(Math.min(100, base + ratingBonus + durabilityBonus))
}

/**
 * Computes the final Confidence Index™.
 *
 * Formula:
 *   confidenceIndex = (compatibilityScore × 0.5)
 *                   + (visualFitScore     × 0.3)
 *                   + (budgetScore        × 0.2)
 */
export function computeConfidenceIndex(input: ConfidenceInput): ConfidenceResult {
  const raw =
    input.compatibilityScore * WEIGHTS.compatibility +
    input.visualFitScore * WEIGHTS.visualFit +
    input.budgetScore * WEIGHTS.budget

  const confidenceIndex = Math.round(Math.min(100, Math.max(0, raw)))

  const partial = {
    compatibilityScore: Math.round(input.compatibilityScore),
    visualFitScore: Math.round(input.visualFitScore),
    budgetScore: Math.round(input.budgetScore),
    confidenceIndex,
  }

  return {
    ...partial,
    explanationSummary: generateSummary(partial),
  }
}
