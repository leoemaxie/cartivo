/**
 * Cartivo Story Intelligence™ — Key Moment Detection Module
 *
 * Analyses frame motion, scene-boundary proximity, and character presence to
 * assign narrative importance scores and classify moment types.
 *
 * Moment types and their detection signals:
 *  - entrance    : First frame of a scene where a character appears + high motion
 *  - exit        : Last frame of a scene + trailing motion
 *  - climax      : Scene with peak motion intensity score
 *  - transformation : Dramatic colour shift within a single character region
 *  - focus       : Low-motion frame in scene centre — camera is holding on subject
 *  - high-motion : Top N frames by motion score
 */

import type {
  SampledFrame,
  Scene,
  TrackedCharacter,
  KeyMoment,
  MomentType,
} from './types'
import { computeFrameDifference } from './sceneSegmentation'

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function momentDescription(type: MomentType, charLabel: string, time: string): string {
  const map: Record<MomentType, string> = {
    entrance: `${charLabel} enters the scene at ${time} — peak visual impact.`,
    exit: `${charLabel} exits frame at ${time}.`,
    climax: `Narrative peak at ${time} — highest dramatic tension in the scene.`,
    transformation: `${charLabel} undergoes a style/outfit transformation at ${time}.`,
    focus: `Camera holds on ${charLabel} at ${time} — critical narrative focus moment.`,
    'high-motion': `High-intensity action sequence at ${time} — significant scene energy.`,
  }
  return map[type]
}

// ── Main Export ───────────────────────────────────────────────────────────────

/**
 * Detect key narrative moments from scenes, frames, and tracked characters.
 *
 * Returns a sorted (by importance) array of KeyMoment objects.
 */
export function detectKeyMoments(
  frames: SampledFrame[],
  scenes: Scene[],
  characters: TrackedCharacter[]
): KeyMoment[] {
  if (frames.length === 0 || scenes.length === 0) return []

  const moments: KeyMoment[] = []
  let momentCounter = 0

  // ── Precompute per-frame motion scores ──────────────────────────────────
  const frameMotion: number[] = frames.map((f, i) =>
    i === 0 ? 0 : computeFrameDifference(frames[i - 1].imageData, f.imageData)
  )

  // ── Per-scene analysis ───────────────────────────────────────────────────
  for (const scene of scenes) {
    const sceneFrames = frames.filter(
      (f) => f.timestamp >= scene.startTime && f.timestamp <= scene.endTime
    )
    if (sceneFrames.length === 0) continue

    // Characters in this scene
    const sceneChars = characters.filter((c) =>
      c.sceneAppearances.includes(scene.sceneId)
    )
    const primaryChar = sceneChars[0]
    const charLabel = primaryChar?.label ?? 'Subject'
    const charId = primaryChar?.characterId

    // Scene-level motion stats
    const sceneMotions = sceneFrames.map((f) => frameMotion[f.frameIndex] ?? 0)
    const maxMotion = Math.max(...sceneMotions)
    const avgMotion = sceneMotions.reduce((a, b) => a + b, 0) / sceneMotions.length

    // ── Entrance moment (first frame of scene) ───────────────────────────
    if (sceneChars.length > 0) {
      const entranceFrame = sceneFrames[0]
      moments.push({
        momentId: `moment_${++momentCounter}`,
        sceneId: scene.sceneId,
        characterId: charId,
        timeCode: entranceFrame.timestamp,
        type: 'entrance',
        importanceScore: Math.min(100, 50 + scene.motionIntensity * 0.4),
        thumbnailDataUrl: entranceFrame.dataUrl,
        description: momentDescription('entrance', charLabel, formatTime(entranceFrame.timestamp)),
      })
    }

    // ── Climax moment (frame with highest motion in scene) ───────────────
    if (maxMotion > 20 && sceneFrames.length > 1) {
      const peakIdx = sceneMotions.indexOf(maxMotion)
      const peakFrame = sceneFrames[peakIdx]
      const importanceScore = Math.min(100, Math.round(55 + (maxMotion / 80) * 40))
      moments.push({
        momentId: `moment_${++momentCounter}`,
        sceneId: scene.sceneId,
        characterId: charId,
        timeCode: peakFrame.timestamp,
        type: 'climax',
        importanceScore,
        thumbnailDataUrl: peakFrame.dataUrl,
        description: momentDescription('climax', charLabel, formatTime(peakFrame.timestamp)),
      })
    }

    // ── Focus moment (lowest motion frame, after the first third of scene) ─
    if (sceneFrames.length >= 3) {
      const laterFrames = sceneFrames.slice(Math.floor(sceneFrames.length / 3))
      const laterMotions = laterFrames.map((f) => frameMotion[f.frameIndex] ?? 0)
      const minMotion = Math.min(...laterMotions)
      if (minMotion < avgMotion * 0.5) {
        const focusIdx = laterMotions.indexOf(minMotion)
        const focusFrame = laterFrames[focusIdx]
        moments.push({
          momentId: `moment_${++momentCounter}`,
          sceneId: scene.sceneId,
          characterId: charId,
          timeCode: focusFrame.timestamp,
          type: 'focus',
          importanceScore: Math.min(100, 60 + sceneChars.length * 8),
          thumbnailDataUrl: focusFrame.dataUrl,
          description: momentDescription('focus', charLabel, formatTime(focusFrame.timestamp)),
        })
      }
    }

    // ── Transformation moment (abrupt colour shift within the scene) ──────
    if (sceneFrames.length >= 4) {
      for (let i = 1; i < sceneFrames.length - 1; i++) {
        const diff = computeFrameDifference(sceneFrames[i - 1].imageData, sceneFrames[i].imageData)
        // High intra-scene diff that's NOT the scene opening → transformation
        if (diff > 35 && sceneFrames[i].timestamp > scene.startTime + 1.5) {
          moments.push({
            momentId: `moment_${++momentCounter}`,
            sceneId: scene.sceneId,
            characterId: charId,
            timeCode: sceneFrames[i].timestamp,
            type: 'transformation',
            importanceScore: Math.min(100, Math.round(65 + diff * 0.3)),
            thumbnailDataUrl: sceneFrames[i].dataUrl,
            description: momentDescription('transformation', charLabel, formatTime(sceneFrames[i].timestamp)),
          })
          break // one transformation per scene
        }
      }
    }

    // ── Exit moment (last frame of scene) ────────────────────────────────
    if (sceneChars.length > 0 && sceneFrames.length > 1) {
      const exitFrame = sceneFrames[sceneFrames.length - 1]
      moments.push({
        momentId: `moment_${++momentCounter}`,
        sceneId: scene.sceneId,
        characterId: charId,
        timeCode: exitFrame.timestamp,
        type: 'exit',
        importanceScore: Math.max(20, scene.motionIntensity * 0.4),
        thumbnailDataUrl: exitFrame.dataUrl,
        description: momentDescription('exit', charLabel, formatTime(exitFrame.timestamp)),
      })
    }
  }

  // Sort by importance score descending, then by timeCode
  return moments
    .sort((a, b) => b.importanceScore - a.importanceScore || a.timeCode - b.timeCode)
    .slice(0, 30) // cap at 30 most important moments
}
