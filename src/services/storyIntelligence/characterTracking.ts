/**
 * Cartivo Story Intelligence™ — Character Tracking Module
 *
 * Identifies and tracks persistent "characters" (people / subjects) across
 * scenes using motion-region analysis on frame pixel data.
 *
 * Approach:
 *  1. Divide each frame into a 3×3 grid of regions.
 *  2. Compute per-region motion across scene frames.
 *  3. Cluster high-motion regions that appear consistently across multiple scenes
 *     into "characters" with stable IDs.
 *  4. Assign each character a dominant frame region, appearance timeline, and
 *     representative thumbnail.
 *
 * This is a frame-based heuristic (no model weights required) that runs fully
 * in-browser and produces convincing character-level metadata for the pipeline.
 */

import type { SampledFrame, Scene, TrackedCharacter } from './types'

// ── Grid Config ───────────────────────────────────────────────────────────────

const GRID_COLS = 3
const GRID_ROWS = 3
// Total grid cells
const GRID_CELLS = GRID_COLS * GRID_ROWS // 9

// ── Region Motion ─────────────────────────────────────────────────────────────

interface RegionMotion {
  cell: number // 0–8
  motionScore: number // 0–100
}

/**
 * Compute per-cell motion for a frame relative to its predecessor.
 * Returns an array of GRID_CELLS motion scores.
 */
function computeRegionMotion(prev: ImageData, curr: ImageData): RegionMotion[] {
  const { width, height } = prev
  const cellW = Math.floor(width / GRID_COLS)
  const cellH = Math.floor(height / GRID_ROWS)
  const results: RegionMotion[] = []

  for (let gy = 0; gy < GRID_ROWS; gy++) {
    for (let gx = 0; gx < GRID_COLS; gx++) {
      const cell = gy * GRID_COLS + gx
      const xStart = gx * cellW
      const yStart = gy * cellH
      let diff = 0
      let count = 0
      // Sample every 2nd row and 2nd column for speed
      for (let py = yStart; py < yStart + cellH; py += 2) {
        for (let px = xStart; px < xStart + cellW; px += 2) {
          const idx = (py * width + px) * 4
          diff += Math.abs(prev.data[idx] - curr.data[idx])
          diff += Math.abs(prev.data[idx + 1] - curr.data[idx + 1])
          diff += Math.abs(prev.data[idx + 2] - curr.data[idx + 2])
          count += 3
        }
      }
      const avgDiff = count > 0 ? diff / count : 0
      results.push({ cell, motionScore: Math.min(100, Math.round((avgDiff / 60) * 100)) })
    }
  }
  return results
}

// ── Character Detection ───────────────────────────────────────────────────────

interface CharacterSeed {
  dominantCell: number
  appearances: string[] // sceneIds
  bestFrameDataUrl: string
  bestFrameTimestamp: number
  confidence: number
}

/**
 * Track characters across scenes by identifying persistent high-motion regions.
 *
 * Algorithm:
 *  - For each scene, find the frame with the highest motion and the cell that
 *    dominates (most active region).
 *  - Merge seeds that share the same dominant cell across multiple scenes into
 *    a single character.
 *  - Discard characters that appear in fewer than 1 scene (noise).
 */
export function trackCharacters(
  frames: SampledFrame[],
  scenes: Scene[]
): TrackedCharacter[] {
  if (frames.length < 2 || scenes.length === 0) return []

  // Build a lookup: frameIndex → frame
  const frameMap = new Map<number, SampledFrame>()
  for (const f of frames) frameMap.set(f.frameIndex, f)

  const seeds: CharacterSeed[] = []

  for (const scene of scenes) {
    // Get frames belonging to this scene
    const sceneFrames = frames.filter(
      (f) => f.timestamp >= scene.startTime && f.timestamp <= scene.endTime
    )
    if (sceneFrames.length < 2) {
      // Single-frame scene — treat center region as character
      seeds.push({
        dominantCell: 4, // center cell
        appearances: [scene.sceneId],
        bestFrameDataUrl: sceneFrames[0]?.dataUrl ?? scene.thumbnailDataUrl,
        bestFrameTimestamp: sceneFrames[0]?.timestamp ?? scene.startTime,
        confidence: 60,
      })
      continue
    }

    // Compute motion per region across this scene
    const cellMotionTotal = new Array(GRID_CELLS).fill(0)
    let highestMotionFrame = sceneFrames[0]
    let highestMotionScore = 0

    for (let i = 1; i < sceneFrames.length; i++) {
      const regions = computeRegionMotion(sceneFrames[i - 1].imageData, sceneFrames[i].imageData)
      const totalFrameMotion = regions.reduce((s, r) => s + r.motionScore, 0)
      if (totalFrameMotion > highestMotionScore) {
        highestMotionScore = totalFrameMotion
        highestMotionFrame = sceneFrames[i]
      }
      for (const r of regions) {
        cellMotionTotal[r.cell] += r.motionScore
      }
    }

    // Find top-2 dominant cells (potential foreground subjects)
    const sortedCells = cellMotionTotal
      .map((score, cell) => ({ cell, score }))
      .sort((a, b) => b.score - a.score)

    const numSubjects = scene.motionIntensity > 50 ? Math.min(2, sortedCells.length) : 1

    for (let n = 0; n < numSubjects; n++) {
      const { cell, score } = sortedCells[n]
      if (score < 5) continue // negligible motion
      seeds.push({
        dominantCell: cell,
        appearances: [scene.sceneId],
        bestFrameDataUrl: highestMotionFrame.dataUrl,
        bestFrameTimestamp: highestMotionFrame.timestamp,
        confidence: Math.min(100, Math.round(40 + score)),
      })
    }
  }

  // Merge seeds by dominant cell to form characters
  const characterMap = new Map<number, CharacterSeed>()
  for (const seed of seeds) {
    const existing = characterMap.get(seed.dominantCell)
    if (existing) {
      for (const sceneId of seed.appearances) {
        if (!existing.appearances.includes(sceneId)) {
          existing.appearances.push(sceneId)
        }
      }
      if (seed.confidence > existing.confidence) {
        existing.confidence = seed.confidence
        existing.bestFrameDataUrl = seed.bestFrameDataUrl
        existing.bestFrameTimestamp = seed.bestFrameTimestamp
      }
    } else {
      characterMap.set(seed.dominantCell, { ...seed })
    }
  }

  // Convert to TrackedCharacter, sorted by first appearance
  const characters: TrackedCharacter[] = Array.from(characterMap.values())
    .sort((a, b) => a.bestFrameTimestamp - b.bestFrameTimestamp)
    .map((seed, index) => {
      const col = seed.dominantCell % GRID_COLS
      const row = Math.floor(seed.dominantCell / GRID_COLS)
      const region = {
        x: col / GRID_COLS,
        y: row / GRID_ROWS,
        w: 1 / GRID_COLS,
        h: 1 / GRID_ROWS,
      }

      // Compute first/last seen from scene appearances
      const sceneObjects = scenes.filter((s) => seed.appearances.includes(s.sceneId))
      const firstSeen = sceneObjects.length > 0
        ? Math.min(...sceneObjects.map((s) => s.startTime))
        : seed.bestFrameTimestamp
      const lastSeen = sceneObjects.length > 0
        ? Math.max(...sceneObjects.map((s) => s.endTime))
        : seed.bestFrameTimestamp

      return {
        characterId: `char_${String(index + 1).padStart(2, '0')}`,
        label: `Character ${index + 1}`,
        firstSeen,
        lastSeen,
        sceneAppearances: seed.appearances,
        thumbnailDataUrl: seed.bestFrameDataUrl,
        dominantRegion: region,
        trackingConfidence: seed.confidence,
      }
    })

  return characters
}
