/**
 * Cartivo API — Bundle Recomputation Service
 *
 * This module is the single integration point between the Miro board and
 * Cartivo's AI intelligence layer.  It accepts a modified set of bundle items
 * (e.g. after a drag-drop event on the Miro canvas), recomputes all scores
 * using the existing Confidence Engine and Setup Builder, and returns a
 * structured JSON response ready to be pushed back to Miro widgets.
 *
 * Because Cartivo runs entirely client-side (no dedicated REST backend in this
 * build), recomputation is performed in the browser using the same engines that
 * power the Smart Setup Builder page.  In a production deployment this module
 * could forward requests to a server-side API endpoint.
 */

import {
  computeConfidenceIndex,
  deriveCompatibilityScore,
  deriveBudgetScore,
  type ConfidenceResult,
} from '.././services/confidenceEngine'
import type { CartivoItemMeta, CartivoBundleMeta } from '../types/miro'

// ── Public types ─────────────────────────────────────────────────────────────

export interface BundleItemInput {
  itemId: string
  name: string
  category: string
  price: number
  imageUrl?: string
  styleTags?: string[]
  sustainabilityScore?: number
  durabilityScore?: number
  averageRating?: number
  isCompatible?: boolean
}

export interface RecomputedBundleItem {
  itemId: string
  name: string
  category: string
  price: number
  imageUrl: string
  styleTags: string[]
  sustainabilityScore: number
  compatibilityScore: number
  confidenceIndex: number
  visualFitScore: number
  budgetScore: number
  explanationSummary: string
}

export interface BundleRecomputeRequest {
  bundleId: string
  items: BundleItemInput[]
  /** User's total budget for the bundle */
  budget: number
}

export interface BundleRecomputeResponse {
  bundleId: string
  items: RecomputedBundleItem[]
  overallConfidence: number
  totalCost: number
  remainingBudget: number
  isCompatible: boolean
  lastComputedAt: string
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Derive a synthetic visual-fit score from item attributes.
 * Without a live Perfect Corp AR session, we estimate based on style tag
 * diversity and sustainability proxy.
 */
function estimateVisualFitScore(item: BundleItemInput, allItems: BundleItemInput[]): number {
  const sustainability = item.sustainabilityScore ?? 60
  const rating = item.averageRating ?? 3.5
  const ratingScore = (rating / 5) * 40           // up to 40 pts
  const sustScore = (sustainability / 100) * 35   // up to 35 pts

  // Style-tag alignment bonus: more items sharing a tag = better visual harmony
  const myTags = new Set(item.styleTags ?? [])
  let sharedTagBonus = 0
  for (const other of allItems) {
    if (other.itemId === item.itemId) continue
    for (const tag of other.styleTags ?? []) {
      if (myTags.has(tag)) sharedTagBonus += 5
    }
  }

  return Math.round(Math.min(100, ratingScore + sustScore + Math.min(25, sharedTagBonus)))
}

/** Whether all items in the bundle declare cross-compatibility */
function checkBundleCompatibility(items: BundleItemInput[]): boolean {
  return items.every((item) => item.isCompatible !== false)
}

// ── Rate limiter ─────────────────────────────────────────────────────────────

const RATE_LIMIT_MS = 800
let lastComputedAt = 0

// ── Main API ─────────────────────────────────────────────────────────────────

/**
 * Recompute all bundle scores.  Returns full score breakdown for every item
 * plus an aggregate confidence for the whole bundle.
 *
 * Rate-limited to avoid spamming the engine during rapid drag events.
 */
export async function recomputeBundle(
  request: BundleRecomputeRequest
): Promise<BundleRecomputeResponse> {
  // Enforce rate limit
  const now = Date.now()
  if (now - lastComputedAt < RATE_LIMIT_MS) {
    await new Promise((r) => setTimeout(r, RATE_LIMIT_MS - (now - lastComputedAt)))
  }
  lastComputedAt = Date.now()

  const { bundleId, items, budget } = request
  const totalCost = items.reduce((s, i) => s + i.price, 0)
  const remainingBudget = Math.max(0, budget - totalCost)
  const isCompatible = checkBundleCompatibility(items)

  const recomputedItems: RecomputedBundleItem[] = items.map((item) => {
    const compatibilityScore = deriveCompatibilityScore(
      isCompatible,
      item.averageRating ?? 3.5,
      item.durabilityScore ?? 60
    )
    const visualFitScore = estimateVisualFitScore(item, items)
    const budgetScore = deriveBudgetScore(remainingBudget, budget)

    const result: ConfidenceResult = computeConfidenceIndex({
      compatibilityScore,
      visualFitScore,
      budgetScore,
    })

    return {
      itemId: item.itemId,
      name: item.name,
      category: item.category,
      price: item.price,
      imageUrl: item.imageUrl ?? '',
      styleTags: item.styleTags ?? [],
      sustainabilityScore: item.sustainabilityScore ?? 60,
      compatibilityScore: result.compatibilityScore,
      confidenceIndex: result.confidenceIndex,
      visualFitScore: result.visualFitScore,
      budgetScore: result.budgetScore,
      explanationSummary: result.explanationSummary,
    }
  })

  const overallConfidence =
    recomputedItems.length > 0
      ? Math.round(
          recomputedItems.reduce((s, i) => s + i.confidenceIndex, 0) / recomputedItems.length
        )
      : 0

  return {
    bundleId,
    items: recomputedItems,
    overallConfidence,
    totalCost,
    remainingBudget,
    isCompatible,
    lastComputedAt: new Date().toISOString(),
  }
}

/**
 * Convert a Miro `CartivoItemMeta` back into a `BundleItemInput` for
 * recomputation after a board event.
 */
export function metaToInput(meta: CartivoItemMeta): BundleItemInput {
  return {
    itemId: meta.cartivoItemId,
    name: meta.name,
    category: meta.category,
    price: meta.price,
    imageUrl: meta.imageUrl,
    styleTags: meta.styleTags,
    sustainabilityScore: meta.sustainabilityScore,
    isCompatible: true,
  }
}

/**
 * Convert a `RecomputedBundleItem` to `CartivoItemMeta` for writing back to
 * a Miro item's custom `data` field.
 */
export function itemToMeta(
  item: RecomputedBundleItem,
  bundleId: string
): CartivoItemMeta {
  return {
    cartivoItemId: item.itemId,
    bundleId,
    name: item.name,
    category: item.category,
    price: item.price,
    imageUrl: item.imageUrl,
    compatibilityScore: item.compatibilityScore,
    confidenceIndex: item.confidenceIndex,
    visualFitScore: item.visualFitScore,
    budgetScore: item.budgetScore,
    explanationSummary: item.explanationSummary,
    styleTags: item.styleTags,
    sustainabilityScore: item.sustainabilityScore,
  }
}

/**
 * Build `CartivoBundleMeta` from a recompute response for storing on the
 * bundle frame.
 */
export function responseToBundleMeta(
  response: BundleRecomputeResponse,
  miroItemIds: string[]
): CartivoBundleMeta {
  return {
    bundleId: response.bundleId,
    overallConfidence: response.overallConfidence,
    totalCost: response.totalCost,
    budget: response.totalCost + response.remainingBudget,
    isCompatible: response.isCompatible,
    itemIds: miroItemIds,
    lastComputedAt: response.lastComputedAt,
  }
}
