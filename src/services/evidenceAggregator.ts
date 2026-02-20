/**
 * Cartivo Insight Agent™ — Evidence Aggregator
 *
 * Combines You.com real-time search results with Cartivo bundle data to
 * produce scored evidence packages used by the Confidence Index Engine.
 */

import {
  searchTrends,
  fetchCitations,
  type SearchResult,
  type Citation,
  YouComAgentError,
} from './youComAgent'

// ── Public types ──────────────────────────────────────────────────────────────

export interface BundleEvidence {
  /** Matches a bundleId or query slug */
  bundleId: string
  /** 0–100: how well the bundle aligns with current fashion trends */
  trendScore: number
  /** 0–100: estimated price/value availability based on search signals */
  priceScore: number
  /** 0–100: overall popularity / mention frequency */
  popularityScore: number
  /** Human-readable evidence summary */
  summary: string
  /** Source citations for UI display */
  sourceCitations: Citation[]
  /** Raw search results for debugging / extended display */
  searchResults: SearchResult[]
}

export interface AggregatorInput {
  /** Unique identifier for the bundle */
  bundleId: string
  /** Natural-language description of the bundle for search */
  query: string
  /** Optional category hint (e.g. "office wear", "accessories") */
  category?: string
  /** Optional budget hint in local currency */
  budgetHint?: string
}

// ── Scoring helpers ───────────────────────────────────────────────────────────

/** Derives a trend score from search result reliability and volume */
function scoreTrends(results: SearchResult[]): number {
  if (results.length === 0) return 30
  const avgReliability = results.reduce((s, r) => s + r.reliability, 0) / results.length
  const volumeBonus = Math.min(results.length / 5, 1) * 20
  return Math.round(Math.min(100, avgReliability * 80 + volumeBonus))
}

/** Derives a price score based on how many results mention price/availability */
function scorePriceAvailability(results: SearchResult[], budgetHint?: string): number {
  const keywords = ['price', 'available', 'affordable', 'value', 'cost', 'budget', 'deal']
  if (budgetHint) keywords.push(...budgetHint.toLowerCase().split(/\s+/))

  const mentionCount = results.filter(r =>
    keywords.some(k => r.snippet.toLowerCase().includes(k))
  ).length

  const base = 60
  const bonus = (mentionCount / Math.max(1, results.length)) * 40
  return Math.round(Math.min(100, base + bonus))
}

/** Derives a popularity score from snippet mention indicators */
function scorePopularity(results: SearchResult[], citations: Citation[]): number {
  const total = results.length + citations.length
  if (total === 0) return 30

  // Each source contributes up to ~20 pts; cap at 100
  const volumeScore = Math.min(total * 12, 70)
  const recencyBonus = citations.filter(c => {
    if (!c.date) return false
    const age = Date.now() - new Date(c.date).getTime()
    return age < 30 * 24 * 60 * 60 * 1000 // within 30 days
  }).length * 10

  return Math.round(Math.min(100, volumeScore + recencyBonus))
}

/** Builds a human-readable summary paragraph */
function buildSummary(
  query: string,
  trendScore: number,
  priceScore: number,
  popularityScore: number,
  citations: Citation[]
): string {
  const trendLabel =
    trendScore >= 80 ? 'highly trending'
    : trendScore >= 55 ? 'moderately trending'
    : 'showing emerging interest'

  const priceLabel =
    priceScore >= 80 ? 'widely available at competitive prices'
    : priceScore >= 55 ? 'available within expected price ranges'
    : 'with limited price data available'

  const popLabel =
    popularityScore >= 80 ? 'generating strong buzz'
    : popularityScore >= 55 ? 'gaining steady traction'
    : 'with growing interest'

  const citationNote =
    citations.length > 0
      ? ` Backed by ${citations.length} source${citations.length > 1 ? 's' : ''} including ${citations[0].title}.`
      : ''

  return (
    `"${query}" is ${trendLabel} right now, ${priceLabel}, and ${popLabel} across fashion channels.` +
    citationNote
  )
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Aggregates real-time evidence for a bundle and returns scored evidence data.
 *
 * Calls You.com APIs in parallel; gracefully degrades to demo data on errors.
 */
export async function aggregateBundleEvidence(
  input: AggregatorInput
): Promise<BundleEvidence> {
  let searchResults: SearchResult[] = []
  let sourceCitations: Citation[] = []

  try {
    ;[searchResults, sourceCitations] = await Promise.all([
      searchTrends(input.query, input.category),
      fetchCitations(input.query),
    ])
  } catch (err) {
    if (err instanceof YouComAgentError) {
      // Non-fatal: log and continue with empty arrays (scores will be conservative)
      console.warn('[EvidenceAggregator]', err.message)
    } else {
      throw err
    }
  }

  const trendScore = scoreTrends(searchResults)
  const priceScore = scorePriceAvailability(searchResults, input.budgetHint)
  const popularityScore = scorePopularity(searchResults, sourceCitations)
  const summary = buildSummary(input.query, trendScore, priceScore, popularityScore, sourceCitations)

  return {
    bundleId: input.bundleId,
    trendScore,
    priceScore,
    popularityScore,
    summary,
    sourceCitations,
    searchResults,
  }
}
