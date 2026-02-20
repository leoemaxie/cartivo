/**
 * Miro Widget Service
 *
 * Creates and updates Cartivo bundle items as interactive Miro board items.
 * Each outfit item becomes a Card widget containing:
 *   - Product image
 *   - Compatibility & Confidence Index™ scores
 *   - Style tags
 *   - Trend/AI summary
 *
 * The entire bundle is wrapped in a Miro Frame so users can drag the whole
 * outfit group together.
 *
 * Miro's built-in multi-user real-time sync propagates all widget changes to
 * every collaborator on the board automatically.
 */

import type { Card, Frame, Image, StickyNote } from '@mirohq/websdk-types'
import type { CartivoItemMeta, CartivoBundleMeta } from '@/types/miro'
import type { RecomputedBundleItem, BundleRecomputeResponse } from '@/services/cartivoApi'

// ── Constants ────────────────────────────────────────────────────────────────

const CARD_WIDTH = 260
const CARD_HEIGHT = 340
const CARD_GAP = 32
const FRAME_PADDING = 48
const CONFIDENCE_TAG_PREFIX = '🎯 CI™:'
const CARTIVO_DATA_KEY = 'cartivoMeta'

// ── Helpers ──────────────────────────────────────────────────────────────────

function confidenceColor(score: number): string {
  if (score >= 80) return '#16a34a'   // green
  if (score >= 60) return '#d97706'   // amber
  return '#dc2626'                    // red
}

function scoreLabel(score: number): string {
  if (score >= 80) return 'Excellent'
  if (score >= 60) return 'Good'
  if (score >= 40) return 'Fair'
  return 'Low'
}

/** Build the HTML-rich card description shown inside a Miro Card widget */
function buildCardDescription(item: RecomputedBundleItem): string {
  const ci = item.confidenceIndex
  const compat = item.compatibilityScore
  const tags = item.styleTags.slice(0, 3).join(' · ') || 'No tags'
  return [
    `💲 $${item.price.toFixed(2)}`,
    `${CONFIDENCE_TAG_PREFIX} ${ci}/100 (${scoreLabel(ci)})`,
    `🔗 Compat: ${compat}/100`,
    `🌿 Sustain: ${item.sustainabilityScore}/100`,
    `🏷 ${tags}`,
  ].join('\n')
}

/** Return top-left (x, y) for the i-th card in a horizontal row */
function cardPosition(
  index: number,
  startX: number,
  startY: number
): { x: number; y: number } {
  return {
    x: startX + index * (CARD_WIDTH + CARD_GAP),
    y: startY,
  }
}

// ── Miro SDK accessor ────────────────────────────────────────────────────────

function sdk() {
  if (typeof window === 'undefined' || !window.miro) {
    throw new Error('Miro Web SDK is not available.  Are you running inside Miro?')
  }
  return window.miro
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Push a full bundle onto the Miro board.
 *
 * Creates:
 *  1. A named Frame around all items
 *  2. One Card per outfit item (with image, scores, tags)
 *  3. A Summary sticky note showing overall Confidence Index™
 *
 * Returns the Miro IDs of all created items so the event handler can track
 * them for drag-drop recomputation.
 */
export async function pushBundleToBoard(
  response: BundleRecomputeResponse,
  options: {
    originX?: number
    originY?: number
    bundleName?: string
  } = {}
): Promise<{ frameId: string; cardIds: string[] }> {
  const miro = sdk()
  const { originX = 0, originY = 0, bundleName = 'Cartivo Bundle' } = options
  const { items, bundleId, overallConfidence, totalCost, isCompatible } = response

  const cardCount = items.length
  const frameWidth =
    cardCount * CARD_WIDTH + (cardCount - 1) * CARD_GAP + FRAME_PADDING * 2
  const frameHeight = CARD_HEIGHT + FRAME_PADDING * 3 + 80 // extra for summary bar

  // 1. Create the bundle frame ───────────────────────────────────────────────
  const frame = await miro.board.createFrame({
    title: `${bundleName} · CI™ ${overallConfidence}/100`,
    x: originX + frameWidth / 2,
    y: originY + frameHeight / 2,
    width: frameWidth,
    height: frameHeight,
    style: {
      fillColor: '#f8fafc',
    },
  }) as Frame

  const bundleMeta: CartivoBundleMeta = {
    bundleId,
    overallConfidence,
    totalCost,
    budget: totalCost + response.remainingBudget,
    isCompatible,
    itemIds: [],
    lastComputedAt: response.lastComputedAt,
  }

  // 2. Create one Card per item ──────────────────────────────────────────────
  const cardIds: string[] = []
  const contentStartX = originX + FRAME_PADDING
  const contentStartY = originY + FRAME_PADDING + 60 // leave room for frame title

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    const pos = cardPosition(i, contentStartX, contentStartY)

    const card = await miro.board.createCard({
      title: item.name,
      description: buildCardDescription(item),
      x: pos.x + CARD_WIDTH / 2,
      y: pos.y + CARD_HEIGHT / 2,
      width: CARD_WIDTH,
      style: {
        cardTheme: confidenceColor(item.confidenceIndex),
      },
    }) as Card

    // Store Cartivo metadata in the card's custom data field
    const meta: CartivoItemMeta = {
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

    await (card as any).setMetadata(CARTIVO_DATA_KEY, meta).catch(() => {
      // setMetadata requires app storage permission; gracefully skip if unavailable
    })

    cardIds.push(card.id)

    // Add product image below the card if URL is available
    if (item.imageUrl) {
      await miro.board.createImage({
        url: item.imageUrl,
        x: pos.x + CARD_WIDTH / 2,
        y: pos.y + CARD_HEIGHT + 20,
        width: CARD_WIDTH * 0.8,
      } as any).catch(() => {
        // Image creation may fail for CORS-restricted URLs; silently skip
      })
    }
  }

  // 3. Summary sticky note ───────────────────────────────────────────────────
  const summaryX = originX + frameWidth / 2
  const summaryY = originY + frameHeight - FRAME_PADDING

  const summaryContent = [
    `📊 Bundle Summary`,
    `Confidence Index™: ${overallConfidence}/100 (${scoreLabel(overallConfidence)})`,
    `Total: $${totalCost.toFixed(2)}  ·  ${isCompatible ? '✅ Compatible' : '⚠️ Review Compat'}`,
    `Items: ${items.length}  ·  Last updated: ${new Date(response.lastComputedAt).toLocaleTimeString()}`,
  ].join('\n')

  await miro.board.createStickyNote({
    content: summaryContent,
    x: summaryX,
    y: summaryY,
    width: Math.min(frameWidth - FRAME_PADDING * 2, 600),
    style: {
      fillColor: overallConfidence >= 80 ? 'light_green' : overallConfidence >= 60 ? 'yellow' : 'light_pink',
      textAlign: 'left',
    },
  }) as StickyNote

  // Update frame metadata with card IDs
  bundleMeta.itemIds = cardIds
  await (frame as any).setMetadata(CARTIVO_DATA_KEY, bundleMeta).catch(() => {})

  // Zoom viewport to the new bundle frame
  await miro.board.viewport.zoomTo(frame).catch(() => {})

  return { frameId: frame.id, cardIds }
}

/**
 * Update existing Card widgets in-place after a recomputation.
 *
 * Matches cards by their stored `cartivoItemId` metadata and patches
 * `description`, `title` colour, and metadata — without moving the card so
 * collaborators' spatial arrangement is preserved.
 */
export async function updateBundleCards(
  cardIds: string[],
  response: BundleRecomputeResponse
): Promise<void> {
  const miro = sdk()

  for (const cardId of cardIds) {
    const item = await miro.board.getById(cardId).catch(() => null) as Card | null
    if (!item || item.type !== 'card') continue

    // Find the matching recomputed item by reading stored metadata
    let meta: CartivoItemMeta | null = null
    try {
      meta = await (item as any).getMetadata(CARTIVO_DATA_KEY) as CartivoItemMeta
    } catch {
      // metadata not available
    }

    const recomputed = response.items.find(
      (i) => i.itemId === (meta?.cartivoItemId ?? '')
    )
    if (!recomputed) continue

    // Patch the card fields
    item.title = recomputed.name
    item.description = buildCardDescription(recomputed)
    ;(item as any).style = {
      cardTheme: confidenceColor(recomputed.confidenceIndex),
    }
    await item.sync()

    // Update stored metadata
    const updatedMeta: CartivoItemMeta = {
      ...meta!,
      compatibilityScore: recomputed.compatibilityScore,
      confidenceIndex: recomputed.confidenceIndex,
      visualFitScore: recomputed.visualFitScore,
      budgetScore: recomputed.budgetScore,
      explanationSummary: recomputed.explanationSummary,
    }
    await (item as any).setMetadata(CARTIVO_DATA_KEY, updatedMeta).catch(() => {})
  }
}

/**
 * Read all Cartivo-tagged cards from the current board.
 * Used on initial load to resume a previous session.
 */
export async function findExistingBundleCards(): Promise<
  Array<{ cardId: string; meta: CartivoItemMeta }>
> {
  const miro = sdk()
  const allItems = await miro.board.get({ type: ['card'] })
  const results: Array<{ cardId: string; meta: CartivoItemMeta }> = []

  for (const item of allItems) {
    try {
      const meta = await (item as any).getMetadata(CARTIVO_DATA_KEY) as CartivoItemMeta | undefined
      if (meta?.cartivoItemId) {
        results.push({ cardId: item.id, meta })
      }
    } catch {
      // no metadata or permission denied
    }
  }

  return results
}

/**
 * Remove all Cartivo items from the board for the given bundle ID.
 */
export async function removeBundleFromBoard(bundleId: string): Promise<void> {
  const miro = sdk()
  const cards = await findExistingBundleCards()
  const toDelete = cards.filter((c) => c.meta.bundleId === bundleId)
  for (const { cardId } of toDelete) {
    const item = await miro.board.getById(cardId).catch(() => null)
    if (item) await miro.board.remove(item)
  }
}
