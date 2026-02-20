import React, { useState } from 'react'
import { motion } from 'motion/react'
import { NumericTextBox, Slider } from '@progress/kendo-react-inputs'
import { MultiSelect, MultiSelectChangeEvent } from '@progress/kendo-react-dropdowns'
import { Button } from '@progress/kendo-react-buttons'
import { FileText, Zap, Leaf, Palette, DollarSign } from 'lucide-react'
import type { PDFReportRequest } from '@/services/pdf/pdfReportService'
import type { SanityCategory } from '@/services/sanity/sanityService'

interface PDFReportFormProps {
  categories: SanityCategory[]
  loading?: boolean
  onSubmit: (request: PDFReportRequest) => void
}

const STYLE_OPTIONS = [
  { text: 'Modern', value: 'modern' },
  { text: 'Minimalist', value: 'minimalist' },
  { text: 'Industrial', value: 'industrial' },
  { text: 'Scandinavian', value: 'scandinavian' },
  { text: 'Industrial Modern', value: 'industrial-modern' },
  { text: 'Ergonomic Tech', value: 'ergonomic-tech' },
  { text: 'Sustainable', value: 'sustainable' },
  { text: 'Luxury', value: 'luxury' },
  { text: 'Budget Friendly', value: 'budget-friendly' },
  { text: 'Vintage', value: 'vintage' },
]

const OPTIMIZE_OPTIONS = [
  { text: 'Web (balanced)', value: 'web' },
  { text: 'Mobile (compressed)', value: 'mobile' },
  { text: 'Print (high quality)', value: 'print' },
]

export default function PDFReportForm({ categories, loading, onSubmit }: PDFReportFormProps) {
  const [budget, setBudget] = useState(1500)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [stylePreferences, setStylePreferences] = useState<string[]>(['modern'])
  const [minSustainability, setMinSustainability] = useState(40)
  const [optimizeFor, setOptimizeFor] = useState<'web' | 'mobile' | 'print'>('web')
  const [error, setError] = useState<string | null>(null)

  const categoryOptions = categories.map((c) => ({ text: c.title, value: c._id }))

  const handleSubmit = () => {
    setError(null)
    if (selectedCategories.length === 0) {
      setError('Please select at least one product category.')
      return
    }
    if (budget < 100) {
      setError('Budget must be at least $100.')
      return
    }
    onSubmit({
      budget,
      categories: selectedCategories,
      stylePreferences,
      minSustainability,
      optimizeFor,
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
          <FileText className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Configure Your Report</h2>
          <p className="text-sm text-slate-500">Set preferences and we'll build a personalised PDF</p>
        </div>
      </div>

      {/* Budget */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <DollarSign className="w-4 h-4 text-indigo-500" />
          Total Budget (USD)
        </label>
        <div className="flex items-center gap-3">
          <span className="text-slate-400 font-medium">$</span>
          <NumericTextBox
            value={budget}
            onChange={(e) => setBudget(e.value ?? 1500)}
            min={100}
            max={50000}
            step={50}
            format="n0"
            className="flex-1"
          />
        </div>
        <p className="text-xs text-slate-400">Min $100 · Max $50,000</p>
      </div>

      {/* Categories */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Zap className="w-4 h-4 text-indigo-500" />
          Product Categories
        </label>
        <MultiSelect
          data={categoryOptions}
          value={selectedCategories}
          onChange={(e: MultiSelectChangeEvent) => setSelectedCategories(e.value as string[])}
          placeholder="Select 1–5 categories…"
          className="w-full"
        />
        <p className="text-xs text-slate-400">One product will be selected per category</p>
      </div>

      {/* Style preferences */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Palette className="w-4 h-4 text-indigo-500" />
          Style Preferences
        </label>
        <MultiSelect
          data={STYLE_OPTIONS}
          value={stylePreferences}
          onChange={(e: MultiSelectChangeEvent) => setStylePreferences(e.value as string[])}
          placeholder="Select styles…"
          className="w-full"
        />
      </div>

      {/* Sustainability */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Leaf className="w-4 h-4 text-emerald-500" />
          Minimum Sustainability Score
          <span className="ml-auto text-indigo-600 font-bold">{minSustainability}/100</span>
        </label>
        <div className="px-1">
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={minSustainability}
            onChange={(e) => setMinSustainability(Number(e.target.value))}
            className="w-full accent-indigo-600"
          />
        </div>
        <div className="flex justify-between text-xs text-slate-400">
          <span>0 — any product</span>
          <span>100 — most eco-friendly</span>
        </div>
      </div>

      {/* Optimize for */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700">Optimise PDF For</label>
        <div className="grid grid-cols-3 gap-2">
          {OPTIMIZE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setOptimizeFor(opt.value as 'web' | 'mobile' | 'print')}
              className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                optimizeFor === opt.value
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
              }`}
            >
              {opt.text}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700"
        >
          {error}
        </motion.div>
      )}

      {/* Submit */}
      <Button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full"
        themeColor="primary"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            Generating…
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <FileText className="w-4 h-4" />
            Generate PDF Report
          </span>
        )}
      </Button>

      {/* API info badge */}
      <div className="flex gap-2 flex-wrap">
        <span className="text-xs bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-full px-3 py-1 font-medium">
          Foxit Document Generation API
        </span>
        <span className="text-xs bg-purple-50 text-purple-600 border border-purple-200 rounded-full px-3 py-1 font-medium">
          Foxit PDF Services API
        </span>
        <span className="text-xs bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full px-3 py-1 font-medium">
          Sanity CMS
        </span>
      </div>
    </div>
  )
}
