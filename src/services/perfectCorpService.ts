/**
 * Cartivo Confidence™ — Perfect Corp Service Layer
 *
 * Abstracts Perfect Corp Virtual Try-On API.
 * Runs in mock mode when VITE_PERFECT_CORP_API_KEY is absent or
 * VITE_MOCK_PERFECT_CORP=true.
 *
 * In production, requests must be proxied via VITE_CONFIDENCE_API_URL
 * (your own backend) to keep the API key server-side.
 *
 * Images are never persisted: they are read into memory, stripped of
 * EXIF metadata via an off-screen <canvas>, converted to base64, and
 * sent once — then discarded.
 */

export interface TryOnResult {
  /** Base64 data-URL or temporary CDN URL of the composited image */
  renderedImage: string
  /** 0–100: how well the facial anchor points align with the product */
  faceAlignmentScore: number
  /** 0–100: confidence that the product overlay is correctly placed */
  overlayConfidence: number
  /** 0–100: overall quality of the face/body detection */
  detectionQuality: number
}

export class PerfectCorpError extends Error {
  constructor(
    message: string,
    public readonly code: 'NO_FACE_DETECTED' | 'LOW_QUALITY' | 'API_UNAVAILABLE' | 'INVALID_INPUT'
  ) {
    super(message)
    this.name = 'PerfectCorpError'
  }
}

// ── Rate limiter (client-side guard: max 5 calls per 60 s) ──────────────────
const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW_MS = 60_000
const callTimestamps: number[] = []

function assertRateLimit(): void {
  const now = Date.now()
  // Evict timestamps outside the window
  while (callTimestamps.length && callTimestamps[0] < now - RATE_LIMIT_WINDOW_MS) {
    callTimestamps.shift()
  }
  if (callTimestamps.length >= RATE_LIMIT_MAX) {
    throw new PerfectCorpError(
      'Rate limit reached. Please wait a moment before trying again.',
      'API_UNAVAILABLE'
    )
  }
  callTimestamps.push(now)
}

// ── Image sanitisation ───────────────────────────────────────────────────────

const MAX_IMAGE_BYTES = 10 * 1024 * 1024 // 10 MB
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

function validateImageFile(file: File): void {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new PerfectCorpError(
      `Unsupported file type "${file.type}". Please upload a JPEG, PNG or WebP image.`,
      'INVALID_INPUT'
    )
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new PerfectCorpError(
      'Image exceeds the 10 MB size limit. Please use a smaller image.',
      'INVALID_INPUT'
    )
  }
}

/**
 * Re-draws the image through an off-screen canvas.
 * This strips all EXIF / ICC metadata before transmission.
 */
async function stripExifAndEncode(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const img = new Image()

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)
      // Export as JPEG — strips all metadata
      resolve(canvas.toDataURL('image/jpeg', 0.92))
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new PerfectCorpError('Failed to decode image file.', 'INVALID_INPUT'))
    }

    img.src = objectUrl
  })
}

// ── Mock responses (development / fallback) ──────────────────────────────────

function buildMockResult(imageBase64: string): TryOnResult {
  return {
    renderedImage: imageBase64, // Echo the original image as the "composited" result
    faceAlignmentScore: 72 + Math.random() * 20,
    overlayConfidence: 68 + Math.random() * 24,
    detectionQuality: 75 + Math.random() * 20,
  }
}

// ── Live API call ────────────────────────────────────────────────────────────

async function callPerfectCorpApi(
  imageBase64: string,
  productAssetURL: string
): Promise<TryOnResult> {
  const proxyUrl = import.meta.env.VITE_CONFIDENCE_API_URL

  if (!proxyUrl) {
    // No backend proxy configured — fall back to mock
    console.warn('[PerfectCorp] VITE_CONFIDENCE_API_URL not set. Using mock response.')
    return buildMockResult(imageBase64)
  }

  const response = await fetch(`${proxyUrl}/visual-validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: imageBase64, productAssetURL }),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    if (response.status === 422) {
      throw new PerfectCorpError('No face detected in the image.', 'NO_FACE_DETECTED')
    }
    throw new PerfectCorpError(
      `API request failed (${response.status}): ${text}`,
      'API_UNAVAILABLE'
    )
  }

  const raw = await response.json()

  // Normalise raw Perfect Corp response fields → our contract
  return {
    renderedImage: raw.renderedImage ?? raw.result_image ?? imageBase64,
    faceAlignmentScore: clamp(raw.faceAlignmentScore ?? raw.face_alignment_score ?? 0),
    overlayConfidence: clamp(raw.overlayConfidence ?? raw.overlay_confidence ?? 0),
    detectionQuality: clamp(raw.detectionQuality ?? raw.detection_quality ?? 0),
  }
}

function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value))
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Runs a virtual try-on for `file` against the given product asset URL.
 *
 * - Validates file type and size
 * - Strips EXIF metadata
 * - Enforces client-side rate limiting
 * - Returns a normalised TryOnResult
 * - Never logs or stores the image content
 */
export async function generateTryOn(file: File, productAssetURL: string): Promise<TryOnResult> {
  validateImageFile(file)
  assertRateLimit()

  const imageBase64 = await stripExifAndEncode(file)

  const useMock =
    import.meta.env.VITE_MOCK_PERFECT_CORP === 'true' ||
    !import.meta.env.VITE_PERFECT_CORP_API_KEY

  if (useMock) {
    return buildMockResult(imageBase64)
  }

  return callPerfectCorpApi(imageBase64, productAssetURL)
}
