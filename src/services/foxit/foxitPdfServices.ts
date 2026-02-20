/**
 * Foxit PDF Services API Client
 *
 * Calls the Foxit PDF Services REST API to post-process and enhance a generated PDF.
 * Operations supported:
 *   - merge: Combine multiple bundle PDFs for side-by-side comparison
 *   - annotate: Add "Best Value" / "Most Sustainable" callout annotations
 *   - bookmark: Insert named bookmarks / table of contents
 *   - optimize: Compress and optimise for mobile or print
 *
 * API Reference: https://api.foxitsoftware.com/pdf-services/v1
 */

const FOXIT_PDF_SERVICES_BASE_URL =
  import.meta.env.VITE_FOXIT_PDF_SERVICES_URL ||
  'https://api.foxitsoftware.com/pdf-services/v1'

const FOXIT_API_KEY = import.meta.env.VITE_FOXIT_API_KEY || ''

// ============================================================
// Request / Response types
// ============================================================

export type AnnotationColor = 'green' | 'blue' | 'orange' | 'red' | 'purple'

export interface PDFAnnotation {
  page: number
  type: 'highlight' | 'callout' | 'stamp'
  label: string
  color: AnnotationColor
  /** Normalised rect [x1, y1, x2, y2] as fractions 0-1 */
  rect?: [number, number, number, number]
}

export interface PDFBookmark {
  title: string
  page: number
  /** Optional nesting level (0 = top-level) */
  level?: number
}

export interface EnhancePDFOptions {
  /** Base64-encoded source PDF from the Document Generation step */
  sourcePdfBase64: string
  /** Additional PDFs to merge before enhancing (e.g. comparison bundles) */
  additionalPdfsBase64?: string[]
  /** Callout annotations to overlay on the PDF */
  annotations?: PDFAnnotation[]
  /** Named bookmarks / TOC entries */
  bookmarks?: PDFBookmark[]
  /** Optimise for 'print' (higher DPI) or 'mobile' (compressed) */
  optimizeFor?: 'print' | 'mobile' | 'web'
  /** Add a watermark text (optional) */
  watermark?: string
}

export interface FoxitPdfServicesResponse {
  jobId: string
  status: 'completed' | 'processing' | 'failed'
  pdfUrl?: string
  pdfBase64?: string
  fileSizeBytes?: number
  pageCount?: number
  operations: string[]
  error?: string
}

// ============================================================
// API helper
// ============================================================

function getAuthHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${FOXIT_API_KEY}`,
    'x-foxit-client': 'cartivo/1.0',
  }
}

async function callOperation(
  operation: string,
  body: Record<string, unknown>
): Promise<FoxitPdfServicesResponse> {
  const response = await fetch(
    `${FOXIT_PDF_SERVICES_BASE_URL}/operations/${operation}`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    }
  )

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new FoxitPdfServicesError(
      'API_ERROR',
      `Foxit PDF Services [${operation}] returned ${response.status}: ${
        (err as any).message || response.statusText
      }`
    )
  }

  return response.json() as Promise<FoxitPdfServicesResponse>
}

// ============================================================
// Individual operations
// ============================================================

/**
 * Merge one or more PDFs into a single document.
 * Used when the user wants to compare multiple bundle configurations.
 */
export async function mergePDFs(
  pdfsBase64: string[]
): Promise<FoxitPdfServicesResponse> {
  return callOperation('merge', {
    files: pdfsBase64.map((b64, i) => ({ name: `bundle-${i + 1}.pdf`, base64: b64 })),
    options: { addPageNumbers: true, addSeparatorPages: false },
  })
}

/**
 * Add callout / highlight annotations to the PDF.
 * Examples: "Best Value", "Most Sustainable", "Top Rated"
 */
export async function annotatePDF(
  sourcePdfBase64: string,
  annotations: PDFAnnotation[]
): Promise<FoxitPdfServicesResponse> {
  return callOperation('annotate', {
    file: { base64: sourcePdfBase64 },
    annotations: annotations.map((a) => ({
      pageIndex: a.page - 1, // 0-based in Foxit API
      type: a.type,
      content: a.label,
      color: a.color,
      ...(a.rect ? { rect: { x1: a.rect[0], y1: a.rect[1], x2: a.rect[2], y2: a.rect[3] } } : {}),
    })),
  })
}

/**
 * Insert bookmarks and a table of contents into the PDF.
 */
export async function addBookmarks(
  sourcePdfBase64: string,
  bookmarks: PDFBookmark[]
): Promise<FoxitPdfServicesResponse> {
  return callOperation('bookmark', {
    file: { base64: sourcePdfBase64 },
    bookmarks: bookmarks.map((b) => ({
      title: b.title,
      pageIndex: b.page - 1,
      level: b.level ?? 0,
    })),
    options: { generateTOCPage: true, tocTitle: 'Table of Contents' },
  })
}

/**
 * Compress and optimise the PDF for the target reading environment.
 */
export async function optimizePDF(
  sourcePdfBase64: string,
  target: 'print' | 'mobile' | 'web' = 'web'
): Promise<FoxitPdfServicesResponse> {
  const profiles: Record<string, Record<string, unknown>> = {
    print: { dpi: 300, imageQuality: 95, embedAllFonts: true, linearize: false },
    mobile: { dpi: 72, imageQuality: 60, embedAllFonts: false, linearize: true },
    web: { dpi: 150, imageQuality: 80, embedAllFonts: true, linearize: true },
  }

  return callOperation('optimize', {
    file: { base64: sourcePdfBase64 },
    profile: profiles[target],
  })
}

// ============================================================
// High-level orchestration: run all enhancement steps
// ============================================================

/**
 * Enhance a generated PDF using all PDF Services operations in sequence:
 * 1. Merge additional comparison PDFs (if provided)
 * 2. Add annotations ("Best Value", "Most Sustainable", etc.)
 * 3. Add bookmarks / table of contents
 * 4. Optimize for the target environment
 */
export async function enhancePDF(
  options: EnhancePDFOptions
): Promise<FoxitPdfServicesResponse> {
  if (!FOXIT_API_KEY) {
    throw new FoxitPdfServicesError(
      'FOXIT_API_KEY_MISSING',
      'Foxit API key is not configured. Set VITE_FOXIT_API_KEY in your environment.'
    )
  }

  let currentPdfBase64 = options.sourcePdfBase64
  const appliedOps: string[] = []

  // Step 1: Merge comparison PDFs
  if (options.additionalPdfsBase64 && options.additionalPdfsBase64.length > 0) {
    const merged = await mergePDFs([currentPdfBase64, ...options.additionalPdfsBase64])
    if (merged.pdfBase64) {
      currentPdfBase64 = merged.pdfBase64
      appliedOps.push('merge')
    }
  }

  // Step 2: Annotate key recommendations
  if (options.annotations && options.annotations.length > 0) {
    const annotated = await annotatePDF(currentPdfBase64, options.annotations)
    if (annotated.pdfBase64) {
      currentPdfBase64 = annotated.pdfBase64
      appliedOps.push('annotate')
    }
  }

  // Step 3: Add bookmarks / TOC
  if (options.bookmarks && options.bookmarks.length > 0) {
    const bookmarked = await addBookmarks(currentPdfBase64, options.bookmarks)
    if (bookmarked.pdfBase64) {
      currentPdfBase64 = bookmarked.pdfBase64
      appliedOps.push('bookmark')
    }
  }

  // Step 4: Optimise
  const optimized = await optimizePDF(currentPdfBase64, options.optimizeFor ?? 'web')
  if (optimized.pdfBase64) {
    currentPdfBase64 = optimized.pdfBase64
    appliedOps.push('optimize')
  }

  return {
    jobId: `local-${Date.now()}`,
    status: 'completed',
    pdfBase64: currentPdfBase64,
    operations: appliedOps,
  }
}

// ============================================================
// Error type
// ============================================================

export class FoxitPdfServicesError extends Error {
  code: string
  constructor(code: string, message: string) {
    super(message)
    this.code = code
    this.name = 'FoxitPdfServicesError'
  }
}
