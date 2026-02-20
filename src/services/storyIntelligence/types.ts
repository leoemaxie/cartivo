/**
 * Cartivo Story Intelligence™ — Shared Type Definitions
 *
 * All data structures produced and consumed by the video understanding pipeline.
 */

// ── Video Metadata ────────────────────────────────────────────────────────────

export interface VideoMetadata {
  fileName: string
  durationSeconds: number
  width: number
  height: number
  fps: number
  totalFrames: number
  fileSizeMb: number
}

// ── Frame Sampling ────────────────────────────────────────────────────────────

export interface SampledFrame {
  frameIndex: number
  /** Timestamp in seconds */
  timestamp: number
  imageData: ImageData
  /** data URL for display */
  dataUrl: string
}

// ── Scene Segmentation ────────────────────────────────────────────────────────

export interface Scene {
  sceneId: string
  /** Timestamp in seconds */
  startTime: number
  endTime: number
  startFrame: number
  endFrame: number
  /** Representative frame thumbnail */
  thumbnailDataUrl: string
  /** Average motion intensity (0-100) */
  motionIntensity: number
}

// ── Character Tracking ────────────────────────────────────────────────────────

export interface TrackedCharacter {
  characterId: string
  /** Human-readable label */
  label: string
  /** First appearance timestamp (seconds) */
  firstSeen: number
  /** Last appearance timestamp (seconds) */
  lastSeen: number
  /** Scene IDs where this character appears */
  sceneAppearances: string[]
  /** Representative thumbnail data URL */
  thumbnailDataUrl: string
  /** Dominant region of the frame (normalised 0–1) */
  dominantRegion: { x: number; y: number; w: number; h: number }
  /** Rough detection confidence (0–100) */
  trackingConfidence: number
}

// ── Key Moments ───────────────────────────────────────────────────────────────

export type MomentType =
  | 'entrance'
  | 'exit'
  | 'climax'
  | 'transformation'
  | 'focus'
  | 'high-motion'

export interface KeyMoment {
  momentId: string
  sceneId: string
  characterId?: string
  /** Timestamp in seconds */
  timeCode: number
  type: MomentType
  /** Narrative importance 0–100 */
  importanceScore: number
  thumbnailDataUrl: string
  description: string
}

// ── Outfit & Style ────────────────────────────────────────────────────────────

export type StyleCategory =
  | 'formal'
  | 'business casual'
  | 'casual'
  | 'streetwear'
  | 'luxury'
  | 'minimalist'
  | 'athletic'
  | 'bohemian'

export interface OutfitFeatures {
  /** Named dominant colours (e.g. "navy", "white") */
  colors: string[]
  /** Silhouette descriptor (e.g. "tailored", "oversized") */
  silhouette: string
  /** Macro style category */
  category: StyleCategory
  /** Detected accessories */
  accessories: string[]
  /** Confidence in the extraction (0–100) */
  extractionConfidence: number
}

export interface CharacterOutfit {
  characterId: string
  sceneId: string
  /** Human-readable time range (e.g. "00:20–00:45") */
  timeRange: string
  outfitFeatures: OutfitFeatures
  /** Representative frame thumbnail */
  thumbnailDataUrl: string
}

// ── Scene Analysis ────────────────────────────────────────────────────────────

export interface SceneAnalysis {
  sceneId: string
  characterIds: string[]
  dominantColors: string[]
  motionIntensity: number
  lightingEstimate: 'dark' | 'neutral' | 'bright'
  outfits: CharacterOutfit[]
  keyMoments: KeyMoment[]
}

// ── Cartivo Bundle Output ─────────────────────────────────────────────────────

export interface SuggestedProduct {
  category: string
  suggestedName: string
  reason: string
  styleMatch: number
  estimatedPrice: number
  styleTag: string
}

export interface CartivoBundleSuggestion {
  bundleId: string
  characterId: string
  characterLabel: string
  sceneId: string
  timeRange: string
  outfitFeatures: OutfitFeatures
  confidenceScores: NarrativeConfidenceScore
  products: SuggestedProduct[]
}

// ── Narrative Confidence ──────────────────────────────────────────────────────

export interface NarrativeConfidenceScore {
  bundleId: string
  /** Style + product compatibility score (0–100) */
  aiCompatibilityScore: number
  /** Visual colour-harmony score (0–100) */
  visualFitScore: number
  /** Narrative moment importance score (0–100) */
  temporalNarrativeScore: number
  /** Weighted aggregate (0–100) */
  overallConfidence: number
  explanationSummary: string
}

// ── Pipeline Progress ─────────────────────────────────────────────────────────

export type PipelineStep =
  | 'idle'
  | 'sampling-frames'
  | 'segmenting-scenes'
  | 'tracking-characters'
  | 'detecting-moments'
  | 'extracting-outfits'
  | 'mapping-bundles'
  | 'scoring-confidence'
  | 'done'
  | 'error'

export interface PipelineProgress {
  step: PipelineStep
  stepIndex: number
  totalSteps: number
  /** 0–100 progress within current step */
  stepProgress: number
  message: string
}

// ── Final Pipeline Result ─────────────────────────────────────────────────────

export interface StoryIntelligenceResult {
  videoMetadata: VideoMetadata
  scenes: Scene[]
  characters: TrackedCharacter[]
  keyMoments: KeyMoment[]
  sceneAnalyses: SceneAnalysis[]
  bundles: CartivoBundleSuggestion[]
  processingDurationMs: number
}
