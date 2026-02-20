/**
 * Cartivo Story Intelligence™ — Video Frame Sampler
 *
 * Uses the browser's HTMLVideoElement + Canvas API to extract frames from
 * a user-supplied video file with no server round-trips.
 *
 * Design goals:
 *  - Works entirely in-browser (no WASM, no server)
 *  - Yields frames via an async generator so callers can process incrementally
 *  - Respects a target FPS cap to balance quality vs. processing time
 */

import type { SampledFrame, VideoMetadata } from './types'

// ── Constants ─────────────────────────────────────────────────────────────────

/** Supported video MIME types */
export const SUPPORTED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm']

/** Maximum file size in MB */
export const MAX_VIDEO_SIZE_MB = 200

/** Canvas resolution for frame analysis (width – height scales proportionally) */
const ANALYSIS_WIDTH = 320

// ── Validation ────────────────────────────────────────────────────────────────

export function validateVideoFile(file: File): void {
  if (file.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
    throw new VideoSamplerError(
      'FILE_TOO_LARGE',
      `Video exceeds ${MAX_VIDEO_SIZE_MB} MB limit (${(file.size / 1024 / 1024).toFixed(1)} MB).`
    )
  }
  const mime = file.type
  const ext = file.name.split('.').pop()?.toLowerCase()
  const validExts = ['mp4', 'mov', 'avi', 'webm']
  if (!SUPPORTED_VIDEO_TYPES.includes(mime) && !validExts.includes(ext ?? '')) {
    throw new VideoSamplerError(
      'UNSUPPORTED_FORMAT',
      `Unsupported format "${ext}". Accepted: mp4, mov, avi, webm.`
    )
  }
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function loadVideoMetadata(file: File): Promise<{ video: HTMLVideoElement; metadata: VideoMetadata }> {
  const url = URL.createObjectURL(file)
  const video = document.createElement('video')
  video.src = url
  video.muted = true
  video.preload = 'metadata'

  await new Promise<void>((resolve, reject) => {
    video.onloadedmetadata = () => resolve()
    video.onerror = () => reject(new VideoSamplerError('LOAD_ERROR', 'Failed to load video metadata.'))
  })

  const metadata: VideoMetadata = {
    fileName: file.name,
    durationSeconds: video.duration,
    width: video.videoWidth,
    height: video.videoHeight,
    fps: 30, // browsers don't expose FPS; we assume 30 and calculate from duration
    totalFrames: Math.ceil(video.duration * 30),
    fileSizeMb: parseFloat((file.size / 1024 / 1024).toFixed(2)),
  }

  return { video, metadata }
}

// ── Frame Extraction ──────────────────────────────────────────────────────────

/**
 * Async generator that seeks the video to each target timestamp and captures a
 * canvas frame. Yields SampledFrame objects in chronological order.
 *
 * @param video      Pre-loaded HTMLVideoElement
 * @param metadata   VideoMetadata from loadVideoMetadata
 * @param targetFps  Frames to capture per second (default 1)
 * @param onProgress Optional progress callback (0–100)
 */
export async function* sampleFrames(
  video: HTMLVideoElement,
  metadata: VideoMetadata,
  targetFps = 1,
  onProgress?: (pct: number) => void
): AsyncGenerator<SampledFrame> {
  const canvas = document.createElement('canvas')
  const scale = ANALYSIS_WIDTH / metadata.width
  canvas.width = ANALYSIS_WIDTH
  canvas.height = Math.round(metadata.height * scale)
  const ctx = canvas.getContext('2d')!

  const interval = 1 / targetFps
  const timestamps: number[] = []
  for (let t = 0; t < metadata.durationSeconds; t += interval) {
    timestamps.push(parseFloat(t.toFixed(3)))
  }

  for (let i = 0; i < timestamps.length; i++) {
    const t = timestamps[i]
    await seekTo(video, t)
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.7)
    yield {
      frameIndex: i,
      timestamp: t,
      imageData,
      dataUrl,
    }
    onProgress?.(Math.round(((i + 1) / timestamps.length) * 100))
    // Yield to event loop to prevent UI freeze
    await yieldToMain()
  }
}

/**
 * Convenience: collect all sampled frames into an array.
 */
export async function collectFrames(
  video: HTMLVideoElement,
  metadata: VideoMetadata,
  targetFps = 1,
  onProgress?: (pct: number) => void
): Promise<SampledFrame[]> {
  const frames: SampledFrame[] = []
  for await (const frame of sampleFrames(video, metadata, targetFps, onProgress)) {
    frames.push(frame)
  }
  return frames
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function seekTo(video: HTMLVideoElement, time: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const onSeeked = () => {
      video.removeEventListener('seeked', onSeeked)
      video.removeEventListener('error', onError)
      resolve()
    }
    const onError = () => {
      video.removeEventListener('seeked', onSeeked)
      video.removeEventListener('error', onError)
      reject(new VideoSamplerError('SEEK_ERROR', `Failed to seek to ${time}s`))
    }
    video.addEventListener('seeked', onSeeked, { once: true })
    video.addEventListener('error', onError, { once: true })
    video.currentTime = time
  })
}

function yieldToMain(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

// ── Error ─────────────────────────────────────────────────────────────────────

export class VideoSamplerError extends Error {
  code: string
  constructor(code: string, message: string) {
    super(message)
    this.code = code
    this.name = 'VideoSamplerError'
  }
}
