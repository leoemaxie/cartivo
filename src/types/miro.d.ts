/**
 * Miro Web SDK 2.0 — Ambient Type Declarations
 *
 * Extends the global `window` object with `miro` when the app is running
 * inside the Miro canvas environment.  These types mirror the official
 * `@mirohq/websdk-types` package and are extended here with Cartivo-specific
 * metadata stored in item `data` fields.
 */

// Re-export the official SDK types so TypeScript can resolve `Miro` globally
// when the `@mirohq/websdk-types` devDependency is installed.
import type { Miro } from '@mirohq/websdk-types'

declare global {
  interface Window {
    /** Miro Web SDK 2.0 — injected by Miro when app runs inside the canvas */
    miro: Miro
  }

  /** Convenience alias so service code can type `const miro = getMiroSdk()` */
  const miro: Miro
}

// ── Cartivo-specific metadata stored inside Miro item custom data ────────────

export interface CartivoItemMeta {
  cartivoItemId: string
  bundleId: string
  name: string
  category: string
  price: number
  imageUrl: string
  compatibilityScore: number
  confidenceIndex: number
  visualFitScore: number
  budgetScore: number
  explanationSummary: string
  styleTags: string[]
  sustainabilityScore: number
  isLocked?: boolean
}

export interface CartivoBundleMeta {
  bundleId: string
  overallConfidence: number
  totalCost: number
  budget: number
  isCompatible: boolean
  itemIds: string[]
  lastComputedAt: string
}
