/**
 * Cartivo Insight Agent™ — You.com API Agent Service
 *
 * Provides real-time web search results and citation-backed data for
 * Cartivo bundle recommendations using the You.com Web Search API.
 *
 * Docs: https://documentation.you.com/api-reference/
 */

// ── Config ────────────────────────────────────────────────────────────────────

const YOU_API_KEY = import.meta.env.VITE_YOU_API_KEY as string | undefined
const YOU_SEARCH_URL = 'https://api.ydc-index.io/search'
const YOU_NEWS_URL = 'https://api.ydc-index.io/news'

/** Minimum source reliability score (0–1) to include in results */
const MIN_RELIABILITY = 0.4
/** Max web results to request per call */
const MAX_RESULTS = 5
/** Minimum ms between API calls (simple rate limiting) */
const RATE_LIMIT_MS = 500

let _lastCallAt = 0

async function rateLimitedFetch(url: string, init?: RequestInit): Promise<Response> {
  const now = Date.now()
  const wait = RATE_LIMIT_MS - (now - _lastCallAt)
  if (wait > 0) await new Promise(r => setTimeout(r, wait))
  _lastCallAt = Date.now()
  return fetch(url, init)
}

// ── Public types ──────────────────────────────────────────────────────────────

export interface SearchResult {
  title: string
  url: string
  snippet: string
  /** ISO date string if available */
  publishedDate?: string
  /** Estimated reliability 0–1 */
  reliability: number
}

export interface Citation {
  title: string
  url: string
  date?: string
  snippet: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildHeaders(): HeadersInit {
  if (!YOU_API_KEY) throw new YouComAgentError('YOU_COM_API_KEY is not configured.')
  return { 'X-API-Key': YOU_API_KEY, 'Content-Type': 'application/json' }
}

/** Rough reliability heuristic based on domain and snippet length */
function estimateReliability(hit: YouHit): number {
  const domainScore = /\.(com|org|net|io|co\.uk)/.test(hit.url) ? 0.6 : 0.4
  const snippetScore = Math.min((hit.description?.length ?? 0) / 300, 0.4)
  return Math.min(1, domainScore + snippetScore)
}

// ── You.com raw response types ────────────────────────────────────────────────

interface YouHit {
  title: string
  url: string
  description?: string
  snippets?: string[]
  published_date?: string
}

interface YouSearchResponse {
  hits?: YouHit[]
}

interface YouNewsArticle {
  title: string
  url: string
  description?: string
  published_date?: string
}

interface YouNewsResponse {
  news?: { results?: YouNewsArticle[] }
}

// ── Error type ────────────────────────────────────────────────────────────────

export class YouComAgentError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'YouComAgentError'
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Searches for current trend data related to a query and optional category.
 *
 * Returns filtered, reliability-scored results from You.com Web Search.
 * Falls back to mock data when the API key is not configured.
 */
export async function searchTrends(
  query: string,
  category?: string
): Promise<SearchResult[]> {
  const q = category ? `${query} ${category} fashion trends` : `${query} fashion trends`

  if (!YOU_API_KEY) return getMockSearchResults(query)

  const params = new URLSearchParams({ query: q, num_web_results: String(MAX_RESULTS) })
  const res = await rateLimitedFetch(`${YOU_SEARCH_URL}?${params}`, {
    headers: buildHeaders(),
  })

  if (!res.ok) {
    throw new YouComAgentError(`You.com search failed: ${res.status} ${res.statusText}`)
  }

  const data: YouSearchResponse = await res.json()
  const hits = data.hits ?? []

  return hits
    .map((hit): SearchResult => ({
      title: hit.title,
      url: hit.url,
      snippet: hit.snippets?.[0] ?? hit.description ?? '',
      publishedDate: hit.published_date,
      reliability: estimateReliability(hit),
    }))
    .filter(r => r.reliability >= MIN_RELIABILITY)
}

/**
 * Fetches citation-quality news articles for a query.
 *
 * Suitable for evidence attribution in bundle scoring.
 * Falls back to mock data when the API key is not configured.
 */
export async function fetchCitations(
  query: string,
  limit = MAX_RESULTS
): Promise<Citation[]> {
  if (!YOU_API_KEY) return getMockCitations(query)

  const params = new URLSearchParams({ q: query, count: String(limit) })
  const res = await rateLimitedFetch(`${YOU_NEWS_URL}?${params}`, {
    headers: buildHeaders(),
  })

  if (!res.ok) {
    throw new YouComAgentError(`You.com news fetch failed: ${res.status} ${res.statusText}`)
  }

  const data: YouNewsResponse = await res.json()
  const articles = data.news?.results ?? []

  return articles.slice(0, limit).map((a): Citation => ({
    title: a.title,
    url: a.url,
    date: a.published_date,
    snippet: a.description ?? '',
  }))
}

// ── Demo/fallback data ────────────────────────────────────────────────────────

function getMockSearchResults(query: string): SearchResult[] {
  const term = query.toLowerCase()
  return [
    {
      title: `Top Trending: ${query} — Style Guide 2026`,
      url: 'https://www.vogue.com/fashion/trends',
      snippet: `${query} continues to dominate fashion feeds with a 34% surge in search volume this quarter. Minimalist silhouettes and neutral palettes lead the category.`,
      publishedDate: '2026-02-10',
      reliability: 0.85,
    },
    {
      title: `${term.includes('office') ? 'Office Wear' : 'Fashion'} Trend Report — Feb 2026`,
      url: 'https://www.harpersbazaar.com/fashion',
      snippet: `According to search trend data, ${query} queries are up 28% year-over-year, with strong engagement in the 25–40 demographic.`,
      publishedDate: '2026-02-14',
      reliability: 0.80,
    },
    {
      title: `Instagram Trend Digest — ${query}`,
      url: 'https://business.instagram.com/blog/fashion-trends',
      snippet: `Hashtag analysis shows #${query.replace(/\s+/g, '')} grew 41% month-over-month on Instagram Reels with over 2M impressions.`,
      publishedDate: '2026-02-17',
      reliability: 0.75,
    },
  ]
}

function getMockCitations(query: string): Citation[] {
  return [
    {
      title: `Fashion Week Recap: ${query} Steals the Spotlight`,
      url: 'https://www.elle.com/fashion/trend-reports',
      date: '2026-02-12',
      snippet: `Designers across Lagos, London, and Milan embraced ${query} in their SS26 collections, signalling a mainstream shift.`,
    },
    {
      title: `Price Watch: ${query} Availability & Value Index`,
      url: 'https://www.businessoffashion.com/articles/retail',
      date: '2026-02-15',
      snippet: `Retail availability for ${query} items improved 22% QoQ, with competitive pricing maintaining strong consumer demand.`,
    },
    {
      title: `Consumer Report: ${query} Satisfaction & Quality`,
      url: 'https://www.consumerreports.org/apparel',
      date: '2026-01-30',
      snippet: `Survey of 3,400 shoppers rates ${query} products 4.3/5 on quality satisfaction, ahead of category average.`,
    },
  ]
}

/** Returns true if a real API key is present */
export function isYouComConfigured(): boolean {
  return Boolean(YOU_API_KEY)
}
