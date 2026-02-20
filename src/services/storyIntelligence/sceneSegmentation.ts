/**
 * Cartivo Story Intelligence™ — Scene Segmentation Module
 *
 * Detects shot/scene boundaries by computing the Sum of Absolute Differences
 * (SAD) between consecutive frames. When the per-pixel difference exceeds a
 * configurable threshold, a scene cut is recorded.
 *
 * Output: an array of Scene objects with start/end times and a representative
 * thumbnail, ready for downstream character tracking and analysis.
 */

import type { SampledFrame, Scene } from './types'

// ── Config ────────────────────────────────────────────────────────────────────

/** SAD threshold (0–255 per-channel average) above which a cut is declared */
const SCENE_CUT_THRESHOLD = 28

/** Minimum scene duration in seconds (prevents micro-scenes on noisy footage) */
const MIN_SCENE_DURATION_S = 1.0

// ── Per-frame difference ──────────────────────────────────────────────────────

/**
 * Computes the mean absolute difference (MAD) between two ImageData buffers.
 * Returns a value in [0, 255]. Samples every 4th pixel for performance.
 */
export function computeFrameDifference(a: ImageData, b: ImageData): number {
  const data1 = a.data
  const data2 = b.data
  const len = data1.length
  let diff = 0
  let count = 0
  // Sample every 4th pixel (every 16 bytes: RGBA × 4 pixels)
  for (let i = 0; i < len; i += 16) {
    diff += Math.abs(data1[i] - data2[i])         // R
    diff += Math.abs(data1[i + 1] - data2[i + 1]) // G
    diff += Math.abs(data1[i + 2] - data2[i + 2]) // B
    count += 3
  }
  return count > 0 ? diff / count : 0
}

// ── Scene Detection ───────────────────────────────────────────────────────────

/**
 * Detects scene/shot boundaries from a sequence of sampled frames.
 *
 * @param frames  Chronological array of SampledFrame
 * @param threshold  Per-channel SAD threshold (default SCENE_CUT_THRESHOLD)
 * @returns  Array of Scene objects
 */
export function detectScenes(
  frames: SampledFrame[],
  threshold = SCENE_CUT_THRESHOLD
): Scene[] {
  if (frames.length === 0) return []

  // Compute frame differences
  const diffs: number[] = [0] // first frame has no predecessor
  for (let i = 1; i < frames.length; i++) {
    diffs.push(computeFrameDifference(frames[i - 1].imageData, frames[i].imageData))
  }

  // Find cut points (indices where a new scene begins)
  const cutIndices: number[] = [0]
  for (let i = 1; i < diffs.length; i++) {
    const timeSinceLastCut = frames[i].timestamp - frames[cutIndices[cutIndices.length - 1]].timestamp
    if (diffs[i] >= threshold && timeSinceLastCut >= MIN_SCENE_DURATION_S) {
      cutIndices.push(i)
    }
  }

  // Build scenes from cut points
  const scenes: Scene[] = []
  for (let s = 0; s < cutIndices.length; s++) {
    const startIdx = cutIndices[s]
    const endIdx = s < cutIndices.length - 1 ? cutIndices[s + 1] - 1 : frames.length - 1
    const startFrame = frames[startIdx]
    const endFrame = frames[endIdx]

    // Choose the middle frame as thumbnail
    const midIdx = Math.floor((startIdx + endIdx) / 2)
    const thumbnail = frames[midIdx]

    // Compute average motion intensity for the scene
    const sceneFrameDiffs = diffs.slice(startIdx + 1, endIdx + 1)
    const avgDiff = sceneFrameDiffs.length > 0
      ? sceneFrameDiffs.reduce((a, b) => a + b, 0) / sceneFrameDiffs.length
      : 0
    const motionIntensity = Math.round(Math.min(100, (avgDiff / 80) * 100))

    scenes.push({
      sceneId: `scene_${String(s + 1).padStart(2, '0')}`,
      startTime: startFrame.timestamp,
      endTime: endFrame.timestamp,
      startFrame: startFrame.frameIndex,
      endFrame: endFrame.frameIndex,
      thumbnailDataUrl: thumbnail.dataUrl,
      motionIntensity,
    })
  }

  return scenes
}

/**
 * Returns per-frame difference scores (useful for visualisation / debugging).
 */
export function computeAllDifferences(frames: SampledFrame[]): number[] {
  return frames.map((f, i) =>
    i === 0 ? 0 : computeFrameDifference(frames[i - 1].imageData, f.imageData)
  )
}
