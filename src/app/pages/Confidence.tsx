import { CartivoConfidence } from '../components/CartivoConfidence'

/**
 * Cartivo Confidence™ Page
 *
 * Standalone route for the Visual Validation + Confidence Scoring feature.
 * Accepts optional query params:
 *   ?budget=<number>   — max budget for budget alignment scoring
 *
 * When embedded after a Smart Setup Builder flow, pass the SetupBuilderResult
 * directly via state or integrate CartivoConfidence inside SmartSetupBuilder.
 */
export function Confidence() {
  const params = new URLSearchParams(
    typeof window !== 'undefined' ? window.location.search : ''
  )
  const budget = Number(params.get('budget')) || undefined

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-xl mx-auto px-4 py-10">
        <CartivoConfidence maxBudget={budget} />
      </div>
    </div>
  )
}

export default Confidence
