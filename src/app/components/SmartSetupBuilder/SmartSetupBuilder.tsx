import React, { useState, useEffect } from 'react'
import {
  MultiSelect,
  MultiSelectChangeEvent,
} from '@progress/kendo-react-dropdowns'
import { NumericTextBox } from '@progress/kendo-react-inputs'
import { Button } from '@progress/kendo-react-buttons'
import { Loader } from '@progress/kendo-react-indicators'
import { Card, CardBody } from '@progress/kendo-react-layout'
import { ChartContainer, Chart, SeriesItem, TooltipItem } from '@progress/kendo-react-charts'

import { fetchCategories, SanityCategory, SanityProduct } from '@/services/sanity/sanityService'
import {
  buildSmartSetup,
  getCompatibleAccessories,
  getUpgradeSuggestions,
  SetupBuilderResult,
} from '@/services/setupBuilder'
import ProductCard from './ProductCard'
import ReplacementSuggestions from './ReplacementSuggestions'
import CompatibleAccessories from './CompatibleAccessories'

export const STYLE_PREFERENCES = [
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

interface SmartSetupBuilderProps {
  onSetupBuilt?: (result: SetupBuilderResult) => void
}

const SmartSetupBuilder: React.FC<SmartSetupBuilderProps> = ({ onSetupBuilt }) => {
  const [categories, setCategories] = useState<SanityCategory[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [budget, setBudget] = useState<number>(1000)
  const [selectedStyles, setSelectedStyles] = useState<string[]>(['modern'])
  const [minSustainability, setMinSustainability] = useState<number>(40)

  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SetupBuilderResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showAccessories, setShowAccessories] = useState(false)
  const [accessories, setAccessories] = useState<SanityProduct[]>([])
  const [upgrades, setUpgrades] = useState<SanityProduct[]>([])

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await fetchCategories()
        setCategories(cats)
        // Pre-select first 3 categories
        setSelectedCategories(cats.slice(0, 3).map((c) => c._id))
      } catch (err) {
        setError(
          `Failed to load categories: ${err instanceof Error ? err.message : String(err)}`
        )
      }
    }

    loadCategories()
  }, [])

  const handleBuildSetup = async () => {
    if (selectedCategories.length === 0) {
      setError('Please select at least one category.')
      return
    }

    if (budget <= 0) {
      setError('Budget must be greater than 0.')
      return
    }

    setLoading(true)
    setError(null)
    setAccessories([])

    try {
      const setupResult = await buildSmartSetup({
        categories: selectedCategories,
        maxBudget: budget,
        stylePreference: selectedStyles,
        minSustainability: minSustainability,
      })

      setResult(setupResult)
      onSetupBuilt?.(setupResult)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  const handleShowAccessories = async () => {
    if (!result || result.products.length === 0) {
      setError('No products selected.')
      return
    }

    setLoading(true)

    try {
      const productIds = result.products.map((p) => p._id)
      const availableAccessories = await getCompatibleAccessories(productIds, budget * 0.2)
      setAccessories(availableAccessories)
      setShowAccessories(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  const handleShowUpgrades = async () => {
    if (!result || result.products.length === 0) {
      setError('No products selected.')
      return
    }

    setLoading(true)

    try {
      const productIds = result.products.map((p) => p._id)
      const availableUpgrades = await getUpgradeSuggestions(productIds, budget * 0.15)
      setUpgrades(availableUpgrades)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  const categoryOptions = categories.map((c) => ({
    text: c.title,
    value: c._id,
  }))

  // Calculate price distribution for chart
  const priceDistribution =
    result?.products.map((p) => ({
      category: p.category.title,
      price: p.price,
    })) || []

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Smart Setup Builder</h1>
        <p className="text-muted-foreground">
          Build a cohesive home office setup with intelligent product matching and budget optimization
        </p>
      </div>

      {/* Input Section */}
      <Card className="border-l-4 border-l-primary">
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Budget Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Total Budget (USD)</label>
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold">$</span>
                <NumericTextBox
                  value={budget}
                  onChange={(e) => setBudget(e.value || 1000)}
                  min={100}
                  max={50000}
                  step={50}
                  format="n0"
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">Minimum $100, Maximum $50,000</p>
            </div>

            {/* Categories */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Categories</label>
              <MultiSelect
                data={categoryOptions}
                value={selectedCategories}
                onChange={(e: MultiSelectChangeEvent) =>
                  setSelectedCategories(e.value as string[])
                }
                placeholder="Select categories..."
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Select 1-5 categories for your setup
              </p>
            </div>

            {/* Style Preferences */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Style Preferences</label>
              <MultiSelect
                data={STYLE_PREFERENCES}
                value={selectedStyles}
                onChange={(e: MultiSelectChangeEvent) =>
                  setSelectedStyles(e.value as string[])
                }
                placeholder="Select styles..."
                className="w-full"
              />
            </div>

            {/* Sustainability Threshold */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Minimum Sustainability Score</label>
              <NumericTextBox
                value={minSustainability}
                onChange={(e) => setMinSustainability(e.value || 0)}
                min={0}
                max={100}
                step={10}
                format="n0"
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">0-100 scale (0 = any product)</p>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-6 p-4 bg-destructive/10 border border-destructive text-destructive rounded-md">
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Build Button */}
          <div className="mt-6">
            <Button
              onClick={handleBuildSetup}
              disabled={loading || selectedCategories.length === 0}
              className="w-full md:w-auto"
            >
              {loading ? (
                <>
                  <Loader /> Building Setup...
                </>
              ) : (
                'Generate Setup'
              )}
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Results Section */}
      {result && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardBody>
                <p className="text-sm text-muted-foreground">Total Cost</p>
                <p className="text-2xl font-bold text-primary">${result.totalCost.toFixed(2)}</p>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <p className="text-sm text-muted-foreground">Remaining Budget</p>
                <p className="text-2xl font-bold text-green-600">
                  ${result.remainingBudget.toFixed(2)}
                </p>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <p className="text-sm text-muted-foreground">Items Selected</p>
                <p className="text-2xl font-bold">{result.products.length}</p>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <p className="text-sm text-muted-foreground">Compatibility</p>
                <p className={`text-2xl font-bold ${result.isCompactible ? 'text-green-600' : 'text-yellow-600'}`}>
                  {result.isCompactible ? '✓ Compatible' : '⚠ Review'}
                </p>
              </CardBody>
            </Card>
          </div>

          {/* Explanation */}
          <Card className="bg-muted/50">
            <CardBody>
              <h3 className="font-semibold mb-2">Setup Summary</h3>
              <p className="text-sm text-foreground">{result.explanation}</p>
            </CardBody>
          </Card>

          {/* Price Distribution Chart */}
          {priceDistribution.length > 0 && (
            <Card>
              <CardBody>
                <h3 className="font-semibold mb-4">Price Distribution</h3>
                <ChartContainer>
                  <Chart>
                    <SeriesItem
                      type="bar"
                      data={priceDistribution}
                      field="price"
                      categoryField="category"
                    />
                    <TooltipItem format="$#,##0.00" />
                  </Chart>
                </ChartContainer>
              </CardBody>
            </Card>
          )}

          {/* Product Cards */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Selected Products</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {result.products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>

          {/* Replacement Suggestions */}
          {result.replacementSuggestions.length > 0 && (
            <ReplacementSuggestions suggestions={result.replacementSuggestions} />
          )}

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row gap-4">
            <Button
              onClick={handleShowAccessories}
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Loading...' : 'Show Compatible Accessories'}
            </Button>
            <Button
              onClick={handleShowUpgrades}
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Loading...' : 'Show Upgrade Options'}
            </Button>
          </div>

          {/* Compatible Accessories */}
          {showAccessories && accessories.length > 0 && (
            <CompatibleAccessories accessories={accessories} />
          )}

          {/* Upgrade Suggestions */}
          {upgrades.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold">Upgrade Options</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {upgrades.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default SmartSetupBuilder
