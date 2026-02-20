import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { FileText, Sparkles, RotateCcw } from 'lucide-react'
import { PDFReportForm, GenerationProgress, BundlePreview, PDFOutput } from '../components/PDFReport'
import { fetchCategories, SanityCategory } from '../../services/sanity/sanityService'
import {
  generatePDFReport,
  PDFReportRequest,
  PDFReportResult,
  GenerationProgress as ProgressData,
  GenerationStep,
} from '../../services/pdf/pdfReportService'
import { isFoxitConfigured } from '../../services/foxit/foxitDocGen'

type UIState = 'form' | 'generating' | 'preview' | 'output' | 'error'

export function PDFReport() {
  const [categories, setCategories] = useState<SanityCategory[]>([])
  const [uiState, setUiState] = useState<UIState>('form')
  const [progress, setProgress] = useState<ProgressData>({
    step: 'idle',
    stepIndex: 0,
    totalSteps: 4,
    message: '',
  })
  const [result, setResult] = useState<PDFReportResult | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const foxitConfigured = isFoxitConfigured()

  // Load categories from Sanity
  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch((err) => console.error('Failed to load categories:', err))
  }, [])

  const handleGenerate = async (request: PDFReportRequest) => {
    setUiState('generating')
    setErrorMessage(null)
    setResult(null)

    try {
      const reportResult = await generatePDFReport(request, (p) => {
        setProgress(p)
        // Transition to preview once bundle is computed
        if (p.bundle && uiState === 'generating' && p.step !== 'complete') {
          // keep generating UI
        }
      })

      setResult(reportResult)
      setUiState('output')
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setErrorMessage(msg)
      setProgress((prev) => ({
        ...prev,
        step: 'error' as GenerationStep,
        message: msg,
      }))
      setUiState('error')
    }
  }

  const handleReset = () => {
    setUiState('form')
    setResult(null)
    setErrorMessage(null)
    setProgress({ step: 'idle', stepIndex: 0, totalSteps: 4, message: '' })
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-4"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-200">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900">PDF Report Generator</h1>
                <span className="text-xs font-semibold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                  Powered by Foxit
                </span>
              </div>
              <p className="text-slate-500 mt-1 text-sm leading-relaxed max-w-xl">
                Set your preferences, and Cartivo's AI will compute a Smart Bundle from Sanity
                CMS data — then generate a professional PDF using{' '}
                <strong className="text-indigo-600">Foxit Document Generation API</strong> and
                enhance it with the{' '}
                <strong className="text-purple-600">Foxit PDF Services API</strong>.
              </p>

              {/* API status badges */}
              <div className="flex gap-2 mt-3 flex-wrap">
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
                    foxitConfigured
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {foxitConfigured ? '● Foxit API connected' : '○ Foxit API — demo mode (no key)'}
                </span>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full border bg-blue-50 text-blue-700 border-blue-200">
                  ● Sanity CMS connected
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {/* Form state */}
          {uiState === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6"
            >
              <PDFReportForm
                categories={categories}
                loading={false}
                onSubmit={handleGenerate}
              />
            </motion.div>
          )}

          {/* Generating state */}
          {(uiState === 'generating' || uiState === 'error') && (
            <motion.div
              key="generating"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="space-y-6"
            >
              {/* Pipeline card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h3 className="font-bold text-slate-900 mb-5 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-500" />
                  Generating Your PDF Report
                </h3>
                <GenerationProgress progress={progress} />
              </div>

              {/* Live bundle preview while generating */}
              {progress.bundle && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6"
                >
                  <h3 className="font-bold text-slate-900 mb-5">Bundle Preview</h3>
                  <BundlePreview
                    result={{
                      bundle: progress.bundle,
                      reportData: null as any,
                      usedFoxitAPI: false,
                      appliedOperations: [],
                    }}
                  />
                </motion.div>
              )}

              {/* Error reset */}
              {uiState === 'error' && (
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Start Over
                </button>
              )}
            </motion.div>
          )}

          {/* Output state */}
          {uiState === 'output' && result && (
            <motion.div
              key="output"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="space-y-6"
            >
              {/* Bundle summary */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h3 className="font-bold text-slate-900 mb-5 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-500" />
                  Your Smart Bundle
                </h3>
                <BundlePreview result={result} />
              </div>

              {/* PDF output */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h3 className="font-bold text-slate-900 mb-5 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-500" />
                  Your PDF Report
                </h3>
                <PDFOutput result={result} />
              </div>

              {/* Start over */}
              <button
                onClick={handleReset}
                className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Generate Another Report
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
