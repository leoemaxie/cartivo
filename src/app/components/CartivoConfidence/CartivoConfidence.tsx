/**
 * Cartivo Confidence™ — Visual Validation + Confidence Scoring UI
 *
 * Allows users to:
 *   1. Upload a photo (or capture via camera)
 *   2. Select a product from the current bundle
 *   3. Receive a Visual Fit Score, Compatibility Score, Budget Score
 *      and a final Confidence Index™ with an animated gauge
 *   4. Push the scored bundle to a Miro board (when running inside Miro)
 *
 * Privacy: images are processed in memory only and never stored.
 */

import React, { useCallback, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Camera,
  Upload,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  Info,
  Loader2,
  ChevronDown,
  Layout,
} from 'lucide-react'

import { generateTryOn, PerfectCorpError } from '../../../services/perfectCorpService'
import { computeVisualFitScore } from '../../../services/visualFitEngine'
import {
  computeConfidenceIndex,
  deriveBudgetScore,
  deriveCompatibilityScore,
  type ConfidenceResult,
} from '../../../services/confidenceEngine'
import type { SetupBuilderResult } from '../../../services/setupBuilder'
import type { SanityProduct } from '../../../services/sanity/sanityService'
import { pushBundleToBoard } from '../../../services/miroWidgets'
import type { BundleRecomputeResponse } from '../../../services/cartivoApi'

// ── Props ────────────────────────────────────────────────────────────────────

export interface CartivoConfidenceProps {
  /** Optional pre-built setup to source products and scores from */
  setupResult?: SetupBuilderResult
  /** Fallback flat product list if no setupResult is provided */
  products?: SanityProduct[]
  /** Max budget used to derive budget score (defaults to setup totalCost if omitted) */
  maxBudget?: number
}

// ── Internal types ───────────────────────────────────────────────────────────

type Phase = 'idle' | 'uploading' | 'processing' | 'done' | 'error'

interface ScoreState {
  tryOnImage: string
  confidence: ConfidenceResult
  visualInsight: string
  confidenceBand: 'Low' | 'Moderate' | 'High'
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const BAND_COLOR: Record<string, string> = {
  High: 'text-emerald-600',
  Moderate: 'text-amber-500',
  Low: 'text-rose-500',
}

const BAND_BG: Record<string, string> = {
  High: 'bg-emerald-50 border-emerald-200',
  Moderate: 'bg-amber-50 border-amber-200',
  Low: 'bg-rose-50 border-rose-200',
}

function scoreColor(score: number): string {
  if (score >= 75) return '#10b981' // emerald
  if (score >= 50) return '#f59e0b' // amber
  return '#f43f5e' // rose
}

// ── Animated Gauge ────────────────────────────────────────────────────────────

function ConfidenceGauge({ score }: { score: number }) {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  // Show only the top 75% of the circle (270°)
  const arcLength = circumference * 0.75
  const filled = (score / 100) * arcLength

  return (
    <div className="relative flex items-center justify-center w-40 h-40">
      <svg width="160" height="160" viewBox="0 0 160 160" className="-rotate-[135deg]">
        {/* Track */}
        <circle
          cx="80" cy="80" r={radius}
          fill="none" stroke="#e2e8f0" strokeWidth="10"
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeLinecap="round"
        />
        {/* Fill */}
        <motion.circle
          cx="80" cy="80" r={radius}
          fill="none"
          stroke={scoreColor(score)}
          strokeWidth="10"
          strokeDasharray={`${filled} ${circumference}`}
          strokeLinecap="round"
          initial={{ strokeDasharray: `0 ${circumference}` }}
          animate={{ strokeDasharray: `${filled} ${circumference}` }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <motion.span
          className="text-3xl font-extrabold text-slate-900"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          {score}
        </motion.span>
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
          /100
        </span>
      </div>
    </div>
  )
}

// ── Score Row ─────────────────────────────────────────────────────────────────

function ScoreBar({ label, score, delay = 0 }: { label: string; score: number; delay?: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm font-medium text-slate-700">
        <span>{label}</span>
        <span style={{ color: scoreColor(score) }}>{score}/100</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: scoreColor(score) }}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.9, ease: 'easeOut', delay }}
        />
      </div>
    </div>
  )
}

// ── Privacy Notice ────────────────────────────────────────────────────────────

function PrivacyNotice() {
  return (
    <div className="flex items-start gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-500">
      <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
      <span>
        Images are processed securely and <strong>not stored</strong>. EXIF metadata is stripped
        before processing. No biometric data is retained.
      </span>
    </div>
  )
}

// ── Product Selector ──────────────────────────────────────────────────────────

function ProductSelector({
  products,
  selected,
  onChange,
}: {
  products: SanityProduct[]
  selected: string
  onChange: (id: string) => void
}) {
  return (
    <div className="relative">
      <select
        value={selected}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none border border-slate-200 rounded-xl px-4 py-3 pr-10 text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 cursor-pointer"
      >
        <option value="" disabled>
          Select a product to try on…
        </option>
        {products.map((p) => (
          <option key={p._id} value={p._id}>
            {p.name} — ${p.price.toFixed(2)}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export function CartivoConfidence({ setupResult, products: propProducts, maxBudget }: CartivoConfidenceProps) {
  const products: SanityProduct[] = propProducts ?? setupResult?.products ?? []

  const [phase, setPhase] = useState<Phase>('idle')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedProductId, setSelectedProductId] = useState<string>('')
  const [scoreState, setScoreState] = useState<ScoreState | null>(null)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [miroPushStatus, setMiroPushStatus] = useState<'idle' | 'pushing' | 'done' | 'error'>('idle')

  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  // ── File selection ──────────────────────────────────────────────────────────

  const handleFileSelected = useCallback((file: File) => {
    const objectUrl = URL.createObjectURL(file)
    setSelectedFile(file)
    setPreviewUrl(objectUrl)
    setPhase('idle')
    setScoreState(null)
    setErrorMessage('')
  }, [])

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileSelected(file)
    e.target.value = '' // reset so re-selecting same file triggers onChange
  }

  // ── Drop zone ───────────────────────────────────────────────────────────────

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const file = e.dataTransfer.files?.[0]
      if (file) handleFileSelected(file)
    },
    [handleFileSelected]
  )

  // ── Submit ──────────────────────────────────────────────────────────────────

  const handleValidate = async () => {
    if (!selectedFile) {
      setErrorMessage('Please upload or capture a photo first.')
      return
    }
    if (!selectedProductId) {
      setErrorMessage('Please select a product to validate.')
      return
    }

    const product = products.find((p) => p._id === selectedProductId)
    if (!product) {
      setErrorMessage('Selected product not found.')
      return
    }

    setPhase('processing')
    setErrorMessage('')

    try {
      // 1. Perfect Corp virtual try-on
      const productAsset = product.image ?? product.images?.[0]?.asset?.url ?? ''
      const tryOnResult = await generateTryOn(selectedFile, productAsset)

      // 2. Visual fit scoring
      const { visualFitScore, visualInsight, confidenceBand } = computeVisualFitScore(tryOnResult)

      // 3. Compatibility score from setup builder data (or defaults)
      const avgRating = setupResult?.products.length
        ? setupResult.products.reduce((s, p) => s + (p.performanceMetrics?.averageRating ?? 3), 0) /
          setupResult.products.length
        : 3
      const avgDurability = setupResult?.products.length
        ? setupResult.products.reduce((s, p) => s + (p.performanceMetrics?.durabilityScore ?? 50), 0) /
          setupResult.products.length
        : 50

      const compatibilityScore = deriveCompatibilityScore(
        setupResult?.isCompactible ?? true,
        avgRating,
        avgDurability
      )

      // 4. Budget score
      const budget = maxBudget ?? (setupResult ? setupResult.totalCost + setupResult.remainingBudget : 0)
      const remaining = setupResult?.remainingBudget ?? budget
      const budgetScore = deriveBudgetScore(remaining, budget)

      // 5. Confidence Index
      const confidence = computeConfidenceIndex({ compatibilityScore, visualFitScore, budgetScore })

      setScoreState({
        tryOnImage: tryOnResult.renderedImage,
        confidence,
        visualInsight,
        confidenceBand,
      })
      setPhase('done')
    } catch (err) {
      const msg =
        err instanceof PerfectCorpError
          ? err.message
          : err instanceof Error
          ? err.message
          : 'An unexpected error occurred. Please try again.'
      setErrorMessage(msg)
      setPhase('error')
    }
  }

  const handleReset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setSelectedFile(null)
    setPreviewUrl(null)
    setScoreState(null)
    setPhase('idle')
    setErrorMessage('')
    setMiroPushStatus('idle')
  }

  const handleMiroPush = async () => {
    if (!scoreState || !selectedProductId) return
    const product = products.find((p) => p._id === selectedProductId)
    if (!product) return

    setMiroPushStatus('pushing')
    try {
      const bundleResponse: BundleRecomputeResponse = {
        bundleId: `confidence_${Date.now()}`,
        items: [
          {
            itemId: product._id,
            name: product.name,
            category: product.category?.title ?? 'fashion',
            price: product.price,
            imageUrl: product.image ?? product.images?.[0]?.asset?.url ?? '',
            styleTags: product.styleTags ?? [],
            sustainabilityScore: product.sustainabilityScore ?? 70,
            compatibilityScore: scoreState.confidence.compatibilityScore,
            confidenceIndex: scoreState.confidence.confidenceIndex,
            visualFitScore: scoreState.confidence.visualFitScore,
            budgetScore: scoreState.confidence.budgetScore,
            explanationSummary: scoreState.confidence.explanationSummary,
          },
        ],
        overallConfidence: scoreState.confidence.confidenceIndex,
        totalCost: product.price,
        remainingBudget: 0,
        isCompatible: scoreState.confidence.compatibilityScore >= 60,
        lastComputedAt: new Date().toISOString(),
      }
      await pushBundleToBoard(bundleResponse, { bundleName: product.name })
      setMiroPushStatus('done')
    } catch {
      setMiroPushStatus('error')
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-100 rounded-2xl flex items-center justify-center">
          <CheckCircle className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Cartivo Confidence™
          </h2>
          <p className="text-sm text-slate-500">
            Visual Validation + Confidence Index
          </p>
        </div>
      </div>

      <PrivacyNotice />

      {/* Upload zone */}
      <div
        className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all"
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={onFileInput}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="user"
          className="hidden"
          onChange={onFileInput}
        />

        {previewUrl ? (
          <div className="flex flex-col items-center gap-3">
            <img
              src={previewUrl}
              alt="Your photo preview"
              className="w-32 h-32 object-cover rounded-xl border border-slate-200 shadow-sm"
            />
            <p className="text-xs text-slate-400">
              {selectedFile?.name} · Tap to change
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-slate-400 py-4">
            <Upload className="w-8 h-8" />
            <p className="font-medium text-slate-600">Drop your photo here, or click to browse</p>
            <p className="text-xs">JPEG · PNG · WebP · max 10 MB</p>
          </div>
        )}
      </div>

      {/* Camera shortcut */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          cameraInputRef.current?.click()
        }}
        className="w-full flex items-center justify-center gap-2 border border-slate-200 rounded-xl py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all"
      >
        <Camera className="w-4 h-4" />
        Take a photo with camera
      </button>

      {/* Product selector */}
      {products.length > 0 && (
        <ProductSelector
          products={products}
          selected={selectedProductId}
          onChange={setSelectedProductId}
        />
      )}

      {/* Error state */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-start gap-3 bg-rose-50 border border-rose-200 rounded-xl p-3 text-sm text-rose-700"
          >
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            {errorMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* CTA */}
      {phase !== 'done' && (
        <button
          type="button"
          onClick={handleValidate}
          disabled={phase === 'processing' || !selectedFile || !selectedProductId}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2"
        >
          {phase === 'processing' ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analysing visual fit…
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              Validate Confidence
            </>
          )}
        </button>
      )}

      {/* Results */}
      <AnimatePresence>
        {phase === 'done' && scoreState && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Try-on render + gauge side-by-side */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                <img
                  src={scoreState.tryOnImage}
                  alt="Visual try-on result"
                  className="w-full h-48 object-cover"
                />
                <p className="text-[10px] text-slate-400 text-center py-1">
                  Virtual try-on preview
                </p>
              </div>

              <div className="flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                <ConfidenceGauge score={scoreState.confidence.confidenceIndex} />
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
                  Confidence Index™
                </p>
              </div>
            </div>

            {/* Visual insight badge */}
            <div
              className={`flex items-start gap-3 rounded-xl border p-3 text-sm ${
                BAND_BG[scoreState.confidenceBand]
              }`}
            >
              <Info className={`w-4 h-4 shrink-0 mt-0.5 ${BAND_COLOR[scoreState.confidenceBand]}`} />
              <div>
                <span
                  className={`font-bold text-xs uppercase tracking-widest ${
                    BAND_COLOR[scoreState.confidenceBand]
                  }`}
                >
                  {scoreState.confidenceBand} Visual Fit
                </span>
                <p className="text-slate-700 mt-0.5">{scoreState.visualInsight}</p>
              </div>
            </div>

            {/* Score breakdown */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest">
                Score Breakdown
              </h3>
              <ScoreBar
                label="Compatibility Score"
                score={scoreState.confidence.compatibilityScore}
                delay={0}
              />
              <ScoreBar
                label="Visual Fit Score"
                score={scoreState.confidence.visualFitScore}
                delay={0.15}
              />
              <ScoreBar
                label="Budget Alignment"
                score={scoreState.confidence.budgetScore}
                delay={0.3}
              />
              <div className="pt-2 border-t border-slate-100">
                <ScoreBar
                  label="Confidence Index™"
                  score={scoreState.confidence.confidenceIndex}
                  delay={0.45}
                />
              </div>
            </div>

            {/* Plain-language summary */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 text-sm text-indigo-800 leading-relaxed">
              <span className="font-bold block mb-1">AI Summary</span>
              {scoreState.confidence.explanationSummary}
            </div>

            {/* Push to Miro (only when Miro SDK is available) */}
            {typeof window !== 'undefined' && (window as any).miro && (
              <button
                type="button"
                onClick={handleMiroPush}
                disabled={miroPushStatus === 'pushing' || miroPushStatus === 'done'}
                className="w-full flex items-center justify-center gap-2 border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 disabled:opacity-60 disabled:cursor-not-allowed text-indigo-700 font-bold py-3 rounded-2xl transition-all text-sm"
              >
                {miroPushStatus === 'pushing' ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Pushing to Miro…</>
                ) : miroPushStatus === 'done' ? (
                  <><CheckCircle className="w-4 h-4 text-green-600" /> Pushed to Miro Board</>
                ) : miroPushStatus === 'error' ? (
                  <><AlertTriangle className="w-4 h-4 text-rose-500" /> Push failed — retry</>
                ) : (
                  <><Layout className="w-4 h-4" /> Push Bundle to Miro</>
                )}
              </button>
            )}

            {/* Reset */}
            <button
              type="button"
              onClick={handleReset}
              className="w-full border border-slate-200 rounded-xl py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all"
            >
              Start over
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default CartivoConfidence
