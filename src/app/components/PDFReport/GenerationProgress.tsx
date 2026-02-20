import React from 'react'
import { motion } from 'motion/react'
import { CheckCircle, Circle, Loader, AlertCircle } from 'lucide-react'
import type { GenerationStep, GenerationProgress as ProgressData } from '@/services/pdf/pdfReportService'

interface GenerationProgressProps {
  progress: ProgressData
}

interface Step {
  id: GenerationStep
  label: string
  description: string
  apiLabel?: string
}

const STEPS: Step[] = [
  {
    id: 'computing-bundle',
    label: 'Compute Smart Bundle',
    description: 'Querying Sanity CMS · AI-scoring products',
    apiLabel: 'Sanity GROQ',
  },
  {
    id: 'building-report-data',
    label: 'Structure Report Data',
    description: 'Assigning badges · Building JSON payload',
  },
  {
    id: 'generating-pdf',
    label: 'Generate PDF',
    description: 'Sending bundle data to Foxit',
    apiLabel: 'Foxit Document Generation API',
  },
  {
    id: 'enhancing-pdf',
    label: 'Enhance PDF',
    description: 'Merge · Annotate · Bookmark · Optimize',
    apiLabel: 'Foxit PDF Services API',
  },
]

const STEP_ORDER: GenerationStep[] = [
  'idle',
  'computing-bundle',
  'building-report-data',
  'generating-pdf',
  'enhancing-pdf',
  'complete',
]

function stepIndex(step: GenerationStep): number {
  return STEP_ORDER.indexOf(step)
}

export default function GenerationProgress({ progress }: GenerationProgressProps) {
  const currentIdx = stepIndex(progress.step)
  const isError = progress.step === 'error'

  return (
    <div className="space-y-6">
      {/* Steps */}
      <div className="space-y-3">
        {STEPS.map((step, i) => {
          const stepIdx = i + 1 // 1-based
          const isComplete = currentIdx > stepIdx && !isError
          const isActive = currentIdx === stepIdx
          const isPending = currentIdx < stepIdx && !isError

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
                isActive
                  ? 'border-indigo-200 bg-indigo-50'
                  : isComplete
                  ? 'border-emerald-200 bg-emerald-50'
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              {/* Icon */}
              <div className="mt-0.5 flex-shrink-0">
                {isComplete ? (
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                ) : isActive ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                  >
                    <Loader className="w-5 h-5 text-indigo-500" />
                  </motion.div>
                ) : (
                  <Circle className="w-5 h-5 text-slate-300" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`font-semibold text-sm ${
                      isActive ? 'text-indigo-700' : isComplete ? 'text-emerald-700' : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </span>
                  {step.apiLabel && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        isActive
                          ? 'bg-indigo-100 text-indigo-600'
                          : isComplete
                          ? 'bg-emerald-100 text-emerald-600'
                          : 'bg-slate-200 text-slate-400'
                      }`}
                    >
                      {step.apiLabel}
                    </span>
                  )}
                </div>
                <p
                  className={`text-xs mt-0.5 ${
                    isActive ? 'text-indigo-600' : isComplete ? 'text-emerald-600' : 'text-slate-400'
                  }`}
                >
                  {isActive ? progress.message : step.description}
                </p>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Error state */}
      {isError && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl"
        >
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm text-red-700">Generation failed</p>
            <p className="text-xs text-red-600 mt-0.5">{progress.message}</p>
          </div>
        </motion.div>
      )}

      {/* Overall progress bar */}
      {progress.step !== 'idle' && progress.step !== 'error' && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Progress</span>
            <span>
              {progress.step === 'complete'
                ? 'Complete'
                : `Step ${Math.min(progress.stepIndex, STEPS.length)} of ${progress.totalSteps}`}
            </span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-indigo-500 rounded-full"
              initial={{ width: 0 }}
              animate={{
                width:
                  progress.step === 'complete'
                    ? '100%'
                    : `${((progress.stepIndex - 1) / progress.totalSteps) * 100}%`,
              }}
              transition={{ ease: 'easeOut', duration: 0.5 }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
