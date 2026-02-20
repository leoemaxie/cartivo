/**
 * Cartivo Confidence™ — Visual Fit Scoring Engine
 *
 * Converts raw Perfect Corp metrics into a human-readable Visual Fit Score
 * and an actionable confidence band.
 */

import { TryOnResult } from './perfectCorpService'

export type ConfidenceBand = 'Low' | 'Moderate' | 'High'

export interface VisualFitResult {
  /** Weighted composite score 0–100 */
  visualFitScore: number
  /** Human-readable explanation of the score */
  visualInsight: string
  /** Categorical band derived from the score */
  confidenceBand: ConfidenceBand
}

// ── Scoring weights ──────────────────────────────────────────────────────────

const WEIGHTS = {
  faceAlignment: 0.4,
  overlayConfidence: 0.4,
  detectionQuality: 0.2,
} as const

// ── Band thresholds ──────────────────────────────────────────────────────────

function deriveConfidenceBand(score: number): ConfidenceBand {
  if (score >= 75) return 'High'
  if (score >= 50) return 'Moderate'
  return 'Low'
}

// ── Insight generator ────────────────────────────────────────────────────────

function generateVisualInsight(
  score: number,
  band: ConfidenceBand,
  metrics: TryOnResult
): string {
  if (metrics.detectionQuality < 40) {
    return 'Detection quality was limited — try a clearer, well-lit photo facing the camera directly.'
  }

  if (band === 'High') {
    if (metrics.faceAlignmentScore >= 85) {
      return 'Product aligns proportionally with facial structure and frame positioning is highly accurate.'
    }
    return 'Strong visual alignment detected. The product sits naturally within your frame and proportions.'
  }

  if (band === 'Moderate') {
    if (metrics.overlayConfidence < 60) {
      return 'Overlay positioning is approximate. The product should look close to this in person; a mirror check is advised.'
    }
    return 'Visual fit is acceptable. Minor alignment variance noted — the product will likely suit your style profile.'
  }

  // Low
  return 'Visual fit confidence is low. Consider using a front-facing, well-lit photo for a more accurate result.'
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Converts raw Perfect Corp metrics into a structured Visual Fit Score.
 *
 * Formula:
 *   visualFitScore = (faceAlignmentScore × 0.4)
 *                  + (overlayConfidence  × 0.4)
 *                  + (detectionQuality   × 0.2)
 */
export function computeVisualFitScore(tryOnResult: TryOnResult): VisualFitResult {
  const raw =
    tryOnResult.faceAlignmentScore * WEIGHTS.faceAlignment +
    tryOnResult.overlayConfidence * WEIGHTS.overlayConfidence +
    tryOnResult.detectionQuality * WEIGHTS.detectionQuality

  const visualFitScore = Math.round(Math.min(100, Math.max(0, raw)))
  const confidenceBand = deriveConfidenceBand(visualFitScore)
  const visualInsight = generateVisualInsight(visualFitScore, confidenceBand, tryOnResult)

  return { visualFitScore, visualInsight, confidenceBand }
}
