/**
 * PDF Report Service
 *
 * Orchestrates the full end-to-end Cartivo PDF report generation pipeline:
 *
 *   1. Compute Smart Bundle  — Sanity GROQ queries + AI-style scoring
 *   2. Build report JSON     — Transform bundle into BundleReportData
 *   3. Generate PDF          — Foxit Document Generation API
 *   4. Enhance PDF           — Foxit PDF Services API (merge, annotate, bookmark, optimize)
 *   5. Return result         — URL or base64 PDF ready to display / download
 *
 * When Foxit API keys are not configured, a client-side HTML report is produced
 * instead, which the user can print to PDF via the browser.
 */

import { buildSmartSetup, SetupConstraints, SetupBuilderResult } from '../../services/setupBuilder'
import {
  generateBundlePDF,
  pollJobStatus,
  isFoxitConfigured,
  BundleReportData,
  ProductReportData,
  FoxitDocGenResponse,
} from '../../services/foxit/foxitDocGen'
import {
  enhancePDF,
  PDFAnnotation,
  PDFBookmark,
} from '../../services/foxit/foxitPdfServices'
import { SanityProduct } from '../../services/sanity/sanityService'

// ============================================================
// Types
// ============================================================

export interface PDFReportRequest {
  budget: number
  categories: string[]
  stylePreferences: string[]
  minSustainability: number
  optimizeFor?: 'print' | 'mobile' | 'web'
}

export type GenerationStep =
  | 'idle'
  | 'computing-bundle'
  | 'building-report-data'
  | 'generating-pdf'
  | 'enhancing-pdf'
  | 'complete'
  | 'error'

export interface PDFReportResult {
  bundle: SetupBuilderResult
  reportData: BundleReportData
  /** Base64-encoded final PDF (when Foxit API is configured) */
  pdfBase64?: string
  /** Blob URL for the final PDF (created from base64) */
  pdfBlobUrl?: string
  /** Raw HTML report for browser-based print-to-PDF fallback */
  htmlReport?: string
  /** Whether this used the Foxit API or the fallback */
  usedFoxitAPI: boolean
  appliedOperations: string[]
  fileSizeBytes?: number
  pageCount?: number
}

export interface GenerationProgress {
  step: GenerationStep
  stepIndex: number
  totalSteps: number
  message: string
  bundle?: SetupBuilderResult
}

// ============================================================
// Helper: assign badges to products
// ============================================================

function assignProductBadge(
  product: SanityProduct,
  allProducts: SanityProduct[]
): ProductReportData['badge'] | undefined {
  const maxSustainability = Math.max(...allProducts.map((p) => p.sustainabilityScore))
  const minPrice = Math.min(...allProducts.map((p) => p.price))
  const maxRating = Math.max(
    ...allProducts.map((p) => p.performanceMetrics?.averageRating ?? 0)
  )

  if (product.sustainabilityScore === maxSustainability && maxSustainability > 60) {
    return 'Most Sustainable'
  }
  if (product.price === minPrice) {
    return 'Budget Pick'
  }
  if ((product.performanceMetrics?.averageRating ?? 0) === maxRating && maxRating >= 4.5) {
    return 'Top Rated'
  }
  return undefined
}

// ============================================================
// Helper: transform SetupBuilderResult → BundleReportData
// ============================================================

function buildReportData(
  bundle: SetupBuilderResult,
  request: PDFReportRequest
): BundleReportData {
  const { products, totalCost, remainingBudget, isCompactible, explanation, replacementSuggestions } =
    bundle

  const avgSustainability =
    products.length > 0
      ? products.reduce((s: any, p: { sustainabilityScore: any }) => s + p.sustainabilityScore, 0) / products.length
      : 0
  const avgDurability =
    products.length > 0
      ? products.reduce((s: any, p: { performanceMetrics: { durabilityScore: any } }) => s + (p.performanceMetrics?.durabilityScore ?? 0), 0) /
        products.length
      : 0

  const reportProducts: ProductReportData[] = products.map((p: SanityProduct) => ({
    id: p._id,
    name: p.name,
    brand: p.brand?.name ?? 'Unknown',
    category: p.category?.title ?? 'Uncategorized',
    price: p.price,
    imageUrl: p.image ?? '',
    sustainabilityScore: p.sustainabilityScore,
    durabilityScore: p.performanceMetrics?.durabilityScore ?? 0,
    averageRating: p.performanceMetrics?.averageRating ?? 0,
    warrantyYears: p.performanceMetrics?.warrantyYears ?? 0,
    styleTags: p.styleTags ?? [],
    description: p.description ?? '',
    compatibleWith: (p.compatibility ?? []).map((c: { name: any; _id: any }) => c.name ?? c._id),
    requiredAccessories: (p.requiredAccessories ?? []).map((a: { name: any; _id: any; price: any }) => ({
      name: a.name ?? a._id,
      price: a.price ?? 0,
    })),
    badge: assignProductBadge(p, products),
  }))

  const appUrl = import.meta.env.VITE_APP_URL || window.location.origin
  const reportId = `CR-${Date.now().toString(36).toUpperCase()}`
  const shareUrl = `${appUrl}/bundle/${reportId}`

  return {
    reportId,
    generatedAt: new Date().toISOString(),
    preferences: {
      budget: request.budget,
      categories: request.categories,
      stylePreferences: request.stylePreferences,
      minSustainability: request.minSustainability,
    },
    summary: {
      totalCost,
      remainingBudget,
      productCount: products.length,
      isCompatible: isCompactible,
      avgSustainabilityScore: Math.round(avgSustainability),
      avgDurabilityScore: Math.round(avgDurability),
      aiExplanation: explanation,
    },
    products: reportProducts,
    replacements: replacementSuggestions.map((r: { productName: any; currentPrice: any; alternativeName: any; alternativePrice: any; savings: any; reason: any }) => ({
      originalProductName: r.productName,
      originalPrice: r.currentPrice,
      alternativeName: r.alternativeName,
      alternativePrice: r.alternativePrice,
      savings: r.savings,
      reason: r.reason,
    })),
    meta: {
      cartivoUrl: appUrl,
      bundleShareUrl: shareUrl,
      reportTitle: `Cartivo Smart Bundle — ${new Date().toLocaleDateString()}`,
      logoUrl: `${appUrl}/logo.svg`,
    },
  }
}

// ============================================================
// Helper: build annotations and bookmarks from report data
// ============================================================

function buildAnnotations(products: ProductReportData[]): PDFAnnotation[] {
  const annotations: PDFAnnotation[] = []
  products.forEach((p, i) => {
    if (!p.badge) return
    const colorMap: Record<string, PDFAnnotation['color']> = {
      'Most Sustainable': 'green',
      'Best Value': 'blue',
      'Top Rated': 'orange',
      'Budget Pick': 'purple',
    }
    annotations.push({
      page: i + 2, // page 1 = cover, product pages start at 2
      type: 'stamp',
      label: p.badge,
      color: colorMap[p.badge] ?? 'blue',
    })
  })
  return annotations
}

function buildBookmarks(products: ProductReportData[]): PDFBookmark[] {
  const bookmarks: PDFBookmark[] = [
    { title: 'Executive Summary', page: 1, level: 0 },
    { title: 'Selected Products', page: 2, level: 0 },
  ]
  products.forEach((p, i) => {
    bookmarks.push({ title: p.name, page: i + 2, level: 1 })
  })
  bookmarks.push({ title: 'Budget Breakdown', page: products.length + 3, level: 0 })
  bookmarks.push({ title: 'Budget-Saving Alternatives', page: products.length + 4, level: 0 })
  return bookmarks
}

// ============================================================
// Helper: convert base64 to Blob URL
// ============================================================

function base64ToBlobUrl(base64: string, mimeType = 'application/pdf'): string {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  const blob = new Blob([bytes], { type: mimeType })
  return URL.createObjectURL(blob)
}

// ============================================================
// Helper: generate HTML fallback report
// ============================================================

export function generateHTMLReport(reportData: BundleReportData): string {
  const { summary, products, replacements, preferences, meta, generatedAt } = reportData

  const productRows = products
    .map(
      (p) => `
    <div class="product-card">
      ${p.imageUrl ? `<img src="${p.imageUrl}" alt="${p.name}" onerror="this.style.display='none'" />` : ''}
      <div class="product-info">
        <div class="product-header">
          <h3>${p.name}</h3>
          ${p.badge ? `<span class="badge badge-${p.badge.toLowerCase().replace(/\s+/g, '-')}">${p.badge}</span>` : ''}
        </div>
        <p class="brand-category">${p.brand} · ${p.category}</p>
        <p class="price">$${p.price.toFixed(2)}</p>
        ${p.description ? `<p class="description">${p.description}</p>` : ''}
        <div class="metrics">
          <div class="metric"><span>Sustainability</span><strong>${p.sustainabilityScore}/100</strong></div>
          <div class="metric"><span>Durability</span><strong>${p.durabilityScore}/100</strong></div>
          <div class="metric"><span>Rating</span><strong>${p.averageRating.toFixed(1)}/5 ★</strong></div>
          <div class="metric"><span>Warranty</span><strong>${p.warrantyYears}y</strong></div>
        </div>
        ${p.styleTags.length > 0 ? `<div class="tags">${p.styleTags.map((t) => `<span class="tag">${t}</span>`).join('')}</div>` : ''}
        ${p.compatibleWith.length > 0 ? `<p class="compat">✓ Compatible with: ${p.compatibleWith.join(', ')}</p>` : ''}
        ${p.requiredAccessories.length > 0 ? `<p class="accessories">⚠ Requires: ${p.requiredAccessories.map((a) => `${a.name} ($${a.price.toFixed(2)})`).join(', ')}</p>` : ''}
      </div>
    </div>`
    )
    .join('')

  const replacementRows =
    replacements.length > 0
      ? `<section>
      <h2>💡 Budget-Saving Alternatives</h2>
      <table>
        <thead><tr><th>Current Product</th><th>Alternative</th><th>Current Price</th><th>Alternative Price</th><th>Savings</th></tr></thead>
        <tbody>${replacements
          .map(
            (r) => `<tr>
          <td>${r.originalProductName}</td>
          <td>${r.alternativeName}</td>
          <td>$${r.originalPrice.toFixed(2)}</td>
          <td>$${r.alternativePrice.toFixed(2)}</td>
          <td class="savings">-$${r.savings.toFixed(2)}</td>
        </tr>`
          )
          .join('')}</tbody>
      </table>
    </section>`
      : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${meta.reportTitle}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1e293b; background: #fff; font-size: 14px; }
    .cover { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; padding: 60px 40px; text-align: center; }
    .cover h1 { font-size: 2rem; font-weight: 800; margin-bottom: 8px; }
    .cover p { opacity: 0.85; font-size: 1rem; }
    .cover .report-id { margin-top: 16px; font-size: 0.75rem; opacity: 0.6; }
    .content { padding: 32px 40px; max-width: 900px; margin: 0 auto; }
    section { margin-bottom: 40px; }
    h2 { font-size: 1.25rem; font-weight: 700; color: #4f46e5; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 20px; }
    .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
    .summary-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; text-align: center; }
    .summary-card .label { font-size: 0.75rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
    .summary-card .value { font-size: 1.5rem; font-weight: 800; color: #4f46e5; margin-top: 4px; }
    .summary-card.green .value { color: #16a34a; }
    .summary-card.orange .value { color: #d97706; }
    .ai-explanation { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; margin-bottom: 24px; }
    .ai-explanation .label { font-size: 0.7rem; font-weight: 700; color: #15803d; text-transform: uppercase; margin-bottom: 6px; }
    .product-card { display: flex; gap: 16px; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 16px; break-inside: avoid; }
    .product-card img { width: 100px; height: 100px; object-fit: cover; border-radius: 8px; flex-shrink: 0; }
    .product-info { flex: 1; }
    .product-header { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; }
    .product-header h3 { font-size: 1rem; font-weight: 700; }
    .badge { font-size: 0.65rem; font-weight: 700; padding: 2px 8px; border-radius: 100px; text-transform: uppercase; letter-spacing: 0.05em; }
    .badge-most-sustainable { background: #dcfce7; color: #15803d; }
    .badge-top-rated { background: #fef3c7; color: #92400e; }
    .badge-budget-pick { background: #ede9fe; color: #6d28d9; }
    .badge-best-value { background: #dbeafe; color: #1d4ed8; }
    .brand-category { font-size: 0.8rem; color: #64748b; margin-bottom: 6px; }
    .price { font-size: 1.1rem; font-weight: 800; color: #4f46e5; margin-bottom: 8px; }
    .description { font-size: 0.8rem; color: #475569; margin-bottom: 8px; line-height: 1.5; }
    .metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 8px; }
    .metric { background: #f8fafc; border-radius: 8px; padding: 6px 8px; text-align: center; }
    .metric span { font-size: 0.65rem; color: #64748b; display: block; }
    .metric strong { font-size: 0.85rem; color: #1e293b; }
    .tags { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 6px; }
    .tag { font-size: 0.65rem; background: #dbeafe; color: #1d4ed8; padding: 2px 8px; border-radius: 100px; }
    .compat { font-size: 0.75rem; color: #16a34a; }
    .accessories { font-size: 0.75rem; color: #d97706; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #f8fafc; text-align: left; padding: 10px 12px; font-size: 0.75rem; color: #64748b; text-transform: uppercase; border-bottom: 2px solid #e2e8f0; }
    td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 0.85rem; }
    .savings { color: #16a34a; font-weight: 700; }
    .preferences-list { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
    .pref-item { background: #f8fafc; border-radius: 8px; padding: 12px; }
    .pref-item .key { font-size: 0.7rem; color: #64748b; text-transform: uppercase; margin-bottom: 4px; }
    .pref-item .val { font-size: 0.9rem; font-weight: 600; }
    .footer { text-align: center; padding: 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 0.75rem; margin-top: 40px; }
    .qr-section { text-align: center; margin-top: 24px; }
    .qr-section img { width: 120px; height: 120px; }
    .qr-section p { font-size: 0.75rem; color: #64748b; margin-top: 6px; }
    @media print {
      .no-print { display: none !important; }
      body { font-size: 12px; }
      .cover { padding: 40px; }
      .content { padding: 20px; }
      .product-card { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="cover">
    <h1>🛒 Cartivo Smart Bundle Report</h1>
    <p>${meta.reportTitle}</p>
    <p style="margin-top:8px;font-size:0.85rem">Generated by Foxit Document Generation API</p>
    <div class="report-id">Report ID: ${reportData.reportId} · ${new Date(generatedAt).toLocaleString()}</div>
  </div>

  <div class="content">
    <!-- Summary -->
    <section>
      <h2>📊 Bundle Summary</h2>
      <div class="summary-grid">
        <div class="summary-card">
          <div class="label">Total Cost</div>
          <div class="value">$${summary.totalCost.toFixed(2)}</div>
        </div>
        <div class="summary-card green">
          <div class="label">Remaining Budget</div>
          <div class="value">$${summary.remainingBudget.toFixed(2)}</div>
        </div>
        <div class="summary-card">
          <div class="label">Products Selected</div>
          <div class="value">${summary.productCount}</div>
        </div>
        <div class="summary-card ${summary.isCompatible ? 'green' : 'orange'}">
          <div class="label">Compatibility</div>
          <div class="value">${summary.isCompatible ? '✓ Compatible' : '⚠ Review'}</div>
        </div>
        <div class="summary-card green">
          <div class="label">Avg Sustainability</div>
          <div class="value">${summary.avgSustainabilityScore}/100</div>
        </div>
        <div class="summary-card">
          <div class="label">Avg Durability</div>
          <div class="value">${summary.avgDurabilityScore}/100</div>
        </div>
      </div>
      <div class="ai-explanation">
        <div class="label">🤖 AI Reasoning</div>
        <p>${summary.aiExplanation}</p>
      </div>
    </section>

    <!-- Preferences -->
    <section>
      <h2>⚙️ Your Preferences</h2>
      <div class="preferences-list">
        <div class="pref-item"><div class="key">Budget</div><div class="val">$${preferences.budget.toLocaleString()}</div></div>
        <div class="pref-item"><div class="key">Min Sustainability</div><div class="val">${preferences.minSustainability}/100</div></div>
        <div class="pref-item"><div class="key">Style</div><div class="val">${preferences.stylePreferences.join(', ') || 'Any'}</div></div>
        <div class="pref-item"><div class="key">Categories</div><div class="val">${preferences.categories.length} selected</div></div>
      </div>
    </section>

    <!-- Products -->
    <section>
      <h2>🛍️ Selected Products</h2>
      ${productRows}
    </section>

    <!-- Replacements -->
    ${replacementRows}

    <!-- QR Code -->
    <section class="qr-section">
      <h2>🔗 Share This Bundle</h2>
      <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(meta.bundleShareUrl)}" alt="QR code for bundle" />
      <p>${meta.bundleShareUrl}</p>
      <p style="margin-top:8px;font-size:0.7rem;color:#94a3b8">Scan to view this bundle on Cartivo</p>
    </section>
  </div>

  <div class="footer">
    Generated by Cartivo · Powered by Foxit Document Generation API &amp; Foxit PDF Services API<br/>
    ${meta.cartivoUrl} · Report ID: ${reportData.reportId}
  </div>
</body>
</html>`
}

// ============================================================
// Main pipeline function
// ============================================================

/**
 * Run the full PDF report generation pipeline.
 *
 * @param request   User preferences (budget, categories, etc.)
 * @param onProgress  Callback invoked at each step for UI updates
 */
export async function generatePDFReport(
  request: PDFReportRequest,
  onProgress: (progress: GenerationProgress) => void
): Promise<PDFReportResult> {
  const totalSteps = isFoxitConfigured() ? 4 : 3

  // ── Step 1: Compute Smart Bundle ──────────────────────────────────────────
  onProgress({
    step: 'computing-bundle',
    stepIndex: 1,
    totalSteps,
    message: 'Querying Sanity CMS and computing your Smart Bundle…',
  })

  const constraints: SetupConstraints = {
    categories: request.categories,
    maxBudget: request.budget,
    stylePreference: request.stylePreferences,
    minSustainability: request.minSustainability,
  }

  const bundle = await buildSmartSetup(constraints)

  // ── Step 2: Build report data ─────────────────────────────────────────────
  onProgress({
    step: 'building-report-data',
    stepIndex: 2,
    totalSteps,
    message: 'Structuring AI reasoning and product data…',
    bundle,
  })

  const reportData = buildReportData(bundle, request)

  // ── Step 3 / Fallback: Generate PDF ──────────────────────────────────────
  if (!isFoxitConfigured()) {
    // No API key → generate HTML report for browser print-to-PDF
    const htmlReport = generateHTMLReport(reportData)

    onProgress({
      step: 'complete',
      stepIndex: totalSteps,
      totalSteps,
      message: 'HTML report ready — use the Print button to export as PDF.',
      bundle,
    })

    return {
      bundle,
      reportData,
      htmlReport,
      usedFoxitAPI: false,
      appliedOperations: ['html-fallback'],
    }
  }

  // ── Step 3: Foxit Document Generation API ────────────────────────────────
  onProgress({
    step: 'generating-pdf',
    stepIndex: 3,
    totalSteps,
    message: 'Calling Foxit Document Generation API to build your PDF…',
    bundle,
  })

  let docGenResponse: FoxitDocGenResponse = await generateBundlePDF(reportData)

  // Poll if the job is async
  if (docGenResponse.status === 'processing' && docGenResponse.jobId) {
    docGenResponse = await pollJobStatus(docGenResponse.jobId)
  }

  const rawPdfBase64 = docGenResponse.pdfBase64 ?? ''

  // ── Step 4: Foxit PDF Services API ───────────────────────────────────────
  onProgress({
    step: 'enhancing-pdf',
    stepIndex: 4,
    totalSteps,
    message:
      'Calling Foxit PDF Services API — adding bookmarks, annotations, and optimising…',
    bundle,
  })

  const annotations = buildAnnotations(reportData.products)
  const bookmarks = buildBookmarks(reportData.products)

  const enhancedResponse = await enhancePDF({
    sourcePdfBase64: rawPdfBase64,
    annotations,
    bookmarks,
    optimizeFor: request.optimizeFor ?? 'web',
  })

  const finalBase64 = enhancedResponse.pdfBase64 ?? rawPdfBase64
  const pdfBlobUrl = finalBase64 ? base64ToBlobUrl(finalBase64) : undefined

  onProgress({
    step: 'complete',
    stepIndex: totalSteps,
    totalSteps,
    message: 'Your PDF report is ready!',
    bundle,
  })

  return {
    bundle,
    reportData,
    pdfBase64: finalBase64,
    pdfBlobUrl,
    usedFoxitAPI: true,
    appliedOperations: enhancedResponse.operations,
    fileSizeBytes: enhancedResponse.fileSizeBytes,
    pageCount: enhancedResponse.pageCount ?? docGenResponse.pageCount,
  }
}
